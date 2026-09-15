export {};

// Preserve existing bookmarks while making /maps the canonical viewer route.
if (/^\/admin(?:\/|$)/.test(location.pathname)) {
  history.replaceState(null, '', location.pathname.replace(/^\/admin/, '/maps') + location.search + location.hash);
}
// Keep the game bootstrap isolated: a Map Viewer deep link never starts a match.
const mapViewer = /^\/maps(?:\/|$)/.test(location.pathname);
if (mapViewer) {
  void import('./maps/MapViewer').then(({ startMapViewer }) => startMapViewer()).catch(showStartupError);
} else {
  void import('./main').catch(showStartupError);
}

function showStartupError(error: unknown) {
  const app = document.querySelector('#app');
  if (!app) return;
  const panel = document.createElement('main');
  panel.style.cssText = 'padding:3rem;color:#eee;background:#151a18;font:16px Arial;min-height:100vh';
  const title = document.createElement('h1'); title.textContent = 'Unable to open battlefield';
  const message = document.createElement('p'); message.textContent = error instanceof Error ? error.message : String(error);
  const retry = document.createElement('a'); retry.href = mapViewer ? '/maps/' : '/';
  retry.textContent = 'Return to map selection'; retry.style.color = '#cbdba7';
  panel.append(title, message, retry); app.replaceChildren(panel);
}
