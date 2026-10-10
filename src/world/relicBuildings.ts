import * as THREE from 'three';
import { createMaterials } from './materials';

/**
 * RELIC Architecture & Structures
 * Fully solid, non-hollow, authentic medieval constructions:
 * 1. Medieval Cottage with furnished interior & walkable doorway
 * 2. Blacksmith Workshop with open-air walkable timber deck, forge & anvil
 * 3. Ancient Temple with stepped plinth platforms & altar dais
 * 4. Arch Bridge with approach ramps & walkable deck over pond
 * 5. Wooden Watchtower with individual post colliders & open ground floor
 * 6. Fortified Stone Tower with solid stone walls
 * 7. Carved Dungeon Portal with twin flaming braziers
 */
export function buildRelicStructures(scene: THREE.Scene, colliders: THREE.Box3[]) {
  const mats = createMaterials();

  const matDarkWood = new THREE.MeshStandardMaterial({ color: '#452A18', roughness: 0.7 });
  const matLightWood = new THREE.MeshStandardMaterial({ color: '#854D0E', roughness: 0.65 });
  const matStoneBrick = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.65 });
  const matRoofTiles = new THREE.MeshStandardMaterial({ color: '#7F1D1D', roughness: 0.5 });
  const matThatch = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.8 });
  const matIron = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });
  const matBanner = new THREE.MeshStandardMaterial({ color: '#991B1B', roughness: 0.6 });
  const matArcaneGlow = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
  const matForgeFire = new THREE.MeshBasicMaterial({ color: '#F97316' });
  const matBedSheet = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.7 });
  const matPillow = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.8 });
  const matPlasterWall = new THREE.MeshStandardMaterial({ color: '#E2D9C8', roughness: 0.75, side: THREE.DoubleSide });

  // Helper to add box collider
  const addBoxCollider = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) => {
    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(sx, sy, sz));
    colliders.push(box);
    return box;
  };

  // -------------------------------------------------------------
  // 1. MEDIEVAL COTTAGE / TAVERN (Furnished Interior & Open Doorway)
  // -------------------------------------------------------------
  // Position: (16, 0, 14)
  const cottageGroup = new THREE.Group();
  cottageGroup.position.set(16, 0, 14);

  // Walkable Wood & Stone Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.3, 6.0), matDarkWood);
  floor.position.set(0, 0.15, 0);
  floor.receiveShadow = true;
  cottageGroup.add(floor);
  addBoxCollider(16, 0.15, 14, 7.0, 0.3, 6.0); // Standable floor platform

  // Wooden Corner Timber Beams
  const cornerGeom = new THREE.BoxGeometry(0.45, 3.4, 0.45);
  [
    [-3.2, -2.7],
    [3.2, -2.7],
    [-3.2, 2.7],
    [3.2, 2.7],
  ].forEach(([cx, cz]) => {
    const post = new THREE.Mesh(cornerGeom, matDarkWood);
    post.position.set(cx, 1.7, cz);
    post.castShadow = true;
    cottageGroup.add(post);
  });

  // Solid Left Wall (-X)
  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 5.4), matPlasterWall);
  wallLeft.position.set(-3.2, 1.7, 0);
  wallLeft.castShadow = true;
  cottageGroup.add(wallLeft);
  addBoxCollider(16 - 3.2, 1.7, 14, 0.5, 3.4, 5.8);

  // Solid Right Wall (+X)
  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 5.4), matPlasterWall);
  wallRight.position.set(3.2, 1.7, 0);
  wallRight.castShadow = true;
  cottageGroup.add(wallRight);
  addBoxCollider(16 + 3.2, 1.7, 14, 0.5, 3.4, 5.8);

  // Solid Back Wall (-Z)
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.2, 0.4), matPlasterWall);
  wallBack.position.set(0, 1.7, -2.7);
  wallBack.castShadow = true;
  cottageGroup.add(wallBack);
  addBoxCollider(16, 1.7, 14 - 2.7, 6.8, 3.4, 0.5);

  // Front Wall (+Z): Left Section & Right Section with Open Doorway in Center!
  // Doorway is 1.8m wide, 2.4m high in center (from x=-0.9 to x=+0.9)
  const wallFrontL = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.2, 0.4), matPlasterWall);
  wallFrontL.position.set(-2.05, 1.7, 2.7);
  wallFrontL.castShadow = true;
  cottageGroup.add(wallFrontL);
  addBoxCollider(16 - 2.05, 1.7, 14 + 2.7, 2.4, 3.4, 0.5);

  const wallFrontR = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.2, 0.4), matPlasterWall);
  wallFrontR.position.set(2.05, 1.7, 2.7);
  wallFrontR.castShadow = true;
  cottageGroup.add(wallFrontR);
  addBoxCollider(16 + 2.05, 1.7, 14 + 2.7, 2.4, 3.4, 0.5);

  // Doorway Timber Lintel Header
  const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.45), matDarkWood);
  doorLintel.position.set(0, 2.95, 2.7);
  cottageGroup.add(doorLintel);

  // Front Porch Wooden Step (smooth transition into house)
  const porchStep = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.2), matDarkWood);
  porchStep.position.set(0, 0.08, 3.3);
  porchStep.receiveShadow = true;
  cottageGroup.add(porchStep);
  addBoxCollider(16, 0.08, 14 + 3.3, 2.4, 0.16, 1.2);

  // Porch Welcome Lantern
  const porchLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.35, 6), matIron);
  porchLantern.position.set(1.2, 2.4, 3.0);
  cottageGroup.add(porchLantern);
  const porchLight = new THREE.PointLight('#FBBF24', 2.2, 8);
  porchLight.position.set(1.2, 2.4, 3.0);
  cottageGroup.add(porchLight);

  // Gabled Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.2, 4), matThatch);
  roof.position.set(0, 4.8, 0);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.0, 0.9, 0.85);
  roof.castShadow = true;
  cottageGroup.add(roof);

  // Stone Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.0, 1.0), matStoneBrick);
  chimney.position.set(-2.2, 2.5, -2.0);
  chimney.castShadow = true;
  cottageGroup.add(chimney);

  // --- INTERIOR FURNITURE (Fully detailed, solid & cozy) ---
  // 1. Cozy Fireplace (Back-Left inside)
  const fireplace = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.8), matStoneBrick);
  fireplace.position.set(-2.0, 0.7, -2.1);
  cottageGroup.add(fireplace);
  addBoxCollider(16 - 2.0, 0.7, 14 - 2.1, 1.9, 1.4, 0.9);

  const hearthFire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 6), matForgeFire);
  hearthFire.position.set(-2.0, 0.45, -1.9);
  cottageGroup.add(hearthFire);

  const hearthLight = new THREE.PointLight('#F97316', 3.0, 9);
  hearthLight.position.set(-2.0, 0.8, -1.8);
  cottageGroup.add(hearthLight);

  // 2. Adventurer's Bed (Back-Right corner)
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 2.4), matDarkWood);
  bedFrame.position.set(2.0, 0.25, -1.4);
  cottageGroup.add(bedFrame);
  addBoxCollider(16 + 2.0, 0.35, 14 - 1.4, 1.7, 0.6, 2.5);

  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 2.2), matBedSheet);
  mattress.position.set(2.0, 0.45, -1.4);
  cottageGroup.add(mattress);

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 0.5), matPillow);
  pillow.position.set(2.0, 0.6, -2.1);
  cottageGroup.add(pillow);

  // 3. Wooden Dining Table & Stools (Center-Left)
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.1), matLightWood);
  tableTop.position.set(-0.8, 0.75, 0.4);
  cottageGroup.add(tableTop);
  addBoxCollider(16 - 0.8, 0.45, 14 + 0.4, 1.9, 0.85, 1.2);

  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6), matDarkWood);
  tableLeg.position.set(-0.8, 0.35, 0.4);
  cottageGroup.add(tableLeg);

  // Stools
  const stool1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.45, 8), matDarkWood);
  stool1.position.set(-0.8, 0.25, 1.2);
  cottageGroup.add(stool1);

  const stool2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.45, 8), matDarkWood);
  stool2.position.set(-0.8, 0.25, -0.4);
  cottageGroup.add(stool2);

  // Interior Warm Chandelier
  const chandelier = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8), matIron);
  chandelier.position.set(0, 2.8, 0);
  cottageGroup.add(chandelier);

  const interiorLight = new THREE.PointLight('#FEF08A', 2.8, 10);
  interiorLight.position.set(0, 2.7, 0);
  cottageGroup.add(interiorLight);

  scene.add(cottageGroup);

  // -------------------------------------------------------------
  // 2. BLACKSMITH WORKSHOP (Open-Air Walkable Deck, Forge & Anvil)
  // -------------------------------------------------------------
  // Position: (20, 0, -2)
  const smithy = new THREE.Group();
  smithy.position.set(20, 0, -2);

  // Walkable Timber Platform Deck
  const smithFloor = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 6.2), matDarkWood);
  smithFloor.position.set(0, 0.125, 0);
  smithFloor.receiveShadow = true;
  smithy.add(smithFloor);
  addBoxCollider(20, 0.125, -2, 7.2, 0.25, 6.2); // Walkable platform!

  // 4 Corner Timber Posts (Individual colliders, ground is open!)
  const postGeom = new THREE.CylinderGeometry(0.18, 0.18, 3.4, 8);
  [
    [-3.3, -2.8],
    [3.3, -2.8],
    [-3.3, 2.8],
    [3.3, 2.8],
  ].forEach(([px, pz]) => {
    const sp = new THREE.Mesh(postGeom, matDarkWood);
    sp.position.set(px, 1.7, pz);
    sp.castShadow = true;
    smithy.add(sp);
    addBoxCollider(20 + px, 1.7, -2 + pz, 0.45, 3.4, 0.45);
  });

  // Tiled Overhang Roof
  const smithRoof = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.4, 6.8), matRoofTiles);
  smithRoof.position.set(0, 3.4, 0);
  smithRoof.rotation.x = 0.08;
  smithRoof.castShadow = true;
  smithy.add(smithRoof);

  // Stone Forge & Chimney (Solid Obstacle)
  const forge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.0), matStoneBrick);
  forge.position.set(-1.8, 0.8, -1.6);
  forge.castShadow = true;
  smithy.add(forge);

  const forgeChimney = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 1.2), matStoneBrick);
  forgeChimney.position.set(-1.8, 2.8, -1.6);
  forgeChimney.castShadow = true;
  smithy.add(forgeChimney);
  addBoxCollider(20 - 1.8, 1.8, -2 - 1.6, 2.5, 3.6, 2.1); // Forge & Chimney solid collider

  // Blazing Forge Fire
  const forgeFireMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.8), matForgeFire);
  forgeFireMesh.position.set(-1.8, 1.2, -1.0);
  smithy.add(forgeFireMesh);

  const forgeLight = new THREE.PointLight('#F97316', 3.4, 14);
  forgeLight.position.set(-1.8, 1.5, -0.8);
  smithy.add(forgeLight);

  // Heavy Blacksmith Anvil (Solid Obstacle)
  const anvilBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.55, 8), mats.woodLog);
  anvilBase.position.set(0.6, 0.28, 0);
  anvilBase.castShadow = true;
  smithy.add(anvilBase);

  const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 0.45), matIron);
  anvilTop.position.set(0.6, 0.7, 0);
  anvilTop.castShadow = true;
  smithy.add(anvilTop);
  addBoxCollider(20 + 0.6, 0.5, -2, 1.0, 1.0, 0.6); // Anvil solid collider

  // Cooling Water Trough (Solid Obstacle)
  const trough = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 0.85), matDarkWood);
  trough.position.set(-1.8, 0.35, 1.5);
  trough.castShadow = true;
  smithy.add(trough);

  const troughWater = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.65), mats.water);
  troughWater.position.set(-1.8, 0.6, 1.5);
  smithy.add(troughWater);
  addBoxCollider(20 - 1.8, 0.4, -2 + 1.5, 1.6, 0.8, 0.9);

  scene.add(smithy);

  // -------------------------------------------------------------
  // 3. ANCIENT TEMPLE (Stepped Plinth Dais, Classical Pillars & Altar)
  // -------------------------------------------------------------
  // Position: (0, 0, -32)
  const temple = new THREE.Group();
  temple.position.set(0, 0, -32);

  // Lower Stepped Plinth Platform (y = 0.4, size 18 x 14)
  const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 14), matStoneBrick);
  plinth1.position.set(0, 0.2, 0);
  plinth1.receiveShadow = true;
  temple.add(plinth1);
  addBoxCollider(0, 0.2, -32, 18, 0.4, 14); // Lower step platform!

  // Upper Stepped Plinth Dais (y = 0.8, size 16 x 12)
  const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 12), matStoneBrick);
  plinth2.position.set(0, 0.6, 0);
  plinth2.receiveShadow = true;
  temple.add(plinth2);
  addBoxCollider(0, 0.6, -32, 16, 0.4, 12); // Main temple floor platform at y=0.8!

  // Grand Front Entrance Steps (Smooth step-climbing approach)
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 1.6), matStoneBrick);
  step1.position.set(0, 0.1, 7.6);
  temple.add(step1);
  addBoxCollider(0, 0.1, -32 + 7.6, 8, 0.2, 1.6);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 1.2), matStoneBrick);
  step2.position.set(0, 0.3, 6.6);
  temple.add(step2);
  addBoxCollider(0, 0.3, -32 + 6.6, 8, 0.2, 1.2);

  const step3 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 1.2), matStoneBrick);
  step3.position.set(0, 0.5, 5.6);
  temple.add(step3);
  addBoxCollider(0, 0.5, -32 + 5.6, 8, 0.2, 1.2);

  // 10 Classical Marble Pillars (Solid colliders)
  const pillarGeom = new THREE.CylinderGeometry(0.5, 0.58, 5.6, 12);
  const pillarCoords = [
    [-6.8, -4.8], [-2.3, -4.8], [2.3, -4.8], [6.8, -4.8],
    [-6.8, 4.8], [-2.3, 4.8], [2.3, 4.8], [6.8, 4.8],
    [-6.8, 0], [6.8, 0],
  ];

  pillarCoords.forEach(([px, pz]) => {
    const col = new THREE.Mesh(pillarGeom, mats.ruinStone);
    col.position.set(px, 3.6, pz);
    col.castShadow = true;
    temple.add(col);
    addBoxCollider(px, 3.6, -32 + pz, 1.3, 5.8, 1.3);
  });

  // Solid Back Sanctuary Wall (Behind Altar)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(13.5, 5.6, 0.8), matStoneBrick);
  backWall.position.set(0, 3.6, -5.2);
  backWall.castShadow = true;
  temple.add(backWall);
  addBoxCollider(0, 3.6, -32 - 5.2, 14.0, 5.8, 1.0);

  // Entablature Lintel on Top of Pillars
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.9, 12.5), mats.ruinStone);
  entablature.position.set(0, 6.8, 0);
  entablature.castShadow = true;
  temple.add(entablature);

  // Triangular Pediment Gables
  const pedimentGeom = new THREE.ConeGeometry(9.0, 2.6, 4);
  const pediment = new THREE.Mesh(pedimentGeom, mats.ruinStone);
  pediment.position.set(0, 8.2, 0);
  pediment.rotation.y = Math.PI / 4;
  pediment.scale.set(1.0, 1.0, 0.68);
  pediment.castShadow = true;
  temple.add(pediment);

  // Central Altar Dais where the Sacred Relic Shard rests!
  const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1.2, 10), mats.ruinStone);
  altar.position.set(0, 1.4, 0);
  altar.castShadow = true;
  temple.add(altar);
  addBoxCollider(0, 1.4, -32, 2.5, 1.4, 2.5); // Solid Altar collider at y=0.8 to 2.0!

  // Glowing Divine Altar Light
  const altarLight = new THREE.PointLight('#38BDF8', 4.0, 15);
  altarLight.position.set(0, 2.8, 0);
  temple.add(altarLight);

  scene.add(temple);

  // -------------------------------------------------------------
  // 4. ARCH BRIDGE (Over Pond/River at -18, 0, 12)
  // -------------------------------------------------------------
  const bridge = new THREE.Group();
  bridge.position.set(-18, 0, 12);
  bridge.rotation.y = Math.PI / 2;

  // Walkable Timber Bridge Deck (Length 9.0, Width 3.4 at y = 0.8)
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 9.0), mats.woodLog);
  bridgeDeck.position.set(0, 0.75, 0);
  bridgeDeck.receiveShadow = true;
  bridge.add(bridgeDeck);
  // Bridge platform (rotated by 90 degrees -> width is in Z, length in X)
  addBoxCollider(-18, 0.75, 12, 9.2, 0.4, 3.8); // Walkable deck platform!

  // Approach Ramps on both ends
  const ramp1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 2.0), mats.woodLog);
  ramp1.position.set(0, 0.35, -5.2);
  ramp1.rotation.x = 0.22;
  bridge.add(ramp1);
  addBoxCollider(-18 - 5.2, 0.35, 12, 2.2, 0.35, 3.8);

  const ramp2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 2.0), mats.woodLog);
  ramp2.position.set(0, 0.35, 5.2);
  ramp2.rotation.x = -0.22;
  bridge.add(ramp2);
  addBoxCollider(-18 + 5.2, 0.35, 12, 2.2, 0.35, 3.8);

  // Safety Side Railings (Solid boundaries so player cannot fall off into deep water)
  const bRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.95, 9.2), matDarkWood);
  bRail1.position.set(-1.7, 1.3, 0);
  bridge.add(bRail1);
  addBoxCollider(-18, 1.3, 12 - 1.7, 9.4, 1.0, 0.4);

  const bRail2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.95, 9.2), matDarkWood);
  bRail2.position.set(1.7, 1.3, 0);
  bridge.add(bRail2);
  addBoxCollider(-18, 1.3, 12 + 1.7, 9.4, 1.0, 0.4);

  scene.add(bridge);

  // -------------------------------------------------------------
  // 5. WOODEN WATCHTOWER / OUTPOST (Position: -20, 0, -6)
  // -------------------------------------------------------------
  const outpost = new THREE.Group();
  outpost.position.set(-20, 0, -6);

  // 4 Main Timber Posts (Individual colliders, open ground underneath!)
  const outpostPostGeom = new THREE.CylinderGeometry(0.22, 0.24, 8.0, 8);
  [
    [-2.2, -2.2],
    [2.2, -2.2],
    [-2.2, 2.2],
    [2.2, 2.2],
  ].forEach(([px, pz]) => {
    const p = new THREE.Mesh(outpostPostGeom, mats.woodLog);
    p.position.set(px, 4.0, pz);
    p.castShadow = true;
    outpost.add(p);
    addBoxCollider(-20 + px, 4.0, -6 + pz, 0.55, 8.0, 0.55);
  });

  // Cross Bracing Beams
  const braceGeom = new THREE.BoxGeometry(4.4, 0.16, 0.16);
  [2.2, 4.4, 6.6].forEach((y) => {
    const b1 = new THREE.Mesh(braceGeom, mats.woodLog);
    b1.position.set(0, y, 2.2);
    outpost.add(b1);
    const b2 = new THREE.Mesh(braceGeom, mats.woodLog);
    b2.position.set(0, y, -2.2);
    outpost.add(b2);
  });

  // Elevated Lookout Deck at y = 6.2
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 5.4), mats.woodLog);
  deck.position.set(0, 6.2, 0);
  deck.castShadow = true;
  outpost.add(deck);
  addBoxCollider(-20, 6.2, -6, 5.4, 0.4, 5.4); // Lookout platform!

  // Roof & Red Flags
  const outpostRoof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2.5, 4), matRoofTiles);
  outpostRoof.position.set(0, 8.8, 0);
  outpostRoof.rotation.y = Math.PI / 4;
  outpostRoof.castShadow = true;
  outpost.add(outpostRoof);

  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 6), mats.woodLog);
  flagPole.position.set(0, 10.8, 0);
  outpost.add(flagPole);

  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.04), matBanner);
  banner.position.set(0.45, 11.2, 0);
  outpost.add(banner);

  scene.add(outpost);

  // -------------------------------------------------------------
  // 6. FORTIFIED STONE TOWER (Position: -28, 0, 18)
  // -------------------------------------------------------------
  const tower = new THREE.Group();
  tower.position.set(-28, 0, 18);

  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 11.0, 16), matStoneBrick);
  towerBase.position.y = 5.5;
  towerBase.castShadow = true;
  tower.add(towerBase);

  // Crenellated Battlement on Top
  const battlementRing = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 1.2, 16), matStoneBrick);
  battlementRing.position.y = 11.2;
  tower.add(battlementRing);

  // Crenels (Teeth)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const crenel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.4), matStoneBrick);
    crenel.position.set(Math.cos(angle) * 3.1, 12.0, Math.sin(angle) * 3.1);
    crenel.rotation.y = -angle;
    tower.add(crenel);
  }

  // Wooden Arched Entrance Door on Tower Face
  const tDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.3), matDarkWood);
  tDoor.position.set(0, 1.2, 3.1);
  tower.add(tDoor);

  scene.add(tower);
  addBoxCollider(-28, 5.5, 18, 6.2, 11.5, 6.2); // Solid stone tower boundary!

  // -------------------------------------------------------------
  // 7. DUNGEON ENTRANCE (Position: -24, 0, -32)
  // -------------------------------------------------------------
  const dungeon = new THREE.Group();
  dungeon.position.set(-24, 0, -32);

  // Massive Arch Portal Pillars
  const portalPillarL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6.4, 2.2), matStoneBrick);
  portalPillarL.position.set(-2.6, 3.2, 0);
  dungeon.add(portalPillarL);
  addBoxCollider(-24 - 2.6, 3.2, -32, 2.4, 6.4, 2.4);

  const portalPillarR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6.4, 2.2), matStoneBrick);
  portalPillarR.position.set(2.6, 3.2, 0);
  dungeon.add(portalPillarR);
  addBoxCollider(-24 + 2.6, 3.2, -32, 2.4, 6.4, 2.4);

  const portalArch = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.8, 2.4), matStoneBrick);
  portalArch.position.set(0, 6.8, 0);
  dungeon.add(portalArch);

  // Glowing Arcane Portal Depth
  const portalCore = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.2), matArcaneGlow);
  portalCore.position.set(0, 2.8, -0.4);
  dungeon.add(portalCore);

  const portalLight = new THREE.PointLight('#0284C7', 4.5, 16);
  portalLight.position.set(0, 3.0, 0.8);
  dungeon.add(portalLight);

  // Twin Fire Braziers
  [-4.0, 4.0].forEach((bx) => {
    const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 1.4, 8), matIron);
    brazier.position.set(bx, 0.7, 1.2);
    dungeon.add(brazier);

    const bFire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), matForgeFire);
    bFire.position.set(bx, 1.6, 1.2);
    dungeon.add(bFire);

    const bLight = new THREE.PointLight('#F97316', 2.4, 9);
    bLight.position.set(bx, 1.8, 1.2);
    dungeon.add(bLight);

    addBoxCollider(-24 + bx, 0.8, -32 + 1.2, 1.0, 1.6, 1.0);
  });

  scene.add(dungeon);
}
