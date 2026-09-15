import './map-viewer.css';
import { AssetManager, DEFAULT_ASSET_URL, assetSourceUrl, type AssetProgress } from '../assets/AssetManager';
import { requestPersistentAssetStorage } from '../assets/AssetDownload';
import { MAP_CATALOG, type MapCatalogEntry } from '../game/maps/catalog';
import { parseNativeMap, type NativeMap } from '../game/maps/nativeMap';
import { Renderer } from '../render/Renderer';

const escape = (text: string) => text.replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value]!);
const theaterName = (value: string) => value === 'SNOW' ? 'Snow' : value === 'URBAN' ? 'Urban' : 'Temperate';
const SOURCE_KEY = 'red-alert-command.asset-source';

export function startMapViewer() {
  document.documentElement.classList.add('map-viewer');
  let remembered = '';
  try { remembered = localStorage.getItem(SOURCE_KEY) ?? ''; } catch { /* Optional preference. */ }
  let source = assetSourceUrl(new URLSearchParams(location.search).get('asset_url') || remembered || DEFAULT_ASSET_URL);
  const app = document.querySelector<HTMLElement>('#app')!;
  app.innerHTML = `<div class="map-shell">
    <header class="map-topbar"><a class="map-brand" href="/">RED ALERT <b>II</b></a><span class="map-viewer-label">MAP VIEWER</span><span id="map-preview-title" class="map-preview-title" hidden></span><a class="map-back" id="map-back" href="/">Return to game <span aria-hidden="true">↗</span></a></header>
    <aside class="map-sidebar" aria-label="Map selector"><label class="map-mobile-picker" for="map-mobile-select">Battlefield<select id="map-mobile-select">${MAP_CATALOG.map(entry => `<option value="${entry.id}">${escape(entry.name)}</option>`).join('')}</select></label><div class="map-library-heading"><span class="map-eyebrow">BATTLEFIELDS</span><span class="map-count">${MAP_CATALOG.length.toString().padStart(2, '0')}</span></div><p class="map-library-intro">Medium maps. Six starting positions.</p>
      <nav class="map-list" aria-label="Choose a map">${MAP_CATALOG.map((entry, index) => `<a class="map-choice" href="/maps/${entry.id}" data-map-id="${entry.id}"><span class="map-number">${(index + 1).toString().padStart(2, '0')}</span><span class="map-choice-copy"><strong>${escape(entry.name)}</strong><small>${theaterName(entry.theater)} <span>·</span> ${entry.size.join(' × ')}</small></span><span class="map-choice-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav>
      <div class="map-library-footer"><span class="map-visibility-dot"></span><div><strong>Full map visibility</strong><p>Fog and shroud disabled</p></div></div>
    </aside>
    <main class="map-main"><header class="map-heading"><div><p class="map-eyebrow" id="map-kicker">MAP OVERVIEW</p><h1 id="map-title">Map library</h1><p id="map-description">Choose a battlefield from the sidebar.</p></div><a id="map-preview" class="map-primary-link" hidden>Preview map <span aria-hidden="true">↗</span></a></header>
      <div class="map-facts" id="map-facts"></div>
      <section class="map-stage" aria-label="Full map viewer"><canvas id="map-viewer-canvas" tabindex="0" aria-label="Full native map. Drag to pan, scroll or pinch to zoom. Press F to fit the map."></canvas><div id="map-starts" class="map-starts"></div>
        <div class="map-status" id="map-status" role="status" aria-live="polite"><span class="map-spinner"></span><span id="map-status-text">Preparing map library…</span></div>
        <div class="map-error" id="map-error" role="alert" hidden><strong id="map-error-title">Unable to load map</strong><p id="map-error-message"></p><button id="map-retry" class="map-button">Retry map</button></div>
        <section class="map-assets" id="map-assets" aria-labelledby="map-assets-title" hidden><span class="map-eyebrow">ORIGINAL GAME ARTWORK</span><h2 id="map-assets-title">Prepare your map viewer</h2><p id="map-assets-detail">Load the original game files to explore every tile and structure.</p><form id="map-assets-form"><label for="map-asset-url">Game archive URL</label><input id="map-asset-url" type="url" value="${escape(source)}" required spellcheck="false"><button type="submit" class="map-button map-button-primary">Load game files</button></form><label class="map-import">Import local game files<input id="map-asset-files" type="file" multiple accept=".mix,.exe,.zip"></label><small>Use an installer, or ra2.mix and language.mix together. Saved files are shared with the game.</small></section>
        <div class="map-view-toolbar" aria-label="Map camera controls"><button class="map-button" id="map-fit" title="Fit full map (F)">Fit map <kbd>F</kbd></button><div class="map-zoom"><button id="map-zoom-out" aria-label="Zoom out">−</button><output id="map-zoom-value">100%</output><button id="map-zoom-in" aria-label="Zoom in">+</button></div></div>
      </section>
      <footer class="map-footer"><span><i class="map-start-symbol">1</i> Player starts <span class="map-footer-divider">/</span> Ore & neutral tech buildings</span><span class="map-control-hint">Drag to pan · Scroll to zoom · F to fit</span><a id="map-download" hidden>Download .map ↓</a></footer>
    </main></div>`;
  const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  for (const link of app.querySelectorAll<HTMLAnchorElement>('[data-map-id]')) link.href = `/maps/${link.dataset.mapId}${location.search}`;
  // Native preview has no Game instance, game tick, AI, or visibility state.
  const canvas = el<HTMLCanvasElement>('map-viewer-canvas'), assets = new AssetManager(), renderer = new Renderer(canvas);
  renderer.assets = assets;
  const cache = new Map<string, NativeMap>();
  let selected: MapCatalogEntry | undefined, map: NativeMap | null = null, displayed: NativeMap | null = null;
  let fetchController: AbortController | undefined, generation = 0, frame = 0, assetBusy = true, fitted = true;
  let mapLoading = false, assetError = '', currentError = '';
  let previewMode = false;
  const markers: { button: HTMLButtonElement; x: number; y: number }[] = [];

  const diagnostic = { assets, renderer, get map() { return map; }, get selected() { return selected; }, get preview() { return previewMode; }, get ready() { return displayed === map && !!map; }, get loading() { return mapLoading || assetBusy; }, get error() { return currentError || assetError; }, fogDisabled: true, simulation: false, fitMap: () => fitMap() };
  Object.assign(window, { __mapViewer: diagnostic });

  function updateStatus() {
    const busy = mapLoading || assetBusy;
    el('map-status').hidden = !busy;
    canvas.setAttribute('aria-busy', String(busy));
    el('map-assets').hidden = assets.ready || assetBusy;
    el('map-error').hidden = !currentError;
    el('map-error-message').textContent = currentError;
    for (const id of ['map-fit', 'map-zoom-in', 'map-zoom-out']) el<HTMLButtonElement>(id).disabled = !displayed;
    el('map-status-text').textContent = assetBusy ? assets.status.message : `Loading ${selected?.name ?? 'map'}…`;
  }
  function render() {
    frame = 0;
    if (!displayed || !assets.ready) return;
    try {
      renderer.renderNativeMap(displayed);
      el('map-zoom-value').textContent = `${Math.round(renderer.camera.zoom * 100)}%`;
      for (const marker of markers) {
        const p = renderer.nativePoint(marker.x, marker.y);
        marker.button.style.transform = `translate(${p.x}px, ${p.y}px)`;
        marker.button.hidden = p.x < 0 || p.y < 0 || p.x > renderer.camera.width || p.y > renderer.camera.height;
      }
    } catch (error) { fail(error); }
  }
  function redraw() { if (!frame) frame = requestAnimationFrame(render); }
  function fitMap() { if (displayed) { renderer.fitNativeMap(displayed, Math.min(56, canvas.clientWidth * .07)); fitted = true; redraw(); } }
  function fail(error: unknown) {
    currentError = error instanceof Error ? error.message : String(error); displayed = null;
    el('map-starts').replaceChildren(); markers.length = 0; updateStatus();
  }
  function showMap() {
    if (!map || !assets.ready || assetBusy) { updateStatus(); return; }
    try {
      renderer.fitNativeMap(map, Math.min(56, canvas.clientWidth * .07));
      displayed = map; currentError = ''; fitted = true;
      el('map-starts').replaceChildren(); markers.length = 0;
      for (const start of map.starts) {
        const button = document.createElement('button'); button.className = 'map-start-marker';
        button.textContent = `${start.index + 1}`; button.setAttribute('aria-label', `Player start ${start.index + 1}`); button.title = `Player start ${start.index + 1} · ${start.x}, ${start.y}`;
        button.addEventListener('click', () => { renderer.camera.center(start.x, start.y); renderer.camera.setZoom(1); fitted = false; redraw(); canvas.focus(); });
        markers.push({ button, x: start.x, y: start.y }); el('map-starts').append(button);
      }
      el('map-facts').innerHTML = `<span><strong>${map.starts.length}</strong> player starts</span><span><strong>${selected!.size.join(' × ')}</strong> medium</span><span><strong>${theaterName(map.theater)}</strong> theater</span><span><strong>${map.structures.filter(value => value.type.toUpperCase() === 'CAOILD').length}</strong> oil derricks</span><span><strong>${map.structures.filter(value => value.type.toUpperCase() === 'CAAIRP').length}</strong> airports</span><span class="map-fog-tag">Fog disabled</span>`;
      render(); updateStatus();
    } catch (error) { fail(error); }
  }
  async function select(entry: MapCatalogEntry, navigation: 'push' | 'replace' | 'none' = 'push') {
    const ticket = ++generation; fetchController?.abort(); fetchController = new AbortController();
    selected = entry; map = null; displayed = null; currentError = ''; mapLoading = true;
    el('map-starts').replaceChildren(); markers.length = 0;
    renderer.gl.begin(canvas.clientWidth || 1, canvas.clientHeight || 1); renderer.gl.flush();
    app.querySelector('.map-shell')!.classList.toggle('is-preview', previewMode);
    const pathname = `/maps/${entry.id}${previewMode ? '/preview' : ''}`, path = `${pathname}${location.search}`;
    if (navigation === 'replace') history.replaceState(null, '', path);
    else if (navigation === 'push' && location.pathname !== pathname) history.pushState(null, '', path);
    for (const link of app.querySelectorAll<HTMLAnchorElement>('[data-map-id]')) {
      const active = link.dataset.mapId === entry.id; link.classList.toggle('is-selected', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    }
    document.title = `${entry.name} · ${previewMode ? 'Map Preview' : 'Map Viewer'} · Red Alert II`;
    el<HTMLSelectElement>('map-mobile-select').value = entry.id;
    el('map-preview-title').textContent = entry.name; el('map-preview-title').hidden = !previewMode;
    const back = el<HTMLAnchorElement>('map-back');
    back.textContent = previewMode ? '← Back to maps' : 'Return to game ↗';
    back.href = previewMode ? `/maps/${entry.id}${location.search}` : '/';
    el('map-title').textContent = entry.name; el('map-description').textContent = entry.description;
    el('map-kicker').textContent = `${theaterName(entry.theater)} / ${entry.style}`;
    el('map-facts').innerHTML = `<span><strong>6</strong> player starts</span><span><strong>${entry.size.join(' × ')}</strong> medium</span><span class="map-fog-tag">Fog disabled</span>`;
    const preview = el<HTMLAnchorElement>('map-preview'); preview.hidden = false; preview.href = `/maps/${entry.id}/preview${location.search}`; preview.title = 'Explore the full map with no fog or active match';
    const download = el<HTMLAnchorElement>('map-download'); download.hidden = false; download.href = entry.path; download.download = `${entry.id}.map`;
    updateStatus();
    try {
      let loaded = cache.get(entry.id);
      if (!loaded) {
        const response = await fetch(entry.path, { signal: fetchController.signal });
        if (!response.ok) throw new Error(`Map download failed (${response.status}). Try again.`);
        loaded = parseNativeMap(await response.text()); cache.set(entry.id, loaded);
      }
      if (ticket !== generation) return;
      map = loaded; mapLoading = false; showMap();
    } catch (error) { if (ticket === generation && !(error instanceof DOMException && error.name === 'AbortError')) { mapLoading = false; fail(error); } }
  }
  function route() {
    const match = /^\/maps(?:\/([a-z0-9-]+))?(?:\/(preview))?\/?$/.exec(location.pathname);
    previewMode = !!match?.[2];
    if (match && !match[1]) { void select(MAP_CATALOG[0], 'replace'); return; }
    const entry = match && MAP_CATALOG.find(value => value.id === match[1]);
    if (entry) { void select(entry, 'none'); return; }
    generation++; fetchController?.abort(); map = displayed = null; selected = undefined; mapLoading = false;
    previewMode = false; app.querySelector('.map-shell')!.classList.remove('is-preview'); el('map-preview-title').hidden = true;
    el<HTMLAnchorElement>('map-back').href = '/maps/'; el('map-back').textContent = '← Back to maps';
    renderer.gl.begin(canvas.clientWidth || 1, canvas.clientHeight || 1); renderer.gl.flush();
    document.title = 'Map not found · Map Viewer · Red Alert II';
    el('map-title').textContent = 'Map not found'; el('map-description').textContent = 'Choose one of the eight battlefields in the sidebar.';
    el('map-preview').hidden = el('map-download').hidden = true; el('map-facts').replaceChildren();
    for (const link of app.querySelectorAll('[data-map-id]')) { link.classList.remove('is-selected'); link.removeAttribute('aria-current'); }
    el('map-retry').textContent = 'Open first map'; fail('This map link does not match the library. Select a map to continue.');
  }
  const progress = (status: AssetProgress) => {
    assetError = status.phase === 'error' ? status.message : '';
    el('map-assets-detail').textContent = assetError || status.message;
    el('map-status-text').textContent = status.message;
  };
  async function loadAssets(files?: File[]) {
    if (assetBusy) return;
    assetBusy = true; assetError = ''; currentError = ''; updateStatus();
    source = assetSourceUrl(el<HTMLInputElement>('map-asset-url').value);
    try { localStorage.setItem(SOURCE_KEY, source); } catch { /* Optional preference. */ }
    void requestPersistentAssetStorage();
    try {
      const options = { url: source, nativeMaps: true, onProgress: progress };
      if (files) await assets.importFiles(files, options); else await assets.download(options);
    } catch (error) { assetError = error instanceof Error ? error.message : String(error); el('map-assets-detail').textContent = assetError; }
    finally { assetBusy = false; showMap(); }
  }
  app.querySelector('.map-list')!.addEventListener('click', event => {
    const click = event as MouseEvent, link = (event.target as Element).closest<HTMLAnchorElement>('[data-map-id]');
    if (!link || click.button || click.ctrlKey || click.metaKey || click.shiftKey || click.altKey) return;
    event.preventDefault(); el('map-retry').textContent = 'Retry map'; void select(MAP_CATALOG.find(value => value.id === link.dataset.mapId)!);
  });
  el<HTMLSelectElement>('map-mobile-select').addEventListener('change', event => {
    const entry = MAP_CATALOG.find(value => value.id === (event.target as HTMLSelectElement).value);
    if (entry) { previewMode = false; void select(entry); }
  });
  for (const id of ['map-preview', 'map-back']) el<HTMLAnchorElement>(id).addEventListener('click', event => {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !selected || id === 'map-back' && !previewMode) return;
    event.preventDefault(); previewMode = id === 'map-preview'; void select(selected);
    if (previewMode) canvas.focus(); else el('map-preview').focus();
  });
  window.addEventListener('popstate', route);
  el('map-retry').addEventListener('click', () => { if (selected) { cache.delete(selected.id); void select(selected, 'none'); } else void select(MAP_CATALOG[0]); });
  el('map-assets-form').addEventListener('submit', event => { event.preventDefault(); void loadAssets(); });
  el<HTMLInputElement>('map-asset-files').addEventListener('change', event => { const input = event.target as HTMLInputElement, files = [...input.files ?? []]; input.value = ''; if (files.length) void loadAssets(files); });
  const zoom = (factor: number, anchor?: { x: number; y: number }) => { if (!displayed) return; renderer.camera.setZoom(renderer.camera.zoom * factor, anchor); fitted = false; redraw(); };
  el('map-fit').addEventListener('click', fitMap); el('map-zoom-in').addEventListener('click', () => zoom(1.3)); el('map-zoom-out').addEventListener('click', () => zoom(1 / 1.3));
  canvas.addEventListener('wheel', event => { event.preventDefault(); const rect = canvas.getBoundingClientRect(); zoom(Math.exp(-Math.max(-120, Math.min(120, event.deltaY)) * .0025), { x: event.clientX - rect.left, y: event.clientY - rect.top }); }, { passive: false });
  const pointers = new Map<number, { x: number; y: number }>();
  canvas.addEventListener('pointerdown', event => { if (event.button > 1) return; event.preventDefault(); canvas.focus(); canvas.setPointerCapture(event.pointerId); pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); canvas.classList.add('is-dragging'); });
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId); if (!previous || !displayed) return;
    const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1];
    if (other) {
      const before = Math.hypot(previous.x - other.x, previous.y - other.y), after = Math.hypot(event.clientX - other.x, event.clientY - other.y), rect = canvas.getBoundingClientRect();
      if (before > 0) zoom(after / before, { x: (event.clientX + other.x) / 2 - rect.left, y: (event.clientY + other.y) / 2 - rect.top });
      renderer.camera.pan((event.clientX - previous.x) / 2, (event.clientY - previous.y) / 2);
    } else renderer.camera.pan(event.clientX - previous.x, event.clientY - previous.y);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); fitted = false; redraw();
  });
  const release = (event: PointerEvent) => { pointers.delete(event.pointerId); if (!pointers.size) canvas.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release);
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    if ((event.target as Element)?.closest('input,select,textarea') || event.ctrlKey || event.metaKey || event.altKey || !displayed) return;
    const pan = { ArrowLeft: [50, 0], ArrowRight: [-50, 0], ArrowUp: [0, 50], ArrowDown: [0, -50] }[event.key];
    if (pan) { event.preventDefault(); renderer.camera.pan(pan[0], pan[1]); fitted = false; redraw(); }
    else if (['f', 'F', '0', 'Home'].includes(event.key)) { event.preventDefault(); fitMap(); }
    else if (['+', '='].includes(event.key)) { event.preventDefault(); zoom(1.3); }
    else if (event.key === '-') { event.preventDefault(); zoom(1 / 1.3); }
  });
  new ResizeObserver(() => { if (fitted) fitMap(); else redraw(); }).observe(canvas);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fail(new Error('The graphics context was interrupted. Reload this page to restore the map.')); });
  route();
  void assets.initialize({ url: source, nativeMaps: true, onProgress: progress }).catch(error => { assetError = String(error); }).finally(() => { assetBusy = false; showMap(); });
}
