import * as THREE from 'three';
import { CollectibleItem } from '../types/game';
import { createMaterials } from '../world/materials';

export interface CollectiblesManager {
  collectibles: CollectibleItem[];
  update: (delta: number) => void;
  remove: (item: CollectibleItem) => void;
}

export function createCollectibles(scene: THREE.Scene, colliders: THREE.Box3[]): CollectiblesManager {
  const mats = createMaterials();
  const collectibles: CollectibleItem[] = [];

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
  spawnGoldBrick('brick_9', -15, 5.8, -5);
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
    collectibles.forEach((c) => {
      if (!c.collected && c.type !== 'chest') {
        c.mesh.rotation.y += delta * 2.2;
        c.mesh.position.y = c.position.y + Math.sin(time * 3 + c.position.x) * 0.08;
      }
    });
  };

  const remove = (item: CollectibleItem) => {
    item.collected = true;
    scene.remove(item.mesh);
  };

  return { collectibles, update, remove };
}
