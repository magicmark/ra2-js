import { afterEach, describe, expect, it, vi } from 'vitest';
import { Controls, detectMobile } from '../src/input/Controls';
import { Camera } from '../src/render/Camera';
import type { ControlRenderer } from '../src/input/Controls';
import { Game } from '../src/game/Game';

afterEach(() => vi.unstubAllGlobals());

class TouchPointer extends Event {
  pointerType = 'touch';
  button = 0;
  shiftKey = false;
  constructor(
    type: string,
    public pointerId: number,
    public clientX: number,
    public clientY: number,
  ) {
    super(type, { cancelable: true });
  }
}

function touchFixture() {
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', {
    documentElement: { classList: { contains: () => false } },
    body: { classList: { contains: () => false } },
  });
  const camera = new Camera();
  camera.width = 600;
  camera.height = 400;
  camera.center(30, 30);

  const canvas = Object.assign(new EventTarget(), {
    style: { cursor: '' },
    focus: vi.fn(),
    setPointerCapture: vi.fn(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 400 }),
  });

  const renderer: ControlRenderer = {
    canvas,
    camera,
    pointer: { x: 0, y: 0 },
    hoverId: null,
    visible: () => true,
    entityPoint: (e) => camera.screen(e.x, e.y),
    pick: () => null,
    selectionBox: null,
    placement: null,
  };

  const game = new Game();

  const controls = new Controls(renderer, game, true, {
    toast: vi.fn(),
    zoom: vi.fn(),
    mode: vi.fn(),
    ack: vi.fn(),
  });

  const pointer = (type: string, id: number, x: number, y: number) =>
    canvas.dispatchEvent(new TouchPointer(type, id, x, y));

  return { camera, canvas, renderer, game, controls, pointer };
}

describe('mobile control activation', () => {
  it('activates for a mobile user agent without a query parameter', () => {
    vi.stubGlobal('location', { search: '' });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148',
      maxTouchPoints: 0,
    });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(detectMobile()).toBe(true);
  });

  it('activates forced controls on an ordinary desktop and leaves the default desktop alone', () => {
    vi.stubGlobal('location', { search: '?force_mobile=1' });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 0 });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(detectMobile()).toBe(true);
    vi.stubGlobal('location', { search: '' });
    expect(detectMobile()).toBe(false);
  });

  it('recognizes tablets presenting a desktop user agent with a coarse touch pointer', () => {
    vi.stubGlobal('location', { search: '' });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      maxTouchPoints: 5,
    });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(detectMobile()).toBe(true);
  });
});

describe('two-finger camera gestures', () => {
  it('lets a touch player cancel placement without losing the completed structure or credits', () => {
    const { game, renderer, controls } = touchFixture();
    expect(game.build('power')).toBe(true);

    for (let i = 0; i < (game.defs.power.buildTime + 1) * 4; i++) game.tick(0.25);
    const queue = game.state.sides[0].queues.structures;
    expect(queue[0].ready).toBe(true);
    const credits = game.state.sides[0].money;
    controls.setPlacement('power');
    controls.setMode('pan');
    expect(renderer.placement).toBe('power');
    controls.setMode('select');
    expect(renderer.placement).toBeNull();
    expect(queue).toHaveLength(1);
    expect(queue[0].ready).toBe(true);
    expect(game.state.sides[0].money).toBe(credits);
    controls.setPlacement('power');
    expect(renderer.placement).toBe('power');
  });

  it('keeps the map point between the fingers fixed through an asymmetric pinch', () => {
    const { camera, pointer } = touchFixture();
    const anchor = camera.world(200, 200);
    pointer('pointerdown', 1, 100, 200);
    pointer('pointerdown', 2, 300, 200);
    pointer('pointermove', 1, 80, 180);
    pointer('pointermove', 2, 320, 220);
    const underFingers = camera.world(200, 200);
    expect(camera.zoom).toBeCloseTo(Math.hypot(240, 40) / 200, 9);
    expect(underFingers.x).toBeCloseTo(anchor.x, 8);
    expect(underFingers.y).toBeCloseTo(anchor.y, 8);
  });

  it('moves terrain with both fingers without accumulating zoom drift from sequential pointer events', () => {
    const { camera, pointer } = touchFixture();
    const anchor = camera.world(200, 170);
    pointer('pointerdown', 1, 100, 170);
    pointer('pointerdown', 2, 300, 170);
    pointer('pointermove', 1, 155, 205);
    pointer('pointermove', 2, 355, 205);
    const underFingers = camera.world(255, 205);
    expect(camera.zoom).toBeCloseTo(1, 9);
    expect(underFingers.x).toBeCloseTo(anchor.x, 8);
    expect(underFingers.y).toBeCloseTo(anchor.y, 8);
  });

  it('finishes and cancels camera gestures without issuing battlefield orders or placing a building', () => {
    const { game, renderer, pointer } = touchFixture();
    game.select([
      game.state.entities.find((entity) => entity.side === 0 && game.defs[entity.type].speed > 0)!
        .id,
    ]);

    const move = vi.spyOn(game, 'orderMove'),
      attack = vi.spyOn(game, 'orderAttack'),
      place = vi.spyOn(game, 'place');

    renderer.placement = 'power';
    pointer('pointerdown', 1, 100, 200);
    pointer('pointerdown', 2, 300, 200);
    pointer('pointermove', 1, 80, 200);
    pointer('pointermove', 2, 320, 200);
    pointer('pointerup', 1, 80, 200);
    pointer('pointerup', 2, 320, 200);
    pointer('pointerdown', 3, 100, 200);
    pointer('pointerdown', 4, 300, 200);
    pointer('pointercancel', 3, 100, 200);
    pointer('pointerup', 4, 300, 200);
    expect(move).not.toHaveBeenCalled();
    expect(attack).not.toHaveBeenCalled();
    expect(place).not.toHaveBeenCalled();
    expect(renderer.selectionBox).toBeNull();
    expect(renderer.placement).toBe('power');
  });
});
