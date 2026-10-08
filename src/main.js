import { GAME_CONFIG } from './core/config.js';
import { ensureThree, ensureTelegram } from './core/three.js';
import { createInitialState, normalizeState } from './core/state.js';
import { createSaveSystem } from './core/save.js';
import { buildWorld } from './world/world.js';
import { createUI } from './ui/ui.js';
import { createInput } from './systems/input.js';
import { createPlayerController } from './entities/player.js';
import { createCombat } from './systems/combat.js';
import { updateEnemyAI } from './systems/ai.js';
import { createInteraction } from './systems/interaction.js';
import { levelCheck, createEconomy } from './systems/progression.js';

const $=id=>document.getElementById(id),loading=$('loading'),hud=$('hud'),loadtxt=$('loadtxt'),err=$('error');
function showError(msg){err.style.display='block';err.textContent=msg;loadtxt.textContent='Startup failed';}
addEventListener('error',e=>{if(e.target&&e.target!==window)return;showError('Game error: '+(e.message||'Unknown error'));});
addEventListener('unhandledrejection',e=>showError('Game startup error: '+(e.reason?.message||e.reason||'Unknown error')));

async function boot(){
  try{
    loadtxt.textContent='Loading 3D engine…';const [THREE,tg]=await Promise.all([ensureThree(),ensureTelegram()]);
    if(tg){try{tg.ready();tg.expand();tg.setHeaderColor?.('#172421');tg.setBackgroundColor?.('#172421');tg.disableVerticalSwipes?.();const u=tg.initDataUnsafe?.user;if(u)$('tgname').textContent='· '+(u.first_name||u.username||'PLAYER');}catch{}}
    const canvas=document.createElement('canvas');if(!(canvas.getContext('webgl2')||canvas.getContext('webgl')))throw new Error('WebGL is not available in this browser/WebView.');
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x667a7d);scene.fog=new THREE.FogExp2(0x667a7d,GAME_CONFIG.world.fogDensity);
    const renderer=new THREE.WebGLRenderer(GAME_CONFIG.renderer);renderer.setPixelRatio(Math.min(devicePixelRatio||1,GAME_CONFIG.renderer.maxPixelRatio));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
    const camera=new THREE.PerspectiveCamera(GAME_CONFIG.camera.fov,innerWidth/innerHeight,GAME_CONFIG.camera.near,GAME_CONFIG.camera.far);camera.position.set(0,4,-4);const clock=new THREE.Clock();scene.add(new THREE.HemisphereLight(0xc9e2e6,0x16211d,1.8));const sun=new THREE.DirectionalLight(0xdce7dd,1.15);sun.position.set(-30,55,20);scene.add(sun);
    const state=createInitialState();let discovered=new Set();const save=createSaveSystem(state,()=>discovered,d=>{discovered=d;});save.load();
    loadtxt.textContent='Building modular world…';const world=buildWorld(THREE,scene);const ui=createUI(state,world);const toast=ui.toast;
    const interaction=createInteraction({THREE,state,world,scene,save:save.save,toast,discovered});
    let gameStarted=false;
    const input=createInput({renderer,attack:()=>combat.attack(),dodge:()=>player.dodge(),interact:()=>interaction.interact(),usePotion:()=>{if(!state.dead&&state.potions>0&&state.hp<state.maxHp){state.potions--;state.hp=Math.min(state.maxHp,state.hp+35);toast('Healing Potion +35 HP');save.save();}},toggleInv:ui.toggleInventory});
    const player=createPlayerController({THREE,hero:world.hero,sword:world.sword,state,input,world,toast,save:save.save});
    const combat=createCombat({THREE,hero:world.hero,sword:world.sword,state,enemies:world.enemies,toast,save:save.save,levelCheck:()=>levelCheck(state,toast)});combat.face=player.face;
    const economy=createEconomy(state,save.save,ui.update,ui.openSkills,toast);
    $('buyPotion').onclick=()=>economy.buy('potion');$('buySword').onclick=()=>economy.buy('sword');$('buyArmor').onclick=()=>economy.buy('armor');$('buyRelic').onclick=()=>economy.buy('relic');$('skillAtk').onclick=()=>economy.skill('atk');$('skillHp').onclick=()=>economy.skill('hp');$('skillSpeed').onclick=()=>economy.skill('speed');
    $('openEquip').onclick=ui.openCharacter;$('openSkills').onclick=ui.openSkills;$('openShop').onclick=()=>$('shop').style.display='grid';$('closeEquip').onclick=()=>$('equipment').style.display='none';$('closeShop').onclick=()=>$('shop').style.display='none';$('closeSkills').onclick=()=>$('skills').style.display='none';$('startGame').onclick=()=>{gameStarted=true;$('mainmenu').style.display='none';toast('Enter the Lost World');};$('continueGame').onclick=()=>{gameStarted=true;$('mainmenu').style.display='none';toast('Journey resumed');};$('resetFromMenu').onclick=()=>{save.reset();location.reload();};
    $('fog').onclick=()=>{state.fog=!state.fog;scene.fog.density=state.fog?(state.dungeon?GAME_CONFIG.world.dungeonFogDensity:GAME_CONFIG.world.fogDensity):GAME_CONFIG.world.lightFogDensity;toast(state.fog?'Dense fog':'Light fog');save.save();};$('reset').onclick=()=>{save.reset();location.reload();};$('close').onclick=ui.toggleInventory;$('inv').onclick=ui.toggleInventory;
    const followTarget=new THREE.Vector3(),offset=new THREE.Vector3(),camTarget=new THREE.Vector3();let uiT=0;
    function cameraFollow(){followTarget.copy(world.hero.position);followTarget.y+=1.1;offset.set(Math.sin(input.yaw)*GAME_CONFIG.camera.distance*Math.cos(input.pitch),GAME_CONFIG.camera.height+Math.sin(input.pitch)*2,Math.cos(input.yaw)*GAME_CONFIG.camera.distance*Math.cos(input.pitch));camTarget.copy(followTarget).add(offset);camera.position.lerp(camTarget,GAME_CONFIG.camera.followLerp);camera.lookAt(followTarget);}
    function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);tg?.onEvent?.('viewportChanged',resize);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();showError('WebGL context lost. Please reopen the game.');});
    loading.style.display='none';hud.style.display='block';$('mainmenu').style.display='grid';ui.update();toast(tg?.initDataUnsafe?.user?'Welcome to RELIC!':'RELIC Modular Final ready');
    function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);combat.attackLock=Math.max(0,combat.attackLock-dt);input.dodgeLock=Math.max(0,input.dodgeLock-dt);if(!state.dead&&gameStarted&&!state.invOpen){player.movePlayer(dt);updateEnemyAI(dt,{enemies:world.enemies,hero:world.hero,state,toast});if(state.hp<=0){state.dead=true;toast('You fell…');setTimeout(respawn,900);}}world.flame.scale.setScalar(1+Math.sin(performance.now()*.012)*.12);cameraFollow();uiT+=dt;if(uiT>.12){uiT=0;ui.update();}renderer.render(scene,camera);}
    function respawn(){state.hp=state.maxHp;world.hero.position.set(0,0,-8);state.dead=false;state.dungeon=false;scene.fog.density=state.fog?GAME_CONFIG.world.fogDensity:GAME_CONFIG.world.lightFogDensity;world.enemies.forEach(e=>{if(e.userData.dead)return;e.position.copy(e.userData.home);e.userData.hp=e.userData.maxHp;e.userData.cd=0;e.visible=!world.isDeepZone(e.userData.home.z);});toast('Respawned at Outpost');save.save();}
    animate();
  }catch(e){showError(e.message||String(e));}
}
boot();
