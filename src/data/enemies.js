export const ENEMIES = Object.freeze({
  beast:{hp:35,color:0x805447,speed:1.7,damage:5},
  ranged:{hp:28,color:0x566f78,speed:1.7,damage:5},
  tank:{hp:75,color:0x56524b,speed:1.2,damage:8},
  boss:{hp:150,color:0x7e3030,speed:1.7,damage:15,scale:1.45}
});
export const ENEMY_SPAWNS=[
  ['beast',-13,-28],['beast',13,-32],['ranged',20,-47],['tank',-17,-51],['boss',0,-65]
];
