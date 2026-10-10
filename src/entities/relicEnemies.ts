import * as THREE from 'three';
import { RelicEnemy, RelicEnemyType } from '../types/relic';
import { createMaterials } from '../world/materials';

export interface RelicEnemiesSystem {
  enemies: RelicEnemy[];
  update: (delta: number, playerPos: THREE.Vector3, onDamagePlayer: (dmg: number) => void) => void;
  damageEnemy: (id: string, dmg: number) => { dead: boolean; enemy?: RelicEnemy };
}

export function buildRelicEnemies(scene: THREE.Scene): RelicEnemiesSystem {
  const mats = createMaterials();
  const enemies: RelicEnemy[] = [];

  const matWolfFur = new THREE.MeshStandardMaterial({ color: '#4B5563', roughness: 0.8 });
  const matBandit = new THREE.MeshStandardMaterial({ color: '#7F1D1D', roughness: 0.6 });
  const matLeather = new THREE.MeshStandardMaterial({ color: '#54341B', roughness: 0.65 });
  const matBone = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.4 });
  const matOrcSkin = new THREE.MeshStandardMaterial({ color: '#446E3A', roughness: 0.55 });
  const matSteel = new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.85, roughness: 0.25 });
  const matTitanStone = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8 });
  const matCrystalBlue = new THREE.MeshBasicMaterial({ color: '#38BDF8' });

  // 1. Spawning Wolf
  function spawnWolf(id: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Quadruped body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.1), matWolfFur);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Wolf Head & Muzzle
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.4), matWolfFur);
    head.position.set(0, 0.75, 0.6);
    head.castShadow = true;
    group.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.3), matWolfFur);
    snout.position.set(0, 0.68, 0.85);
    group.add(snout);

    // Red glowing eyes
    [-0.09, 0.09].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: '#EF4444' }));
      eye.position.set(ex, 0.8, 0.78);
      group.add(eye);
    });

    // 4 Legs
    [[-0.2, -0.35], [0.2, -0.35], [-0.2, 0.35], [0.2, 0.35]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), matWolfFur);
      leg.position.set(lx, 0.25, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    scene.add(group);

    enemies.push({
      id,
      type: 'wolf',
      name: 'Dire Wolf',
      position: { x, y: 0, z },
      rotation: 0,
      health: 35,
      maxHealth: 35,
      attackPower: 10,
      speed: 4.8,
      attackRange: 1.6,
      state: 'patrol',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  // 2. Spawning Bandit Rogue
  function spawnBandit(id: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.28), matLeather);
    torso.position.y = 0.85;
    torso.castShadow = true;
    group.add(torso);

    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.42, 8), matBandit);
    hood.position.y = 1.35;
    group.add(hood);

    // Twin daggers
    [-0.32, 0.32].forEach((dx) => {
      const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.02), matSteel);
      dagger.position.set(dx, 0.65, 0.2);
      dagger.rotation.x = Math.PI / 3;
      group.add(dagger);
    });

    scene.add(group);

    enemies.push({
      id,
      type: 'bandit',
      name: 'Valley Bandit',
      position: { x, y: 0, z },
      rotation: 0,
      health: 45,
      maxHealth: 45,
      attackPower: 14,
      speed: 3.8,
      attackRange: 1.8,
      state: 'patrol',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  // 3. Spawning Skeleton Swordsman
  function spawnSkeleton(id: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const ribs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.22), matBone);
    ribs.position.y = 0.8;
    ribs.castShadow = true;
    group.add(ribs);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), matBone);
    skull.position.y = 1.3;
    skull.castShadow = true;
    group.add(skull);

    // Rusty Sword & Round Shield
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.03), matSteel);
    sword.position.set(0.32, 0.6, 0.2);
    sword.rotation.x = Math.PI / 3;
    group.add(sword);

    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 12), matLeather);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.3, 0.8, 0.1);
    group.add(shield);

    scene.add(group);

    enemies.push({
      id,
      type: 'skeleton',
      name: 'Skeleton Warrior',
      position: { x, y: 0, z },
      rotation: 0,
      health: 50,
      maxHealth: 50,
      attackPower: 15,
      speed: 3.2,
      attackRange: 2.0,
      state: 'patrol',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  // 4. Spawning Orc Brute
  function spawnOrc(id: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Heavy muscular green torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 0.5), matOrcSkin);
    torso.position.y = 1.1;
    torso.castShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.45), matOrcSkin);
    head.position.y = 1.75;
    head.castShadow = true;
    group.add(head);

    // Spiked Shoulders
    [-0.55, 0.55].forEach((sx) => {
      const pauldron = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 4), matSteel);
      pauldron.position.set(sx, 1.4, 0);
      group.add(pauldron);
    });

    // Heavy Battleaxe
    const axePole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), mats.woodLog);
    axePole.position.set(0.55, 0.8, 0.2);
    axePole.rotation.x = Math.PI / 3;
    group.add(axePole);

    const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.05), matSteel);
    axeBlade.position.set(0.55, 1.3, 0.35);
    group.add(axeBlade);

    scene.add(group);

    enemies.push({
      id,
      type: 'orc',
      name: 'Orc Warlord',
      position: { x, y: 0, z },
      rotation: 0,
      health: 95,
      maxHealth: 95,
      attackPower: 22,
      speed: 2.8,
      attackRange: 2.2,
      state: 'patrol',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  // 5. Spawning Dungeon Guardian (Boss Titan)
  function spawnDungeonGuardian(id: string, x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Massive Armored Titan Core
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 1.0), matTitanStone);
    torso.position.y = 1.8;
    torso.castShadow = true;
    group.add(torso);

    // Arcane Core Rune on Chest
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 1), matCrystalBlue);
    core.position.set(0, 1.8, 0.55);
    group.add(core);

    const coreLight = new THREE.PointLight('#38BDF8', 3.0, 10);
    coreLight.position.set(0, 1.8, 0.8);
    group.add(coreLight);

    // Titan Head & Horns
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), matTitanStone);
    head.position.y = 2.8;
    head.castShadow = true;
    group.add(head);

    [-0.55, 0.55].forEach((hx) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 4), matCrystalBlue);
      horn.position.set(hx, 3.4, 0);
      horn.rotation.z = hx > 0 ? -0.4 : 0.4;
      group.add(horn);
    });

    // Massive Stone Arms with Blue Crystal Spikes
    [-1.2, 1.2].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.6, 0.65), matTitanStone);
      arm.position.set(ax, 1.6, 0);
      arm.castShadow = true;
      group.add(arm);

      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 4), matCrystalBlue);
      spike.position.set(ax * 1.1, 2.1, 0);
      group.add(spike);
    });

    // Heavy Pillar Legs
    [-0.55, 0.55].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.1, 0.7), matTitanStone);
      leg.position.set(lx, 0.55, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    scene.add(group);

    enemies.push({
      id,
      type: 'dungeon_guardian',
      name: 'Dungeon Guardian (Titan Boss)',
      position: { x, y: 0, z },
      rotation: 0,
      health: 220,
      maxHealth: 220,
      attackPower: 32,
      speed: 2.2,
      attackRange: 2.8,
      state: 'idle',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  // Spawns in world
  spawnWolf('wolf_1', 8, 8);
  spawnWolf('wolf_2', 12, 6);

  spawnBandit('bandit_1', -12, 18);
  spawnBandit('bandit_2', -15, 22);

  spawnSkeleton('skel_1', -6, -18);
  spawnSkeleton('skel_2', 6, -18);

  spawnOrc('orc_1', -16, -26);

  // The Dungeon Guardian Boss stationed at the Dungeon Entrance!
  spawnDungeonGuardian('boss_guardian', -24, -28);

  const update = (delta: number, playerPos: THREE.Vector3, onDamagePlayer: (dmg: number) => void) => {
    enemies.forEach((enemy) => {
      if (enemy.state === 'dead' || enemy.health <= 0) return;

      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= delta;
      }

      const dx = playerPos.x - enemy.position.x;
      const dz = playerPos.z - enemy.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const aggroRadius = enemy.type === 'dungeon_guardian' ? 18 : 14;

      if (dist < aggroRadius) {
        enemy.rotation = Math.atan2(dx, dz);
        enemy.mesh.rotation.y = enemy.rotation;

        if (dist > enemy.attackRange) {
          const moveX = (dx / dist) * enemy.speed * delta;
          const moveZ = (dz / dist) * enemy.speed * delta;
          enemy.position.x += moveX;
          enemy.position.z += moveZ;
          enemy.mesh.position.set(enemy.position.x, 0, enemy.position.z);
          enemy.state = 'chase';
          enemy.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.008)) * 0.1;
        } else {
          enemy.state = 'attack';
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.type === 'dungeon_guardian' ? 2.6 : 1.7;
            onDamagePlayer(enemy.attackPower);

            // Punch lunging animation
            enemy.mesh.position.y = 0.25;
            setTimeout(() => {
              if (enemy.mesh) enemy.mesh.position.y = 0;
            }, 180);
          }
        }
      } else {
        // Patrol
        enemy.state = 'patrol';
        const patrolDx = enemy.patrolCenter.x - enemy.position.x;
        const patrolDz = enemy.patrolCenter.z - enemy.position.z;
        const patrolDist = Math.sqrt(patrolDx * patrolDx + patrolDz * patrolDz);
        if (patrolDist > 1.0) {
          enemy.position.x += (patrolDx / patrolDist) * 1.0 * delta;
          enemy.position.z += (patrolDz / patrolDist) * 1.0 * delta;
          enemy.mesh.position.set(enemy.position.x, 0, enemy.position.z);
        }
      }
    });
  };

  const damageEnemy = (id: string, dmg: number) => {
    const enemy = enemies.find((e) => e.id === id);
    if (!enemy || enemy.health <= 0) return { dead: false };

    enemy.health = Math.max(0, enemy.health - dmg);

    if (enemy.mesh) {
      enemy.mesh.position.y = 0.3;
      setTimeout(() => {
        if (enemy.mesh) enemy.mesh.position.y = 0;
      }, 120);
    }

    if (enemy.health <= 0) {
      enemy.state = 'dead';
      if (enemy.mesh) {
        enemy.mesh.rotation.x = Math.PI / 2;
        enemy.mesh.position.y = 0.2;
        setTimeout(() => {
          scene.remove(enemy.mesh);
        }, 3000);
      }
      return { dead: true, enemy };
    }

    return { dead: false, enemy };
  };

  return { enemies, update, damageEnemy };
}
