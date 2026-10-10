import * as THREE from 'three';
import { createMaterials } from './materials';

export function createVegetation(scene: THREE.Scene, colliders: THREE.Box3[]) {
  const mats = createMaterials();

  function createLegoTree(x: number, z: number, scale = 1) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 3.4 * scale, 8), mats.woodLog);
    trunk.position.y = 1.7 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Conical Foliage Tiers
    const tiers = [
      { y: 3.2, r: 2.3, h: 2.1, mat: mats.pineFoliage },
      { y: 4.6, r: 1.8, h: 1.9, mat: mats.pineFoliageLight },
      { y: 5.8, r: 1.2, h: 1.6, mat: mats.pineFoliage },
    ];
    tiers.forEach((tier) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r * scale, tier.h * scale, 8), tier.mat);
      cone.position.y = tier.y * scale;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    });

    scene.add(tree);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(x, 1.7 * scale, z),
      new THREE.Vector3(0.9 * scale, 3.4 * scale, 0.9 * scale)
    );
    colliders.push(box);
  }

  // Forest perimeter positions
  const treePositions = [
    [-14, 18], [-18, 12], [-22, 25], [-16, 32],
    [14, 16], [20, 22], [18, 30], [24, 12],
    [-20, -10], [-25, -18], [-15, -24], [-8, -26],
    [18, -12], [26, -18], [15, -24], [8, -28],
    [-28, 5], [28, 5], [-32, -2], [32, 2],
    [-35, 15], [35, 15], [-25, 38], [25, 38],
  ];
  treePositions.forEach(([x, z], idx) => {
    createLegoTree(x, z, 0.85 + (idx % 3) * 0.22);
  });

  // Flower patches (red & yellow Lego flowers)
  const flowerMatRed = new THREE.MeshBasicMaterial({ color: '#EF4444' });
  const flowerMatYellow = new THREE.MeshBasicMaterial({ color: '#FACC15' });
  const stemMat = new THREE.MeshBasicMaterial({ color: '#16A34A' });

  for (let i = 0; i < 28; i++) {
    const fx = (Math.random() - 0.5) * 50;
    const fz = (Math.random() - 0.5) * 50;
    if (Math.abs(fx) < 5 && Math.abs(fz) < 15) continue; // Skip paths

    const flower = new THREE.Group();
    flower.position.set(fx, 0, fz);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6), stemMat);
    stem.position.y = 0.125;
    flower.add(stem);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), i % 2 === 0 ? flowerMatRed : flowerMatYellow);
    head.position.y = 0.25;
    flower.add(head);

    scene.add(flower);
  }
}
