export type WeaponType = 'sword' | 'bow' | 'dual_daggers';

export type CharacterPose = 'idle' | 'run' | 'attack_slash' | 'attack_combo' | 'aim_bow' | 'shoot_bow' | 'roll' | 'jump' | 'victory';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  arrows: number;
  maxArrows: number;
  goldBricks: number;
  level: number;
  exp: number;
  nextLevelExp: number;
}

export interface Enemy {
  id: string;
  name: string;
  type: 'goblin' | 'skeleton_archer' | 'golem_boss';
  position: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  maxHealth: number;
  attackPower: number;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead';
  mesh?: any;
  targetPos?: { x: number; y: number; z: number };
  attackCooldown: number;
  patrolCenter: { x: number; z: number };
}

export interface ArrowProjectile {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  mesh: any;
  life: number;
  damage: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  opacity: number;
  life: number;
}

export interface Quest {
  id: string;
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
  targetCount: number;
  currentCount: number;
  rewardBricks: number;
  completed: boolean;
}

export interface CollectibleItem {
  id: string;
  type: 'gold_brick' | 'health_potion' | 'arrow_bundle' | 'chest';
  position: { x: number; y: number; z: number };
  mesh: any;
  collected: boolean;
  value: number;
}

export interface CharacterCustomization {
  capeVisible: boolean;
  backpackVisible: boolean;
  quiverVisible: boolean;
  weapon: WeaponType;
  cowlColor: string;
  sashColor: string;
}
