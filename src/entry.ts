// Keep the game bootstrap isolated: an admin deep link never starts a match.
if (/^\/admin(?:\/|$)/.test(location.pathname)) {
  void import('./admin/MapViewer').then(({ startMapViewer }) => startMapViewer()).catch(showStartupError);
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
  const retry = document.createElement('a'); retry.href = location.pathname.startsWith('/admin') ? '/admin/' : '/';
  retry.textContent = 'Return to map selection'; retry.style.color = '#cbdba7';
  panel.append(title, message, retry); app.replaceChildren(panel);
}
