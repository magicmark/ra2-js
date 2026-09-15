// Run from repository root; see MAP_VISUAL_AUDIT.md. Read-only diagnostic, not a passing regression test.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { MAP_CATALOG } from '../../../src/game/maps/catalog.ts';
import { parseNativeMap, isWithinLocalMap } from '../../../src/game/maps/nativeMap.ts';
import { createMap } from '../../../src/game/map.ts';
import { DEFAULT_ORE_MINES, initializeOreMines } from '../../../src/game/oreMines.ts';
import { MixArchive } from '../../../src/assets/formats.ts';

const root = process.cwd();

const key = (x:number,y:number) => `${x},${y}`;

const road = (c:any) => c && c.tileIndex >= 293 && c.tileIndex <= 295;

function inspect(name:string,cells:any[],mines:readonly any[],cx:number,cy:number,local=(_c:any)=>true,structures:any[]=[]) {
  const idx = new Map(cells.map(c=>[key(c.x,c.y),c]));
  const roads = cells.filter(c=>road(c)&&local(c));

  const ranges = (axis:'x'|'y',fixed:number) => {
    const axisCells=roads.flatMap(c=>(axis==='x'?c.y===fixed:c.x===fixed)?[c[axis]]:[]).sort((a,b)=>a-b);
    const runs:number[][]=[];

    for(const n of axisCells) { const last=runs.at(-1);

 if(last&&n===last[1]+1)last[1]=n; else runs.push([n,n]); }

    return runs.map(([from,to])=>({from:axis==='x'?[from,fixed]:[fixed,from],to:axis==='x'?[to,fixed]:[fixed,to],before:idx.get(axis==='x'?key(from-1,fixed):key(fixed,from-1))?.tileIndex,after:idx.get(axis==='x'?key(to+1,fixed):key(fixed,to+1))?.tileIndex}));
  };

  const fragments=new Map();

  for(const c of roads) {
    const w=c.tileIndex===293?1:3,h=c.tileIndex===294?1:3;
    const ax=c.x-c.subTile%w,ay=c.y-Math.floor(c.subTile/w);
    const k=`${c.tileIndex}:${ax},${ay}`;

    if(fragments.has(k))continue;
    const missing=[];

    for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++) {
      const other=idx.get(key(ax+dx,ay+dy));

      if(!other||other.tileIndex!==c.tileIndex||other.subTile!==dy*w+dx)missing.push({x:ax+dx,y:ay+dy,tileIndex:other?.tileIndex});
    }

    fragments.set(k,{tileIndex:c.tileIndex,anchor:[ax,ay],missing});
  }

  return {name,inspectedCells:cells.length,localCells:cells.filter(local).length,roadCells:roads.length,roadTileTypes:[...new Set(roads.map(c=>c.tileIndex))],roadRuns:{x:ranges('x',cy),y:ranges('y',cx)},incompleteRoadPieces:[...fragments.values()].filter(f=>f.missing.length),drills:mines.map(m=>({x:m.x,y:m.y,tileIndex:idx.get(key(m.x,m.y))?.tileIndex,onRoad:!!road(idx.get(key(m.x,m.y))),nearestRoadCell:roads.reduce((a,c)=>Math.hypot(c.x-m.x,c.y-m.y)<a.distance?{x:c.x,y:c.y,distance:Math.hypot(c.x-m.x,c.y-m.y)}:a,{distance:Infinity})})),structures};
}

const training=createMap();

const trainingCells=training.map((t,i)=>({x:i%64,y:Math.floor(i/64),...t.nativeArt}));

const trainingResult=inspect('Field Command (training)',trainingCells,DEFAULT_ORE_MINES,23,30);

const trainingState:any={width:64,height:64,tiles:training};

initializeOreMines(trainingState);

Object.assign(trainingResult,{drillsAfterInitialization:DEFAULT_ORE_MINES.map(m=>({x:m.x,y:m.y,...training[m.y*64+m.x]}))});

const results=[trainingResult,...MAP_CATALOG.map(entry=>{
  const text=readFileSync(`${root}/public/maps/${entry.id}.map`,'utf8');
  const map=parseNativeMap(text);

  return {id:entry.id,theater:map.theater,source:`public/maps/${entry.id}.map`,...inspect(map.name,map.cells,map.terrain.filter(t=>t.type==='TIBTRE01'),95,95,c=>isWithinLocalMap(c,map),map.structures),sha256:createHash('sha256').update(text).digest('hex')};
})];

const archives:MixArchive[]=[];

function visit(bytes:Uint8Array,name:string) {
  const a=new MixArchive(bytes,name);archives.push(a);

  for(const child of ['local.mix','cache.mix','generic.mix','conquer.mix','isogen.mix','isotemp.mix','isosnow.mix','isourb.mix','temperat.mix','snow.mix','urban.mix','neutral.mix']) {const b=a.get(child);

if(b)visit(b,child);}
}

visit(readFileSync(`${process.env.RA2_ASSET_DIR}/ra2.mix`),'ra2.mix');

const get=(name:string)=>{const b=archives.map(a=>a.get(name)).find(Boolean);

if(!b)throw Error(`Missing ${name}`);

return b;};

const ini=(name:string)=>{const sections:Record<string,Record<string,string>>={};let current:Record<string,string>={};

for(const raw of new TextDecoder().decode(get(name)).split(/\r?\n/)){const line=raw.replace(/;.*/,'').trim();const h=/^\[(.+)\]$/.exec(line);

if(h)current=sections[h[1].toLowerCase()]??={};else{const eq=line.indexOf('=');

if(eq>=0)current[line.slice(0,eq).trim().toLowerCase()]=line.slice(eq+1).trim();}}

return sections;};

const originalRoadSets = ['temperat.ini', 'snow.ini', 'urban.ini'].flatMap(file => {
  let offset = 0;

  return Object.entries(ini(file)).filter(([s]) => /^tileset\d+$/.test(s)).sort((a,b) => +a[0].slice(7)-+b[0].slice(7)).flatMap(([section,v]) => {
    const count = Number(v.tilesinset ?? 0), first = offset; offset += count;

    return /road/i.test(v.setname ?? '') ? [{ file, section, first, count, ...v }] : [];
  });
});

const sha = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');

const originalEndPieces = ['tem', 'sno', 'urb'].flatMap(extension => [1,2,3,4].map((n,i) => {
  const fileName = `p_end0${n}.${extension}`, bytes = get(fileName), v = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);

  return {fileName,tileIndex:(extension==='sno'?430:445)+i,columns:v.getUint32(0,true),rows:v.getUint32(4,true),sha256:sha(bytes),endDirection:[[1,0],[0,-1],[-1,0],[0,1]][i]};
}));

const sourceHashes = Object.fromEntries(['src/game/map.ts','src/game/oreMines.ts','src/game/maps/theater.ts','src/game/maps/terrainTopology.ts','scripts/generateMaps.ts'].map(path=>[path,sha(readFileSync(path))]));

console.log(JSON.stringify({ baseline: '522691f', sourceHashes, results, originalRoadSets, originalEndPieces }, null, 2));
