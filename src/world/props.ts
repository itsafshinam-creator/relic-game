import * as THREE from 'three';
import { createMaterials } from './materials';

export interface PropsResult {
  targets: THREE.Mesh[];
}

export function createProps(scene: THREE.Scene, colliders: THREE.Box3[]): PropsResult {
  const mats = createMaterials();
  const targets: THREE.Mesh[] = [];

  // 1. Archery Target Function
  function createArcheryTarget(x: number, y: number, z: number, rotY = 0) {
    const targetGroup = new THREE.Group();
    targetGroup.position.set(x, y, z);
    targetGroup.rotation.y = rotY;

    // Wooden Stand
    const standL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mats.woodLog);
    standL.position.set(-0.5, 1.0, -0.3);
    standL.rotation.x = 0.25;
    standL.castShadow = true;
    targetGroup.add(standL);

    const standR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), mats.woodLog);
    standR.position.set(0.5, 1.0, -0.3);
    standR.rotation.x = 0.25;
    standR.castShadow = true;
    targetGroup.add(standR);

    // Board
    const board = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 24), mats.woodLog);
    board.rotation.x = Math.PI / 2;
    board.position.set(0, 1.4, 0);
    board.castShadow = true;
    targetGroup.add(board);

    // Rings
    const ringWhite = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.13, 24), new THREE.MeshBasicMaterial({ color: '#F8FAFC' }));
    ringWhite.rotation.x = Math.PI / 2;
    ringWhite.position.set(0, 1.4, 0.01);
    targetGroup.add(ringWhite);

    const ringRed = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.14, 20), new THREE.MeshBasicMaterial({ color: '#DC2626' }));
    ringRed.rotation.x = Math.PI / 2;
    ringRed.position.set(0, 1.4, 0.02);
    targetGroup.add(ringRed);

    const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.15, 16), new THREE.MeshBasicMaterial({ color: '#FACC15' }));
    bullseye.rotation.x = Math.PI / 2;
    bullseye.position.set(0, 1.4, 0.03);
    targetGroup.add(bullseye);
    targets.push(bullseye);

    scene.add(targetGroup);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 1.2, z), new THREE.Vector3(1.4, 2.0, 1.0));
    colliders.push(box);
  }

  createArcheryTarget(12, 0, 5, -Math.PI / 4);
  createArcheryTarget(16, 0, 0, -Math.PI / 4);
  createArcheryTarget(20, 0, -5, -Math.PI / 4);

  // 2. Watchtower
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-15, 0, -5);

  const postGeom = new THREE.CylinderGeometry(0.18, 0.18, 7.0, 8);
  [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeom, mats.woodLog);
    post.position.set(px, 3.5, pz);
    post.castShadow = true;
    towerGroup.add(post);
  });

  const platGeom = new THREE.BoxGeometry(4.4, 0.35, 4.4);
  const plat = new THREE.Mesh(platGeom, mats.woodLog);
  plat.position.y = 5.2;
  plat.castShadow = true;
  towerGroup.add(plat);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.0, 4), new THREE.MeshStandardMaterial({ color: '#881337', roughness: 0.5 }));
  roof.position.y = 7.6;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  towerGroup.add(roof);

  scene.add(towerGroup);

  const towerBox = new THREE.Box3();
  towerBox.setFromCenterAndSize(new THREE.Vector3(-15, 3.5, -5), new THREE.Vector3(4.2, 7.0, 4.2));
  colliders.push(towerBox);

  return { targets };
}
