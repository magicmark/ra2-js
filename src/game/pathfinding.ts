import type { Vec2 } from './types';

interface SearchNode { index: number; f: number }
class MinHeap {
  private data: SearchNode[] = [];
  get length(): number { return this.data.length; }
  push(node: SearchNode): void {
    let i = this.data.length;
    this.data.push(node);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].f <= node.f) break;
      this.data[i] = this.data[p];
      i = p;
    }
    this.data[i] = node;
  }
  pop(): SearchNode {
    const first = this.data[0];
    const tail = this.data.pop()!;
    if (this.data.length) {
      let i = 0;
      while (i * 2 + 1 < this.data.length) {
        let child = i * 2 + 1;
        if (child + 1 < this.data.length && this.data[child + 1].f < this.data[child].f) child++;
        if (this.data[child].f >= tail.f) break;
        this.data[i] = this.data[child];
        i = child;
      }
      this.data[i] = tail;
    }
    return first;
  }
}

const directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
const heuristic = (x: number, y: number, tx: number, ty: number): number => {
  const dx = Math.abs(x - tx), dy = Math.abs(y - ty);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
};

/** Eight-way A*, returning tile centers. Diagonal moves may not cut blocked corners. */
export function findPath(
  width: number, height: number, start: Vec2, goal: Vec2,
  passable: (x: number, y: number) => boolean,
): Vec2[] {
  const sx = Math.floor(start.x), sy = Math.floor(start.y), tx = Math.floor(goal.x), ty = Math.floor(goal.y);
  if (![sx, sy, tx, ty].every(Number.isFinite) || sx < 0 || sy < 0 || sx >= width || sy >= height || tx < 0 || ty < 0 || tx >= width || ty >= height)
    return [];
  if (sx === tx && sy === ty) return [];
  if (!passable(tx, ty)) return [];
  const length = width * height, from = new Int32Array(length).fill(-1);
  const costs = new Float64Array(length).fill(Infinity), closed = new Uint8Array(length);
  const open = new MinHeap(), startIndex = sy * width + sx, targetIndex = ty * width + tx;
  costs[startIndex] = 0;
  open.push({ index: startIndex, f: heuristic(sx, sy, tx, ty) });
  while (open.length) {
    const current = open.pop().index;
    if (closed[current]) continue;
    if (current === targetIndex) {
      const route: Vec2[] = [];
      for (let index = current; index !== startIndex; index = from[index])
        route.push({ x: index % width + 0.5, y: Math.floor(index / width) + 0.5 });
      return route.reverse();
    }
    closed[current] = 1;
    const x = current % width, y = Math.floor(current / width);
    for (const [dx, dy] of directions) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || !passable(nx, ny)) continue;
      if (dx !== 0 && dy !== 0 && (!passable(x + dx, y) || !passable(x, y + dy))) continue;
      const next = ny * width + nx, cost = costs[current] + (dx && dy ? Math.SQRT2 : 1);
      if (closed[next] || cost >= costs[next]) continue;
      costs[next] = cost;
      from[next] = current;
      open.push({ index: next, f: cost + heuristic(nx, ny, tx, ty) });
    }
  }
  return [];
}
