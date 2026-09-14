import type { Entity, GameAPI, Tile, UnitDef, Vec2 } from '../game/types';
import { GL, type Color, type Texture } from './GL';
import { Camera } from './Camera';
import type { NativeMap } from '../game/maps/nativeMap';
import type { NativeCell } from '../game/maps/nativeMap';
import type { NativeTheater } from '../game/maps/theater';
import { INSPECTION_RULES } from '../game/customUnits';
const terrainCodes:Record<Tile['terrain'],number>={grass:1,water:2,rock:3,road:4,sand:5};

export interface OriginalSprite { source: CanvasImageSource; width: number; height: number; offsetX?:number; offsetY?:number; anchorX?:number; anchorY?:number }
export interface SpriteProvider { ready:boolean; getSprite(name:string,frame?:number,side?:number):OriginalSprite|null; getInfantryFrame(name:string,frame:number,side?:number):OriginalSprite|null; getInfantrySequence(name:string,action:string,facing:number,age:number,side?:number,speedIndex?:number):OriginalSprite|null; getAnimationSprite(name:string,age:number,ticksPerFrame?:number):OriginalSprite|null; getAnimationOpacity(name:string):number; getVehicleSprite(name:string,hull:number,turret:number,side?:number):OriginalSprite|null; getBuildingSprite(name:string,time:number,side?:number,speedIndex?:number):OriginalSprite|null; getTerrain(terrain:string,variant?:number):OriginalSprite|null; getOverlay(kind:'ore'|'tree',variant?:number):OriginalSprite|null }
export interface NativeSpriteProvider extends SpriteProvider {
  getNativeTerrain(theater:NativeTheater,tileIndex:number,subTile:number):OriginalSprite|null;
  getNativeOverlay(theater:string,index:number,data?:number):OriginalSprite|null;
  getNativeStructure(theater:string,type:string):OriginalSprite|null;
  getNativeDecoration(theater:string,name:string):OriginalSprite|null;
  getNativeFoundation(type:string):[number,number];
}
export interface NativeMapBounds { left:number; top:number; right:number; bottom:number }
export class Renderer {
  readonly gl: GL;
  readonly camera = new Camera();
  assets: SpriteProvider | null = null;
  placement: string|null = null;
  pointer: Vec2 = {x:0,y:0};
  selectionBox: {from:Vec2;to:Vec2}|null = null;
  hoverId: number|null = null;
  targetLines = true;
  private textures = new WeakMap<object, Texture>();
  private shroudEdges = new Map<number, OriginalSprite>();
  private terrainChunks = new Map<string, HTMLCanvasElement>();
  private terrainChunkVersions = new Map<string, number>();
  private terrainVersion=0;
  private terrainProvider:SpriteProvider|null=null;
  private terrainSource:CanvasImageSource|null=null;
  private terrainHash=0;
  private frame=0;
  private nativeTerrainMap:NativeMap|null=null;
  private nativeTerrainProvider:SpriteProvider|null=null;
  private nativeSurfaces:{x:number;y:number;source:HTMLCanvasElement}[]=[];
  private nativeSurfacePool:HTMLCanvasElement[]=[];
  private nativeHeights=new Map<string,number>();
  private nativeCells=new Map<string,NativeCell>();
  nativeBounds:NativeMapBounds={left:0,top:0,right:1,bottom:1};
  constructor(readonly canvas:HTMLCanvasElement,private readonly gameSource?:GameAPI){this.gl=new GL(canvas);}
  get game():GameAPI {
    if(!this.gameSource)throw new Error('This renderer is a map preview without a running game.');
    return this.gameSource;
  }
  private originals():SpriteProvider{
    if(!this.assets?.ready)throw new Error('Original game artwork is not ready. Load complete game files to continue.');
    return this.assets;
  }
  private required(sprite:OriginalSprite|null,name:string):OriginalSprite{
    if(!sprite)throw new Error(`Missing original artwork: ${name}. Load complete game files to continue.`);
    return sprite;
  }
  private texture(source:CanvasImageSource):Texture{
    let texture=this.textures.get(source);if(!texture){this.gl.flush();texture=this.gl.createTexture(source as TexImageSource);this.textures.set(source,texture);}return texture;
  }
  private drawArt(sprite:OriginalSprite,x:number,y:number,shade=1,alpha=1){
    const z=this.camera.zoom,anchorX=sprite.anchorX??sprite.width/2,anchorY=sprite.anchorY??sprite.height;
    // Every tile shares the same world-to-screen transform. Rounding each
    // origin separately while retaining fractional extents opens tile seams.
    this.gl.sprite(this.texture(sprite.source),x-anchorX*z,y-anchorY*z,sprite.width*z,sprite.height*z,[shade,shade,shade,alpha]);
  }
  private nativeAssets():NativeSpriteProvider {
    const assets=this.originals() as NativeSpriteProvider;
    if(typeof assets.getNativeTerrain!=='function')throw new Error('Native map artwork is unavailable.');
    return assets;
  }
  /** Native cell centres retain their FinalAlert coordinates and elevation. */
  nativePoint(x:number,y:number,height=this.nativeHeights.get(`${Math.floor(x)},${Math.floor(y)}`)??0):Vec2 {
    const p=this.camera.screen(x,y);return{x:p.x,y:p.y-height*15*this.camera.zoom};
  }
  private prepareNativeTerrain(map:NativeMap) {
    const assets=this.nativeAssets();
    if(this.nativeTerrainMap===map&&this.nativeTerrainProvider===assets)return;
    this.nativeTerrainMap=null;this.nativeHeights.clear();this.nativeCells.clear();
    const byChunk=new Map<string,{x:number;y:number;items:{sprite:OriginalSprite;x:number;y:number}[]}>(),size=512;
    const bounds:NativeMapBounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};
    const include=(x:number,y:number,w:number,h:number)=>{bounds.left=Math.min(bounds.left,x);bounds.top=Math.min(bounds.top,y);bounds.right=Math.max(bounds.right,x+w);bounds.bottom=Math.max(bounds.bottom,y+h);};
    for(const cell of [...map.cells].sort((a,b)=>a.x+a.y-b.x-b.y)) {
      this.nativeHeights.set(`${cell.x},${cell.y}`,cell.height);
      this.nativeCells.set(`${cell.x},${cell.y}`,cell);
      const art=this.required(assets.getNativeTerrain(map.theater,cell.tileIndex,cell.subTile),`${map.theater} tile ${cell.tileIndex}:${cell.subTile}`);
      const p=this.camera.project(cell.x,cell.y),x=p.x-(art.anchorX??30),y=p.y-cell.height*15-(art.anchorY??15);
      include(x,y,art.width,art.height);
      for(let cy=Math.floor(y/size);cy<=Math.floor((y+art.height-1)/size);cy++)for(let cx=Math.floor(x/size);cx<=Math.floor((x+art.width-1)/size);cx++) {
        const key=`${cx},${cy}`;let chunk=byChunk.get(key);if(!chunk){chunk={x:cx*size,y:cy*size,items:[]};byChunk.set(key,chunk);}
        chunk.items.push({sprite:art,x,y});
      }
    }
    this.nativeSurfaces=[];
    for(const chunk of byChunk.values()) {
      const index=this.nativeSurfaces.length,source=this.nativeSurfacePool[index]??document.createElement('canvas');
      if(!this.nativeSurfacePool[index]){source.width=source.height=size;this.nativeSurfacePool.push(source);}
      const ctx=source.getContext('2d')!;ctx.clearRect(0,0,size,size);ctx.imageSmoothingEnabled=false;
      for(const item of chunk.items)ctx.drawImage(item.sprite.source,item.x-chunk.x,item.y-chunk.y);
      const texture=this.textures.get(source);if(texture)this.gl.updateTexture(texture,source);
      this.nativeSurfaces.push({x:chunk.x,y:chunk.y,source});
    }
    for(const structure of map.structures) {
      const art=this.required(assets.getNativeStructure(map.theater,structure.type),structure.type),[w,h]=assets.getNativeFoundation(structure.type);
      const p=this.camera.project(structure.x+(w-1)/2,structure.y+(h-1)/2),height=this.nativeHeights.get(`${structure.x},${structure.y}`)??0;
      include(p.x-(art.anchorX??art.width/2),p.y-height*15-(art.anchorY??art.height),art.width,art.height);
    }
    this.nativeBounds=bounds;this.nativeTerrainMap=map;this.nativeTerrainProvider=assets;
  }
  private drawNativeTerrain(map:NativeMap,gameGrid=false) {
    this.prepareNativeTerrain(map);const c=this.camera,z=c.zoom;
    for(const chunk of this.nativeSurfaces) {
      const x=(chunk.x-c.x)*z+c.width/2,y=(chunk.y-c.y+(gameGrid?15:0))*z+c.height/2;
      if(x+512*z<0||y+512*z<0||x>c.width||y>c.height)continue;
      this.gl.sprite(this.texture(chunk.source),x,y,512*z,512*z);
    }
  }
  fitNativeMap(map:NativeMap,padding=52) {
    this.prepareNativeTerrain(map);
    const rect=this.canvas.getBoundingClientRect(),c=this.camera,b=this.nativeBounds;
    c.width=rect.width;c.height=rect.height;c.minZoom=.025;c.maxZoom=3;
    c.zoom=Math.max(c.minZoom,Math.min(c.maxZoom,(rect.width-padding*2)/(b.right-b.left),(rect.height-padding*2)/(b.bottom-b.top)));
    c.x=(b.left+b.right)/2;c.y=(b.top+b.bottom)/2;
  }
  /** Full native battlefield, using the same TMP/SHP sprite pipeline as play. No fog pass. */
  renderNativeMap(map:NativeMap) {
    const assets=this.nativeAssets(),rect=this.canvas.getBoundingClientRect(),c=this.camera;
    if(!rect.width||!rect.height)return;
    c.width=rect.width;c.height=rect.height;this.gl.begin(c.width,c.height);this.drawNativeTerrain(map);
    const items:{depth:number;draw:()=>void}[]=[];
    for(const cell of map.cells)if(cell.overlay!==undefined&&cell.overlay!==255) {
      const art=this.required(assets.getNativeOverlay(map.theater,cell.overlay,cell.overlayData),`overlay ${cell.overlay}`),p=this.nativePoint(cell.x,cell.y,cell.height);
      if(p.x<-100||p.x>c.width+100||p.y<-100||p.y>c.height+100)continue;
      this.drawArt(art,p.x,p.y);
    }
    for(const object of map.terrain) {
      const art=this.required(assets.getNativeDecoration(map.theater,object.type),object.type),p=this.nativePoint(object.x,object.y);
      items.push({depth:object.x+object.y,draw:()=>this.drawArt(art,p.x,p.y)});
    }
    for(const structure of map.structures) {
      const art=this.required(assets.getNativeStructure(map.theater,structure.type),structure.type),[w,h]=assets.getNativeFoundation(structure.type);
      const p=this.nativePoint(structure.x+(w-1)/2,structure.y+(h-1)/2,this.nativeHeights.get(`${structure.x},${structure.y}`)??0);
      items.push({depth:structure.x+structure.y+(w+h)/2,draw:()=>this.drawArt(art,p.x,p.y)});
    }
    items.sort((a,b)=>a.depth-b.depth);for(const item of items)item.draw();this.gl.flush();
  }
  visible(entity:Entity){const s=this.game.state;if(entity.side===0)return true;const d=this.game.defs[entity.type];for(let y=Math.floor(entity.y);y<entity.y+d.footprint[1];y++)for(let x=Math.floor(entity.x);x<entity.x+d.footprint[0];x++)if(x>=0&&y>=0&&x<s.width&&y<s.height&&s.fog[y*s.width+x])return true;return false;}
  private visualPosition(entity:Entity):Vec2{const d=this.game.defs[entity.type];if(!entity.previous||d.category==='structures'||d.category==='defenses')return entity;const alpha=Math.max(0,Math.min(1,this.game.interpolation??1));return{x:entity.previous.x+(entity.x-entity.previous.x)*alpha,y:entity.previous.y+(entity.y-entity.previous.y)*alpha};}
  private visualFacing(entity:Entity):number{const previous=entity.previousFacing??entity.facing,delta=Math.atan2(Math.sin(entity.facing-previous),Math.cos(entity.facing-previous));return previous+delta*Math.max(0,Math.min(1,this.game.interpolation??1));}
  entityPoint(entity:Entity):Vec2{const def=this.game.defs[entity.type],building=def.category==='structures'||def.category==='defenses',p=this.visualPosition(entity);return this.camera.screen(p.x+(building?def.footprint[0]/2:0),p.y+(building?def.footprint[1]/2:0));}
  pick(screenX:number,screenY:number):Entity|null{
    const world=this.camera.world(screenX,screenY),entities=this.game.state.entities;
    for(let i=entities.length-1;i>=0;i--){const e=entities[i];if(!this.visible(e))continue;const d=this.game.defs[e.type];if(d.category==='structures'||d.category==='defenses'){if(world.x>=e.x&&world.x<e.x+d.footprint[0]&&world.y>=e.y&&world.y<e.y+d.footprint[1])return e;}else{const p=this.entityPoint(e);if(Math.hypot((screenX-p.x)/1.3,screenY-p.y+10*this.camera.zoom)<18*this.camera.zoom)return e;}}
    return null;
  }
  private tileDiamond(x:number,y:number,color:Color,outline=false){
    const points=[this.camera.screen(x,y),this.camera.screen(x+1,y),this.camera.screen(x+1,y+1),this.camera.screen(x,y+1)].map(p=>[p.x,p.y] as [number,number]);
    if(outline){for(let i=0;i<4;i++)this.gl.line(...points[i],...points[(i+1)%4],1,color);}else this.gl.polygon(points,color);
  }
  private shroudEdge(mask:number):OriginalSprite {
    const existing=this.shroudEdges.get(mask);if(existing)return existing;
    const canvas=document.createElement('canvas');canvas.width=60;canvas.height=30;
    const context=canvas.getContext('2d')!,image=context.createImageData(60,30);
    const neighbors=[[-1,0],[0,-1],[1,0],[0,1],[-1,-1],[1,-1],[1,1],[-1,1]];
    for(let py=0;py<30;py++)for(let px=0;px<60;px++){
      const u=(px+.5-30)/60+(py+.5)/30,v=(py+.5)/30-(px+.5-30)/60;
      if(u<0||u>1||v<0||v>1)continue;
      let distance=1;
      for(let bit=0;bit<neighbors.length;bit++)if(mask&(1<<bit)){
        const [dx,dy]=neighbors[bit];
        const du=dx<0?u:dx>0?1-u:0,dv=dy<0?v:dy>0?1-v:0;
        distance=Math.min(distance,Math.hypot(du,dv));
      }
      // The feather stays inside explored cells: no hidden terrain is revealed.
      image.data[(py*60+px)*4+3]=Math.round(255*Math.max(0,1-distance/.48)**1.4);
    }
    context.putImageData(image,0,0);
    const sprite={source:canvas,width:60,height:30,anchorX:30,anchorY:15};this.shroudEdges.set(mask,sprite);return sprite;
  }
  private drawShroud(minX:number,maxX:number,minY:number,maxY:number){
    const s=this.game.state,neighbors=[[-1,0],[0,-1],[1,0],[0,1],[-1,-1],[1,-1],[1,1],[-1,1]];
    // Cover original TMP edge pixels extending beyond the map's ideal diamond.
    // Adjacent hidden cells form one parallelogram. Its exterior is identical
    // to the individual diamonds, without thousands of redundant triangles.
    for(let y=minY-1;y<=maxY+1;y++){
      let run:number|null=null;
      const flush=(end:number)=>{
        if(run===null)return;
        const points=[[run,y],[end,y],[end,y+1],[run,y+1]].map(([x,y])=>{const p=this.camera.screen(x,y);return[p.x,p.y] as [number,number];});
        this.gl.polygon(points,[0,0,0,1]);run=null;
      };
      for(let x=minX-1;x<=maxX+1;x++){
        if(x<0||y<0||x>=s.width||y>=s.height||!s.explored[y*s.width+x]){if(run===null)run=x;continue;}
        flush(x);
        let mask=0;
        neighbors.forEach(([dx,dy],bit)=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.width||ny>=s.height||!s.explored[ny*s.width+nx])mask|=1<<bit;});
        if(mask){const p=this.camera.screen(x+.5,y+.5);this.drawArt(this.shroudEdge(mask),p.x,p.y);}
      }
      flush(maxX+2);
    }
  }
  private drawCommandLines(){
    if(!this.targetLines)return;
    for(const entity of this.game.state.entities){
      if(!entity.selected||entity.side!==0||entity.hp<=0)continue;
      const command=this.game.commandPath(entity.id);if(!command?.points.length)continue;
      let from=this.entityPoint(entity);
      const color:Color=command.attack?[1,0,0,1]:[0,1,0,1];
      for(const point of command.points){
        const to=this.camera.screen(point.x,point.y);
        this.gl.line(from.x,from.y,to.x,to.y,1,color);from=to;
      }
    }
  }
  private terrainSprite(tile:Tile,x:number,y:number):OriginalSprite {
    const assets=this.originals();
    if(tile.terrain==='road'){
      const name=tile.variant>=32?'proad03':tile.variant>=16?'proad02':'proad01';
      return this.required(assets.getTerrain(name,tile.variant%16),`${name} terrain`);
    }
    if(tile.terrain==='grass'){
      const s=this.game.state,neighbors=[[0,-1],[1,0],[0,1],[-1,0]];
      const around=neighbors.map(([dx,dy])=>x+dx<0||y+dy<0||x+dx>=s.width||y+dy>=s.height?undefined:s.tiles[(y+dy)*s.width+x+dx]?.terrain);
      const transition=around.includes('sand')?'sand':around.includes('rock')?'rock':null;
      if(transition){
        const mask=around.reduce((mask,type,bit)=>mask|(type!==transition?1<<bit:0),0);
        const name=`${transition==='sand'?'glat':'clat'}${String(mask+1).padStart(2,'0')}`;
        return this.required(assets.getTerrain(name,0),`${name} terrain transition`);
      }
    }
    return this.required(assets.getTerrain(tile.terrain,tile.variant),`${tile.terrain} terrain`);
  }
  private drawTerrain(){
    if(this.game.state.nativeMap){this.drawNativeTerrain(this.game.state.nativeMap,true);return;}
    const s=this.game.state,c=this.camera,assets=this.originals(),terrainSource=this.required(assets.getTerrain('grass',0),'grass terrain').source;
    let hash=s.width*65537+s.height;
    for(const tile of s.tiles)hash=Math.imul(hash^terrainCodes[tile.terrain],16777619)^tile.variant;
    if(this.terrainProvider!==assets||this.terrainSource!==terrainSource||this.terrainHash!==hash){
      this.terrainVersion++;this.terrainProvider=assets;
      this.terrainSource=terrainSource;this.terrainHash=hash;
    }
    // Native TMP diamonds join at integer pixel coordinates. Compose that
    // shared surface before zooming: independently sampling each diamond's
    // transparent edge can leave holes even with precise fractional vertices.
    // 480 is divisible by both native cell dimensions and fits a 512px atlas.
    const size=480,z=c.zoom;
    const left=Math.floor((c.x-c.width/2/z)/size),right=Math.floor((c.x+c.width/2/z)/size);
    const top=Math.floor((c.y-c.height/2/z)/size),bottom=Math.floor((c.y+c.height/2/z)/size);
    for(let cy=top;cy<=bottom;cy++)for(let cx=left;cx<=right;cx++){
      const px=cx*size,py=cy*size,key=`${cx}:${cy}`;
      if(px+size<=-s.height*30||px>=s.width*30||py+size<=0||py>=(s.width+s.height)*15)continue;
      let source=this.terrainChunks.get(key);
      if(!source||this.terrainChunkVersions.get(key)!==this.terrainVersion){
        const minX=Math.max(0,Math.floor(px/60+py/30)-2),maxX=Math.min(s.width-1,Math.ceil((px+size)/60+(py+size)/30)+2);
        const minY=Math.max(0,Math.floor(py/30-(px+size)/60)-2),maxY=Math.min(s.height-1,Math.ceil((py+size)/30-px/60)+2);
        if(minX>maxX||minY>maxY)continue;
        if(!source){source=document.createElement('canvas');source.width=source.height=size;}
        const ctx=source.getContext('2d')!;ctx.clearRect(0,0,size,size);ctx.imageSmoothingEnabled=false;let painted=false;
        for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
          const tile=s.tiles[y*s.width+x],sprite=this.terrainSprite(tile,x,y);
          const sx=(x-y)*30-(sprite.anchorX??sprite.width/2)-px,sy=(x+y+1)*15-(sprite.anchorY??sprite.height)-py;
          if(sx+sprite.width<0||sy+sprite.height<0||sx>=size||sy>=size)continue;
          ctx.drawImage(sprite.source,sx,sy);painted=true;
        }
        if(!painted)continue;
        this.terrainChunks.set(key,source);this.terrainChunkVersions.set(key,this.terrainVersion);
        // Reuse the atlas allocation when terrain or palettes change. An
        // identical restarted map also keeps its existing native surfaces.
        const texture=this.textures.get(source);if(texture)this.gl.updateTexture(texture,source);
      }
      this.gl.sprite(this.texture(source),(px-c.x)*z+c.width/2,(py-c.y)*z+c.height/2,size*z,size*z);
    }
  }
  render(){
    const assets=this.originals();
    const rect=this.canvas.getBoundingClientRect(),c=this.camera,s=this.game.state;
    if(rect.width<=0||rect.height<=0)return;
    c.width=rect.width;c.height=rect.height;this.gl.begin(rect.width,rect.height);this.frame++;
    const corners=[c.world(-200,-200),c.world(c.width+200,-200),c.world(0,c.height+220),c.world(c.width+200,c.height+220)];
    const minX=Math.max(0,Math.floor(Math.min(...corners.map(p=>p.x)))),maxX=Math.min(s.width-1,Math.ceil(Math.max(...corners.map(p=>p.x))));
    const minY=Math.max(0,Math.floor(Math.min(...corners.map(p=>p.y)))),maxY=Math.min(s.height-1,Math.ceil(Math.max(...corners.map(p=>p.y))));
    this.drawTerrain();
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      const i=y*s.width+x,tile=s.tiles[i],p=c.screen(x+.5,y+.5);
      if(!s.explored[i])continue;
      const shade=s.fog[i]?1:.39;
      if(!s.fog[i])this.tileDiamond(x,y,[0,0,0,.61]);
      if(tile.ore>0){
        const native=s.nativeMap,cell=native?this.nativeCells.get(`${x},${y}`):undefined;
        const sprite=native&&cell?this.nativeAssets().getNativeOverlay(native.theater,cell.overlay,cell.overlayData):assets.getOverlay('ore',tile.variant);
        this.drawArt(this.required(sprite,'ore'),p.x,p.y-(cell?.height??0)*15*c.zoom,shade);
      }
    }
    const renderables:{depth:number;draw:()=>void}[]=[];
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      const i=y*s.width+x,t=s.tiles[i];if(s.nativeMap||!s.explored[i]||t.terrain!=='rock')continue;
      const p=c.screen(x+.5,y+.5);renderables.push({depth:x+y+1,draw:()=>this.drawArt(this.required(assets.getOverlay('tree',t.variant),'tree'),p.x,p.y,s.fog[i]?1:.39)});
    }
    if(s.nativeMap)for(const object of s.nativeMap.terrain){
      const i=object.y*s.width+object.x;if(!s.explored[i])continue;
      const p=this.nativePoint(object.x+.5,object.y+.5);
      renderables.push({depth:object.x+object.y+1,draw:()=>this.drawArt(this.required(this.nativeAssets().getNativeDecoration(s.nativeMap!.theater,object.type),object.type),p.x,p.y,s.fog[i]?1:.39)});
    }
    for(const e of s.entities){if(!this.visible(e))continue;const p=this.entityPoint(e);if(p.x<-220||p.x>c.width+220||p.y<-80||p.y>c.height+250)continue;
      const d=this.game.defs[e.type],world=this.visualPosition(e);renderables.push({depth:world.x+world.y+(d.footprint[0]+d.footprint[1])/2,draw:()=>this.drawEntity(e,d,p)});
    }
    renderables.sort((a,b)=>a.depth-b.depth);for(const item of renderables)item.draw();
    for(const entity of s.entities)if(this.visible(entity))this.drawInspectionFeedback(entity);
    for(const e of s.effects){if(!s.explored[Math.floor(e.y)*s.width+Math.floor(e.x)])continue;const p=c.screen(e.x,e.y),progress=1-e.life/e.maxLife;
      if(e.animation){
        const age=e.startedAt===undefined?e.maxLife-e.life:s.time-e.startedAt;
        this.drawArt(this.required(assets.getAnimationSprite(e.animation,age,e.animationTicksPerFrame),`${e.animation} animation`),p.x,p.y,1,assets.getAnimationOpacity(e.animation));
        continue;
      }
      // Shot/death events without authored animation metadata remain audio
      // events. Projectile art and infantry/building death sequences are
      // separate native paths; a generic tracer or ring is not their artwork.
      if(e.kind==='order'){const rx=(15-progress*4)*c.zoom,ry=rx*.5,color:Color=[0,1,0,1-progress];
        for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const x=p.x+dx*rx,y=p.y+dy*ry;this.gl.line(x,y,x-dx*5*c.zoom-dy*5*c.zoom,y-dy*3*c.zoom-dx*3*c.zoom,1,color);this.gl.line(x,y,x-dx*5*c.zoom+dy*5*c.zoom,y-dy*3*c.zoom+dx*3*c.zoom,1,color);}}
    }
    this.drawCommandLines();
    this.drawShroud(minX,maxX,minY,maxY);
    // Placement uses the same original sprite and simulation validation as the building.
    if(this.placement){const def=this.game.defs[this.placement],p=c.world(this.pointer.x,this.pointer.y),x=Math.floor(p.x),y=Math.floor(p.y),valid=this.game.canPlace(this.placement,x,y);
      for(let ty=0;ty<def.footprint[1];ty++)for(let tx=0;tx<def.footprint[0];tx++){this.tileDiamond(x+tx,y+ty,valid?[0,1,0,.3]:[1,0,0,.35]);this.tileDiamond(x+tx,y+ty,valid?[0,1,0,.85]:[1,0,0,.85],true);}
      const q=c.screen(x+def.footprint[0]/2,y+def.footprint[1]/2),original=this.required(assets.getSprite(def.sprite||this.placement,0,0),`${def.name} placement`);
      this.drawArt(original,q.x,q.y,.85,.65);
    }
    if(this.selectionBox){const{from,to}=this.selectionBox,x=Math.min(from.x,to.x),y=Math.min(from.y,to.y),w=Math.abs(from.x-to.x),h=Math.abs(from.y-to.y);const color:Color=[1,1,1,1];this.gl.line(x,y,x+w,y,1,color);this.gl.line(x+w,y,x+w,y+h,1,color);this.gl.line(x+w,y+h,x,y+h,1,color);this.gl.line(x,y+h,x,y,1,color);}
    this.gl.flush();
  }
  private drawInspectionFeedback(entity:Entity){
    const p=this.entityPoint(entity),z=this.camera.zoom,cyan:Color=[.2,.9,1,1],gold:Color=[1,.82,.2,1];
    const inspected=entity.inspectedBy!==undefined,george=entity.type==='george';
    if(george&&entity.side===0&&entity.selected){
      // A world-space circle projects to the same isometric ground plane as units.
      const points=Array.from({length:33},(_,i)=>{
        const angle=i/32*Math.PI*2,dx=Math.cos(angle)*INSPECTION_RULES.radius,dy=Math.sin(angle)*INSPECTION_RULES.radius;
        return{x:p.x+(dx-dy)*30*z,y:p.y+(dx+dy)*15*z};
      });
      for(let i=1;i<points.length;i++)this.gl.line(points[i-1].x,points[i-1].y,points[i].x,points[i].y,1,[.2,.9,1,.5]);
    }
    if(george&&entity.inspection&&entity.side===0){
      const target=this.game.state.entities.find(e=>e.id===entity.inspection?.targetId);
      if(target&&this.visible(target)){const q=this.entityPoint(target);this.gl.line(p.x,p.y,q.x,q.y,Math.max(1,z),[.2,.9,1,.65]);}
    }
    if(entity.side===0&&(inspected||(george&&(entity.inspection||entity.selected)))){
      const progress=george?(entity.inspection?.elapsed??0)/INSPECTION_RULES.seconds:entity.inspectionProgress??0;
      const width=30*Math.max(.75,z),height=Math.max(3,3*z),left=p.x-width/2,top=p.y-48*z;
      this.gl.rect(left-1,top-1,width+2,height+2,[0,0,0,.9]);
      this.gl.rect(left,top,width,height,[.06,.22,.27,1]);
      this.gl.rect(left,top,width*Math.max(0,Math.min(1,progress)),height,cyan);
    }
    const rank=entity.rank??0;
    if(rank>0){
      const scale=Math.max(.8,z),x=p.x+12*z,y=p.y-20*z;
      for(let i=0;i<rank;i++){
        const top=y-i*5*scale;
        this.gl.line(x-4*scale,top+3*scale,x,top,Math.max(3,3*scale),[0,0,0,1]);
        this.gl.line(x,top,x+4*scale,top+3*scale,Math.max(3,3*scale),[0,0,0,1]);
        this.gl.line(x-4*scale,top+3*scale,x,top,Math.max(1,scale),gold);
        this.gl.line(x,top,x+4*scale,top+3*scale,Math.max(1,scale),gold);
      }
    }
  }
  private drawEntity(e:Entity,d:UnitDef,p:Vec2){
    const c=this.camera,building=d.category==='structures'||d.category==='defenses',selected=e.selected,hover=e.id===this.hoverId;
    const heading=((this.visualFacing(e)%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    // Infantry SHPs start facing screen-north and advance counterclockwise;
    // simulation headings start at world +X (screen-southeast).
    let frame=building&&e.type!=='sentry'?0:d.category==='vehicles'||e.type==='sentry'?Math.round(heading/(Math.PI*2)*32)%32:(5-Math.round(heading/(Math.PI*2)*8)+8)%8;
    const moving=e.previous?Math.hypot(e.x-e.previous.x,e.y-e.previous.y)>1e-7:e.path.length>0;
    const name=e.type==='conyard'&&e.side===1?'conyard_soviet':d.sprite||e.type;
    const assets=this.originals();
    let original:OriginalSprite;
    if(this.game.state.nativeMap&&/^tech_(oil|airport)$/.test(e.type)){
      original=this.required(this.nativeAssets().getNativeStructure(this.game.state.nativeMap.theater,e.type==='tech_oil'?'CAOILD':'CAAIRP'),d.name);
    }else if(d.category==='infantry'){
      const facing=(5-Math.round(heading/(Math.PI*2)*8)+8)%8;
      const action=e.infantryAnimation?.sequence??(e.type==='rocketeer'?(moving?'Fly':'Hover'):e.deployed?'Deployed':moving?'Walk':'Ready');
      const age=e.infantryAnimation?this.game.state.time-e.infantryAnimation.startedAt:e.anim;
      original=this.required(assets.getInfantrySequence(name,action,facing,age,e.side,this.game.nativeGameSpeedIndex),`${name} ${action} sequence`);
    }else if(d.category==='vehicles'&&d.turret&&e.turretFacing!==undefined){
      const previous=e.previousTurretFacing??e.turretFacing,delta=Math.atan2(Math.sin(e.turretFacing-previous),Math.cos(e.turretFacing-previous));
      const angle=previous+delta*Math.max(0,Math.min(1,this.game.interpolation??1));
      const turret=Math.round(angle/(Math.PI*2)*32);
      original=this.required(assets.getVehicleSprite(name,frame,turret,e.side),`${name} hull/turret`);
    }else original=this.required(building&&e.type!=='sentry'?assets.getBuildingSprite(name,this.game.state.time,e.side,this.game.nativeGameSpeedIndex):assets.getSprite(name,frame,e.side),name);
    this.drawArt(original,p.x,p.y);
    if(selected||hover){const z=c.zoom,w=(building?Math.max(30,(d.footprint[0]+d.footprint[1])*15-8):d.category==='infantry'?16:28)*z;
      // Rotating turrets and walking poses keep the same health-frame anchor.
      const healthSprite=building?original:this.required(assets.getSprite(name,0,e.side),`${name} health anchor`);
      const spriteTop=p.y-(healthSprite.anchorY??healthSprite.height)*z;
      const y=Math.round(spriteTop-5*z),left=Math.round(p.x-w/2),height=Math.max(2,Math.round(2*z)),ratio=e.hp/e.maxHp;
      if(building){
        this.gl.rect(left-1,y-1,w+2,height+2,[0,0,0,1]);this.gl.rect(left,y,w,height,[.28,.28,.28,1]);this.gl.rect(left,y,Math.round(w*ratio),height,ratio>.5?[0,1,0,1]:ratio>.25?[1,1,0,1]:[1,0,0,1]);
        const bracket:Color=selected?[1,1,1,1]:e.side===0?[0,1,0,1]:[1,0,0,1],bottom=Math.round(p.y+2*z),top=y+height+3,corner=Math.max(3,Math.round(4*z));
        for(const x of [left-2,left+w+2]){const direction=x< p.x?1:-1;this.gl.line(x,top,x+direction*corner,top,1,bracket);this.gl.line(x,top,x,top+corner,1,bracket);this.gl.line(x,bottom,x+direction*corner,bottom,1,bracket);this.gl.line(x,bottom,x,bottom-corner,1,bracket);}
      }else{
        this.gl.rect(left-z,y-z,w+2*z,height+2*z,[.89,1,1,1]);this.gl.rect(left,y,w,height,[0,0,0,1]);
        const bright:Color=ratio>.5?[.31,.77,.32,1]:ratio>.25?[.95,.88,.25,1]:[.9,.25,.2,1];
        const dark:Color=ratio>.5?[0,.39,0,1]:ratio>.25?[.45,.39,0,1]:[.42,0,0,1];
        for(let pixel=0;pixel<Math.round(w/z*ratio);pixel++)this.gl.rect(left+pixel*z,y,z,height,pixel%2?dark:bright);
      }
      if(d.harvester&&e.cargo>0)this.gl.rect(left,y+height+2,w*Math.min(1,e.cargo/(d.capacity||700)),Math.max(1,z),[1,1,0,1]);
    }
  }
}
