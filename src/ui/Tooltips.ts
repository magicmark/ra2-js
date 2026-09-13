export interface TooltipContent { title: string; description?: string }

/** A stationary pointer must remain for more than the manual's two seconds. */
export class TooltipDelay {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private target: unknown;
  private x = 0;
  private y = 0;
  constructor(private hide: () => void) {}
  point(target: unknown, x: number, y: number, show: () => void) {
    if (target === this.target && Math.hypot(x - this.x, y - this.y) < 2) return;
    this.clear(); this.target = target; this.x = x; this.y = y;
    if (target !== null) this.timer = setTimeout(show, 2001);
  }
  clear() { clearTimeout(this.timer); this.timer = undefined; this.target = null; this.hide(); }
}

export class Tooltips {
  private box: HTMLElement;
  private delay: TooltipDelay;
  private enabled = true;
  private abort = new AbortController();
  constructor(private hooks: {
    paint(element: HTMLElement, text: string): void;
    allowed(element: Element): boolean;
    battlefield(x: number, y: number): (TooltipContent & { id: number }) | null;
  }) {
    this.box = document.createElement('div'); this.box.className = 'native-tooltip'; this.box.hidden = true; this.box.setAttribute('role', 'tooltip');
    document.body.append(this.box);
    this.delay = new TooltipDelay(() => { this.box.hidden = true; });
    const options = { signal: this.abort.signal, passive: true };
    document.addEventListener('pointermove', event => this.move(event), options);
    for (const name of ['pointerdown', 'keydown', 'scroll']) document.addEventListener(name, () => this.clear(), { ...options, capture: true });
    window.addEventListener('blur', () => this.clear(), options);
    document.documentElement.addEventListener('pointerleave', () => this.clear(), options);
  }
  setEnabled(enabled: boolean) { this.enabled = enabled; this.clear(); }
  clear() { this.delay.clear(); }
  destroy() { this.abort.abort(); this.clear(); this.box.remove(); }
  private move(event: PointerEvent) {
    const element = event.target as Element;
    if (!this.enabled || event.pointerType === 'touch' || !this.hooks.allowed(element)) { this.clear(); return; }
    const hint = element.closest<HTMLElement>('[data-tooltip]');
    let key: unknown = hint, content: TooltipContent | null = hint?.dataset.tooltip ? { title: hint.dataset.tooltip } : null;
    if (element.id === 'game-canvas') {
      const rect = element.getBoundingClientRect();
      const entity = this.hooks.battlefield(event.clientX - rect.left, event.clientY - rect.top);
      content = entity; key = entity ? `entity:${entity.id}` : null;
    }
    if (!content) { this.clear(); return; }
    this.delay.point(key, event.clientX, event.clientY, () => {
      if (!this.enabled || !this.hooks.allowed(element)) return;
      this.box.replaceChildren();
      for (const paragraph of [content!.title, content!.description].filter(Boolean) as string[]) {
        for (const line of paragraph.split('\n')) {
          // Keep original font pixels instead of shrinking a wide canvas.
          const words = line.split(' '); let row = '';
          const append = () => { const label = document.createElement('div'); this.hooks.paint(label, row); this.box.append(label); };
          for (const word of words) { if (row && row.length + word.length > 45) { append(); row = ''; } row += `${row ? ' ' : ''}${word}`; }
          if (row) append();
        }
      }
      this.box.hidden = false;
      this.box.style.left = `${Math.max(4, Math.min(event.clientX + 14, innerWidth - this.box.offsetWidth - 4))}px`;
      this.box.style.top = `${Math.max(4, Math.min(event.clientY + 20, innerHeight - this.box.offsetHeight - 4))}px`;
    });
  }
}
