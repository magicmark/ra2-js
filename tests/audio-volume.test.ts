import { afterEach, expect, it, vi } from 'vitest';
import { GameAudio } from '../src/game/Audio';

afterEach(()=>vi.unstubAllGlobals());
it('applies the working effects volume to actual gain and suppresses zero-volume playback',()=>{
  const gains:number[]=[];
  const context=vi.fn(function () { return {
    state:'running',currentTime:0,destination:{},
    createOscillator(){return{type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(node:unknown){return node;},start(){},stop(){}};},
    createGain(){return{gain:{setValueAtTime:(gain:number)=>gains.push(gain),exponentialRampToValueAtTime(){}},connect(){}};}
  }; });
  vi.stubGlobal('AudioContext',context);
  const audio=new GameAudio();audio.effectsVolume=0;audio.acknowledge();
  expect(context).not.toHaveBeenCalled();
  audio.effectsVolume=5;audio.acknowledge();
  expect(gains[0]).toBeCloseTo(.035/2);
  audio.enabled=false;audio.acknowledge();expect(gains).toHaveLength(1);
});
