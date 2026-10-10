import * as THREE from 'three';
import { HarvestableResource, ResourceType } from '../types/relic';
import { createMaterials } from '../world/materials';

export interface RelicResourcesManager {
  resources: HarvestableResource[];
  update: (delta: number) => void;
  collectResource: (r: HarvestableResource) => void;
}

export function buildRelicResources(scene: THREE.Scene): RelicResourcesManager {
  const mats = createMaterials();
  const resources: HarvestableResource[] = [];

  const matIronOre = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9, roughness: 0.25 });
  const matCrystalCluster = new THREE.MeshPhysicalMaterial({
    color: '#0284C7',
    emissive: '#0369A1',
    emissiveIntensity: 0.8,
    transmission: 0.6,
    roughness: 0.1,
    metalness: 0.2,
  });
  const matGoldOre = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.85, roughness: 0.2 });
  const matRelicDivine = new THREE.MeshPhysicalMaterial({
    color: '#38BDF8',
    emissive: '#0EA5E9',
    emissiveIntensity: 1.2,
    transmission: 0.4,
    roughness: 0.05,
    metalness: 0.8,
  });

  // 1. Spawning Wood Log Stacks
  function spawnWoodStack(id: string, x: number, z: number, amount = 2) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    [
      { x: -0.2, y: 0.15, z: 0, rot: 0 },
      { x: 0.2, y: 0.15, z: 0, rot: 0 },
      { x: 0, y: 0.38, z: 0, rot: 0.05 },
    ].forEach((l) => {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.2, 8), mats.woodLog);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = l.rot;
      log.position.set(l.x, l.y, l.z);
      log.castShadow = true;
      group.add(log);
    });

    scene.add(group);
    resources.push({ id, type: 'wood', position: { x, y: 0, z }, mesh: group, collected: false, amount });
  }

  // 2. Spawning Iron Ore Veins
  function spawnIronVein(id: string, x: number, z: number, amount = 2) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const baseRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), mats.ruinStone);
    baseRock.position.y = 0.45;
    group.add(baseRock);

    // Iron ore spikes
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.25), matIronOre);
      spike.position.set(Math.cos(angle) * 0.35, 0.65, Math.sin(angle) * 0.35);
      spike.rotation.y = angle;
      group.add(spike);
    }

    scene.add(group);
    resources.push({ id, type: 'iron', position: { x, y: 0, z }, mesh: group, collected: false, amount });
  }

  // 3. Spawning Arcane Crystal Clusters
  function spawnCrystalCluster(id: string, x: number, z: number, amount = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const height = 0.6 + (i % 2) * 0.4;
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.18, height, 5), matCrystalCluster);
      shard.position.set(Math.cos(angle) * 0.3, height / 2, Math.sin(angle) * 0.3);
      shard.rotation.z = (Math.random() - 0.5) * 0.3;
      shard.rotation.x = (Math.random() - 0.5) * 0.3;
      group.add(shard);
    }

    // Glowing point light
    const glow = new THREE.PointLight('#38BDF8', 2.0, 7);
    glow.position.set(0, 0.7, 0);
    group.add(glow);

    scene.add(group);
    resources.push({ id, type: 'crystal', position: { x, y: 0, z }, mesh: group, collected: false, amount });
  }

  // 4. Spawning Gold Nuggets
  function spawnGoldVein(id: string, x: number, z: number, amount = 3) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    for (let i = 0; i < 4; i++) {
      const nugget = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), matGoldOre);
      nugget.position.set((i % 2 - 0.5) * 0.4, 0.2, Math.floor(i / 2 - 0.5) * 0.4);
      group.add(nugget);
    }

    scene.add(group);
    resources.push({ id, type: 'gold', position: { x, y: 0, z }, mesh: group, collected: false, amount });
  }

  // 5. Spawning THE LOST RELIC SHARD on the Ancient Temple Altar!
  function spawnRelicShard(id: string, x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Divine triangular faceted Relic Shard
    const shardGeom = new THREE.OctahedronGeometry(0.55, 1);
    const shard = new THREE.Mesh(shardGeom, matRelicDivine);
    shard.scale.set(0.8, 1.4, 0.6);
    group.add(shard);

    // Divine halo ring
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: '#BAE6FD' })
    );
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    const relicLight = new THREE.PointLight('#38BDF8', 4.5, 16);
    group.add(relicLight);

    scene.add(group);
    resources.push({ id, type: 'relic_shard', position: { x, y, z }, mesh: group, collected: false, amount: 1 });
  }

  // Spawn resources across the world
  spawnWoodStack('wood_1', -2, 6, 3);
  spawnWoodStack('wood_2', 10, 18, 3);
  spawnWoodStack('wood_3', -16, 22, 3);

  spawnIronVein('iron_1', 14, -6, 2);
  spawnIronVein('iron_2', 26, 4, 3);
  spawnIronVein('iron_3', -10, -18, 2);

  spawnCrystalCluster('crystal_1', -20, -28, 1);
  spawnCrystalCluster('crystal_2', 6, -26, 2);

  spawnGoldVein('gold_1', 4, 16, 4);
  spawnGoldVein('gold_2', -6, -14, 5);

  // The Relic Shard on the Temple Altar!
  spawnRelicShard('the_lost_relic', 0, 2.8, -32);

  let time = 0;
  const update = (delta: number) => {
    time += delta;
    resources.forEach((r) => {
      if (!r.collected && r.type === 'relic_shard') {
        r.mesh.rotation.y += delta * 1.5;
        r.mesh.position.y = r.position.y + Math.sin(time * 3) * 0.12;
      }
    });
  };

  const collectResource = (r: HarvestableResource) => {
    r.collected = true;
    scene.remove(r.mesh);
  };

  return { resources, update, collectResource };
}
