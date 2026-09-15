interface EntryLoaders {
  viewer(): Promise<void>;
  game(): Promise<void>;
}

export async function openEntry(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  history: Pick<History, 'replaceState'>,
  loaders: EntryLoaders,
) {
  let path = location.pathname;

  // Preserve bookmarks while making /maps the canonical viewer route.
  if (/^\/admin(?:\/|$)/.test(path)) {
    path = path.replace(/^\/admin/, '/maps');
    history.replaceState(null, '', path + location.search + location.hash);
  }

  return /^\/maps(?:\/|$)/.test(path) ? loaders.viewer() : loaders.game();
}
