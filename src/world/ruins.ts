import * as THREE from 'three';
import { createMaterials } from './materials';

export function createAncientRuins(scene: THREE.Scene, colliders: THREE.Box3[]) {
  const mats = createMaterials();

  function createRuinPillar(x: number, z: number, height = 4.2) {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(x, 0, z);

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.5), mats.ruinStone);
    base.position.y = 0.3;
    base.castShadow = true;
    pillarGroup.add(base);

    // Column
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, height, 10), mats.ruinStone);
    col.position.y = height / 2 + 0.3;
    col.castShadow = true;
    pillarGroup.add(col);

    // Glowing Runic Band
    const runeBand = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.22, 10), mats.runeCyan);
    runeBand.position.y = height * 0.65;
    pillarGroup.add(runeBand);

    // Capital
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), mats.ruinStone);
    cap.position.y = height + 0.45;
    cap.castShadow = true;
    pillarGroup.add(cap);

    // Wall Torch on Pillar
    const torchLight = new THREE.PointLight('#38BDF8', 1.2, 7);
    torchLight.position.set(0, height * 0.65, 0.7);
    pillarGroup.add(torchLight);

    scene.add(pillarGroup);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, height / 2, z), new THREE.Vector3(1.5, height + 0.6, 1.5));
    colliders.push(box);
  }

  // 4 Corner Pillars
  createRuinPillar(-8, -14, 4.0);
  createRuinPillar(-3, -16, 4.8);
  createRuinPillar(3, -16, 4.8);
  createRuinPillar(8, -14, 4.0);

  // Archway Lintel
  const archLintel = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.75, 1.3), mats.ruinStone);
  archLintel.position.set(0, 5.2, -16);
  archLintel.castShadow = true;
  scene.add(archLintel);
}
