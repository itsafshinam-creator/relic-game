import { GAME_CONFIG } from '../core/config.js';
export function createPlayerController({THREE,hero,sword,state,input,world,toast,save}){
  const face=new THREE.Vector3(0,0,-1),fwd=new THREE.Vector3(),right=new THREE.Vector3(),move=new THREE.Vector3();
  function movePlayer(dt){
    let f=(input.keys.w||input.keys.arrowup?1:0)+(input.keys.s||input.keys.arrowdown?-1:0),str=(input.keys.d||input.keys.arrowright?1:0)+(input.keys.a||input.keys.arrowleft?-1:0);f+=-input.joy.y;str+=input.joy.x;const len=Math.hypot(f,str);if(len>.05){if(len>1){f/=len;str/=len;}fwd.set(-Math.sin(input.yaw),0,-Math.cos(input.yaw));right.set(Math.cos(input.yaw),0,-Math.sin(input.yaw));move.set(0,0,0).addScaledVector(fwd,f).addScaledVector(right,str);const speed=GAME_CONFIG.player.moveSpeed*(1+state.moveBonus);hero.position.addScaledVector(move,speed*dt);if(move.lengthSq()>1e-4)face.copy(move).normalize();}hero.rotation.y=Math.atan2(-face.x,-face.z);hero.position.x=Math.max(-95,Math.min(95,hero.position.x));hero.position.z=Math.max(-100,Math.min(95,hero.position.z));sword.rotation.x+=(0-sword.rotation.x)*Math.min(1,dt*12);}
  function dodge(){if(input.dodgeLock>0||state.dead)return;input.dodgeLock=GAME_CONFIG.player.dodgeCooldown;hero.position.addScaledVector(face,GAME_CONFIG.player.dodgeDistance);hero.position.y=0;}
  return {movePlayer,dodge,face};
}
