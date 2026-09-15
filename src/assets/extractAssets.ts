import SevenZip, { type SevenZipModuleOptions } from '7z-wasm';
import { selectAudioFiles } from './AudioBank';
import { MissingMusicError, selectMusicFiles } from './MusicBank';
import wasmUrl from '7z-wasm/7zz.wasm?url';
import { MixArchive } from './formats';
import { NESTED_MIXES, UI_FILES, UI_HASH_FILES, wantedFiles } from './catalog';

export interface ExtractionInput {
  files: { name: string; blob: Blob }[];
  includeMixStage?: boolean;
}

export type ExtractionOutput =
  | { kind: 'progress'; message: string }
  | { kind: 'mix'; files: { name: string; blob: Blob }[] }
  | { kind: 'error'; invalidArchive: boolean; missingMusic: boolean; message: string }
  | {
      kind: 'complete';
      files: { name: string; bytes: Uint8Array }[];
      archives: { name: string; entries: number; encrypted: boolean }[];
    };

export interface ExtractionChannel {
  postMessage(message: ExtractionOutput, transfer?: Transferable[]): void;
}

/** The installer operations needed by the asset selector, independent of Emscripten's filesystem. */
export interface InstallerArchive {
  mount(blob: Blob): void;
  extract(): void;
  names(): string[];
  size(name: string): number;
  read(name: string): Uint8Array;
  remove(name: string): void;
  unmount(): void;
}

type InstallerOptions = Pick<SevenZipModuleOptions, 'onExit' | 'print'>;

export type OpenInstaller = (options: InstallerOptions) => Promise<InstallerArchive>;

async function openInstaller(options: InstallerOptions): Promise<InstallerArchive> {
  const archive = await SevenZip({ ...options, locateFile: () => wasmUrl, printErr: () => {} });

  return {
    mount(blob) {
      archive.FS.mkdir('/input');
      archive.FS.mkdir('/output');
      archive.FS.mount(archive.WORKERFS, { blobs: [{ name: 'source.exe', data: blob }] }, '/input');
    },
    extract() {
      archive.callMain([
        'e',
        '/input/source.exe',
        'ra2.mix',
        'language.mix',
        'theme.mix',
        'expand*.mix',
        '-r',
        '-o/output',
        '-y',
      ]);
    },
    names: () => archive.FS.readdir('/output'),
    size: (name) => archive.FS.stat('/output/' + name).size,
    read: (name) => archive.FS.readFile('/output/' + name),
    remove(name) {
      archive.FS.unlink('/output/' + name);
    },
    unmount() {
      archive.FS.unmount('/input');
    },
  };
}

interface ExtractorExit {
  status: number;
}

function isExtractorExit(value: unknown): value is ExtractorExit {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof value.status === 'number'
  );
}

export async function extractAssets(
  data: ExtractionInput,
  worker: ExtractionChannel,
  open: OpenInstaller = openInstaller,
): Promise<void> {
  let invalidArchive = false;

  try {
    const raw = new Map<string, Uint8Array>();

    for (const file of data.files) {
      if (/\.mix$/i.test(file.name)) {
        if (file.blob.size)
          raw.set(file.name.toLowerCase(), new Uint8Array(await file.blob.arrayBuffer()));
        continue;
      }

      worker.postMessage({
        kind: 'progress',
        message: 'Opening installer with 7-Zip WebAssembly…',
      });
      let exitCode = 0;

      const archive = await open({
        onExit: (code) => {
          exitCode = code;
        },
        print: (message) => {
          if (/Extracting|Everything|Files:/.test(message))
            worker.postMessage({ kind: 'progress', message });
        },
      });

      archive.mount(file.blob);
      worker.postMessage({
        kind: 'progress',
        message: 'Extracting game MIX files. The installer is never executed.',
      });

      const extractionError = (code: number): Error => {
        invalidArchive = code === 2;

        const reason =
          code === 8
            ? 'The browser extractor ran out of memory. Close other tabs and retry; the saved download is kept.'
            : code === 7
              ? 'The extractor command failed. The saved download is kept for a corrected retry.'
              : code === 255
                ? 'Extraction was interrupted. Retry to continue from the saved download.'
                : code === 2
                  ? 'The archive could not be opened. Choose a complete game installer.'
                  : 'Extraction failed; the saved download is kept for retry.';

        return new Error(`7-Zip code ${code}: ${reason}`);
      };

      try {
        archive.extract();
      } catch (error) {
        const code = isExtractorExit(error) ? error.status : NaN;

        if (code > 1) throw extractionError(code);

        if (code !== 0 && code !== 1) throw error;
      }

      if (exitCode > 1) throw extractionError(exitCode);

      for (const name of archive.names()) {
        if (/\.mix$/i.test(name) && archive.size(name) > 0) {
          raw.set(name.toLowerCase(), archive.read(name));
          archive.remove(name);
        }
      }

      archive.unmount();
    }

    if (!raw.size) {
      invalidArchive = true;
      throw new Error(
        'No game MIX files found. Choose the RA2 multiplayer installer, or ra2.mix, language.mix and theme.mix.',
      );
    }

    // Successful installer extraction remains reusable even if a later nested
    // MIX decoder fails. Only direct MIX input is rejected by its index parser;
    // WASM startup, interruption and browser allocation errors stay retryable.
    invalidArchive = data.files.every((file) => /\.mix$/i.test(file.name));
    const archives: MixArchive[] = [];

    const visit = (name: string, bytes: Uint8Array, depth: number) => {
      if (depth > 5) return;
      const mix = new MixArchive(bytes, name);
      archives.push(mix);

      for (const nested of NESTED_MIXES) {
        const content = mix.get(nested);

        if (content?.length) visit(name + '/' + nested, content, depth + 1);
      }
    };

    for (const [name, bytes] of raw) {
      worker.postMessage({ kind: 'progress', message: `Indexing ${name}…` });
      visit(name, bytes, 0);
    }

    if (!archives.length)
      throw new Error(
        'No game MIX files found. Choose the RA2 multiplayer installer, or ra2.mix, language.mix and theme.mix.',
      );

    if (!archives.some((archive) => archive.get('unittem.pal')))
      throw new Error(
        'The game unit palette was not found. Import ra2.mix from a complete Red Alert 2 installation.',
      );
    invalidArchive = false;

    if (data.includeMixStage !== false)
      worker.postMessage({
        kind: 'mix',
        files: [...raw].map(([name, bytes]) => {
          // SAFETY: Blob.arrayBuffer() and the single-threaded 7-Zip filesystem return ordinary ArrayBuffer-backed bytes.
          return { name, blob: new Blob([bytes as Uint8Array<ArrayBuffer>]) };
        }),
      });
    const selected: { name: string; bytes: Uint8Array }[] = [];

    for (const name of wantedFiles()) {
      for (let i = archives.length - 1; i >= 0; i--) {
        const bytes = archives[i].get(name);

        if (bytes) {
          selected.push({ name, bytes: bytes.slice() });
          break;
        }
      }
    }

    selected.push(...selectAudioFiles(archives), ...selectMusicFiles(archives));

    // Side MIXes reuse filenames with different pixels and palettes. Keep the
    // faction namespace; global last-archive-wins would paint Allied chrome red.
    for (const side of [0, 1]) {
      const archive = archives.find((a) => a.name.endsWith(`sidec0${side + 1}.mix`));

      if (!archive) continue;

      for (const name of UI_FILES) {
        const bytes = archive.get(name);

        if (bytes) selected.push({ name: `side${side}/${name}`, bytes: bytes.slice() });
      }

      for (const [name, hash] of Object.entries(UI_HASH_FILES)) {
        const entry = archive.entries.get(hash);

        if (entry)
          selected.push({
            name: `side${side}/${name}`,
            bytes: archive.bytes.slice(entry.offset, entry.offset + entry.size),
          });
      }
    }

    // SAFETY: Selected file bytes are created by slice() or the audio encoders, all backed by ordinary ArrayBuffers.
    worker.postMessage(
      {
        kind: 'complete',
        files: selected,
        archives: archives.map((a) => ({
          name: a.name,
          entries: a.entries.size,
          encrypted: a.encrypted,
        })),
      },
      selected.map((file) => file.bytes.buffer as ArrayBuffer),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/out of memory|allocation failed|array buffer allocation/i.test(message))
      invalidArchive = false;
    worker.postMessage({
      kind: 'error',
      invalidArchive,
      missingMusic: error instanceof MissingMusicError,
      message,
    });
  }
}
