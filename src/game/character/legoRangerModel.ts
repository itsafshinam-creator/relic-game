import * as THREE from 'three';
import { CharacterCustomization, WeaponType } from '../../types/game';

export interface CharacterRigs {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Group;
  capeSegments: THREE.Group[];
  quiver: THREE.Group;
  backpack: THREE.Group;
  sword: THREE.Group;
  bow: THREE.Group;
  arrowInHand: THREE.Group;
  tabardFront: THREE.Group;
  materials: { [key: string]: THREE.Material };
}

// Helper to create small Lego studs on top of brick surfaces
function createStud(radius = 0.032, height = 0.02, mat: THREE.Material): THREE.Mesh {
  const geom = new THREE.CylinderGeometry(radius, radius, height, 12);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Generate high-resolution procedural face texture matching the Lego Ranger image
function createRangerFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Skin base
  ctx.fillStyle = '#E5AA82';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle shading at jawline
  ctx.fillStyle = '#D99870';
  ctx.fillRect(0, 420, 512, 92);

  // Beard stubble & short goatee / sideburns
  ctx.fillStyle = '#261914';
  
  // Jaw stubble dots / textured area
  ctx.globalAlpha = 0.85;
  // Side stubble
  ctx.fillRect(40, 310, 80, 140);
  ctx.fillRect(392, 310, 80, 140);
  // Chin beard / goatee
  ctx.beginPath();
  ctx.roundRect(196, 380, 120, 90, [10, 10, 20, 20]);
  ctx.fill();

  // Mustache
  ctx.beginPath();
  ctx.moveTo(170, 340);
  ctx.quadraticCurveTo(256, 325, 342, 340);
  ctx.quadraticCurveTo(310, 365, 256, 355);
  ctx.quadraticCurveTo(202, 365, 170, 340);
  ctx.fill();

  ctx.globalAlpha = 1.0;

  // Mouth line (determined neutral expression)
  ctx.strokeStyle = '#1F140F';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(215, 368);
  ctx.lineTo(297, 368);
  ctx.stroke();

  // Draw Eyes & Eyebrows (Left and Right)
  const drawEye = (centerX: number, centerY: number, flip: boolean) => {
    ctx.save();
    // Determined Eyebrow
    ctx.fillStyle = '#1B130E';
    ctx.beginPath();
    if (!flip) {
      ctx.moveTo(centerX - 46, centerY - 62);
      ctx.lineTo(centerX + 48, centerY - 46);
      ctx.lineTo(centerX + 44, centerY - 28);
      ctx.lineTo(centerX - 46, centerY - 44);
    } else {
      ctx.moveTo(centerX + 46, centerY - 62);
      ctx.lineTo(centerX - 48, centerY - 46);
      ctx.lineTo(centerX - 44, centerY - 28);
      ctx.lineTo(centerX + 46, centerY - 44);
    }
    ctx.closePath();
    ctx.fill();

    // Eye Outline & Sclera (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 38, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1F1611';
    ctx.stroke();

    // Large Dark Iris (Lego / Anime style)
    ctx.fillStyle = '#26150D';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 2, 28, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner Dark Pupil
    ctx.fillStyle = '#0D0704';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 2, 18, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight Glints (white sparkles)
    ctx.fillStyle = '#FFFFFF';
    // Main highlight
    ctx.beginPath();
    ctx.arc(centerX - 10, centerY - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    // Secondary micro-sparkle
    ctx.beginPath();
    ctx.arc(centerX + 11, centerY + 9, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawEye(160, 230, false);
  drawEye(352, 230, true);

  // Nose contour
  ctx.strokeStyle = '#B37B58';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(256, 255);
  ctx.lineTo(256, 295);
  ctx.lineTo(245, 297);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createLegoRanger(custom: CharacterCustomization = {
  capeVisible: true,
  backpackVisible: false,
  quiverVisible: true,
  weapon: 'sword',
  cowlColor: '#284638',
  sashColor: '#932029',
}): CharacterRigs {
  const root = new THREE.Group();
  root.name = 'LegoRanger';

  // Common PBR Materials with Lego glossy finish
  const matSkin = new THREE.MeshStandardMaterial({
    color: '#E5AA82',
    roughness: 0.35,
    metalness: 0.05,
  });

  const faceTexture = createRangerFaceTexture();
  const matFace = new THREE.MeshStandardMaterial({
    map: faceTexture,
    roughness: 0.35,
    metalness: 0.05,
  });

  const matHair = new THREE.MeshStandardMaterial({
    color: '#2A1A12', // Dark espresso brown
    roughness: 0.4,
    metalness: 0.1,
  });

  const matTunic = new THREE.MeshStandardMaterial({
    color: '#BFA684', // Buff / tan linen tunic
    roughness: 0.6,
    metalness: 0.05,
  });

  const matGreenCowl = new THREE.MeshStandardMaterial({
    color: custom.cowlColor, // Forest green mantle
    roughness: 0.55,
    metalness: 0.08,
  });

  const matCrimsonSash = new THREE.MeshStandardMaterial({
    color: custom.sashColor, // Rich crimson red sash
    roughness: 0.45,
    metalness: 0.1,
  });

  const matLeather = new THREE.MeshStandardMaterial({
    color: '#4A2E1D', // Dark leather straps & boots
    roughness: 0.5,
    metalness: 0.15,
  });

  const matLeatherDark = new THREE.MeshStandardMaterial({
    color: '#341E12',
    roughness: 0.45,
    metalness: 0.2,
  });

  const matTrousers = new THREE.MeshStandardMaterial({
    color: '#3B4252', // Dark grey/slate pants
    roughness: 0.55,
    metalness: 0.05,
  });

  const matSilver = new THREE.MeshStandardMaterial({
    color: '#D8DEE9',
    roughness: 0.2,
    metalness: 0.85,
  });

  const matGoldBrass = new THREE.MeshStandardMaterial({
    color: '#D4AF37',
    roughness: 0.25,
    metalness: 0.75,
  });

  const matSteelBlade = new THREE.MeshStandardMaterial({
    color: '#E5E9F0',
    roughness: 0.15,
    metalness: 0.9,
  });

  const matWood = new THREE.MeshStandardMaterial({
    color: '#7D4F27',
    roughness: 0.6,
    metalness: 0.05,
  });

  const materials = {
    skin: matSkin,
    hair: matHair,
    tunic: matTunic,
    cowl: matGreenCowl,
    sash: matCrimsonSash,
    leather: matLeather,
    trousers: matTrousers,
    silver: matSilver,
    gold: matGoldBrass,
    steel: matSteelBlade,
    wood: matWood,
  };

  // Base Body pivot
  const body = new THREE.Group();
  body.name = 'Body';
  body.position.y = 1.05; // Elevation off ground
  root.add(body);

  // -------------------------------------------------------------
  // 1. TORSO & CHEST
  // -------------------------------------------------------------
  const torso = new THREE.Group();
  torso.name = 'Torso';
  body.add(torso);

  // Main Torso Box
  const torsoGeom = new THREE.BoxGeometry(0.54, 0.58, 0.32);
  // Multi-material for front/back/sides
  const torsoMaterials = [
    matTunic, // right
    matTunic, // left
    matTunic, // top
    matTunic, // bottom
    matTunic, // front
    matTunic, // back
  ];
  const torsoMesh = new THREE.Mesh(torsoGeom, torsoMaterials);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torso.add(torsoMesh);

  // Green Cowl / Mantle collar draped around neck & upper torso
  const cowlCollarGeom = new THREE.BoxGeometry(0.58, 0.16, 0.36);
  const cowlCollar = new THREE.Mesh(cowlCollarGeom, matGreenCowl);
  cowlCollar.position.set(0, 0.24, 0);
  cowlCollar.castShadow = true;
  torso.add(cowlCollar);

  // Studs on cowl shoulders
  [-0.22, 0.22].forEach((x) => {
    const s = createStud(0.04, 0.02, matGreenCowl);
    s.position.set(x, 0.33, 0);
    torso.add(s);
  });

  // Silver circular Medallion / Brooch on left chest collar
  const medallionGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.02, 16);
  const medallion = new THREE.Mesh(medallionGeom, matSilver);
  medallion.rotation.x = Math.PI / 2;
  medallion.position.set(0.16, 0.22, 0.19);
  medallion.castShadow = true;
  torso.add(medallion);

  // Inner Gold stud inside medallion
  const innerPin = createStud(0.022, 0.015, matGoldBrass);
  innerPin.rotation.x = Math.PI / 2;
  innerPin.position.set(0.16, 0.22, 0.205);
  torso.add(innerPin);

  // Crimson Diagonal Sash running across chest from right shoulder to left hip
  const sashGeom = new THREE.BoxGeometry(0.14, 0.54, 0.035);
  const sashMesh = new THREE.Mesh(sashGeom, matCrimsonSash);
  sashMesh.rotation.z = -0.58; // Diagonal angle
  sashMesh.position.set(0.01, 0.02, 0.17);
  sashMesh.castShadow = true;
  torso.add(sashMesh);

  // Second leather cross-strap over sash
  const strapGeom = new THREE.BoxGeometry(0.07, 0.52, 0.03);
  const strapMesh = new THREE.Mesh(strapGeom, matLeather);
  strapMesh.rotation.z = 0.52;
  strapMesh.position.set(0.04, -0.01, 0.178);
  torso.add(strapMesh);

  // Leather Utility Belt around waist
  const beltGeom = new THREE.BoxGeometry(0.56, 0.11, 0.34);
  const beltMesh = new THREE.Mesh(beltGeom, matLeatherDark);
  beltMesh.position.set(0, -0.25, 0);
  beltMesh.castShadow = true;
  torso.add(beltMesh);

  // Belt Buckle (Brass rectangular plate)
  const buckleGeom = new THREE.BoxGeometry(0.12, 0.09, 0.03);
  const buckleMesh = new THREE.Mesh(buckleGeom, matGoldBrass);
  buckleMesh.position.set(0, -0.25, 0.18);
  torso.add(buckleMesh);

  // Belt Ring Accessory (Gold ring on left waist)
  const ringGeom = new THREE.TorusGeometry(0.04, 0.012, 8, 16);
  const ringMesh = new THREE.Mesh(ringGeom, matGoldBrass);
  ringMesh.position.set(-0.16, -0.27, 0.18);
  torso.add(ringMesh);

  // Hanging Crimson Tabard / Cloth flap hanging in front between thighs
  const tabardFront = new THREE.Group();
  tabardFront.name = 'TabardFront';
  tabardFront.position.set(0, -0.3, 0.17);
  // Layered tattered brick cloth segments
  const tabardUpperGeom = new THREE.BoxGeometry(0.15, 0.24, 0.03);
  const tabardUpper = new THREE.Mesh(tabardUpperGeom, matCrimsonSash);
  tabardUpper.position.y = -0.12;
  tabardUpper.castShadow = true;
  tabardFront.add(tabardUpper);

  // Stepped lower ragged brick edge
  const tabardLowerGeom = new THREE.BoxGeometry(0.11, 0.14, 0.028);
  const tabardLower = new THREE.Mesh(tabardLowerGeom, matCrimsonSash);
  tabardLower.position.set(0.01, -0.3, 0);
  tabardLower.castShadow = true;
  tabardFront.add(tabardLower);

  torso.add(tabardFront);

  // -------------------------------------------------------------
  // 2. HEAD, FACE & BLOCKY HAIR
  // -------------------------------------------------------------
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.44, 0);
  body.add(head);

  // Head cube
  const headGeom = new THREE.BoxGeometry(0.38, 0.38, 0.36);
  const headMaterials = [
    matSkin, // right
    matSkin, // left
    matSkin, // top
    matSkin, // bottom
    matFace, // front (Face texture with eyes, beard, stubble)
    matHair, // back (covered by hair)
  ];
  const headMesh = new THREE.Mesh(headGeom, headMaterials);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  head.add(headMesh);

  // Ears (Small skin boxes on sides)
  [-0.20, 0.20].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.07), matSkin);
    ear.position.set(x, 0.02, -0.01);
    head.add(ear);
  });

  // Hair Group (stepped layered brick Lego hair)
  const hairGroup = new THREE.Group();
  hairGroup.name = 'LegoHair';
  head.add(hairGroup);

  // Hair Top Cap
  const hairTopGeom = new THREE.BoxGeometry(0.44, 0.14, 0.42);
  const hairTop = new THREE.Mesh(hairTopGeom, matHair);
  hairTop.position.set(0, 0.19, -0.01);
  hairTop.castShadow = true;
  hairGroup.add(hairTop);

  // Hair Studs on top of head
  const studPositions = [
    [-0.12, 0.08], [0.12, 0.08],
    [-0.12, -0.08], [0.12, -0.08],
    [0, 0],
  ];
  studPositions.forEach(([x, z]) => {
    const s = createStud(0.038, 0.022, matHair);
    s.position.set(x, 0.27, z);
    hairGroup.add(s);
  });

  // Front Bangs / Fringe (parted slightly, stepped block volume)
  const bangLGeom = new THREE.BoxGeometry(0.20, 0.12, 0.09);
  const bangL = new THREE.Mesh(bangLGeom, matHair);
  bangL.position.set(-0.11, 0.14, 0.19);
  bangL.castShadow = true;
  hairGroup.add(bangL);

  const bangRGeom = new THREE.BoxGeometry(0.18, 0.10, 0.09);
  const bangR = new THREE.Mesh(bangRGeom, matHair);
  bangR.position.set(0.12, 0.15, 0.19);
  bangR.castShadow = true;
  hairGroup.add(bangR);

  // Side hair / thick sideburns locks
  const sideLGeom = new THREE.BoxGeometry(0.08, 0.28, 0.38);
  const sideL = new THREE.Mesh(sideLGeom, matHair);
  sideL.position.set(-0.21, 0.04, -0.01);
  sideL.castShadow = true;
  hairGroup.add(sideL);

  const sideRGeom = new THREE.BoxGeometry(0.08, 0.28, 0.38);
  const sideR = new THREE.Mesh(sideRGeom, matHair);
  sideR.position.set(0.21, 0.04, -0.01);
  sideR.castShadow = true;
  hairGroup.add(sideR);

  // Back wavy blocky hair cascading down
  const hairBackUpper = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.12), matHair);
  hairBackUpper.position.set(0, 0.07, -0.22);
  hairBackUpper.castShadow = true;
  hairGroup.add(hairBackUpper);

  const hairBackLower = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.16, 0.10), matHair);
  hairBackLower.position.set(0, -0.10, -0.21);
  hairBackLower.castShadow = true;
  hairGroup.add(hairBackLower);

  // -------------------------------------------------------------
  // 3. CAPE / CLOAK (Tiered dynamic brick cloth drape)
  // -------------------------------------------------------------
  const cape = new THREE.Group();
  cape.name = 'Cape';
  cape.position.set(0, 0.22, -0.18);
  torso.add(cape);

  const capeSegments: THREE.Group[] = [];

  // Segment 1 (Top shoulder cape)
  const capeSeg1 = new THREE.Group();
  const capeMesh1 = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.30, 0.04), matGreenCowl);
  capeMesh1.position.set(0, -0.14, 0);
  capeMesh1.castShadow = true;
  capeSeg1.add(capeMesh1);
  cape.add(capeSeg1);
  capeSegments.push(capeSeg1);

  // Segment 2 (Mid back cape)
  const capeSeg2 = new THREE.Group();
  capeSeg2.position.set(0, -0.28, 0);
  const capeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.32, 0.038), matGreenCowl);
  capeMesh2.position.set(0, -0.15, 0);
  capeMesh2.castShadow = true;
  capeSeg2.add(capeMesh2);
  capeSeg1.add(capeSeg2);
  capeSegments.push(capeSeg2);

  // Segment 3 (Lower tattered frayed cape with ragged stepped cutouts)
  const capeSeg3 = new THREE.Group();
  capeSeg3.position.set(0, -0.30, 0);
  const capeMesh3 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.36, 0.035), matGreenCowl);
  capeMesh3.position.set(0, -0.17, 0);
  capeMesh3.castShadow = true;
  capeSeg3.add(capeMesh3);

  // Bottom ragged fringes (Lego jagged cut blocks)
  const fringe1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.03), matGreenCowl);
  fringe1.position.set(-0.22, -0.40, 0);
  capeSeg3.add(fringe1);

  const fringe2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.03), matGreenCowl);
  fringe2.position.set(0.04, -0.44, 0);
  capeSeg3.add(fringe2);

  const fringe3 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.03), matGreenCowl);
  fringe3.position.set(0.24, -0.38, 0);
  capeSeg3.add(fringe3);

  capeSeg2.add(capeSeg3);
  capeSegments.push(capeSeg3);

  cape.visible = custom.capeVisible;

  // -------------------------------------------------------------
  // 4. ARMS, PAULDRONS & HANDS
  // -------------------------------------------------------------
  // Left Arm (Bow holding arm / off-hand)
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.35, 0.18, 0);
  body.add(leftArm);

  // Left Pauldron (Leather/metal shoulder guard)
  const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), matLeatherDark);
  pauldronL.position.set(0, 0, 0);
  pauldronL.castShadow = true;
  leftArm.add(pauldronL);
  // Stud on shoulder
  const pStudL = createStud(0.03, 0.018, matSilver);
  pStudL.position.set(0, 0.09, 0);
  leftArm.add(pStudL);

  // Left Upper Arm
  const upperArmL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.14), matTunic);
  upperArmL.position.set(0, -0.10, 0);
  upperArmL.castShadow = true;
  leftArm.add(upperArmL);

  // Left Forearm
  const leftForearm = new THREE.Group();
  leftForearm.name = 'LeftForearm';
  leftForearm.position.set(0, -0.22, 0);
  leftArm.add(leftForearm);

  // Left Leather Bracer / Vambrace with studs
  const bracerL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.15), matLeather);
  bracerL.position.set(0, -0.10, 0);
  bracerL.castShadow = true;
  leftForearm.add(bracerL);
  // Mini studs on forearm bracer
  [-0.04, 0.04].forEach((yOffset) => {
    const bs = createStud(0.022, 0.015, matSilver);
    bs.rotation.x = Math.PI / 2;
    bs.position.set(0, -0.10 + yOffset, 0.08);
    leftForearm.add(bs);
  });

  // Left Hand (Cupped Lego C-Hand in dark leather glove)
  const leftHand = new THREE.Group();
  leftHand.name = 'LeftHand';
  leftHand.position.set(0, -0.24, 0);
  leftForearm.add(leftHand);

  const handGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.09, 16, 1, false, 0, Math.PI * 1.6);
  const handMeshL = new THREE.Mesh(handGeom, matLeatherDark);
  handMeshL.rotation.z = Math.PI / 2;
  handMeshL.castShadow = true;
  leftHand.add(handMeshL);

  // -------------------------------------------------------------
  // Right Arm (Sword swinging / bowstring drawing arm)
  // -------------------------------------------------------------
  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.35, 0.18, 0);
  body.add(rightArm);

  // Right Pauldron
  const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), matLeatherDark);
  pauldronR.position.set(0, 0, 0);
  pauldronR.castShadow = true;
  rightArm.add(pauldronR);
  const pStudR = createStud(0.03, 0.018, matSilver);
  pStudR.position.set(0, 0.09, 0);
  rightArm.add(pStudR);

  // Right Upper Arm
  const upperArmR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.14), matTunic);
  upperArmR.position.set(0, -0.10, 0);
  upperArmR.castShadow = true;
  rightArm.add(upperArmR);

  // Right Forearm
  const rightForearm = new THREE.Group();
  rightForearm.name = 'RightForearm';
  rightForearm.position.set(0, -0.22, 0);
  rightArm.add(rightForearm);

  const bracerR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.15), matLeather);
  bracerR.position.set(0, -0.10, 0);
  bracerR.castShadow = true;
  rightForearm.add(bracerR);
  [-0.04, 0.04].forEach((yOffset) => {
    const bs = createStud(0.022, 0.015, matSilver);
    bs.rotation.x = Math.PI / 2;
    bs.position.set(0, -0.10 + yOffset, 0.08);
    rightForearm.add(bs);
  });

  // Right Hand
  const rightHand = new THREE.Group();
  rightHand.name = 'RightHand';
  rightHand.position.set(0, -0.24, 0);
  rightForearm.add(rightHand);

  const handMeshR = new THREE.Mesh(handGeom.clone(), matLeatherDark);
  handMeshR.rotation.z = Math.PI / 2;
  handMeshR.castShadow = true;
  rightHand.add(handMeshR);

  // -------------------------------------------------------------
  // 5. LEGS & STUDDED GREAVES / BOOTS
  // -------------------------------------------------------------
  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.15, -0.32, 0);
  body.add(leftLeg);

  // Upper Leg / Trousers
  const legUpperL = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.32, 0.22), matTrousers);
  legUpperL.position.set(0, -0.16, 0);
  legUpperL.castShadow = true;
  leftLeg.add(legUpperL);

  // Boot & Greave
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.24), matLeather);
  bootL.position.set(0, -0.48, 0);
  bootL.castShadow = true;
  leftLeg.add(bootL);

  // Boot Sole & Toe Extension
  const toeL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.12), matLeatherDark);
  toeL.position.set(0, -0.59, 0.08);
  toeL.castShadow = true;
  leftLeg.add(toeL);

  // Shin Studs (Lego Studded greaves as seen in photo!)
  [-0.40, -0.48, -0.56].forEach((y) => {
    [-0.05, 0.05].forEach((x) => {
      const s = createStud(0.028, 0.018, matLeather);
      s.rotation.x = Math.PI / 2;
      s.position.set(x, y, 0.13);
      leftLeg.add(s);
    });
  });

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.15, -0.32, 0);
  body.add(rightLeg);

  const legUpperR = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.32, 0.22), matTrousers);
  legUpperR.position.set(0, -0.16, 0);
  legUpperR.castShadow = true;
  rightLeg.add(legUpperR);

  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.24), matLeather);
  bootR.position.set(0, -0.48, 0);
  bootR.castShadow = true;
  rightLeg.add(bootR);

  const toeR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.12), matLeatherDark);
  toeR.position.set(0, -0.59, 0.08);
  toeR.castShadow = true;
  rightLeg.add(toeR);

  [-0.40, -0.48, -0.56].forEach((y) => {
    [-0.05, 0.05].forEach((x) => {
      const s = createStud(0.028, 0.018, matLeather);
      s.rotation.x = Math.PI / 2;
      s.position.set(x, y, 0.13);
      rightLeg.add(s);
    });
  });

  // -------------------------------------------------------------
  // 6. BACK QUIVER & ARROWS
  // -------------------------------------------------------------
  const quiver = new THREE.Group();
  quiver.name = 'Quiver';
  quiver.position.set(0.16, 0.12, -0.22);
  quiver.rotation.z = -0.42; // Slung diagonally across back
  torso.add(quiver);

  // Quiver Body (Hexagonal/Cylinder leather sheath)
  const quiverGeom = new THREE.CylinderGeometry(0.075, 0.06, 0.58, 8);
  const quiverMesh = new THREE.Mesh(quiverGeom, matLeather);
  quiverMesh.castShadow = true;
  quiver.add(quiverMesh);

  // Studs on quiver
  for (let i = -0.2; i <= 0.2; i += 0.1) {
    const qs = createStud(0.018, 0.012, matGoldBrass);
    qs.position.set(0, i, 0.065);
    quiver.add(qs);
  }

  // Arrows poking out from quiver
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 6), matWood);
    arrowShaft.position.set(Math.cos(angle) * 0.035, 0.36 + (i % 2) * 0.06, Math.sin(angle) * 0.035);
    arrowShaft.castShadow = true;
    quiver.add(arrowShaft);

    // Fletching feathers
    const fletching = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 0.008), matSilver);
    fletching.position.set(Math.cos(angle) * 0.035, 0.46 + (i % 2) * 0.06, Math.sin(angle) * 0.035);
    quiver.add(fletching);
  }

  quiver.visible = custom.quiverVisible;

  // -------------------------------------------------------------
  // 7. ADVENTURER BACKPACK (Toggleable cosmetic)
  // -------------------------------------------------------------
  const backpack = new THREE.Group();
  backpack.name = 'Backpack';
  backpack.position.set(0, 0.02, -0.25);
  torso.add(backpack);

  // Main Bag Pack
  const packBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.20), matLeather);
  packBase.castShadow = true;
  backpack.add(packBase);

  // Rolled Bedroll on top
  const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.40, 12), matLeatherDark);
  bedroll.rotation.z = Math.PI / 2;
  bedroll.position.set(0, 0.24, 0);
  bedroll.castShadow = true;
  backpack.add(bedroll);

  // Lantern on side
  const lantern = new THREE.Group();
  lantern.position.set(-0.21, -0.05, 0);
  const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), matGoldBrass);
  lantern.add(lanternBody);
  const lanternGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#FEF08A' })
  );
  lantern.add(lanternGlow);
  backpack.add(lantern);

  backpack.visible = custom.backpackVisible;

  // -------------------------------------------------------------
  // 8. WEAPONS (Sword & Recurve Bow)
  // -------------------------------------------------------------
  // Fantasy Brick Sword
  const sword = new THREE.Group();
  sword.name = 'BrickSword';

  // Blade with double bevel
  const bladeGeom = new THREE.BoxGeometry(0.09, 0.85, 0.024);
  const blade = new THREE.Mesh(bladeGeom, matSteelBlade);
  blade.position.y = 0.45;
  blade.castShadow = true;
  sword.add(blade);

  // Blade Tip (triangular point)
  const tipGeom = new THREE.ConeGeometry(0.065, 0.16, 4);
  const tip = new THREE.Mesh(tipGeom, matSteelBlade);
  tip.position.y = 0.94;
  tip.rotation.y = Math.PI / 4;
  tip.castShadow = true;
  sword.add(tip);

  // Central Fuller Groove
  const fullerGeom = new THREE.BoxGeometry(0.022, 0.65, 0.028);
  const fuller = new THREE.Mesh(fullerGeom, matSilver);
  fuller.position.y = 0.42;
  sword.add(fuller);

  // Winged Crossguard (Bronze/Brass)
  const guardGeom = new THREE.BoxGeometry(0.28, 0.055, 0.06);
  const guard = new THREE.Mesh(guardGeom, matGoldBrass);
  guard.position.y = 0.03;
  guard.castShadow = true;
  sword.add(guard);

  // Guard studs
  [-0.11, 0.11].forEach((x) => {
    const gs = createStud(0.02, 0.015, matGoldBrass);
    gs.position.set(x, 0.03, 0.035);
    sword.add(gs);
  });

  // Hilt Grip
  const hiltGeom = new THREE.CylinderGeometry(0.028, 0.028, 0.18, 12);
  const hilt = new THREE.Mesh(hiltGeom, matLeatherDark);
  hilt.position.y = -0.09;
  sword.add(hilt);

  // Pommel
  const pommelGeom = new THREE.DodecahedronGeometry(0.045);
  const pommel = new THREE.Mesh(pommelGeom, matGoldBrass);
  pommel.position.y = -0.20;
  pommel.castShadow = true;
  sword.add(pommel);

  // Attached to Right Hand by default
  sword.position.set(0, -0.06, 0.08);
  sword.rotation.x = Math.PI / 2;
  rightHand.add(sword);

  // Recurve Bow
  const bow = new THREE.Group();
  bow.name = 'RecurveBow';

  // Curved stave created via connected segments
  const bowSegments: THREE.Mesh[] = [];
  const numBowSegs = 9;
  for (let i = 0; i < numBowSegs; i++) {
    const t = (i / (numBowSegs - 1)) * 2 - 1; // -1 to 1
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.13, 0.04), matWood);
    const curveZ = (1 - t * t) * 0.16; // Curve shape
    seg.position.set(0, t * 0.52, curveZ);
    seg.rotation.x = -t * 0.45;
    seg.castShadow = true;
    bow.add(seg);
    bowSegments.push(seg);
  }

  // Bowstring
  const stringGeom = new THREE.CylinderGeometry(0.005, 0.005, 1.05, 6);
  const bowString = new THREE.Mesh(stringGeom, new THREE.MeshBasicMaterial({ color: '#E2E8F0' }));
  bowString.position.set(0, 0, 0);
  bow.add(bowString);

  // Bow attached to Left Hand
  bow.position.set(0, 0, 0.08);
  bow.rotation.y = Math.PI / 2;
  bow.rotation.z = Math.PI;
  leftHand.add(bow);

  // Arrow in Hand (for bow aim animation)
  const arrowInHand = new THREE.Group();
  arrowInHand.name = 'ArrowInHand';
  const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6), matWood);
  arrowShaft.position.z = 0.45;
  arrowShaft.rotation.x = Math.PI / 2;
  arrowInHand.add(arrowShaft);

  const arrowhead = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 4), matSilver);
  arrowhead.position.z = 0.92;
  arrowhead.rotation.x = Math.PI / 2;
  arrowInHand.add(arrowhead);

  arrowInHand.visible = false;
  rightHand.add(arrowInHand);

  // Set initial weapon visibility
  if (custom.weapon === 'bow') {
    sword.visible = false;
    bow.visible = true;
  } else {
    sword.visible = true;
    bow.visible = false;
  }

  return {
    root,
    body,
    head,
    torso,
    leftArm,
    rightArm,
    leftForearm,
    rightForearm,
    leftHand,
    rightHand,
    leftLeg,
    rightLeg,
    cape,
    capeSegments,
    quiver,
    backpack,
    sword,
    bow,
    arrowInHand,
    tabardFront,
    materials,
  };
}
