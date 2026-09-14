import type { NativeMap } from '../src/game/maps/nativeMap.ts';

/** Greedy native LZO1X writer. Uses literal runs and M3 dictionary matches. */
export function encodeLzo1x(bytes: Uint8Array): Uint8Array {
  const out: number[] = [], dictionary = new Map<number, number>(); let p = 0, literalStart = 0, previousMatch = -1;
  const extended = (n: number) => { while (n > 255) { out.push(0); n -= 255; } out.push(n); };
  const literals = (end: number) => {
    const n = end - literalStart; if (!n) return;
    if (!out.length && n <= 238) out.push(n + 17);
    else if (n < 4 && previousMatch >= 0) out[previousMatch] |= n;
    else if (n <= 18) out.push(n - 3);
    else { out.push(0); extended(n - 18); }
    for (let i = literalStart; i < end; i++) out.push(bytes[i]);
  };
  const key = (i: number) => bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
  while (p + 3 < bytes.length) {
    const hash = key(p), match = dictionary.get(hash); dictionary.set(hash, p);
    let length = 0;
    if (match !== undefined && p - match <= 16384)
      while (p + length < bytes.length && bytes[match + length] === bytes[p + length]) length++;
    if (length < 4) { p++; continue; }
    literals(p);
    if (length <= 33) out.push(32 | (length - 2)); else { out.push(32); extended(length - 33); }
    const distance = (p - match! - 1) << 2; previousMatch = out.length; out.push(distance & 255, distance >> 8);
    for (let i = p + 1; i < p + length && i + 2 < bytes.length; i++) dictionary.set(key(i), i);
    p += length; literalStart = p;
  }
  literals(bytes.length); out.push(17, 0, 0); return Uint8Array.from(out);
}
export function encodeLcw(bytes: Uint8Array): Uint8Array {
  const out: number[] = []; let p = 0;
  const run = (i: number) => { let n = 1; while (i + n < bytes.length && n < 65535 && bytes[i + n] === bytes[i]) n++; return n; };
  while (p < bytes.length) {
    const n = run(p);
    if (n >= 4) { out.push(254, n & 255, n >> 8, bytes[p]); p += n; }
    else { const start = p++; while (p < bytes.length && p - start < 63 && run(p) < 4) p++; out.push(128 | (p - start)); for (let i = start; i < p; i++) out.push(bytes[i]); }
  }
  out.push(128); return Uint8Array.from(out);
}
export function packSection(data: Uint8Array, codec: 'lzo' | 'lcw'): string {
  const result: number[] = [];
  for (let p = 0; p < data.length; p += 8192) {
    const raw = data.subarray(p, p + 8192), compressed = (codec === 'lzo' ? encodeLzo1x : encodeLcw)(raw);
    result.push(compressed.length & 255, compressed.length >> 8, raw.length & 255, raw.length >> 8, ...compressed);
  }
  return Buffer.from(result).toString('base64').match(/.{1,70}/g)!.map((line, index) => `${index + 1}=${line}`).join('\n');
}
export function writeNativeMap(map: NativeMap, description: string): string {
  const iso = new Uint8Array(map.cells.length * 11 + 4), view = new DataView(iso.buffer), overlay = new Uint8Array(512 * 512).fill(255), overlayData = new Uint8Array(512 * 512);
  map.cells.forEach((cell, i) => {
    const p = i * 11; view.setUint16(p, cell.x, true); view.setUint16(p + 2, cell.y, true); view.setInt32(p + 4, cell.tileIndex, true);
    iso[p + 8] = cell.subTile; iso[p + 9] = cell.height; iso[p + 10] = cell.iceGrowth;
    overlay[cell.x + 512 * cell.y] = cell.overlay; overlayData[cell.x + 512 * cell.y] = cell.overlayData;
  });
  return `; Original six-player battlefield authored by scripts/generateMaps.ts
; Standard FinalAlert2 / Red Alert 2 native INI map. No custom terrain sections.
; ${description}

[Basic]
Name=${map.name}
Player=Neutral
NewINIFormat=4
MultiplayerOnly=yes
MinPlayer=2
MaxPlayer=6
GameMode=standard
RequiredAddon=0
SkipScore=yes
EndOfGame=yes
OneTimeOnly=no
TruckCrate=no
TrainCrate=no

[Map]
Theater=${map.theater}
Size=${map.size.join(',')}
LocalSize=${map.localSize.join(',')}

[SpecialFlags]
Inert=yes
TiberiumGrows=yes
TiberiumSpreads=yes
TiberiumExplosive=no
DestroyableBridges=yes

[Lighting]
Ambient=${map.lighting.ambient}
Red=${map.lighting.red}
Green=${map.lighting.green}
Blue=${map.lighting.blue}
Level=0.000
Ground=0.000

[Waypoints]
${map.starts.map(start => `${start.index}=${start.x + start.y * 1000}`).join('\n')}

[Structures]
${map.structures.map(s => `${s.id}=${s.owner},${s.type},${s.health},${s.x},${s.y},${s.facing},None,0,0,1,0,0,None,None,None,0,0`).join('\n')}

[Terrain]
${map.terrain.map(t => `${t.x + t.y * 1000}=${t.type}`).join('\n')}

[IsoMapPack5]
${packSection(iso, 'lzo')}

[OverlayPack]
${packSection(overlay, 'lcw')}

[OverlayDataPack]
${packSection(overlayData, 'lcw')}
`;
}
