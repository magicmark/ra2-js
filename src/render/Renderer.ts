import type { Entity, GameAPI, Tile, UnitDef, Vec2 } from '../game/types';
import { GL, type Color, type Texture } from './GL';
import { Camera } from './Camera';
const terrainCodes:Record<Tile['terrain'],number>={grass:1,water:2,rock:3,road:4,sand:5};

export interface OriginalSprite { source: CanvasImageSource; width: number; height: number; offsetX?:number; offsetY?:number; anchorX?:number; anchorY?:number }
export interface SpriteProvider { ready:boolean; getSprite(name:string,frame?:number,side?:number):OriginalSprite|null; getInfantryFrame(name:string,frame:number,side?:number):OriginalSprite|null; getVehicleSprite(name:string,hull:number,turret:number,side?:number):OriginalSprite|null; getBuildingSprite(name:string,time:number,side?:number):OriginalSprite|null; getTerrain(terrain:string,variant?:number):OriginalSprite|null; getOverlay(kind:'ore'|'tree',variant?:number):OriginalSprite|null }
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
  constructor(readonly canvas:HTMLCanvasElement,readonly game:GameAPI){this.gl=new GL(canvas);}
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
      if(tile.ore>0)this.drawArt(this.required(assets.getOverlay('ore',tile.variant),'ore'),p.x,p.y,shade);
    }
    const renderables:{depth:number;draw:()=>void}[]=[];
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      const i=y*s.width+x,t=s.tiles[i];if(!s.explored[i]||t.terrain!=='rock')continue;
      const p=c.screen(x+.5,y+.5);renderables.push({depth:x+y+1,draw:()=>this.drawArt(this.required(assets.getOverlay('tree',t.variant),'tree'),p.x,p.y,s.fog[i]?1:.39)});
    }
    for(const e of s.entities){if(!this.visible(e))continue;const p=this.entityPoint(e);if(p.x<-220||p.x>c.width+220||p.y<-80||p.y>c.height+250)continue;
      const d=this.game.defs[e.type],world=this.visualPosition(e);renderables.push({depth:world.x+world.y+(d.footprint[0]+d.footprint[1])/2,draw:()=>this.drawEntity(e,d,p)});
    }
    renderables.sort((a,b)=>a.depth-b.depth);for(const item of renderables)item.draw();
    for(const e of s.effects){if(!s.explored[Math.floor(e.y)*s.width+Math.floor(e.x)])continue;const p=c.screen(e.x,e.y),progress=1-e.life/e.maxLife;
      if(e.kind==='shot'&&e.to){const to=c.screen(e.to.x,e.to.y);this.gl.line(p.x,p.y-17*c.zoom,to.x,to.y-13*c.zoom,2*c.zoom,[1,.88,.47,Math.min(1,e.life*6)]);}
      if(e.kind==='explosion'){for(let i=0;i<8;i++){const a=i*.8,r=progress*26*c.zoom;this.gl.ring(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.6-12*c.zoom,(1-progress)*12*c.zoom,(1-progress)*10*c.zoom,[1,.3+i*.07,.08,1-progress],3*c.zoom);}}
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
  private drawEntity(e:Entity,d:UnitDef,p:Vec2){
    const c=this.camera,building=d.category==='structures'||d.category==='defenses',selected=e.selected,hover=e.id===this.hoverId;
    const heading=((this.visualFacing(e)%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    // Infantry SHPs start facing screen-north and advance counterclockwise;
    // simulation headings start at world +X (screen-southeast).
    let frame=building&&e.type!=='sentry'?0:d.category==='vehicles'||e.type==='sentry'?Math.round(heading/(Math.PI*2)*32)%32:(5-Math.round(heading/(Math.PI*2)*8)+8)%8;
    const moving=e.previous?Math.hypot(e.x-e.previous.x,e.y-e.previous.y)>1e-7:e.path.length>0;
    if(d.category==='infantry'&&moving)frame+=8+(Math.floor(e.anim*10)%6)*8;
    const name=e.type==='conyard'&&e.side===1?'conyard_soviet':d.sprite||e.type;
    const assets=this.originals();
    let original:OriginalSprite;
    if(e.type==='gi'&&e.deployed){
      const facing=(5-Math.round(heading/(Math.PI*2)*8)+8)%8;
      const firing=e.cooldown>Math.max(0,(d.deployedFireRate??d.fireRate)-.4);
      const index=firing?315+facing*6+Math.floor(e.anim*15)%6:292+facing;
      original=this.required(assets.getInfantryFrame(name,index,e.side),`${name} deployed frame ${index}`);
    }else if(d.category==='vehicles'&&d.turret&&e.turretFacing!==undefined){
      const previous=e.previousTurretFacing??e.turretFacing,delta=Math.atan2(Math.sin(e.turretFacing-previous),Math.cos(e.turretFacing-previous));
      const angle=previous+delta*Math.max(0,Math.min(1,this.game.interpolation??1));
      const turret=Math.round(angle/(Math.PI*2)*32);
      original=this.required(assets.getVehicleSprite(name,frame,turret,e.side),`${name} hull/turret`);
    }else original=this.required(building&&e.type!=='sentry'?assets.getBuildingSprite(name,this.game.state.time,e.side):assets.getSprite(name,frame,e.side),name);
    this.drawArt(original,p.x,p.y);
    if(e.hp<e.maxHp*.4&&building&&Math.sin(this.game.state.time*2+e.id)>.1){this.gl.ring(p.x+12*c.zoom,p.y-65*c.zoom,7*c.zoom,10*c.zoom,[.22,.22,.19,.5],6*c.zoom);}
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
