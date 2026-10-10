export type ResourceType = 'wood' | 'iron' | 'crystal' | 'gold' | 'relic_shard';
export type ConsumableType = 'potion' | 'food' | 'arrow' | 'bomb' | 'key' | 'scroll';
export type WeaponSlot = 'sword' | 'bow' | 'dagger' | 'shield';
export type ArmorSlot = 'helmet' | 'armor' | 'gloves' | 'boots';

export interface RelicInventory {
  resources: {
    wood: number;
    iron: number;
    crystal: number;
    gold: number;
    relic_shard: number;
  };
  consumables: {
    potion: number;
    food: number;
    arrow: number;
    bomb: number;
    key: number;
    scroll: number;
  };
  equipment: {
    weapon: WeaponSlot;
    offhand: 'shield' | 'none';
    helmet: boolean;
    armor: boolean;
    gloves: boolean;
    boots: boolean;
  };
}

export type NPCType = 'mara' | 'toren' | 'merchant' | 'guard';

export interface NPCData {
  id: string;
  type: NPCType;
  name: string;
  title: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  dialogue: string[];
  activeQuestId?: string;
  mesh?: any;
}

export type RelicEnemyType = 'wolf' | 'bandit' | 'skeleton' | 'orc' | 'dungeon_guardian';

export interface RelicEnemy {
  id: string;
  type: RelicEnemyType;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  maxHealth: number;
  attackPower: number;
  speed: number;
  attackRange: number;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead';
  mesh?: any;
  attackCooldown: number;
  patrolCenter: { x: number; z: number };
}

export interface BreakableProp {
  id: string;
  type: 'barrel' | 'crate' | 'chest' | 'target' | 'dummy';
  position: { x: number; y: number; z: number };
  mesh: any;
  health: number;
  broken: boolean;
  lootType: ResourceType | ConsumableType;
  lootAmount: number;
}

export interface HarvestableResource {
  id: string;
  type: ResourceType;
  position: { x: number; y: number; z: number };
  mesh: any;
  collected: boolean;
  amount: number;
}

export interface RelicQuest {
  id: string;
  title: string;
  description: string;
  objectives: {
    text: string;
    target: number;
    current: number;
    completed: boolean;
  }[];
  reward: {
    gold: number;
    xp: number;
    item?: string;
  };
  completed: boolean;
}
