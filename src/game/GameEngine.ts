import * as THREE from 'three';
import { CharacterCustomization, PlayerStats, Quest, WeaponType } from '../types/game';
import {
  RelicInventory,
  RelicQuest,
  NPCData,
  ResourceType,
  ConsumableType,
} from '../types/relic';
import { CharacterRigs, createLegoRanger } from './character/legoRangerModel';
import { CharacterAnimator } from './character/characterAnimator';
import { CombatSystem } from './combat/combatSystem';
import { sounds } from '../audio/soundSystem';
import { GAME_CONFIG } from '../core/config';
import { createWorldLighting } from '../world/lighting';
import { createAtmosphericFog, FogSystem } from '../world/fog';
import { createTerrain } from '../world/terrain';
import { CampfireObject, createCampfire } from '../world/campfire';
import { createCrystalPond } from '../world/pond';
import { createVegetation } from '../world/vegetation';
import { InputController } from '../systems/input';
import { ThirdPersonCameraController } from '../systems/camera';
import { MovementPhysics } from '../systems/physics';

// RELIC World & Entity Modules
import { buildRelicStructures } from '../world/relicBuildings';
import { buildRelicProps, RelicPropsSystem } from '../world/relicProps';
import { buildRelicFoliage } from '../world/relicFoliage';
import { buildRelicResources, RelicResourcesManager } from '../entities/relicResources';
import { buildRelicNPCs, RelicNPCManager } from '../entities/relicNPCs';
import { buildRelicEnemies, RelicEnemiesSystem } from '../entities/relicEnemies';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onInventoryUpdate: (inventory: RelicInventory) => void;
  onQuestUpdate: (quest: RelicQuest) => void;
  onNearbyNPCChange: (npc: NPCData | null) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  // Controllers
  public input: InputController;
  public cameraController: ThirdPersonCameraController;
  public physics: MovementPhysics;
  public fogSystem: FogSystem;
  public campfire: CampfireObject;

  // RELIC Systems
  public propsSystem: RelicPropsSystem;
  public resourcesManager: RelicResourcesManager;
  public npcManager: RelicNPCManager;
  public enemiesSystem: RelicEnemiesSystem;
  public combat: CombatSystem;

  // Character
  public rigs: CharacterRigs;
  public animator: CharacterAnimator;
  private callbacks: GameEngineCallbacks;

  // Player Vitals
  public playerStats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    arrows: 30,
    maxArrows: 40,
    goldBricks: 0,
    level: 1,
    exp: 14,
    nextLevelExp: 110,
  };

  // Full RELIC Inventory
  public relicInventory: RelicInventory = {
    resources: {
      wood: 1,
      iron: 0,
      crystal: 0,
      gold: 5,
      relic_shard: 0,
    },
    consumables: {
      potion: 3,
      food: 2,
      arrow: 30,
      bomb: 1,
      key: 0,
      scroll: 1,
    },
    equipment: {
      weapon: 'sword',
      offhand: 'shield',
      helmet: false,
      armor: true,
      gloves: true,
      boots: true,
    },
  };

  // Active Main Quest (Directly matching Asset Sheet)
  public activeQuest: RelicQuest = {
    id: 'main_find_relic',
    title: 'Find the lost relic',
    description: 'Explore the ancient forgotten world, gather materials, and discover the divine relic shard.',
    objectives: [
      { text: 'Collect 3 Wood', target: 3, current: 1, completed: false },
      { text: 'Collect 2 Iron', target: 2, current: 0, completed: false },
      { text: 'Find the Relic Shard at Ancient Temple', target: 1, current: 0, completed: false },
    ],
    reward: { gold: 50, xp: 200 },
    completed: false,
  };

  public customization: CharacterCustomization = {
    capeVisible: true,
    backpackVisible: false,
    quiverVisible: true,
    weapon: 'sword',
    cowlColor: '#284638',
    sashColor: '#932029',
  };

  /** When true the world is frozen (used by the main menu) but still rendered. */
  public paused = false;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Renderer
    this.scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 150);

    this.renderer = new THREE.WebGLRenderer({
      antialias: GAME_CONFIG.GRAPHICS.ANTIALIAS,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = GAME_CONFIG.GRAPHICS.TONE_MAPPING_EXPOSURE;
    container.appendChild(this.renderer.domElement);

    // 2. Atmospheric Fog & World Lighting
    this.fogSystem = createAtmosphericFog(this.scene);
    createWorldLighting(this.scene);

    // 3. World Terrain & Colliders
    const colliders: THREE.Box3[] = [];
    createTerrain(this.scene);
    this.campfire = createCampfire(this.scene, -6, 8, colliders);
    createCrystalPond(this.scene, -18, 20);
    createVegetation(this.scene, colliders);

    // 4. Build RELIC Architecture, Props, Foliage & Resources
    buildRelicStructures(this.scene, colliders);
    this.propsSystem = buildRelicProps(this.scene, colliders);
    buildRelicFoliage(this.scene, colliders);
    this.resourcesManager = buildRelicResources(this.scene);
    this.npcManager = buildRelicNPCs(this.scene);
    this.enemiesSystem = buildRelicEnemies(this.scene);

    // 5. 3D Character Rigs & Kinematics
    this.rigs = createLegoRanger(this.customization);
    this.rigs.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    this.scene.add(this.rigs.root);
    this.animator = new CharacterAnimator(this.rigs);

    // 6. Controllers
    this.physics = new MovementPhysics(new THREE.Vector3(0, 0, 15), colliders);
    this.cameraController = new ThirdPersonCameraController(this.camera);

    this.input = new InputController(this.renderer.domElement, (action) => {
      if (this.paused) return;
      this.handleAction(action);
    });

    this.combat = new CombatSystem(this.scene);

    window.addEventListener('resize', this.onResize);

    // 7. Render Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      if (this.isDestroyed) return;
      const delta = Math.min((time - lastTime) / 1000, 0.08);
      lastTime = time;

      this.update(this.paused ? 0 : delta);
      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(animate);
    };
    this.animFrameId = requestAnimationFrame(animate);
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handleAction(action: string) {
    if (action === 'attack') {
      if (this.relicInventory.equipment.weapon === 'sword') {
        this.performSwordAttack();
      } else {
        this.performBowAttack();
      }
    } else if (action === 'shoot_bow') {
      this.performBowAttack();
    } else if (action === 'jump') {
      if (this.physics.jump()) {
        sounds.playDodgeRoll();
        this.animator.setPose('jump');
      }
    } else if (action === 'roll') {
      if (this.playerStats.stamina >= GAME_CONFIG.CONTROLS.ROLL_STAMINA_COST) {
        this.playerStats.stamina -= GAME_CONFIG.CONTROLS.ROLL_STAMINA_COST;
        sounds.playDodgeRoll();
        this.animator.triggerRoll();
        this.physics.roll();
        this.callbacks.onStatsUpdate({ ...this.playerStats });
      }
    } else if (action === 'interact') {
      this.interactNearby();
    } else if (action === 'switch_weapon') {
      this.setWeapon(this.relicInventory.equipment.weapon === 'sword' ? 'bow' : 'sword');
    } else if (action === 'heal') {
      this.useHealingPotion();
    }
  }

  public useHealingPotion() {
    if (this.relicInventory.consumables.potion <= 0) {
      this.combat.addDamageText('NO POTIONS!', this.physics.position.x, 1.8, this.physics.position.z, '#F59E0B');
      return;
    }
    if (this.playerStats.health >= this.playerStats.maxHealth) {
      this.combat.addDamageText('HEALTH FULL!', this.physics.position.x, 1.8, this.physics.position.z, '#10B981');
      return;
    }
    this.relicInventory.consumables.potion--;
    const healAmount = 45;
    this.playerStats.health = Math.min(this.playerStats.maxHealth, this.playerStats.health + healAmount);
    sounds.playChestOpen();
    this.combat.addDamageText(`+${healAmount} HP HEALED!`, this.physics.position.x, 2.0, this.physics.position.z, '#22C55E');
    this.combat.spawnSparks(this.physics.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 12, '#34D399');
    this.callbacks.onStatsUpdate({ ...this.playerStats });
    this.callbacks.onInventoryUpdate({ ...this.relicInventory });
  }

  public useFood() {
    if (this.relicInventory.consumables.food <= 0) {
      this.combat.addDamageText('NO PROVISIONS!', this.physics.position.x, 1.8, this.physics.position.z, '#F59E0B');
      return;
    }
    this.relicInventory.consumables.food--;
    const healAmount = 25;
    this.playerStats.health = Math.min(this.playerStats.maxHealth, this.playerStats.health + healAmount);
    this.playerStats.stamina = this.playerStats.maxStamina;
    sounds.playChestOpen();
    this.combat.addDamageText(`+${healAmount} HP RESTORED!`, this.physics.position.x, 2.0, this.physics.position.z, '#FACC15');
    this.combat.spawnSparks(this.physics.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 10, '#FBBF24');
    this.callbacks.onStatsUpdate({ ...this.playerStats });
    this.callbacks.onInventoryUpdate({ ...this.relicInventory });
  }

  public setWeapon(w: 'sword' | 'bow') {
    this.relicInventory.equipment.weapon = w;
    this.rigs.sword.visible = w === 'sword';
    this.rigs.bow.visible = w === 'bow';
    this.callbacks.onInventoryUpdate({ ...this.relicInventory });
  }

  public attack() {
    this.handleAction('attack');
  }

  public jump() {
    this.handleAction('jump');
  }

  public dodgeRoll() {
    this.handleAction('roll');
  }

  public interact() {
    this.handleAction('interact');
  }

  private performSwordAttack() {
    sounds.playSwordSlash();
    this.animator.triggerSwordAttack(() => {
      this.executeMeleeStrike();
    });
  }

  private executeMeleeStrike() {
    this.combat.spawnSwordSlashArc(this.physics.position, this.physics.rotation);

    const forward = new THREE.Vector3(Math.sin(this.physics.rotation), 0, Math.cos(this.physics.rotation));
    const attackCenter = this.physics.position.clone().add(forward.multiplyScalar(1.5));
    this.combat.spawnSparks(attackCenter.clone().add(new THREE.Vector3(0, 1.0, 0)), 12, '#FBBF24');

    // 1. Damage Enemies
    this.enemiesSystem.enemies.forEach((enemy) => {
      if (enemy.health <= 0) return;
      const dist = attackCenter.distanceTo(new THREE.Vector3(enemy.position.x, 1, enemy.position.z));
      if (dist < GAME_CONFIG.COMBAT.SWORD_RANGE) {
        sounds.playEnemyHit();
        const dmg = 30 + Math.floor(Math.random() * 16);
        const { dead } = this.enemiesSystem.damageEnemy(enemy.id, dmg);
        this.combat.addDamageText(`-${dmg}`, enemy.position.x, 1.6, enemy.position.z, '#EF4444');

        if (enemy.type === 'dungeon_guardian') {
          this.combat.spawnShockwave(new THREE.Vector3(enemy.position.x, 0, enemy.position.z), '#38BDF8');
        }

        if (dead) {
          this.onEnemyDefeated(enemy.type);
        }
      }
    });

    // 2. Smash Breakable Barrels & Crates
    this.propsSystem.breakableProps.forEach((prop) => {
      if (prop.broken) return;
      const dist = attackCenter.distanceTo(new THREE.Vector3(prop.position.x, 0.5, prop.position.z));
      if (dist < 1.6) {
        sounds.playArrowHit();
        const { broken } = this.propsSystem.damageProp(prop.id, 25);
        this.combat.spawnSparks(new THREE.Vector3(prop.position.x, 0.6, prop.position.z), 14, '#C29B38');

        if (broken) {
          sounds.playChestOpen();
          this.onCollectLoot(prop.lootType, prop.lootAmount);
          this.combat.addDamageText(`+${prop.lootAmount} ${prop.lootType.toUpperCase()}!`, prop.position.x, 1.2, prop.position.z, '#FBBF24');
        }
      }
    });
  }

  private performBowAttack() {
    if (this.relicInventory.consumables.arrow <= 0) {
      this.combat.addDamageText('NO ARROWS!', this.physics.position.x, this.physics.position.y + 0.6, this.physics.position.z, '#FBBF24');
      return;
    }

    this.animator.startAimingBow();
    setTimeout(() => {
      this.animator.releaseBow(() => {
        this.relicInventory.consumables.arrow--;
        this.callbacks.onInventoryUpdate({ ...this.relicInventory });

        const dir = new THREE.Vector3(Math.sin(this.physics.rotation), 0.05, Math.cos(this.physics.rotation)).normalize();
        const origin = this.physics.position.clone().add(new THREE.Vector3(0, 1.25, 0));
        this.combat.fireArrow(origin, dir, 45);
      });
    }, 170);
  }

  private interactNearby() {
    const playerVec = this.physics.position;

    // 1. Talk to NPC if nearby
    const npc = this.npcManager.getNearbyNPC(playerVec);
    if (npc) {
      sounds.playChestOpen();
      this.callbacks.onNearbyNPCChange(npc);
      return;
    }

    // 2. Collect harvestable resources
    for (const r of this.resourcesManager.resources) {
      if (r.collected) continue;
      const dx = playerVec.x - r.position.x;
      const dz = playerVec.z - r.position.z;
      const dy = Math.abs(playerVec.y - r.position.y);
      const dist2D = Math.sqrt(dx * dx + dz * dz);
      if (dist2D < 3.2 && dy < 3.2) {
        this.resourcesManager.collectResource(r);
        this.onCollectLoot(r.type, r.amount);
        sounds.playCoinPickup();
        this.combat.addDamageText(`+${r.amount} ${r.type.toUpperCase()}!`, r.position.x, 1.2, r.position.z, '#38BDF8');
        break;
      }
    }
  }

  private onCollectLoot(type: string, amount: number) {
    if (type in this.relicInventory.resources) {
      (this.relicInventory.resources as any)[type] += amount;

      // Update Main Quest objectives
      if (type === 'wood') {
        const obj = this.activeQuest.objectives[0];
        obj.current = Math.min(obj.target, obj.current + amount);
        if (obj.current >= obj.target) obj.completed = true;
      } else if (type === 'iron') {
        const obj = this.activeQuest.objectives[1];
        obj.current = Math.min(obj.target, obj.current + amount);
        if (obj.current >= obj.target) obj.completed = true;
      } else if (type === 'relic_shard') {
        const obj = this.activeQuest.objectives[2];
        obj.current = 1;
        obj.completed = true;
        sounds.playChestOpen();
        this.combat.addDamageText('LOST RELIC DISCOVERED!', this.physics.position.x, 2.0, this.physics.position.z, '#38BDF8');
      }

      this.callbacks.onQuestUpdate({ ...this.activeQuest });
    } else if (type in this.relicInventory.consumables) {
      (this.relicInventory.consumables as any)[type] += amount;
    }

    this.callbacks.onInventoryUpdate({ ...this.relicInventory });
  }

  private onEnemyDefeated(type: string) {
    this.playerStats.exp += 50;
    this.relicInventory.resources.gold += 4;
    sounds.playCoinPickup();

    if (this.playerStats.exp >= this.playerStats.nextLevelExp) {
      this.playerStats.level++;
      this.playerStats.exp -= this.playerStats.nextLevelExp;
      this.playerStats.nextLevelExp = Math.floor(this.playerStats.nextLevelExp * 1.5);
      this.playerStats.maxHealth += 25;
      this.playerStats.health = this.playerStats.maxHealth;
      sounds.playChestOpen();
      this.combat.addDamageText('LEVEL UP!', this.physics.position.x, 1.8, this.physics.position.z, '#FACC15');
    }

    this.callbacks.onStatsUpdate({ ...this.playerStats });
    this.callbacks.onInventoryUpdate({ ...this.relicInventory });
  }

  // -------------------------------------------------------------
  // Engine Update Loop
  // -------------------------------------------------------------
  public update(delta: number) {
    // 1. Stamina Regeneration
    if (this.playerStats.stamina < this.playerStats.maxStamina) {
      this.playerStats.stamina = Math.min(
        this.playerStats.maxStamina,
        this.playerStats.stamina + GAME_CONFIG.CONTROLS.STAMINA_REGEN * delta
      );
      this.callbacks.onStatsUpdate({ ...this.playerStats });
    }

    // 2. Input & Camera
    const inputState = this.input.update();
    const { lookX, lookY, zoom } = this.input.consumeDeltas();
    this.cameraController.handleInput(lookX, lookY, zoom);

    // 3. Physics Movement
    const { speedRatio } = this.physics.update(
      inputState.moveX,
      inputState.moveZ,
      inputState.isSprinting && this.playerStats.stamina > 5,
      this.cameraController.getYaw(),
      delta
    );

    if (speedRatio > 0.05 && Math.random() < delta * (inputState.isSprinting ? 4.5 : 2.5)) {
      sounds.playFootstep();
    }

    // 4. Character Rigs & Animation
    this.rigs.root.position.copy(this.physics.position);
    this.rigs.root.rotation.y = this.physics.rotation;
    this.animator.update(delta, speedRatio, this.physics.isGrounded);

    this.cameraController.update(this.physics.position, delta);

    // 5. Environmental Systems
    this.fogSystem.update(delta);
    this.campfire.update(delta);
    this.resourcesManager.update(delta);

    // 6. NPCs Nearby Check
    const nearby = this.npcManager.getNearbyNPC(this.physics.position);
    this.npcManager.update(delta, this.physics.position);

    // 7. Dynamic Adaptive Music Context Update
    const inCombat = this.enemiesSystem.enemies.some(
      (enemy) =>
        enemy.health > 0 &&
        new THREE.Vector3(enemy.position.x, 0, enemy.position.z).distanceTo(this.physics.position) < 13.5
    );
    const distToVillage = this.physics.position.distanceTo(new THREE.Vector3(0, 0, 0));
    const nearVillage = distToVillage < 26 || !!nearby;

    sounds.updateGameContext({
      inCombat,
      nearVillage,
      inDialogue: false,
    });

    // 8. Enemies Update & Attack Player
    this.enemiesSystem.update(
      delta,
      this.physics.position,
      (damage) => {
        sounds.playEnemyHit();
        this.playerStats.health = Math.max(0, this.playerStats.health - damage);
        this.combat.addDamageText(`-${damage}`, this.physics.position.x, 1.8, this.physics.position.z, '#EF4444');
        this.callbacks.onStatsUpdate({ ...this.playerStats });
      }
    );

    // 8. Projectiles Update
    this.combat.update(delta);

    for (let i = this.combat.arrows.length - 1; i >= 0; i--) {
      const arrow = this.combat.arrows[i];
      const arrowVec = new THREE.Vector3(arrow.position.x, arrow.position.y, arrow.position.z);

      let hit = false;
      for (const enemy of this.enemiesSystem.enemies) {
        if (enemy.health <= 0) continue;
        const ePos = new THREE.Vector3(enemy.position.x, 1.0, enemy.position.z);
        if (arrowVec.distanceTo(ePos) < 1.3) {
          sounds.playEnemyHit();
          const dmg = arrow.damage + Math.floor(Math.random() * 14);
          const { dead } = this.enemiesSystem.damageEnemy(enemy.id, dmg);
          this.combat.addDamageText(`CRIT! -${dmg}`, enemy.position.x, 1.8, enemy.position.z, '#F59E0B');
          this.combat.spawnSparks(arrowVec, 10, '#EF4444');
          if (dead) this.onEnemyDefeated(enemy.type);
          hit = true;
          break;
        }
      }

      // Check breakable props & archery targets
      if (!hit) {
        for (const prop of this.propsSystem.breakableProps) {
          if (prop.broken) continue;
          const propPos = new THREE.Vector3(prop.position.x, 0.8, prop.position.z);
          if (arrowVec.distanceTo(propPos) < 1.4) {
            sounds.playArrowHit();
            this.combat.spawnSparks(arrowVec, 12, '#FDE047');
            hit = true;
            if (prop.type === 'target') {
              this.playerStats.exp += 15;
              sounds.playCoinPickup();
              this.combat.addDamageText('BULLSEYE! +15 XP', prop.position.x, 2.0, prop.position.z, '#FACC15');
              this.callbacks.onStatsUpdate({ ...this.playerStats });
            } else {
              const { broken } = this.propsSystem.damageProp(prop.id, arrow.damage);
              if (broken) {
                sounds.playChestOpen();
                this.onCollectLoot(prop.lootType, prop.lootAmount);
                this.combat.addDamageText(`+${prop.lootAmount} ${prop.lootType.toUpperCase()}!`, prop.position.x, 1.4, prop.position.z, '#FBBF24');
              } else {
                this.combat.addDamageText(`-${arrow.damage}`, prop.position.x, 1.4, prop.position.z, '#94A3B8');
              }
            }
            break;
          }
        }
      }

      if (hit) {
        this.scene.remove(arrow.mesh);
        this.combat.arrows.splice(i, 1);
      }
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.input.destroy();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
