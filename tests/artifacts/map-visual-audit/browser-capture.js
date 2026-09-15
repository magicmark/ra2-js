// In a dev Map Viewer with originals ready, import this module and call install().
// Capture the viewport after overview(id), details(id), drills(id), or ends(extension).
// This diagnostic changes only its own canvas and paused Game; reload to remove it.
import { Renderer } from '/src/render/Renderer.ts';
import { Game } from '/src/game/Game.ts';
import { MAP_CATALOG } from '/src/game/maps/catalog.ts';
import { parseNativeMap } from '/src/game/maps/nativeMap.ts';
import { MixArchive, decodeTmp, decodePalette } from '/src/assets/formats.ts';

export async function install() {
  const assets = window.__mapViewer.assets;
  if (!assets.ready) throw Error('Import complete originals in Map Viewer first');
  document.querySelector('#audit')?.remove();
  const maps = await Promise.all(MAP_CATALOG.map(async e => ({ ...e, map: parseNativeMap(await (await fetch(e.path)).text()) })));
  const panel = document.createElement('div'); panel.id = 'audit';
  panel.style = 'position:fixed;inset:0;background:#17201c;z-index:99999;color:white;font:16px monospace;overflow:auto';
  document.body.append(panel);
  const title = document.createElement('div'); title.style = 'padding:12px;height:44px;box-sizing:border-box';
  const sheet = document.createElement('canvas'); sheet.width = 1400; sheet.height = 1000; sheet.style = 'display:block';
  panel.append(title, sheet);
  const ctx = sheet.getContext('2d');
  const game = new Game({ ai: false }); game.state.paused = true;
  game.state.explored.fill(1); game.state.fog.fill(1);
  const makeRenderer = source => {
    const c = document.createElement('canvas'); panel.append(c);
    c.style = 'position:fixed;left:-10000px;width:1400px;height:1000px';
    const r = new Renderer(c, source); r.assets = assets; return r;
  };
  const native = makeRenderer(), training = makeRenderer(game);
  // Fit the entire diagnostic overview, below gameplay's minimum zoom; no ticking.
  training.camera.constrain = () => {};
  const select = id => id === 'training' ? { name: 'Field Command', renderer: training } : { ...maps.find(m => m.id === id), renderer: native };
  const clear = label => { title.textContent = label + ' | baseline 522691f'; ctx.fillStyle = '#17201c'; ctx.fillRect(0, 0, 1400, 1000); };
  const render = (e, width, height) => {
    e.renderer.canvas.style.width = width + 'px'; e.renderer.canvas.style.height = height + 'px';
    if (e.map) e.renderer.renderNativeMap(e.map); else e.renderer.render();
  };
  const copy = (r, x, y, w, h) => ctx.drawImage(r.canvas, 0, 0, r.canvas.width, r.canvas.height, x, y, w, h);
  const views = {
    training: [[22,51,'drill on road'],[23,30,'erased crossing / shore'],[23,54,'uncapped south end'],[5,30,'uncapped west end']],
    'ironwood-crossing': [[127,95,'one-cell road strip'],[95,132,'isolated end / clearing'],[95,52,'uncapped north end'],[139,95,'uncapped east end']],
    'slatewater-reach': [[95,135,'one-cell road strip'],[119,95,'road into shore'],[95,57,'partial shore contact'],[139,95,'uncapped east end']],
    'tidal-crown': [[95,136,'one-cell road strip'],[123,95,'cleared road gap'],[95,54,'uncapped north end'],[137,95,'uncapped east end']],
  };
  let archives = [];
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.mix'; input.style = 'position:fixed;right:0;bottom:0'; panel.append(input);
  input.onchange = async () => {
    archives = [];
    const visit = a => { archives.push(a); for (const name of ['local.mix','cache.mix','generic.mix','conquer.mix','isogen.mix','isotemp.mix','isosnow.mix','isourb.mix','temperat.mix','snow.mix','urban.mix','neutral.mix']) { const bytes = a.get(name); if (bytes) visit(new MixArchive(bytes,name)); } };
    visit(new MixArchive(new Uint8Array(await input.files[0].arrayBuffer()), 'ra2.mix'));
    input.hidden = true;
  };
  return {
    overview(id) {
      const e = select(id), r = e.renderer; clear(e.name + ' | full map | original assets');
      r.canvas.style.width = '1400px'; r.canvas.style.height = '1000px';
      if (e.map) r.fitNativeMap(e.map, 35); else { r.camera.center(32,32); r.camera.zoom = .35; }
      render(e,1400,1000); copy(r,0,0,1400,1000);
    },
    details(id) {
      const e = select(id), r = e.renderer; clear(e.name + ' | original-assets details, 100% zoom');
      views[id].forEach(([x,y,label],i) => {
        r.camera.center(x,y); r.camera.zoom = 1; render(e,700,460);
        const ox = i%2*700, oy = Math.floor(i/2)*500; copy(r,ox,oy+40,700,460);
        ctx.fillStyle = 'white'; ctx.font = '16px monospace'; ctx.fillText(`(${x},${y}) ${label}`,ox+10,oy+25);
      });
    },
    drills(id) {
      const e = select(id), r = e.renderer, points = e.map ? e.map.terrain.filter(t=>t.type==='TIBTRE01') : game.state.oreMines;
      clear(e.name + ` | ALL ${points.length} drills, original assets at 100%`);
      points.forEach(({x,y},i) => {
        r.camera.center(x,y); r.camera.zoom = 1; render(e,350,290);
        const ox = i%4*350, oy = Math.floor(i/4)*330; copy(r,ox,oy+40,350,290);
        ctx.fillStyle = 'white'; ctx.font = '16px monospace'; ctx.fillText(`(${x},${y})`,ox+10,oy+25);
      });
    },
    ends(extension = 'tem') {
      if (!archives.length) throw Error('Choose ra2.mix in the diagnostic file input first');
      clear(`Original .${extension} paved road ends | exact TMP subtiles + 3 straight pieces | enlarged reference`);
      const get = name => { const bytes = archives.map(a=>a.get(name)).find(Boolean); if (!bytes) throw Error(name); return bytes; };
      const pal = decodePalette(get(`iso${extension}.pal`)), vectors = [[1,0],[0,-1],[-1,0],[0,1]], directions = ['+x / screen SE','-y / screen NE','-x / screen NW','+y / screen SW'];
      for (let i=0;i<4;i++) {
        const [vx,vy] = vectors[i], ox = i%2*700, oy = Math.floor(i/2)*500, scale = 1.75;
        const stamp = (name,ax,ay) => {
          const bytes = get(name), v = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), w = v.getUint32(0,true), h = v.getUint32(4,true);
          for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
            const sub=y*w+x; if(!v.getUint32(16+sub*4,true))continue;
            const f=decodeTmp(bytes,sub), c=document.createElement('canvas'); c.width=60;c.height=30;
            const t=c.getContext('2d'), im=t.createImageData(60,30);
            f.pixels.forEach((p,j)=>{if(p)im.data.set([...pal.slice(p*3,p*3+3),255],j*4);});t.putImageData(im,0,0);
            ctx.imageSmoothingEnabled=false;ctx.drawImage(c,ox+(170+(ax+x-ay-y)*30)*scale,oy+50+(65+(ax+x+ay+y)*15)*scale,60*scale,30*scale);
          }
        };
        for(let d=1;d<=3;d++)stamp(`proad0${vx?1:2}.${extension}`,-vx*d,-vy*d);
        stamp(`p_end0${i+1}.${extension}`,0,0);
        ctx.fillStyle='white';ctx.font='18px monospace';ctx.fillText(`p_end0${i+1}.${extension} | tile ${(extension==='sno'?430:445)+i} | ends ${directions[i]}`,ox+10,oy+25);
        ctx.fillText(`Straight approach: proad0${vx?1:2}.${extension}`,ox+10,oy+460);
      }
    },
    inventory: maps.map(e=>({id:e.id,cells:e.map.cells.length,drills:e.map.terrain.filter(t=>t.type==='TIBTRE01').length})),
  };
}
