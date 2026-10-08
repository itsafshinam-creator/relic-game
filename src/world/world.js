import { RESOURCE_COLORS, RESOURCE_SPAWNS, DISCOVERIES, POTIONS } from '../data/resources.js';
import { ENEMIES, ENEMY_SPAWNS } from '../data/enemies.js';
import { CHARACTERS } from '../data/characters.js';
import { createMaterialFactory } from './materials.js';

export function buildWorld(THREE, scene){
  const mat=createMaterialFactory(THREE); const world=new THREE.Group(); scene.add(world);
  const resources=[], discoveries=[], potionMeshes=[], enemies=[];
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220),mat(0x30463d));ground.rotation.x=-Math.PI/2;scene.add(ground);
  const river=new THREE.Mesh(new THREE.PlaneGeometry(15,220),new THREE.MeshStandardMaterial({color:0x294d55,transparent:true,opacity:.82,roughness:.2}));river.rotation.x=-Math.PI/2;river.position.set(-48,.02,0);scene.add(river);
  const box=(x,y,z,size,color,parent=world)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color));m.position.set(x,y,z);parent.add(m);return m;};
  const trunkGeo=new THREE.CylinderGeometry(.16,.22,1.9,7),leafGeo=new THREE.ConeGeometry(.85,2.1,8),rockGeo=new THREE.DodecahedronGeometry(.55,0);
  const tree=(x,z,scale=1)=>{const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);const t=new THREE.Mesh(trunkGeo,mat(0x40362c));t.position.y=.95;g.add(t);const l=new THREE.Mesh(leafGeo,mat(0x263e31));l.position.y=2.25;g.add(l);world.add(g);};
  const rock=(x,z,s=1)=>{const r=new THREE.Mesh(rockGeo,mat(0x535b57));r.scale.setScalar(s);r.position.set(x,.35*s,z);world.add(r);};
  for(let i=0;i<130;i++){const x=(Math.random()-.5)*205,z=(Math.random()-.5)*205;if(Math.abs(x+48)<10||Math.hypot(x,z+18)<18||Math.hypot(x,z+11)<6||Math.abs(x)<8&&z<-58)continue;tree(x,z,.7+Math.random()*.8);}
  for(let i=0;i<55;i++)rock((Math.random()-.5)*190,(Math.random()-.5)*190,.6+Math.random()*.8);
  const outpost=new THREE.Group();outpost.position.set(0,0,-18);scene.add(outpost);box(0,.15,0,[15,.3,15],0x3b3c35,outpost);box(-4,1,-3,[5,2,5],0x5b5141,outpost);box(-4,2.25,-3,[5.5,.5,5.5],0x322e2a,outpost);box(4,1,1,[4,2,4],0x665744,outpost);box(4,2.2,1,[4.5,.4,4.5],0x322e2a,outpost);
  const fire=new THREE.PointLight(0xffb35c,2.2,12);fire.position.set(1,1.6,-1);outpost.add(fire);const flame=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0xff9a3d}));flame.position.set(1,1,-1);outpost.add(flame);
  const npc=(key,x,z)=>{const c=CHARACTERS[key];const g=new THREE.Group();g.position.set(x,0,z);const b=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.9,5,8),mat(c.body));b.position.y=.75;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),mat(c.skin));h.position.y=1.65;g.add(h);g.userData={npc:true,name:c.name};scene.add(g);return g;};
  const mara=npc('mara',-3,-13),toren=npc('toren',4,-13);
  const hero=new THREE.Group();hero.position.set(0,0,-8);scene.add(hero);const hb=new THREE.Mesh(new THREE.CapsuleGeometry(.46,1,5,8),mat(CHARACTERS.seeker.body));hb.position.y=.72;hero.add(hb);const hh=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),mat(CHARACTERS.seeker.skin));hh.position.y=1.65;hero.add(hh);const cape=new THREE.Mesh(new THREE.BoxGeometry(.78,.9,.12),mat(CHARACTERS.seeker.cape));cape.position.set(0,.75,.4);hero.add(cape);const sword=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,1),mat(CHARACTERS.seeker.sword,.4));sword.position.set(.55,.9,-.6);hero.add(sword);
  for(const [type,x,z] of RESOURCE_SPAWNS){const g=new THREE.Group();g.position.set(x,.25,z);g.add(new THREE.Mesh(new THREE.DodecahedronGeometry(.48,0),mat(RESOURCE_COLORS[type])));g.userData={resource:true,type,dead:false};scene.add(g);resources.push(g);}
  for(const d of DISCOVERIES){const m=new THREE.Mesh(new THREE.TorusGeometry(.48,.08,7,18),mat(0xc6a85a));m.position.set(d.x,.35,d.z);m.rotation.x=Math.PI/2;m.userData.discovery=d;scene.add(m);discoveries.push(m);}
  for(const p of POTIONS){const m=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.42,8),mat(0x8a4f74));m.position.set(p.x,.3,p.z);m.userData.potion=true;scene.add(m);potionMeshes.push(m);}
  const dungeon=new THREE.Group();dungeon.position.set(0,0,-72);scene.add(dungeon);box(0,2,0,[18,4,2],0x272b29,dungeon);box(-9,1,0,[2,2,2],0x252725,dungeon);box(9,1,0,[2,2,2],0x252725,dungeon);const gate=new THREE.Mesh(new THREE.BoxGeometry(8,4,.5),mat(0x101313));gate.position.set(0,2,0);dungeon.add(gate);const rune=new THREE.Mesh(new THREE.TorusGeometry(1.2,.12,8,20),mat(0x5bb6b0));rune.position.set(0,2,1.2);dungeon.add(rune);
  for(const [type,x,z] of ENEMY_SPAWNS){const cfg=ENEMIES[type],s=cfg.scale||1,g=new THREE.Group();g.position.set(x,0,z);const b=new THREE.Mesh(new THREE.CapsuleGeometry(.42*s,.85*s,5,8),mat(cfg.color));b.position.y=.7*s;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.31*s,10,8),mat(0x8d7769));h.position.y=1.5*s;g.add(h);g.userData={enemy:true,type,hp:cfg.hp,maxHp:cfg.hp,dead:false,cd:0,home:new THREE.Vector3(x,0,z)};g.visible=z>=-45;scene.add(g);enemies.push(g);}
  return {world,ground,river,outpost,mara,toren,hero,sword,flame,resources,discoveries,potionMeshes,enemies,gatePosition:new THREE.Vector3(0,0,-70),isDeepZone:z=>z<-45};
}
