import * as THREE from 'three';
import { Enemy } from '../../types/game';

export class EnemyManager {
  private scene: THREE.Scene;
  public enemies: Enemy[] = [];
  private enemyMeshes: Map<string, THREE.Group> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnInitialEnemies();
  }

  private spawnInitialEnemies() {
    // 3 Goblins patrolling northern woods and ruin entrance
    this.spawnGoblin('goblin_1', 'Forest Goblin', -6, -8, 45);
    this.spawnGoblin('goblin_2', 'Forest Goblin', 6, -8, 45);
    this.spawnGoblin('goblin_3', 'Goblin Scout', -12, 14, 40);

    // 2 Skeleton Archers near ancient ruins
    this.spawnSkeleton('skel_1', 'Skeleton Archer', -10, -18, 50);
    this.spawnSkeleton('skel_2', 'Skeleton Marksman', 10, -18, 50);

    // 1 Stone Golem Mini-Boss in the northern sanctum
    this.spawnGolem('golem_boss', 'Ancient Brick Golem', 0, -26, 160);
  }

  private spawnGoblin(id: string, name: string, x: number, z: number, hp: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const matSkin = new THREE.MeshStandardMaterial({ color: '#5B8C5A', roughness: 0.5 });
    const matCloth = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.6 });
    const matClub = new THREE.MeshStandardMaterial({ color: '#543217', roughness: 0.7 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.45, 0.28), matCloth);
    torso.position.y = 0.65;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.32), matSkin);
    head.position.y = 1.05;
    head.castShadow = true;
    group.add(head);

    // Pointy Goblin Ears
    [-0.19, 0.19].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), matSkin);
      ear.rotation.z = ex > 0 ? -Math.PI / 3 : Math.PI / 3;
      ear.position.set(ex, 1.1, 0);
      group.add(ear);
    });

    // Goblin Eyes (Red glowing dots)
    [-0.08, 0.08].forEach((gx) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: '#EF4444' }));
      eye.position.set(gx, 1.08, 0.17);
      group.add(eye);
    });

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.2), matCloth);
    legL.position.set(-0.12, 0.23, 0);
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.2), matCloth);
    legR.position.set(0.12, 0.23, 0);
    legR.castShadow = true;
    group.add(legR);

    // Arms & Spiked Wooden Club
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), matSkin);
    armR.position.set(0.28, 0.65, 0);
    armR.castShadow = true;
    group.add(armR);

    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.04, 0.7, 8), matClub);
    club.position.set(0.32, 0.5, 0.2);
    club.rotation.x = Math.PI / 3;
    club.castShadow = true;
    group.add(club);

    this.scene.add(group);
    this.enemyMeshes.set(id, group);

    this.enemies.push({
      id,
      name,
      type: 'goblin',
      position: { x, y: 0, z },
      rotation: 0,
      health: hp,
      maxHealth: hp,
      attackPower: 12,
      state: 'patrol',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  private spawnSkeleton(id: string, name: string, x: number, z: number, hp: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const matBone = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.4 });
    const matWood = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.6 });

    // Ribcage torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.24), matBone);
    torso.position.y = 0.75;
    torso.castShadow = true;
    group.add(torso);

    // Skull head
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), matBone);
    skull.position.y = 1.15;
    skull.castShadow = true;
    group.add(skull);

    // Black Eye Sockets
    [-0.07, 0.07].forEach((sx) => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: '#0F172A' }));
      eye.position.set(sx, 1.17, 0.165);
      group.add(eye);
    });

    // Thin Bone Legs
    [-0.1, 0.1].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), matBone);
      leg.position.set(lx, 0.3, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    // Bone Bow in hand
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 6, 12, Math.PI * 0.9), matWood);
    bow.position.set(-0.25, 0.75, 0.15);
    bow.rotation.y = Math.PI / 2;
    bow.castShadow = true;
    group.add(bow);

    this.scene.add(group);
    this.enemyMeshes.set(id, group);

    this.enemies.push({
      id,
      name,
      type: 'skeleton_archer',
      position: { x, y: 0, z },
      rotation: 0,
      health: hp,
      maxHealth: hp,
      attackPower: 15,
      state: 'patrol',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  private spawnGolem(id: string, name: string, x: number, z: number, hp: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const matStone = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.85 });
    const matRune = new THREE.MeshBasicMaterial({ color: '#38BDF8' });

    // Massive Stone Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.9), matStone);
    torso.position.y = 1.4;
    torso.castShadow = true;
    group.add(torso);

    // Glowing Rune Core on Chest
    const rune = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 8), matRune);
    rune.rotation.x = Math.PI / 2;
    rune.position.set(0, 1.4, 0.48);
    group.add(rune);

    // Stone Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.6), matStone);
    head.position.y = 2.25;
    head.castShadow = true;
    group.add(head);

    // Cyan glowing eye slit
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.05), matRune);
    eye.position.set(0, 2.28, 0.31);
    group.add(eye);

    // Massive Boulder Arms
    [-0.95, 0.95].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 0.55), matStone);
      arm.position.set(ax, 1.2, 0);
      arm.castShadow = true;
      group.add(arm);
    });

    // Heavy Pillar Legs
    [-0.45, 0.45].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.6), matStone);
      leg.position.set(lx, 0.45, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    this.scene.add(group);
    this.enemyMeshes.set(id, group);

    this.enemies.push({
      id,
      name,
      type: 'golem_boss',
      position: { x, y: 0, z },
      rotation: 0,
      health: hp,
      maxHealth: hp,
      attackPower: 28,
      state: 'idle',
      mesh: group,
      attackCooldown: 0,
      patrolCenter: { x, z },
    });
  }

  public update(
    delta: number,
    playerPos: { x: number; y: number; z: number },
    onPlayerDamage: (dmg: number) => void
  ) {
    this.enemies.forEach((enemy) => {
      if (enemy.state === 'dead' || enemy.health <= 0) return;

      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= delta;
      }

      const dx = playerPos.x - enemy.position.x;
      const dz = playerPos.z - enemy.position.z;
      const distToPlayer = Math.sqrt(dx * dx + dz * dz);

      // Aggro radius: 14 for regular, 16 for golem
      const aggroRadius = enemy.type === 'golem_boss' ? 16 : 14;

      if (distToPlayer < aggroRadius) {
        // Look at player
        enemy.rotation = Math.atan2(dx, dz);
        enemy.mesh.rotation.y = enemy.rotation;

        const attackRange = enemy.type === 'skeleton_archer' ? 9 : 2.2;

        if (distToPlayer > attackRange) {
          // Chase player
          const speed = enemy.type === 'golem_boss' ? 2.0 : 3.6;
          const moveX = (dx / distToPlayer) * speed * delta;
          const moveZ = (dz / distToPlayer) * speed * delta;
          enemy.position.x += moveX;
          enemy.position.z += moveZ;
          enemy.mesh.position.set(enemy.position.x, 0, enemy.position.z);
          enemy.state = 'chase';

          // Walking bounce
          enemy.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.008)) * 0.1;
        } else {
          // In range to attack!
          enemy.state = 'attack';
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.type === 'golem_boss' ? 2.5 : 1.8;
            onPlayerDamage(enemy.attackPower);

            // Punch/lunge animation
            enemy.mesh.position.y = 0.2;
            setTimeout(() => {
              if (enemy.mesh) enemy.mesh.position.y = 0;
            }, 180);
          }
        }
      } else {
        // Idle / gentle patrol near spawn center
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
  }

  public damageEnemy(id: string, dmg: number): { dead: boolean; enemy?: Enemy } {
    const enemy = this.enemies.find((e) => e.id === id);
    if (!enemy || enemy.health <= 0) return { dead: false };

    enemy.health = Math.max(0, enemy.health - dmg);

    // Red hit flash on mesh
    if (enemy.mesh) {
      enemy.mesh.position.y = 0.3;
      setTimeout(() => {
        if (enemy.mesh) enemy.mesh.position.y = 0;
      }, 120);
    }

    if (enemy.health <= 0) {
      enemy.state = 'dead';
      // Fall over & remove after delay
      if (enemy.mesh) {
        enemy.mesh.rotation.x = Math.PI / 2;
        enemy.mesh.position.y = 0.2;
        setTimeout(() => {
          this.scene.remove(enemy.mesh);
        }, 3000);
      }
      return { dead: true, enemy };
    }

    return { dead: false, enemy };
  }
}
