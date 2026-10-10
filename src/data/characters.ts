export interface CharacterProfile {
  name: string;
  class: string;
  bio: string;
  gear: {
    weapon: string;
    armor: string;
    cape: string;
    quiver: string;
    backpack: string;
  };
  baseAttributes: {
    strength: number;
    agility: number;
    archery: number;
    stamina: number;
  };
}

export const LEGO_RANGER_PROFILE: CharacterProfile = {
  name: 'Lego Forest Ranger',
  class: 'Ranger / Vanguard',
  bio: 'A brick-built wanderer of the outer woodlands. Armed with a forged broadsword and recurve bow, he protects the ancient brick sanctum from goblin raiders and arcane constructs.',
  gear: {
    weapon: 'Steel Broadsword & Recurve Hunting Bow',
    armor: 'Linen Tunica, Studded Leather Greaves & Bracers',
    cape: 'Tattered Forest Green Cowl & Mantle with Silver Brooch',
    quiver: 'Slung Leather Quiver with Fletched Arrows',
    backpack: 'Explorer Pack with Bedroll and Brass Lantern',
  },
  baseAttributes: {
    strength: 14,
    agility: 18,
    archery: 20,
    stamina: 16,
  },
};
