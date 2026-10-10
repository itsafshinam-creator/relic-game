import * as THREE from 'three';
import { BreakableProp, ResourceType, ConsumableType } from '../types/relic';
import { createMaterials } from './materials';

export interface RelicPropsSystem {
  breakableProps: BreakableProp[];
  update: (delta: number) => void;
  damageProp: (id: string, dmg: number) => { broken: boolean; prop?: BreakableProp };
}

export function buildRelicProps(scene: THREE.Scene, colliders: THREE.Box3[]): RelicPropsSystem {
  const mats = createMaterials();
  const breakableProps: BreakableProp[] = [];

  const matBarrelWood = new THREE.MeshStandardMaterial({ color: '#783E19', roughness: 0.6 });
  const matIronBand = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 });
  const matTentCanvas = new THREE.MeshStandardMaterial({ color: '#D4C5A9', roughness: 0.85 });
  const matSackBurlap = new THREE.MeshStandardMaterial({ color: '#A17D4E', roughness: 0.9 });
  const matGoldBrass = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.85, roughness: 0.2 });
  const matHayStraw = new THREE.MeshStandardMaterial({ color: '#EAB308', roughness: 0.8 });
  const matDarkTimber = new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.7 });
  const matSteelMetal = new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.85, roughness: 0.25 });
  const matStoneCobble = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.7 });
  const matRoofThatch = new THREE.MeshStandardMaterial({ color: '#A16207', roughness: 0.85 });

  // 1. Spawning Breakable Barrels
  function spawnBarrel(id: string, x: number, z: number, loot: ResourceType | ConsumableType, amount = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Barrel body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 1.0, 12), matBarrelWood);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Iron bands
    [-0.25, 0.25].forEach((yOffset) => {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 12), matIronBand);
      band.position.y = 0.5 + yOffset;
      group.add(band);
    });

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 0.5, z), new THREE.Vector3(0.9, 1.0, 0.9));
    colliders.push(box);

    breakableProps.push({
      id,
      type: 'barrel',
      position: { x, y: 0, z },
      mesh: group,
      health: 20,
      broken: false,
      lootType: loot,
      lootAmount: amount,
    });
  }

  // 2. Spawning Breakable Wooden Crates
  function spawnCrate(id: string, x: number, z: number, loot: ResourceType | ConsumableType, amount = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const boxGeom = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const crateMesh = new THREE.Mesh(boxGeom, matBarrelWood);
    crateMesh.position.y = 0.45;
    crateMesh.castShadow = true;
    group.add(crateMesh);

    // Metal corner brackets
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.92), matIronBand);
    bracket.position.y = 0.45;
    group.add(bracket);

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 0.45, z), new THREE.Vector3(0.9, 0.9, 0.9));
    colliders.push(box);

    breakableProps.push({
      id,
      type: 'crate',
      position: { x, y: 0, z },
      mesh: group,
      health: 25,
      broken: false,
      lootType: loot,
      lootAmount: amount,
    });
  }

  // 3. Spawning Treasure Chests (Carved wood with golden brass trim)
  function spawnChest(id: string, x: number, z: number, rotY: number, loot: ResourceType | ConsumableType, amount = 5) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Chest base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.75), matDarkTimber);
    base.position.y = 0.28;
    base.castShadow = true;
    group.add(base);

    // Chest lid (rounded top)
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 10, 1, false, 0, Math.PI), matDarkTimber);
    lid.rotation.z = Math.PI / 2;
    lid.position.set(0, 0.55, 0);
    lid.castShadow = true;
    group.add(lid);

    // Golden lock & corner bands
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.08), matGoldBrass);
    lock.position.set(0, 0.36, 0.4);
    group.add(lock);

    [-0.4, 0.4].forEach((bx) => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.77), matGoldBrass);
      strap.position.set(bx, 0.28, 0);
      group.add(strap);
    });

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 0.4, z), new THREE.Vector3(1.2, 0.8, 0.9));
    colliders.push(box);

    breakableProps.push({
      id,
      type: 'chest',
      position: { x, y: 0, z },
      mesh: group,
      health: 35,
      broken: false,
      lootType: loot,
      lootAmount: amount,
    });
  }

  // 4. Spawning Archery Targets
  function spawnArcheryTarget(id: string, x: number, z: number, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Wooden A-Frame tripod stand
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mats.woodLog);
    legL.position.set(-0.45, 1.0, -0.25);
    legL.rotation.x = 0.22;
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mats.woodLog);
    legR.position.set(0.45, 1.0, -0.25);
    legR.rotation.x = 0.22;
    legR.castShadow = true;
    group.add(legR);

    const legBack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6), mats.woodLog);
    legBack.position.set(0, 0.9, -0.65);
    legBack.rotation.x = -0.35;
    group.add(legBack);

    // Target Straw Disc
    const targetBoard = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 20), mats.woodLog);
    targetBoard.rotation.x = Math.PI / 2;
    targetBoard.position.set(0, 1.35, 0);
    targetBoard.castShadow = true;
    group.add(targetBoard);

    // Target Rings
    const ringWhite = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.13, 20), new THREE.MeshBasicMaterial({ color: '#F8FAFC' }));
    ringWhite.rotation.x = Math.PI / 2;
    ringWhite.position.set(0, 1.35, 0.01);
    group.add(ringWhite);

    const ringRed = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.14, 18), new THREE.MeshBasicMaterial({ color: '#DC2626' }));
    ringRed.rotation.x = Math.PI / 2;
    ringRed.position.set(0, 1.35, 0.02);
    group.add(ringRed);

    const ringBullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16), new THREE.MeshBasicMaterial({ color: '#FACC15' }));
    ringBullseye.rotation.x = Math.PI / 2;
    ringBullseye.position.set(0, 1.35, 0.03);
    group.add(ringBullseye);

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.1, z), new THREE.Vector3(1.4, 2.0, 1.2));
    colliders.push(box);

    breakableProps.push({
      id,
      type: 'target',
      position: { x, y: 0, z },
      mesh: group,
      health: 15,
      broken: false,
      lootType: 'arrow',
      lootAmount: 5,
    });
  }

  // 5. Spawning Training Dummy
  function spawnTrainingDummy(id: string, x: number, z: number, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Center timber pole
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.4, 8), mats.woodLog);
    post.position.y = 1.2;
    post.castShadow = true;
    group.add(post);

    // Cross beam (arms)
    const arms = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), mats.woodLog);
    arms.rotation.z = Math.PI / 2;
    arms.position.y = 1.6;
    arms.castShadow = true;
    group.add(arms);

    // Straw body
    const strawTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.1, 10), matHayStraw);
    strawTorso.position.y = 1.4;
    strawTorso.castShadow = true;
    group.add(strawTorso);

    // Straw head with burlap sack
    const strawHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), matSackBurlap);
    strawHead.position.y = 2.15;
    strawHead.castShadow = true;
    group.add(strawHead);

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.2, z), new THREE.Vector3(1.2, 2.4, 1.0));
    colliders.push(box);

    breakableProps.push({
      id,
      type: 'dummy',
      position: { x, y: 0, z },
      mesh: group,
      health: 50,
      broken: false,
      lootType: 'wood',
      lootAmount: 2,
    });
  }

  // 6. Spawning Medieval Stone Village Well
  function spawnVillageWell(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Cylindrical stone basin
    const wellStone = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 1.1, 14), matStoneCobble);
    wellStone.position.y = 0.55;
    wellStone.castShadow = true;
    group.add(wellStone);

    // Inner water surface
    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.1, 12), mats.water);
    wellWater.position.y = 0.75;
    group.add(wellWater);

    // Twin wooden vertical posts
    [-1.4, 1.4].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8), mats.woodLog);
      pillar.position.set(px, 1.6, 0);
      pillar.castShadow = true;
      group.add(pillar);
    });

    // Cross beam with winch axle
    const crossBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), mats.woodLog);
    crossBeam.rotation.z = Math.PI / 2;
    crossBeam.position.set(0, 2.6, 0);
    group.add(crossBeam);

    // Peaked timber roof over well
    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.4, 4), matRoofThatch);
    wellRoof.position.y = 3.3;
    wellRoof.rotation.y = Math.PI / 4;
    wellRoof.castShadow = true;
    group.add(wellRoof);

    // Suspended wood bucket
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.35, 8), matBarrelWood);
    bucket.position.set(0, 1.2, 0);
    group.add(bucket);

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.5, z), new THREE.Vector3(3.4, 3.5, 3.4));
    colliders.push(box);
  }

  // 7. Spawning Wooden Cargo Wagon / Cart
  function spawnWagon(x: number, z: number, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Wagon rectangular bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 4.2), matBarrelWood);
    bed.position.y = 0.85;
    bed.castShadow = true;
    group.add(bed);

    // Wagon sideboards
    [-1.15, 1.15].forEach((sx) => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.65, 4.2), matBarrelWood);
      side.position.set(sx, 1.2, 0);
      side.castShadow = true;
      group.add(side);
    });

    // 4 Spoked wooden wheels
    [[-1.25, -1.3], [1.25, -1.3], [-1.25, 1.3], [1.25, 1.3]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.14, 12), mats.woodLog);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.65, wz);
      wheel.castShadow = true;
      group.add(wheel);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.05, 6, 12), matIronBand);
      rim.rotation.y = Math.PI / 2;
      rim.position.set(wx, 0.65, wz);
      group.add(rim);
    });

    // Drawbar shafts in front
    [-0.5, 0.5].forEach((dx) => {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), mats.woodLog);
      shaft.rotation.x = 0.15;
      shaft.position.set(dx, 0.65, 3.0);
      group.add(shaft);
    });

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 0.8, z), new THREE.Vector3(2.8, 1.6, 5.0));
    colliders.push(box);
  }

  // 8. Spawning Village Waymarker Direction Signpost
  function spawnDirectionSignpost(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Central wooden post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8), mats.woodLog);
    post.position.y = 1.4;
    post.castShadow = true;
    group.add(post);

    // Carved direction planks pointing in different directions
    const signs = [
      { textY: 2.3, rotY: 0.1, length: 1.1, offset: 0.55 },
      { textY: 2.0, rotY: 1.6, length: 1.0, offset: 0.5 },
      { textY: 1.7, rotY: -1.4, length: 1.2, offset: 0.6 },
    ];

    signs.forEach((s) => {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(s.length, 0.22, 0.06), matBarrelWood);
      plank.position.set(s.offset, s.textY, 0);
      plank.rotation.y = s.rotY;
      plank.castShadow = true;
      group.add(plank);
    });

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.4, z), new THREE.Vector3(1.2, 2.8, 1.2));
    colliders.push(box);
  }

  // 9. Spawning Weapon Rack
  function spawnWeaponRack(x: number, z: number, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Timber frame
    const barTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.15), mats.woodLog);
    barTop.position.set(0, 1.3, 0);
    group.add(barTop);

    const barBottom = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.6), mats.woodLog);
    barBottom.position.set(0, 0.15, 0);
    group.add(barBottom);

    [-0.9, 0.9].forEach((px) => {
      const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), mats.woodLog);
      upright.position.set(px, 0.7, 0);
      group.add(upright);
    });

    // Resting swords
    [-0.4, 0, 0.4].forEach((sx) => {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.02), matSteelMetal);
      blade.position.set(sx, 0.75, 0.05);
      blade.rotation.x = 0.15;
      group.add(blade);
    });

    scene.add(group);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 0.7, z), new THREE.Vector3(2.2, 1.5, 0.8));
    colliders.push(box);
  }

  // 10. Traveler Expedition Tents
  function spawnTent(x: number, z: number, rotY = 0) {
    const tentGroup = new THREE.Group();
    tentGroup.position.set(x, 0, z);
    tentGroup.rotation.y = rotY;

    const tentGeom = new THREE.ConeGeometry(2.2, 2.0, 4);
    const tent = new THREE.Mesh(tentGeom, matTentCanvas);
    tent.position.y = 1.0;
    tent.rotation.y = Math.PI / 4;
    tent.scale.set(1.2, 1.0, 1.0);
    tent.castShadow = true;
    tentGroup.add(tent);

    scene.add(tentGroup);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.0, z), new THREE.Vector3(2.4, 2.0, 2.2));
    colliders.push(box);
  }

  // 11. Clustered Sacks
  function spawnSackCluster(x: number, z: number) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);

    [
      { ox: 0, oz: 0, r: 0.35, h: 0.6 },
      { ox: 0.3, oz: 0.2, r: 0.32, h: 0.55 },
      { ox: -0.25, oz: 0.15, r: 0.3, h: 0.5 },
    ].forEach((s) => {
      const sack = new THREE.Mesh(new THREE.SphereGeometry(s.r, 8, 8), matSackBurlap);
      sack.scale.set(1.0, 1.4, 0.9);
      sack.position.set(s.ox, s.r * 1.1, s.oz);
      sack.castShadow = true;
      cluster.add(sack);
    });

    scene.add(cluster);
  }

  // 12. Hanging Lanterns
  function spawnLantern(x: number, y: number, z: number) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);

    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.35, 8), matGoldBrass);
    lanternGroup.add(lamp);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: '#FEF08A' }));
    lanternGroup.add(glow);

    const light = new THREE.PointLight('#FBBF24', 1.8, 8);
    lanternGroup.add(light);

    scene.add(lanternGroup);
  }

  // --- SPAWN OBJECTS ACROSS THE REALM ---

  // Barrels
  spawnBarrel('barrel_1', -4, 4, 'wood', 2);
  spawnBarrel('barrel_2', -5, 4, 'potion', 1);
  spawnBarrel('barrel_3', 14, 11, 'iron', 2);
  spawnBarrel('barrel_4', 18, -5, 'food', 1);
  spawnBarrel('barrel_5', -18, -4, 'bomb', 1);
  spawnBarrel('barrel_6', 8, -12, 'potion', 1);

  // Crates
  spawnCrate('crate_1', -8, 6, 'arrow', 10);
  spawnCrate('crate_2', 17, 11, 'gold', 3);
  spawnCrate('crate_3', 22, -4, 'crystal', 1);
  spawnCrate('crate_4', 2, -26, 'key', 1);
  spawnCrate('crate_5', -16, 2, 'food', 2);

  // Treasure Chests
  spawnChest('chest_ruins', -12, -18, 0.3, 'gold', 15);
  spawnChest('chest_tower', -26, 19, -0.8, 'crystal', 3);
  spawnChest('chest_temple', 6, -34, Math.PI, 'relic_shard', 1);

  // Archery Practice Range
  spawnArcheryTarget('target_1', 6, 8, -Math.PI / 2);
  spawnArcheryTarget('target_2', 6, 12, -Math.PI / 2);
  spawnArcheryTarget('target_3', 6, 16, -Math.PI / 2);

  // Straw Training Dummies
  spawnTrainingDummy('dummy_1', 10, 6, 0.2);
  spawnTrainingDummy('dummy_2', -14, -8, -0.4);

  // Village Architecture Props
  spawnVillageWell(4, 2);
  spawnWagon(12, 4, -0.2);
  spawnDirectionSignpost(0, 7);
  spawnWeaponRack(18, 1, Math.PI / 2);

  // Campsite
  spawnTent(-10, 12, 0.4);
  spawnTent(-12, 8, -0.6);
  spawnSackCluster(13, 13);
  spawnSackCluster(18, -3);
  spawnSackCluster(-7, 5);

  // Lanterns on Porches & Fortifications
  spawnLantern(15.5, 2.2, 16.5);
  spawnLantern(18.5, 2.2, 1.0);
  spawnLantern(-19.5, 6.4, -3.5);

  const update = (_delta: number) => {
    // Dynamic updates for props
  };

  const damageProp = (id: string, dmg: number) => {
    const prop = breakableProps.find((p) => p.id === id);
    if (!prop || prop.broken) return { broken: false };

    prop.health -= dmg;
    if (prop.health <= 0) {
      prop.broken = true;
      scene.remove(prop.mesh);
      return { broken: true, prop };
    }
    return { broken: false, prop };
  };

  return { breakableProps, update, damageProp };
}
