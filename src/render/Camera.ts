import type { Vec2 } from '../game/types';
import type { NativeMap } from '../game/maps/nativeMap';

export const TILE_W = 60,
  TILE_H = 30;

export class Camera {
  x = (16 - 41) * 30;
  y = (16 + 41) * 15;
  zoom = 1;
  width = 1000;
  height = 700;
  minZoom = 0.45;
  maxZoom = 2.4;
  private nativeBounds = new WeakMap<
    NativeMap,
    { left: number; right: number; top: number; bottom: number }
  >();
  project(x: number, y: number): Vec2 {
    return { x: (x - y) * 30, y: (x + y) * 15 };
  }
  screen(x: number, y: number): Vec2 {
    const p = this.project(x, y);

    return {
      x: (p.x - this.x) * this.zoom + this.width / 2,
      y: (p.y - this.y) * this.zoom + this.height / 2,
    };
  }
  world(x: number, y: number): Vec2 {
    const a = (x - this.width / 2) / this.zoom + this.x,
      b = (y - this.height / 2) / this.zoom + this.y;

    return { x: a / 60 + b / 30, y: b / 30 - a / 60 };
  }
  center(x: number, y: number) {
    const p = this.project(x, y);
    this.x = p.x;
    this.y = p.y;
  }
  pan(x: number, y: number) {
    this.x -= x / this.zoom;
    this.y -= y / this.zoom;
  }
  setZoom(value: number, anchor: Vec2 = { x: this.width / 2, y: this.height / 2 }) {
    const before = this.world(anchor.x, anchor.y);
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, value));

    const after = this.world(anchor.x, anchor.y),
      a = this.project(before.x, before.y),
      b = this.project(after.x, after.y);

    this.x += a.x - b.x;
    this.y += a.y - b.y;
  }
  /** Native maps are rectangles in projected space, not in their backing grid. */
  private nativeLimits(map: NativeMap) {
    const cached = this.nativeBounds.get(map);

    if (cached) return cached;
    const [, , width, height] = map.size;
    // Inset the alternating half-cell tips to the fully tiled rectangle.
    // Gameplay terrain is drawn 15px below the native cell centres.
    // Elevated TMP cells move up 15px per level. Keep the viewport in the
    // overlap of raised terrain and the ground-level gameplay/shroud grid.
    let high = 0;

    for (const cell of map.cells) high = Math.max(high, cell.height);

    const bounds = {
      left: -(width - 1) * 30,
      right: (width - 1) * 30,
      top: (width + 2) * 15,
      bottom: (width + 2 * height - high) * 15,
    };

    this.nativeBounds.set(map, bounds);

    return bounds;
  }
  constrainedPosition(
    width: number,
    height: number,
    x = this.x,
    y = this.y,
    map?: NativeMap,
  ): Vec2 {
    if (map) {
      const b = this.nativeLimits(map),
        halfW = this.width / 2 / this.zoom,
        halfH = this.height / 2 / this.zoom;

      const clamp = (value: number, low: number, high: number) =>
        low > high ? (low + high) / 2 : Math.max(low, Math.min(high, value));

      return {
        x: clamp(x, b.left + halfW, b.right - halfW),
        y: clamp(y, b.top + halfH, b.bottom - halfH),
      };
    }

    return this.project(
      Math.max(-3, Math.min(width + 3, x / 60 + y / 30)),
      Math.max(-3, Math.min(height + 3, y / 30 - x / 60)),
    );
  }
  constrain(width: number, height: number, map?: NativeMap) {
    if (map) {
      const b = this.nativeLimits(map);
      this.minZoom = Math.max(
        0.45,
        this.width / Math.max(1, b.right - b.left),
        this.height / Math.max(1, b.bottom - b.top),
      );
      this.maxZoom = Math.max(2.4, this.minZoom);
    } else {
      this.minZoom = 0.45;
      this.maxZoom = 2.4;
    }

    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
    const p = this.constrainedPosition(width, height, this.x, this.y, map);
    this.x = p.x;
    this.y = p.y;
  }
}
