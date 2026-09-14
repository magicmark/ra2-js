import type { Vec2 } from '../game/types';
export const TILE_W = 60, TILE_H = 30;
export class Camera {
  x = (16 - 41) * 30; y = (16 + 41) * 15; zoom = 1;
  width = 1000; height = 700;
  minZoom = .45; maxZoom = 2.4;
  project(x:number,y:number):Vec2 {return {x:(x-y)*30,y:(x+y)*15};}
  screen(x:number,y:number):Vec2 {const p=this.project(x,y);return {x:(p.x-this.x)*this.zoom+this.width/2,y:(p.y-this.y)*this.zoom+this.height/2};}
  world(x:number,y:number):Vec2 {const a=(x-this.width/2)/this.zoom+this.x,b=(y-this.height/2)/this.zoom+this.y;return{x:a/60+b/30,y:b/30-a/60};}
  center(x:number,y:number){const p=this.project(x,y);this.x=p.x;this.y=p.y;}
  pan(x:number,y:number){this.x-=x/this.zoom;this.y-=y/this.zoom;}
  setZoom(value:number,anchor:Vec2={x:this.width/2,y:this.height/2}){
    const before=this.world(anchor.x,anchor.y);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,value));
    const after=this.world(anchor.x,anchor.y),a=this.project(before.x,before.y),b=this.project(after.x,after.y);this.x+=a.x-b.x;this.y+=a.y-b.y;
  }
  constrain(width:number,height:number){const p=this.world(this.width/2,this.height/2);this.center(Math.max(-3,Math.min(width+3,p.x)),Math.max(-3,Math.min(height+3,p.y)));}
}
