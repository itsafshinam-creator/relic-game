import { GAME_CONFIG } from './config.js';
export function createInitialState(){
  return {
    hp:100,xp:0,lvl:1,atk:GAME_CONFIG.player.attack,gold:120,shards:0,wood:0,iron:0,crystal:0,
    quest:0,questProgress:0,fog:true,dead:false,invOpen:false,dungeon:false,
    weapon:'Seeker Blade',armor:'Wanderer Gear',maxHp:100,moveBonus:0,skillPoints:0,
    skills:{atk:0,hp:0,speed:0},potions:2,relicPower:0,weaponTier:1,kills:0,discoveries:0
  };
}
export function normalizeState(state){
  const base=createInitialState(); Object.assign(base,state||{});
  base.skills=Object.assign({atk:0,hp:0,speed:0},state?.skills||{});
  base.hp=Math.max(1,Math.min(base.hp,base.maxHp)); base.dead=false;base.invOpen=false;base.dungeon=false;
  return base;
}
