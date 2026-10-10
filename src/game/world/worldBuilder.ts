import * as THREE from 'three';
import { CollectibleItem } from '../../types/game';
import { createMaterials } from '../../world/materials';

export interface WorldObjects {
  scene: THREE.Scene;
  colliders: THREE.Box3[];
  collectibles: CollectibleItem[];
  targets: THREE.Mesh[];
  clouds: THREE.Group[];
  embers: THREE.Points;
  update: (delta: number) => void;
}

export function buildGameWorld(scene: THREE.Scene): WorldObjects {
  const colliders: THREE.Box3[] = [];
  const collectibles: CollectibleItem[] = [];
  const targets: THREE.Mesh[] = [];
  const clouds: THREE.Group[] = [];

  const mats = createMaterials();

  // 1. Terrain Base
  const groundGeom = new THREE.PlaneGeometry(180, 180, 48, 48);
  const groundMesh = new THREE.Mesh(groundGeom, mats.grass);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Cobblestone Stone Pathways & Plaza
  const pathGeom = new THREE.PlaneGeometry(14, 52);
  const pathMesh = new THREE.Mesh(pathGeom, mats.stoneRoad);
  pathMesh.rotation.x = -Math.PI / 2;
  pathMesh.position.set(0, 0.015, 10);
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  const crossPathGeom = new THREE.PlaneGeometry(64, 8);
  const crossPathMesh = new THREE.Mesh(crossPathGeom, mats.stoneRoad);
  crossPathMesh.rotation.x = -Math.PI / 2;
  crossPathMesh.position.set(0, 0.02, -5);
  crossPathMesh.receiveShadow = true;
  scene.add(crossPathMesh);

  // Stylized Lego Studded Plate Detail
  const studGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10);
  const studInstanced = new THREE.InstancedMesh(studGeom, mats.grassDark, 320);
  const dummy = new THREE.Object3D();
  let studIdx = 0;
  for (let x = -36; x <= 36; x += 4) {
    for (let z = -36; z <= 36; z += 4) {
      if (Math.abs(x) > 3 || z < -6 || z > 36) {
        dummy.position.set(x + (Math.random() - 0.5) * 1.5, 0.02, z + (Math.random() - 0.5) * 1.5);
        dummy.updateMatrix();
        studInstanced.setMatrixAt(studIdx++, dummy.matrix);
      }
    }
  }
  studInstanced.receiveShadow = true;
  scene.add(studInstanced);

  // 2. Crystal Pond (Reflective Water Body)
  const pondGroup = new THREE.Group();
  pondGroup.position.set(-18, 0.03, 20);

  const pondGeom = new THREE.CylinderGeometry(6.5, 6.5, 0.2, 24);
  const pondWater = new THREE.Mesh(pondGeom, mats.water);
  pondWater.position.y = 0.02;
  pondWater.receiveShadow = true;
  pondGroup.add(pondWater);

  // Pond stone shoreline rim
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const stoneSize = 0.5 + Math.random() * 0.4;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(stoneSize), mats.ruinStone);
    stone.position.set(Math.cos(angle) * 6.5, 0.1, Math.sin(angle) * 6.5);
    stone.castShadow = true;
    pondGroup.add(stone);
  }

  // Water lilies on pond
  const lilyMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.5 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.4 });
  for (let i = 0; i < 4; i++) {
    const lily = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.02, 12), lilyMat);
    lily.add(pad);
    const flower = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.15, 6), flowerMat);
    flower.position.y = 0.08;
    lily.add(flower);

    const a = (i / 4) * Math.PI * 2 + 0.3;
    const r = 2.0 + (i % 2) * 1.8;
    lily.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
    pondGroup.add(lily);
  }

  scene.add(pondGroup);

  // 3. Campfire Area with Warm Lighting and Floating Embers
  const campfireGroup = new THREE.Group();
  campfireGroup.position.set(-6, 0, 8);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.3, 8), mats.woodLog);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = angle;
    log.position.y = 0.08;
    log.castShadow = true;
    campfireGroup.add(log);
  }

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), mats.ruinStone);
    stone.position.set(Math.cos(angle) * 0.95, 0.1, Math.sin(angle) * 0.95);
    stone.castShadow = true;
    campfireGroup.add(stone);
  }

  // Warm Campfire Light casting dynamic shadow
  const fireLight = new THREE.PointLight('#FFA500', 3.2, 16);
  fireLight.position.set(0, 0.9, 0);
  fireLight.castShadow = true;
  fireLight.shadow.bias = -0.002;
  campfireGroup.add(fireLight);

  const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 8), mats.fireGlow);
  flameMesh.position.y = 0.38;
  campfireGroup.add(flameMesh);

  // Wooden campsite bench
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.5), mats.woodLog);
  benchSeat.position.set(2.2, 0.45, 0);
  benchSeat.castShadow = true;
  campfireGroup.add(benchSeat);
  [-0.8, 0.8].forEach((bx) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 6), mats.woodLog);
    leg.position.set(2.2 + bx, 0.22, 0);
    leg.castShadow = true;
    campfireGroup.add(leg);
  });

  scene.add(campfireGroup);

  // Campfire Embers particle system
  const emberCount = 35;
  const emberGeom = new THREE.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    emberPos[i * 3] = -6 + (Math.random() - 0.5) * 0.8;
    emberPos[i * 3 + 1] = 0.4 + Math.random() * 2.5;
    emberPos[i * 3 + 2] = 8 + (Math.random() - 0.5) * 0.8;
  }
  emberGeom.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const emberMat = new THREE.PointsMaterial({
    color: '#FFB703',
    size: 0.12,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(emberGeom, emberMat);
  scene.add(embers);

  // 4. Lego Pine & Oak Trees
  function createLegoTree(x: number, z: number, scale = 1) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 3.4 * scale, 8), mats.woodLog);
    trunk.position.y = 1.7 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const tiers = [
      { y: 3.2, r: 2.3, h: 2.1, mat: mats.pineFoliage },
      { y: 4.6, r: 1.8, h: 1.9, mat: mats.pineFoliageLight },
      { y: 5.8, r: 1.2, h: 1.6, mat: mats.pineFoliage },
    ];
    tiers.forEach((tier) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r * scale, tier.h * scale, 8), tier.mat);
      cone.position.y = tier.y * scale;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    });

    scene.add(tree);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, 1.7 * scale, z),
      new THREE.Vector3(0.9 * scale, 3.4 * scale, 0.9 * scale)
    );
    colliders.push(box);
  }

  const treePositions = [
    [-14, 18], [-18, 12], [-22, 25], [-16, 32],
    [14, 16], [20, 22], [18, 30], [24, 12],
    [-20, -10], [-25, -18], [-15, -24], [-8, -26],
    [18, -12], [26, -18], [15, -24], [8, -28],
    [-28, 5], [28, 5], [-32, -2], [32, 2],
    [-35, 15], [35, 15], [-25, 38], [25, 38],
  ];
  treePositions.forEach(([x, z], idx) => {
    createLegoTree(x, z, 0.85 + (idx % 3) * 0.22);
  });

  // 5. Ancient Stone Ruins & Pillars with Glowing Runes
  function createRuinPillar(x: number, z: number, height = 4.2) {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(x, 0, z);

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.5), mats.ruinStone);
    base.position.y = 0.3;
    base.castShadow = true;
    pillarGroup.add(base);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, height, 10), mats.ruinStone);
    col.position.y = height / 2 + 0.3;
    col.castShadow = true;
    pillarGroup.add(col);

    // Glowing Runic Inscription Band
    const runeBand = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.2, 10), mats.runeCyan);
    runeBand.position.y = height * 0.65;
    pillarGroup.add(runeBand);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), mats.ruinStone);
    cap.position.y = height + 0.45;
    cap.castShadow = true;
    pillarGroup.add(cap);

    // Wall Torch on Pillar
    const torchLight = new THREE.PointLight('#38BDF8', 1.0, 6);
    torchLight.position.set(0, height * 0.65, 0.7);
    pillarGroup.add(torchLight);

    scene.add(pillarGroup);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, height / 2, z), new THREE.Vector3(1.5, height + 0.6, 1.5));
    colliders.push(box);
  }

  createRuinPillar(-8, -14, 4.0);
  createRuinPillar(-3, -16, 4.8);
  createRuinPillar(3, -16, 4.8);
  createRuinPillar(8, -14, 4.0);

  const archLintel = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.75, 1.3), mats.ruinStone);
  archLintel.position.set(0, 5.2, -16);
  archLintel.castShadow = true;
  scene.add(archLintel);

  // 6. Archery Target Range
  function createArcheryTarget(x: number, y: number, z: number, rotY = 0) {
    const targetGroup = new THREE.Group();
    targetGroup.position.set(x, y, z);
    targetGroup.rotation.y = rotY;

    const standL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mats.woodLog);
    standL.position.set(-0.5, 1.0, -0.3);
    standL.rotation.x = 0.25;
    standL.castShadow = true;
    targetGroup.add(standL);

    const standR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mats.woodLog);
    standR.position.set(0.5, 1.0, -0.3);
    standR.rotation.x = 0.25;
    standR.castShadow = true;
    targetGroup.add(standR);

    const board = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 24), mats.woodLog);
    board.rotation.x = Math.PI / 2;
    board.position.set(0, 1.4, 0);
    board.castShadow = true;
    targetGroup.add(board);

    const ringWhite = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.13, 24),
      new THREE.MeshBasicMaterial({ color: '#F8FAFC' })
    );
    ringWhite.rotation.x = Math.PI / 2;
    ringWhite.position.set(0, 1.4, 0.01);
    targetGroup.add(ringWhite);

    const ringRed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 0.14, 20),
      new THREE.MeshBasicMaterial({ color: '#DC2626' })
    );
    ringRed.rotation.x = Math.PI / 2;
    ringRed.position.set(0, 1.4, 0.02);
    targetGroup.add(ringRed);

    const bullseye = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.15, 16),
      new THREE.MeshBasicMaterial({ color: '#FACC15' })
    );
    bullseye.rotation.x = Math.PI / 2;
    bullseye.position.set(0, 1.4, 0.03);
    targetGroup.add(bullseye);
    targets.push(bullseye);

    scene.add(targetGroup);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.2, z), new THREE.Vector3(1.4, 2.0, 1.0));
    colliders.push(box);
  }

  createArcheryTarget(12, 0, 5, -Math.PI / 4);
  createArcheryTarget(16, 0, 0, -Math.PI / 4);
  createArcheryTarget(20, 0, -5, -Math.PI / 4);

  // 7. Watchtower with Ladder & Flag
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-15, 0, -5);

  const postGeom = new THREE.CylinderGeometry(0.18, 0.18, 7.0, 8);
  [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeom, mats.woodLog);
    post.position.set(px, 3.5, pz);
    post.castShadow = true;
    towerGroup.add(post);
  });

  const platGeom = new THREE.BoxGeometry(4.4, 0.35, 4.4);
  const plat = new THREE.Mesh(platGeom, mats.woodLog);
  plat.position.y = 5.2;
  plat.castShadow = true;
  towerGroup.add(plat);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.0, 4), new THREE.MeshStandardMaterial({ color: '#881337', roughness: 0.5 }));
  roof.position.y = 7.6;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  towerGroup.add(roof);

  scene.add(towerGroup);

  const towerBox = new THREE.Box3();
  towerBox.setFromCenterAndSize(new THREE.Vector3(-15, 3.5, -5), new THREE.Vector3(4.2, 7.0, 4.2));
  colliders.push(towerBox);

  // 8. Volumetric Lego Clouds Floating Overhead
  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.88,
  });

  function createLegoCloud(x: number, y: number, z: number) {
    const cloud = new THREE.Group();
    cloud.position.set(x, y, z);

    const sizes = [
      { w: 9, h: 2.2, d: 5, ox: 0, oz: 0 },
      { w: 6, h: 2.4, d: 4, ox: -3, oz: 1 },
      { w: 7, h: 2.0, d: 4, ox: 3, oz: -1 },
    ];
    sizes.forEach((s) => {
      const part = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), cloudMat);
      part.position.set(s.ox, 0, s.oz);
      cloud.add(part);
    });

    scene.add(cloud);
    clouds.push(cloud);
  }

  createLegoCloud(-40, 32, -20);
  createLegoCloud(10, 35, -45);
  createLegoCloud(35, 30, 20);
  createLegoCloud(-20, 33, 40);

  // 9. Collectibles: Golden Bricks, Health Potions, and Treasure Chests
  function spawnGoldBrick(id: string, x: number, y: number, z: number, val = 1) {
    const brickGroup = new THREE.Group();
    brickGroup.position.set(x, y, z);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.28), mats.goldBrick);
    base.castShadow = true;
    brickGroup.add(base);

    [-0.14, 0.14].forEach((sx) => {
      [-0.06, 0.06].forEach((sz) => {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), mats.goldBrick);
        s.position.set(sx, 0.16, sz);
        brickGroup.add(s);
      });
    });

    scene.add(brickGroup);
    collectibles.push({
      id,
      type: 'gold_brick',
      position: { x, y, z },
      mesh: brickGroup,
      collected: false,
      value: val,
    });
  }

  function spawnHealthPotion(id: string, x: number, y: number, z: number) {
    const potGroup = new THREE.Group();
    potGroup.position.set(x, y, z);

    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.32, 10),
      new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.2, metalness: 0.1 })
    );
    bottle.castShadow = true;
    potGroup.add(bottle);

    const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), mats.woodLog);
    cork.position.y = 0.2;
    potGroup.add(cork);

    scene.add(potGroup);
    collectibles.push({
      id,
      type: 'health_potion',
      position: { x, y, z },
      mesh: potGroup,
      collected: false,
      value: 35,
    });
  }

  function spawnChest(id: string, x: number, y: number, z: number) {
    const chestGroup = new THREE.Group();
    chestGroup.position.set(x, y, z);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.6), mats.woodLog);
    base.position.y = 0.22;
    base.castShadow = true;
    chestGroup.add(base);

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12, 1, false, 0, Math.PI), mats.woodLog);
    lid.rotation.z = Math.PI / 2;
    lid.position.set(0, 0.45, 0);
    lid.castShadow = true;
    chestGroup.add(lid);

    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.08), mats.goldBrick);
    lock.position.set(0, 0.36, 0.32);
    chestGroup.add(lock);

    scene.add(chestGroup);
    collectibles.push({
      id,
      type: 'chest',
      position: { x, y, z },
      mesh: chestGroup,
      collected: false,
      value: 5,
    });

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 0.35, z), new THREE.Vector3(1.1, 0.7, 0.8));
    colliders.push(box);
  }

  // Golden Bricks
  spawnGoldBrick('brick_1', 0, 0.5, 4);
  spawnGoldBrick('brick_2', 0, 0.5, 12);
  spawnGoldBrick('brick_3', 0, 0.5, 20);
  spawnGoldBrick('brick_4', -8, 0.5, 0);
  spawnGoldBrick('brick_5', 8, 0.5, 0);
  spawnGoldBrick('brick_6', -6, 0.5, -14);
  spawnGoldBrick('brick_7', 6, 0.5, -14);
  spawnGoldBrick('brick_8', 0, 0.5, -16);
  spawnGoldBrick('brick_9', -15, 5.8, -5); // Top of watchtower
  spawnGoldBrick('brick_10', 16, 0.5, 8);

  // Health Potions
  spawnHealthPotion('pot_1', -5, 0.3, 10);
  spawnHealthPotion('pot_2', 5, 0.3, -12);

  // Chests
  spawnChest('chest_ruins', 0, 0, -18);
  spawnChest('chest_camp', -8, 0, 10);

  let time = 0;
  const update = (delta: number) => {
    time += delta;

    // Flicker Campfire Light
    fireLight.intensity = 2.8 + Math.sin(time * 16) * 0.4 + Math.cos(time * 26) * 0.3;
    flameMesh.scale.y = 1 + Math.sin(time * 18) * 0.18;

    // Slowly float clouds across sky
    clouds.forEach((cloud) => {
      cloud.position.x += delta * 1.2;
      if (cloud.position.x > 80) cloud.position.x = -80;
    });

    // Update Campfire embers drifting upward
    const positions = embers.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3 + 1] += delta * 1.4; // rise
      positions[i * 3] += Math.sin(time * 2 + i) * 0.01;
      if (positions[i * 3 + 1] > 3.2) {
        positions[i * 3 + 1] = 0.4;
        positions[i * 3] = -6 + (Math.random() - 0.5) * 0.8;
      }
    }
    embers.geometry.attributes.position.needsUpdate = true;

    // Bobbing Collectibles
    collectibles.forEach((c) => {
      if (!c.collected && c.type !== 'chest') {
        c.mesh.rotation.y += delta * 2.0;
        c.mesh.position.y = c.position.y + Math.sin(time * 3 + c.position.x) * 0.08;
      }
    });
  };

  return {
    scene,
    colliders,
    collectibles,
    targets,
    clouds,
    embers,
    update,
  };
}
