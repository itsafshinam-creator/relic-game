import * as THREE from 'three';
import { NPCData } from '../types/relic';

export interface RelicNPCManager {
  npcs: NPCData[];
  update: (delta: number, playerPos: THREE.Vector3) => void;
  getNearbyNPC: (playerPos: THREE.Vector3, range?: number) => NPCData | null;
}

export function buildRelicNPCs(scene: THREE.Scene): RelicNPCManager {
  const npcs: NPCData[] = [];

  const matSkin = new THREE.MeshStandardMaterial({ color: '#E29D72', roughness: 0.4 });
  const matHairDark = new THREE.MeshStandardMaterial({ color: '#1E140F', roughness: 0.5 });
  const matLeather = new THREE.MeshStandardMaterial({ color: '#5C381E', roughness: 0.6 });
  const matIronArmor = new THREE.MeshStandardMaterial({ color: '#64748B', metalness: 0.85, roughness: 0.25 });
  const matCloakGreen = new THREE.MeshStandardMaterial({ color: '#1E3A2F', roughness: 0.7 });
  const matCloakBrown = new THREE.MeshStandardMaterial({ color: '#452A18', roughness: 0.75 });
  const matApron = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.65 });
  const matWoodStaff = new THREE.MeshStandardMaterial({ color: '#543217', roughness: 0.6 });

  // 1. Mara (NPC) - Wise wanderer by the campfire
  function spawnMara(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Robe body
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.3, 10), matCloakGreen);
    robe.position.y = 0.65;
    group.add(robe);

    // Head & Hood
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), matSkin);
    head.position.y = 1.45;
    group.add(head);

    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.42, 8), matCloakGreen);
    hood.position.y = 1.55;
    group.add(hood);

    // Walking Staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6), matWoodStaff);
    staff.position.set(0.35, 0.95, 0.2);
    group.add(staff);

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: '#38BDF8' }));
    orb.position.set(0.35, 1.92, 0.2);
    group.add(orb);

    scene.add(group);

    npcs.push({
      id: 'npc_mara',
      type: 'mara',
      name: 'Mara',
      title: 'Seeker Lorekeeper',
      position: { x, y: 0, z },
      rotation: 0,
      dialogue: [
        'Greetings, Seeker. The lost world is waking once more.',
        'To the north lies the Ancient Temple. Deep within sits the divine Relic Shard.',
        'Collect 3 Wood and 2 Iron first, and consult Toren the Blacksmith to prepare for the Dungeon Guardian!',
      ],
      mesh: group,
    });
  }

  // 2. Toren (NPC) - Blacksmith by the Forge
  function spawnToren(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Sturdy Tunic & Leather Apron
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.36), matLeather);
    torso.position.y = 1.0;
    group.add(torso);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.05), matApron);
    apron.position.set(0, 0.9, 0.19);
    group.add(apron);

    // Head & Beard
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.34), matSkin);
    head.position.y = 1.5;
    group.add(head);

    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.1), matHairDark);
    beard.position.set(0, 1.38, 0.18);
    group.add(beard);

    // Smithing Hammer in hand
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.12), matIronArmor);
    hammer.position.set(0.42, 0.75, 0.2);
    group.add(hammer);

    scene.add(group);

    npcs.push({
      id: 'npc_toren',
      type: 'toren',
      name: 'Toren',
      title: 'Master Blacksmith',
      position: { x, y: 0, z },
      rotation: 0,
      dialogue: [
        'Well met, warrior! I am Toren, smith of the lost realm.',
        'Bring me 2 Iron and 3 Wood, and I can reinforce your gear with a sturdy Viking Shield.',
        'Strike the iron veins near the rocky foothills to gather ore.',
      ],
      mesh: group,
    });
  }

  // 3. Merchant (NPC) - Wandering Trader by the Tent
  function spawnMerchant(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 1.35, 10), matCloakBrown);
    coat.position.y = 0.68;
    group.add(coat);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), matSkin);
    head.position.y = 1.45;
    group.add(head);

    // Large Travel Pack on back
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), matLeather);
    pack.position.set(0, 1.1, -0.3);
    group.add(pack);

    scene.add(group);

    npcs.push({
      id: 'npc_merchant',
      type: 'merchant',
      name: 'Alden',
      title: 'Wandering Merchant',
      position: { x, y: 0, z },
      rotation: 0,
      dialogue: [
        'Welcome, traveler! Rare goods from distant shores for trade.',
        'I have fresh Health Potions, Bomb satchels, and bundles of feathered Arrows.',
        'Smash barrels and crates around the glade to find gold and supplies!',
      ],
      mesh: group,
    });
  }

  // 4. Guard (NPC) - Armored Knight at Outpost
  function spawnGuard(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Plate Armor Torso
    const armor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.65, 0.34), matIronArmor);
    armor.position.y = 1.0;
    group.add(armor);

    // Iron Great Helmet
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.42, 10), matIronArmor);
    helm.position.y = 1.55;
    group.add(helm);

    // Steel Spear / Halberd
    const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 6), matWoodStaff);
    spear.position.set(0.38, 1.2, 0.1);
    group.add(spear);

    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 4), matIronArmor);
    spearTip.position.set(0.38, 2.45, 0.1);
    group.add(spearTip);

    // Round Shield
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 16), matIronArmor);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.35, 1.0, 0.1);
    group.add(shield);

    scene.add(group);

    npcs.push({
      id: 'npc_guard',
      type: 'guard',
      name: 'Gareth',
      title: 'Outpost Sentinel',
      position: { x, y: 0, z },
      rotation: 0,
      dialogue: [
        'Halt, traveler! The road to the north is perilous.',
        'Prowling wolves and bandit rogues have infested the valley.',
        'Stay near the campfire light at night. Good hunting, Seeker.',
      ],
      mesh: group,
    });
  }

  // Spawns
  spawnMara(-4, 9);       // Near campfire
  spawnToren(18, 0);      // Outside Blacksmith forge
  spawnMerchant(-10, 10); // Outside Traveler tent
  spawnGuard(-17, -5);    // Guarding outpost entrance

  const update = (delta: number, playerPos: THREE.Vector3) => {
    // Face player if nearby
    npcs.forEach((npc) => {
      const dx = playerPos.x - npc.position.x;
      const dz = playerPos.z - npc.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 5.0 && npc.mesh) {
        npc.mesh.rotation.y = Math.atan2(dx, dz);
      }
    });
  };

  const getNearbyNPC = (playerPos: THREE.Vector3, range = 2.6): NPCData | null => {
    for (const npc of npcs) {
      const dx = playerPos.x - npc.position.x;
      const dz = playerPos.z - npc.position.z;
      if (Math.sqrt(dx * dx + dz * dz) <= range) {
        return npc;
      }
    }
    return null;
  };

  return { npcs, update, getNearbyNPC };
}
