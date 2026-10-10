export interface GameItem {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'collectible' | 'weapon' | 'gear';
  value: number;
}

export const GAME_ITEMS: GameItem[] = [
  {
    id: 'gold_brick',
    name: 'Golden Brick',
    description: 'A polished solid gold Lego brick with four studs. Valued by craftsmen and kingdom treasurers.',
    category: 'collectible',
    value: 10,
  },
  {
    id: 'health_potion',
    name: 'Crimson Elixir',
    description: 'A restorative potion that instantly regenerates 35 health points.',
    category: 'consumable',
    value: 25,
  },
  {
    id: 'brick_sword',
    name: 'Forged Steel Broadsword',
    description: 'Double-edged steel blade with a brass crossguard and leather wrapped grip.',
    category: 'weapon',
    value: 50,
  },
  {
    id: 'recurve_bow',
    name: 'Woodland Recurve Bow',
    description: 'Crafted from supple yew wood with high draw weight and long effective range.',
    category: 'weapon',
    value: 45,
  },
];
