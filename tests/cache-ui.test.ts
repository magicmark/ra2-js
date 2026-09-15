import { afterEach, describe, expect, it, vi } from 'vitest';
import { UI } from '../src/ui/UI';
import { ORIGINAL_ASSET_URL as ORIGINAL, LEGACY_ASSET_URL } from '../src/assets/AssetDownload';

// Exercise the real status/source methods without a browser, so restoring from
// local archives and native-source retries share the same presentation logic.
function fixture() {
  const elements = new Map<string, any>();

  const element = (id: string) => {
    if (!elements.has(id))
      elements.set(id, {
        value: ORIGINAL,
        textContent: '',
        style: {},
        readOnly: false,
        disabled: false,
        classList: { toggle: vi.fn() },
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        focus: vi.fn(),
      });

    return elements.get(id);
  };

  const submits = [element('startup-submit'), element('settings-submit')];
  const ui = Object.create(UI.prototype);
  Object.assign(ui, {
    root: {
      querySelector: (selector: string) => element(selector.slice(1)),
      querySelectorAll: (selector: string) => (selector === '.asset-submit-button' ? submits : []),
    },
    loading: true,
    assetSubmitting: false,
    assetSourceEdited: false,
    assetStatus: { phase: 'cache' },
    actions: { onAssetRetry: vi.fn() },
  });
  vi.stubGlobal('location', { href: 'http://omarky:5173/', origin: 'http://omarky:5173' });
  vi.stubGlobal('document', { activeElement: element('startup-asset-source') });

  return { ui, element, submits };
}

afterEach(() => vi.unstubAllGlobals());

describe('cache restoration presentation', () => {
  it('shows local preparation without telling the user to download again, then offers cached Continue', () => {
    const { ui, element } = fixture();

    for (const phase of ['cache', 'extract', 'decode']) {
      ui.setAssetStatus({
        phase,
        detail: 'Preparing saved game files from MIX archives.',
        source: ORIGINAL,
      });
      expect(element('startup-submit-label').textContent).toBe('Load & play');
      expect(element('startup-source-hint').textContent).toContain('use saved game files');
      expect(element('loading-phase').textContent).not.toMatch(/download/i);
      expect(element('loading-detail').textContent).toContain('saved game files');
    }

    ui.setAssetStatus({ phase: 'ready', ready: true, source: ORIGINAL });
    expect(element('startup-submit-label').textContent).toBe('Continue');

    for (const source of ['/asset-source', 'http://omarky:5173/asset-source', LEGACY_ASSET_URL]) {
      ui.setAssetSource(source);
      expect(element('startup-asset-source').value).toBe(ORIGINAL);
      expect(element('startup-submit-label').textContent).toBe('Continue');
    }
  });

  it('does not inherit cached Continue when a different source is being edited', () => {
    const { ui, element } = fixture();
    element('startup-asset-source').value = 'https://example.test/my-game.exe';
    ui.assetSourceEdited = true;
    ui.setAssetStatus({ phase: 'ready', ready: true, source: ORIGINAL });
    expect(element('startup-asset-source').value).toBe('https://example.test/my-game.exe');
    expect(element('startup-submit-label').textContent).toBe('Load & play');
    expect(element('loading-detail').textContent).toContain('Saved files for this source');
    ui.setAssetStatus({
      phase: 'download',
      source: 'https://example.test/my-game.exe',
      detail: 'Receiving archive bytes.',
    });
    expect(element('loading-phase').textContent).toBe('Downloading game files');
  });

  it('retains storage warnings alongside ready Continue and truthful retry errors', () => {
    const { ui, element } = fixture();
    const cacheWarning = 'Browser storage could not save the completed installer: quota exceeded.';
    ui.setAssetStatus({ phase: 'ready', ready: true, source: ORIGINAL, cacheWarning });
    expect(element('startup-submit-label').textContent).toBe('Continue');
    expect(element('loading-phase').textContent).toBe('Game files are ready for this session');
    expect(element('startup-source-hint').textContent).toContain('ready for this session');
    expect(element('loading-detail').textContent).not.toContain('saved');
    expect(element('loading-note').textContent).toBe(cacheWarning);
    expect(element('asset-error').textContent).toBe(cacheWarning);
    ui.setAssetStatus({
      phase: 'error',
      error: 'Saved MIX artwork selection failed.',
      source: ORIGINAL,
      cacheWarning,
    });
    expect(element('asset-detail').textContent).toContain('Retry loading');
    expect(element('asset-error').textContent).toContain('Saved MIX artwork selection failed.');
    expect(element('asset-error').textContent).toContain(cacheWarning);
    expect(element('loading-note').textContent).toBe(cacheWarning);
  });

  it('preserves the actionable saved-work reason and coalesces explicit retry requests', () => {
    const { ui, element, submits } = fixture();

    const detail =
      'Saved files need a newer artwork decoder. Press Enter to retry using saved work.';

    ui.setAssetStatus({ phase: 'awaiting-source', detail, source: ORIGINAL });
    expect(element('loading-detail').textContent).toBe(detail);
    expect(element('loading-note').textContent).toContain('when storage is available');
    ui.submitAssetSource(element('startup-asset-source'));
    ui.submitAssetSource(element('startup-asset-source'));
    expect(ui.actions.onAssetRetry).toHaveBeenCalledExactlyOnceWith(ORIGINAL);
    expect(submits.every((button) => button.disabled)).toBe(true);
    ui.setAssetStatus({
      phase: 'error',
      error: 'Saved archive still needs repair.',
      source: ORIGINAL,
    });
    expect(submits.every((button) => !button.disabled)).toBe(true);
  });
});
