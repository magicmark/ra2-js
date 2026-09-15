import SevenZip from '7z-wasm';
import { selectAudioFiles } from './AudioBank';
import wasmUrl from '7z-wasm/7zz.wasm?url';
import { MixArchive } from './formats';
import { NESTED_MIXES, UI_FILES, UI_HASH_FILES, wantedFiles } from './catalog';

interface Input { files: { name: string; blob: Blob }[]; includeMixStage?: boolean }
const worker = self as unknown as { postMessage(message: unknown, transfer?: Transferable[]): void; onmessage: ((event: MessageEvent<Input>) => void) | null };
worker.onmessage = async ({ data }) => {
  let invalidArchive = false;
  try {
    const raw = new Map<string, Uint8Array>();
    for (const file of data.files) {
      if (/\.mix$/i.test(file.name)) {
        if (file.blob.size) raw.set(file.name.toLowerCase(), new Uint8Array(await file.blob.arrayBuffer()));
        continue;
      }
      worker.postMessage({ kind: 'progress', message: 'Opening installer with 7-Zip WebAssembly…' });
      let exitCode = 0;
      const archive = await SevenZip({ locateFile: () => wasmUrl, onExit: code => { exitCode = code; }, print: message => {
        if (/Extracting|Everything|Files:/.test(message)) worker.postMessage({ kind: 'progress', message });
      }, printErr: () => {} });
      archive.FS.mkdir('/input'); archive.FS.mkdir('/output');
      archive.FS.mount(archive.WORKERFS, { blobs: [{ name: 'source.exe', data: file.blob }] }, '/input');
      worker.postMessage({ kind: 'progress', message: 'Extracting game MIX files. The installer is never executed.' });
      const extractionError = (code: number): Error => {
        invalidArchive = code === 2;
        const reason = code === 8 ? 'The browser extractor ran out of memory. Close other tabs and retry; the saved download is kept.'
          : code === 7 ? 'The extractor command failed. The saved download is kept for a corrected retry.'
          : code === 255 ? 'Extraction was interrupted. Retry to continue from the saved download.'
          : code === 2 ? 'The archive could not be opened. Choose a complete game installer.'
          : 'Extraction failed; the saved download is kept for retry.';
        return new Error(`7-Zip code ${code}: ${reason}`);
      };
      try { archive.callMain(['e', '/input/source.exe', 'ra2.mix', 'language.mix', 'expand*.mix', '-r', '-o/output', '-y']); }
      catch (error) {
        const code = error && typeof error === 'object' && 'status' in error ? Number(error.status) : NaN;
        if (code > 1) throw extractionError(code);
        if (code !== 0 && code !== 1) throw error;
      }
      if (exitCode > 1) throw extractionError(exitCode);
      for (const name of archive.FS.readdir('/output')) {
        if (/\.mix$/i.test(name) && archive.FS.stat('/output/' + name).size > 0) {
          raw.set(name.toLowerCase(), archive.FS.readFile('/output/' + name));
          archive.FS.unlink('/output/' + name);
        }
      }
      archive.FS.unmount('/input');
    }
    if (!raw.size) { invalidArchive = true; throw new Error('No game MIX files found. Choose the RA2 multiplayer installer, or ra2.mix and language.mix.'); }
    // Successful installer extraction remains reusable even if a later nested
    // MIX decoder fails. Only direct MIX input is rejected by its index parser;
    // WASM startup, interruption and browser allocation errors stay retryable.
    invalidArchive = data.files.every(file => /\.mix$/i.test(file.name));
    const archives: MixArchive[] = [];
    const visit = (name: string, bytes: Uint8Array, depth: number) => {
      if (depth > 5) return;
      const mix = new MixArchive(bytes, name); archives.push(mix);
      for (const nested of NESTED_MIXES) { const content = mix.get(nested); if (content?.length) visit(name + '/' + nested, content, depth + 1); }
    };
    for (const [name, bytes] of raw) { worker.postMessage({ kind: 'progress', message: `Indexing ${name}…` }); visit(name, bytes, 0); }
    if (!archives.length) throw new Error('No game MIX files found. Choose the RA2 multiplayer installer, or ra2.mix and language.mix.');
    if (!archives.some(archive => archive.get('unittem.pal'))) throw new Error('The game unit palette was not found. Import ra2.mix from a complete Red Alert 2 installation.');
    invalidArchive = false;
    if (data.includeMixStage !== false) worker.postMessage({ kind: 'mix', files: [...raw].map(([name, bytes]) => ({ name, blob: new Blob([bytes as Uint8Array<ArrayBuffer>]) })) });
    const selected: { name: string; bytes: Uint8Array }[] = [];
    for (const name of wantedFiles()) {
      for (let i = archives.length - 1; i >= 0; i--) {
        const bytes = archives[i].get(name);
        if (bytes) { selected.push({ name, bytes: bytes.slice() }); break; }
      }
    }
    selected.push(...selectAudioFiles(archives));
    // Side MIXes reuse filenames with different pixels and palettes. Keep the
    // faction namespace; global last-archive-wins would paint Allied chrome red.
    for (const side of [0, 1]) {
      const archive = archives.find(a => a.name.endsWith(`sidec0${side + 1}.mix`));
      if (!archive) continue;
      for (const name of UI_FILES) {
        const bytes = archive.get(name);
        if (bytes) selected.push({ name: `side${side}/${name}`, bytes: bytes.slice() });
      }
      for (const [name, hash] of Object.entries(UI_HASH_FILES)) {
        const entry = archive.entries.get(hash);
        if (entry) selected.push({ name: `side${side}/${name}`, bytes: archive.bytes.slice(entry.offset, entry.offset + entry.size) });
      }
    }
    worker.postMessage({ kind: 'complete', files: selected, archives: archives.map(a => ({ name: a.name, entries: a.entries.size, encrypted: a.encrypted })) }, selected.map(file => file.bytes.buffer as ArrayBuffer));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/out of memory|allocation failed|array buffer allocation/i.test(message)) invalidArchive = false;
    worker.postMessage({ kind: 'error', invalidArchive, message });
  }
};
