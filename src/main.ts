import './style.css';
import { Game } from './game/Game';
import { GameAudio } from './game/Audio';
import { Renderer } from './render/Renderer';
import { Controls, detectMobile } from './input/Controls';
import { UI } from './ui/UI';
import { AssetManager, DEFAULT_ASSET_URL, HUD_ASSET_FRAMES, DIALOG_ASSET_FRAMES, assetSourceUrl } from './assets/AssetManager';
import { requestPersistentAssetStorage } from './assets/AssetDownload';
import { MAP_CATALOG } from './game/maps/catalog';
import { parseNativeMap, type NativeMap } from './game/maps/nativeMap';
import { CustomArt } from './assets/CustomArt';
import { inspectionStatus, INSPECTION_HELP } from './game/customUnits';

const requestedMap=new URLSearchParams(location.search).get('map');
let nativeMap:NativeMap|undefined;
if(requestedMap){
  const entry=MAP_CATALOG.find(map=>map.id===requestedMap);
  if(!entry)throw new Error('This battlefield is not in the map library. Open /maps/ in the Map Viewer to choose a map.');
  const response=await fetch(entry.path);
  if(!response.ok)throw new Error(`Unable to load ${entry.name} (${response.status}). Reload to retry.`);
  nativeMap=parseNativeMap(await response.text());
}
const game=new Game(nativeMap?{map:nativeMap}:{}),assets=new AssetManager(),audio=new GameAudio(()=>assets.getSounds(),()=>assets.getMusic());
let renderer:Renderer,controls:Controls;
let battleStarted=false;
const SOURCE_STORAGE_KEY='red-alert-command.asset-source';
let rememberedSource:string|null=null;
try{rememberedSource=localStorage.getItem(SOURCE_STORAGE_KEY);}catch{/* The source field also works when browser storage is disabled. */}
let source=assetSourceUrl(new URLSearchParams(location.search).get('asset_url')||rememberedSource||DEFAULT_ASSET_URL);
let assetOperation:Promise<void>|null=null;
let restoringAssets=false;
const ui=new UI(game,{
  onPlace:type=>controls.setPlacement(type),
  onCenter:(x,y)=>renderer.camera.center(x,y),
  onZoom:delta=>{renderer.camera.setZoom(renderer.camera.zoom+delta);ui.setZoom(renderer.camera.zoom);},
  onMode:mode=>controls.setMode(mode),
  onCommand:(command,options)=>controls.executeCommand(command,options),
  getPlanning:()=>controls?.planning??false,
  onTargetLines:enabled=>{renderer.targetLines=enabled;},
  getTargetLines:()=>renderer?.targetLines??true,
  onSpeed:speed=>game.setGameSpeed(speed),
  onPause:paused=>{game.state.paused=paused;},
  onScrollRate:value=>controls.setScrollRate(value),
  getScrollRate:()=>controls?.scrollRate??1,
  onEffectsVolume:value=>{audio.effectsVolume=Math.max(0,Math.min(10,value));},
  getEffectsVolume:()=>audio.effectsVolume,
  onMusicVolume:value=>{audio.musicVolume=value;},
  getMusicVolume:()=>audio.musicVolume,
  onPreviewSound:()=>audio.preview(),
  onAbort:()=>{
    battleStarted=false;audio.reset();game.restart();controls.cancelPlacement();controls.setMode('select');centerStart();
    ui.setLoading(true);progress(assets.status);
  },
  getBindings:()=>controls?.getBindings()??[],
  inspectBinding:(command,key)=>controls.inspectBinding(command,key),
  onAssignBinding:(command,key)=>controls.assignBinding(command,key),
  onResetBindings:()=>controls.resetBindings(),
  getBattlefieldTooltip:(x,y)=>{
    if(!battleStarted||!assets.ready)return null;
    const entity=renderer.pick(x,y);if(!entity)return null;
    const def=game.defs[entity.type],inspection=entity.type==='george'||entity.inspectedBy!==undefined||(entity.rank??0)>0;
    return{id:entity.id,title:inspection?`${def.name} · ${inspectionStatus(entity,game.state,game.defs)}`:def.name,description:inspection?`${def.description}\n${INSPECTION_HELP}`:undefined};
  },
  onRadar:(x,y,modifiers)=>controls.radarOrder(x,y,modifiers),
  getCameraView:()=>[[0,0],[renderer.camera.width,0],[renderer.camera.width,renderer.camera.height],[0,renderer.camera.height]].map(([x,y])=>renderer.camera.world(x,y)),
  onSound:enabled=>{audio.enabled=enabled;if(enabled)audio.acknowledge();},
  onAssetRetry:url=>{void downloadAssets(url);},
  onAssetImport:files=>{void importAssets(files);},
  onRestart:()=>{audio.reset();game.restart();controls.cancelPlacement();controls.setMode('select');centerStart();ui.showToast('New operation started. Good luck, Commander.');},
},{mobile:detectMobile(),assetSource:source});

try{
  renderer=new Renderer(document.querySelector<HTMLCanvasElement>('#game-canvas')!,game);
  controls=new Controls(renderer,game,detectMobile(),{toast:text=>ui.showToast(text),zoom:value=>ui.setZoom(value),mode:value=>ui.setMode(value),cursor:name=>ui.setCursor(name),ack:()=>audio.acknowledge(),enabled:()=>battleStarted&&assets.ready&&!ui.isModalOpen(),category:category=>ui.selectCategory(category,true),options:()=>ui.openOptions(),briefing:()=>ui.openBriefing()});
  renderer.assets=assets;
  if(nativeMap)centerStart();
  if(detectMobile())renderer.camera.zoom=.75;
  ui.setZoom(renderer.camera.zoom);
  let last=performance.now(),uiTime=0;
  for(const event of ['pointerdown','keydown'])document.addEventListener(event,event=>{if(event.isTrusted)void audio.unlock();},{capture:true});
  document.addEventListener('visibilitychange',()=>{last=performance.now();audio.setMusicPlaying(battleStarted&&assets.ready&&!document.hidden);});
  const frame=(now:number)=>{
    const dt=Math.max(0,(now-last)/1000);last=now;
    if(battleStarted&&!document.hidden&&!ui.isModalOpen()){
      try{requireOriginals();game.tick(dt);controls.tick(dt);renderer.render();}
      catch(error){handleBattleError(error);}
    }uiTime+=dt;
    if(uiTime>.1){ui.update();uiTime=0;if(battleStarted&&!document.hidden&&!ui.isModalOpen())audio.notifications(game.state.events);}
    if(battleStarted&&!document.hidden&&!ui.isModalOpen())audio.effects(game.state.effects,effect=>{
      const x=Math.floor(effect.x),y=Math.floor(effect.y),p=renderer.camera.screen(effect.x,effect.y);
      return x>=0&&y>=0&&x<game.state.width&&y<game.state.height&&!!game.state.fog[y*game.state.width+x]&&p.x>=0&&p.y>=0&&p.x<renderer.camera.width&&p.y<renderer.camera.height;
    });
    audio.setMusicPlaying(battleStarted&&assets.ready&&!document.hidden);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // Diagnostics keep actual runtime state and controls accessible for reproducible
  // browser smoke checks and mod development. No hidden game cheats are enabled.
  Object.assign(window,{__rts:{game,renderer,controls,assets,ui,audio}});
  if(import.meta.env.DEV)void import('./dev/LocalTools').then(({installLocalTools})=>installLocalTools(game,renderer,controls,()=>battleStarted&&assets.ready&&!ui.isModalOpen()));
  ui.setLoading(true);
  void restoreAssets();
}catch(error){
  document.querySelector('#battlefield')!.textContent=error instanceof Error?error.message:String(error);
  console.error(error);
}

function progress(p:{phase:string;loaded?:number;total?:number;message?:string}){
  ui.setAssetStatus({phase:p.phase,detail:p.message,error:p.phase==='error'?p.message:undefined,progress:p.total?(p.loaded||0)/p.total:null,ready:p.phase==='ready',source,cacheWarning:assets.cacheWarning});
}
function requireOriginals(){
  if(!assets.ready||assets.status.phase!=='ready')throw new Error('Complete original game files are required to enter the battlefield.');
}
function showAssetError(error:unknown){
  battleStarted=false;audio.reset();ui.setLoading(true);
  ui.setAssetStatus({phase:'error',error:error instanceof Error?error.message:String(error),detail:'Choose complete original game files, then press Enter or import them to retry.',source});
}
function handleBattleError(error:unknown){
  audio.reset();
  const message=error instanceof Error?error.message:String(error);
  if(message.includes('bundled artwork')){battleStarted=false;ui.showRuntimeError(message);return;}
  if(assets.ready&&assets.status.phase==='ready'&&!/^(Missing original|Invalid original|Original game artwork|Complete original)/.test(message)){
    battleStarted=false;ui.showRuntimeError(message);
  }else showAssetError(error);
}
function runAssetOperation(action:()=>Promise<void>){
  // Native Enter repeats and a second submit share the operation already in
  // flight. Errors leave the form idle; only another explicit submit retries.
  if(assetOperation)return assetOperation;
  const operation=Promise.resolve().then(action).catch(handleBattleError).finally(()=>{if(assetOperation===operation)assetOperation=null;});
  assetOperation=operation;
  return operation;
}
function restoreAssets(){
  restoringAssets=true;
  return runAssetOperation(async()=>{
    try{assets.customArt=await CustomArt.load();await assets.initialize({url:source,nativeMaps:!!nativeMap,onProgress:progress});if(assets.status.phase==='ready')installCameos();}
    finally{restoringAssets=false;}
  });
}
function downloadAssets(url:string):Promise<void>{
  if(assetOperation)return restoringAssets?assetOperation.then(()=>downloadAssets(url)):assetOperation;
  source=assetSourceUrl(url);
  try{localStorage.setItem(SOURCE_STORAGE_KEY,source);}catch{/* Remembering the URL is optional. */}
  ui.setAssetSource(source);
  return runAssetOperation(async()=>{
    void requestPersistentAssetStorage();
    battleStarted=false;audio.reset();ui.setLoading(true);
    await assets.download({url:source,nativeMaps:!!nativeMap,onProgress:progress});
    if(assets.status.phase==='ready')enterBattle();
  });
}
function importAssets(files:File[]):Promise<void>{
  if(assetOperation&&restoringAssets)return assetOperation.then(()=>importAssets(files));
  return runAssetOperation(async()=>{
    void requestPersistentAssetStorage();
    battleStarted=false;audio.reset();ui.setLoading(true);
    await assets.importFiles(files,{url:source,nativeMaps:!!nativeMap,onProgress:progress});
    if(assets.status.phase==='ready')enterBattle();
  });
}
function installCameos(){
  requireOriginals();
  const font=assets.getFont(),cursors=assets.getCursors();
  if(font)ui.setFont(font);
  if(cursors)ui.setCursors(cursors);
  game.setAnimationDefinitions(assets.getAnimationDefinitions(),assets.getInfantryAnimationDefinitions());
  for(const def of Object.values(game.defs)){
    if(def.mapOnly)continue;
    const sprite=assets.getCameo(def.id);
    if(!sprite)continue;
    const canvas=document.createElement('canvas');canvas.width=sprite.width;canvas.height=sprite.height;canvas.getContext('2d')!.drawImage(sprite.source,0,0);ui.setCameo(def.id,canvas.toDataURL());
  }
  installSidebar();
  ui.setAssetStatus({phase:'ready',detail:assets.status.message,ready:true,progress:1,source,cacheWarning:assets.cacheWarning});
}
function centerStart(){
  const start=nativeMap?.starts.find(start=>start.index===0);
  renderer.camera.center(start?.x??16,start?.y??42);
}
function enterBattle(){
  installCameos();renderer.render();battleStarted=true;
  ui.setLoading(false);
  audio.setMusicPlaying(!document.hidden);
}

function installSidebar(){
  for(const [name,frames] of Object.entries(HUD_ASSET_FRAMES))for(const frame of frames){
    const sprite=assets.getUIAsset(name,frame);
    if(!sprite)continue;
    const key=frame===32?'radar-online':frame===1?`${name}-active`:frame===2?`${name}-empty`:name;
    ui.setChrome(key,sprite.source.toDataURL());
  }
  for(const [name,frames] of Object.entries(DIALOG_ASSET_FRAMES))for(const frame of frames){
    const sprite=assets.getDialogAsset(name,frame);
    if(!sprite)continue;
    ui.setChrome(frame?`${name}-frame${frame}`:name,sprite.source.toDataURL());
  }
}
