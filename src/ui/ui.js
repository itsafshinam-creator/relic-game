import { QUESTS } from '../data/quests.js';
export function createUI(state,world){
  const $=id=>document.getElementById(id);
  const toast=t=>{const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1700);};
  const openCharacter=()=>{$('eqWeapon').textContent=state.weapon+' · T'+state.weaponTier;$('eqArmor').textContent=state.armor;$('eqLevel').textContent=state.lvl;$('eqAttack').textContent=state.atk;$('eqRelic').textContent=state.relicPower;$('eqPotions').textContent=state.potions;$('statsMini').textContent=`Kills: ${state.kills} · Discoveries: ${state.discoveries} · Skill Points: ${state.skillPoints}`;$('equipment').style.display='grid';};
  const openSkills=()=>{$('skillPoints').textContent=state.skillPoints;$('skills').style.display='grid';};
  function update(){
    $('hp').textContent=Math.max(0,Math.round(state.hp));$('lvl').textContent=state.lvl;$('atk').textContent=state.atk;$('xp').textContent=state.xp;$('xpn').textContent=state.lvl*50;$('gold').textContent=state.gold;$('shards').textContent=state.shards;$('hpbar').style.width=Math.max(0,state.hp/state.maxHp*100)+'%';$('xpbar').style.width=Math.min(100,state.xp/(state.lvl*50)*100)+'%';
    $('iwood').textContent=state.wood;$('iiron').textContent=state.iron;$('icrystal').textContent=state.crystal;$('ishards').textContent=state.shards;$('igold').textContent=state.gold;$('iweapon').textContent=state.weapon+' · ATK '+state.atk;$('iarmor').textContent=state.armor;$('ipower').textContent=state.relicPower;$('idiscoveries').textContent=state.discoveries;
    const q=QUESTS[Math.min(state.quest,5)];$('qtitle').textContent=q[0];$('qtext').textContent=typeof q[1]==='function'?q[1](state):q[1];$('zoneName').textContent=state.dungeon?'ANCIENT DUNGEON':'THE WILD';$('zoneSub').textContent=state.dungeon?'Guardian chamber · no turning back':'Explore the forgotten frontier';
    const boss=world.enemies.find(e=>e.userData.type==='boss');if(boss&&state.dungeon&&!boss.userData.dead){$('bossbar').style.display='block';$('bosshp').style.width=Math.max(0,boss.userData.hp/boss.userData.maxHp*100)+'%';}else $('bossbar').style.display='none';
    const mp=$('mapPlayer');if(mp){mp.style.left=Math.max(10,Math.min(108,59+world.hero.position.x*.55))+'px';mp.style.top=Math.max(10,Math.min(108,59+world.hero.position.z*.42))+'px';}
    if($('eqWeapon')){$('eqWeapon').textContent=state.weapon+' · T'+state.weaponTier;$('eqArmor').textContent=state.armor;$('eqLevel').textContent=state.lvl;$('eqAttack').textContent=state.atk;$('eqRelic').textContent=state.relicPower;$('eqPotions').textContent=state.potions;$('statsMini').textContent=`Kills: ${state.kills} · Discoveries: ${state.discoveries} · Skill Points: ${state.skillPoints}`;}
  }
  function toggleInventory(){state.invOpen=!state.invOpen;$('menu').style.display=state.invOpen?'grid':'none';update();}
  return {toast,openCharacter,openSkills,update,toggleInventory};
}
