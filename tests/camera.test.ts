import { describe, expect, it } from 'vitest';
import { Camera } from '../src/render/Camera';
import { nativeMapCoordinates, type NativeMap } from '../src/game/maps/nativeMap';

function nativeMap(width=96,height=96,elevation=0):NativeMap{
  return {name:'Camera fixture',theater:'TEMPERATE',size:[0,0,width,height],localSize:[0,0,width,height],
    cells:nativeMapCoordinates(width,height).map(p=>({...p,height:elevation,tileIndex:0,subTile:0,iceGrowth:0,overlay:255,overlayData:0})),
    starts:[],structures:[],terrain:[],lighting:{ambient:1,red:1,green:1,blue:1}};
}

describe('isometric camera',()=>{
  it('round trips world positions after panning and zooming',()=>{
    const c=new Camera();c.width=873;c.height=641;c.center(23,48);c.pan(141,-67);c.setZoom(1.8);
    for(const [x,y] of [[0,0],[63,63],[12.5,42.25],[0,63],[63,0]]){
      const screen=c.screen(x,y),world=c.world(screen.x,screen.y);expect(world.x).toBeCloseTo(x,8);expect(world.y).toBeCloseTo(y,8);
    }
  });
  it('keeps the terrain under the mouse or pinch midpoint fixed while zooming',()=>{
    const c=new Camera(),anchor={x:152,y:381},before=c.world(anchor.x,anchor.y);c.setZoom(2.2,anchor);
    const after=c.world(anchor.x,anchor.y);expect(after.x).toBeCloseTo(before.x,8);expect(after.y).toBeCloseTo(before.y,8);
  });
  it('limits zoom and prevents the center getting lost beyond the map',()=>{
    const c=new Camera();c.setZoom(100);expect(c.zoom).toBe(2.4);c.setZoom(.001);expect(c.zoom).toBe(.45);
    c.center(-100,1000);c.constrain(64,64);const center=c.world(c.width/2,c.height/2);expect(center.x).toBeCloseTo(-3);expect(center.y).toBeCloseTo(67);
  });
  it('keeps all four viewport corners on native terrain at every camera extreme and zoom',()=>{
    const map=nativeMap();
    for(const [width,height] of [[1280,720],[390,844],[3840,2160]])for(const zoom of [.45,.83,2.4])for(const x of [-10000,10000])for(const y of [-10000,10000]){
      const c=new Camera();Object.assign(c,{width,height,zoom,x,y});c.constrain(192,192,map);
      for(const [sx,sy] of [[0,0],[width,0],[width,height],[0,height]]){
        const world=c.world(sx,sy),p=c.project(world.x,world.y);
        expect(p.x).toBeGreaterThanOrEqual(-2850-1e-8);expect(p.x).toBeLessThanOrEqual(2850+1e-8);
        expect(p.y).toBeGreaterThanOrEqual(1470-1e-8);expect(p.y).toBeLessThanOrEqual(4320+1e-8);
      }
    }
  });
  it('accounts for the actual elevation when constraining a raised native map',()=>{
    const c=new Camera(),flat=nativeMap(),raised=nativeMap(96,96,6);
    c.x=10000;c.y=10000;c.constrain(192,192,flat);const flatY=c.y;
    c.x=10000;c.y=10000;c.constrain(192,192,raised);expect(c.y).toBe(flatY-90);
    c.y=-10000;c.constrain(192,192,raised);expect(c.y-c.height/2/c.zoom).toBe(1470);
  });
  it('restores zoom limits after resize and transitions between tiny native, large native and training maps',()=>{
    const c=new Camera(),tiny=nativeMap(4,4);c.width=1280;c.height=720;c.constrain(8,8,tiny);
    expect(c.minZoom).toBe(8);expect(c.maxZoom).toBe(8);expect(c.zoom).toBe(8);
    c.width=160;c.height=90;c.constrain(8,8,tiny);
    expect(c.minZoom).toBe(1);expect(c.maxZoom).toBe(2.4);expect(c.zoom).toBe(2.4);
    c.constrain(192,192,nativeMap());expect(c.minZoom).toBe(.45);expect(c.maxZoom).toBe(2.4);
    c.width=1280;c.height=720;c.constrain(8,8,tiny);c.constrain(64,64);
    expect(c.minZoom).toBe(.45);expect(c.maxZoom).toBe(2.4);expect(c.zoom).toBe(2.4);
    c.setZoom(.001);expect(c.zoom).toBe(.45);
  });
});
