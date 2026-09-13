import { describe, expect, it } from 'vitest';
import { Camera } from '../src/render/Camera';

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
});
