/** Lightweight feedback, initialized only after a user gesture. */
export class GameAudio {
  enabled=true;
  effectsVolume=10;
  private context:AudioContext|null=null;
  private lastShot=0;
  private tone(frequency:number,duration:number,volume:number,type:OscillatorType='sine',end?:number){
    if(!this.enabled||this.effectsVolume<=0)return;
    volume*=Math.max(0,Math.min(10,this.effectsVolume))/10;
    this.context??=new AudioContext();if(this.context.state==='suspended')void this.context.resume();
    const c=this.context,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,c.currentTime);if(end)o.frequency.exponentialRampToValueAtTime(end,c.currentTime+duration);
    g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration);
  }
  acknowledge(){this.tone(780,.075,.035,'sine',1050);}
  ready(){this.tone(660,.17,.025,'sine',990);}
  warning(){this.tone(250,.3,.025,'triangle',180);}
  shot(){if(!this.context||performance.now()-this.lastShot<100)return;this.lastShot=performance.now();this.tone(120,.1,.025,'sawtooth',35);}
  explosion(){if(!this.context)return;this.tone(65,.4,.045,'sawtooth',20);}
}
