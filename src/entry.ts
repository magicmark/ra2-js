import { openEntry } from './entryRoute';

void openEntry(location, history, {
  viewer: () => import('./maps/MapViewer').then(({ startMapViewer }) => startMapViewer()),
  game: () => import('./main').then(({ startGame }) => startGame()),
}).catch((error) => showStartupError(error instanceof Error ? error.message : String(error)));

function showStartupError(error: string) {
  const app = document.querySelector('#app');

  if (!app) return;
  const panel = document.createElement('main');
  panel.style.cssText =
    'padding:3rem;color:#eee;background:#151a18;font:16px Arial;min-height:100vh';
  const title = document.createElement('h1');
  title.textContent = 'Unable to open battlefield';
  const message = document.createElement('p');
  message.textContent = error;
  const retry = document.createElement('a');
  retry.href = /^\/maps(?:\/|$)/.test(location.pathname) ? '/maps/' : '/';
  retry.textContent = 'Return to map selection';
  retry.style.color = '#cbdba7';
  panel.append(title, message, retry);
  app.replaceChildren(panel);
}
