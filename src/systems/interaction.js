export function createInteraction({THREE,state,world,scene,save,toast,discovered=new Set()}){
  function interact(){
    if(state.dead)return;
    if(!state.dungeon&&world.hero.position.distanceTo(world.gatePosition)<6){state.dungeon=true;state.quest=Math.max(state.quest,3);world.hero.position.set(0,0,-58);world.enemies.forEach(e=>{if(!e.userData.dead&&world.isDeepZone(e.userData.home.z))e.visible=true;});scene.fog.density=state.fog?.028:.006;toast('ENTERED THE FIRST DUNGEON');save();return;}
    let near=null,nd=999;for(const n of [world.mara,world.toren]){const d=world.hero.position.distanceTo(n.position);if(d<3.5&&d<nd){near=n;nd=d;}}for(const r of world.resources){if(!r.userData.dead){const d=world.hero.position.distanceTo(r.position);if(d<2.8&&d<nd){near=r;nd=d;}}}
    for(const d of world.discoveries){if(d.visible&&!discoveries.has(d.userData.discovery.id)&&world.hero.position.distanceTo(d.position)<2.5){discoveries.add(d.userData.discovery.id);state.discoveries++;d.visible=false;toast('Discovery found: '+d.userData.discovery.name);save();return;}}
    if(!near)return;
    if(near.userData.resource){near.userData.dead=true;near.visible=false;state[near.userData.type]++;toast('Collected '+near.userData.type.toUpperCase());save();return;}
    if(near.userData.npc){if(near.userData.name==='Mara'){if(state.quest===0){state.quest=1;toast('Mara: Gather 3 Wood and 2 Iron.');}else if(state.quest===4){state.quest=5;state.gold+=250;state.relicPower+=5;toast('Mara: You found the First Relic. +250 Gold · +5 Relic Power');}else if(state.quest>=5)toast('Mara: More lands await in the next alpha.');else toast('Mara: Keep going, Seeker.');}else if(state.quest===1&&state.wood>=3&&state.iron>=2){state.wood-=3;state.iron-=2;state.atk+=4;state.quest=2;toast('Toren upgraded your blade +4 ATK');}else if(state.quest===0)toast('Toren: Speak with Mara first.');else if(state.quest===1)toast('Toren: Bring me 3 Wood and 2 Iron.');else toast('Toren: Good luck out there.');save();}}
  return {interact,discoveries};
}
