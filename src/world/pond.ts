import * as THREE from 'three';
import { createMaterials } from './materials';

export function createCrystalPond(scene: THREE.Scene, posX = -18, posZ = 20) {
  const mats = createMaterials();
  const pondGroup = new THREE.Group();
  pondGroup.position.set(posX, 0.03, posZ);

  // Reflective Crystal Water
  const pondGeom = new THREE.CylinderGeometry(6.5, 6.5, 0.2, 28);
  const pondWater = new THREE.Mesh(pondGeom, mats.water);
  pondWater.position.y = 0.02;
  pondWater.receiveShadow = true;
  pondGroup.add(pondWater);

  // Shoreline Stones
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const stoneSize = 0.45 + Math.random() * 0.4;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(stoneSize), mats.ruinStone);
    stone.position.set(Math.cos(angle) * 6.5, 0.1, Math.sin(angle) * 6.5);
    stone.castShadow = true;
    pondGroup.add(stone);
  }

  // Water Lilies and Lotus flowers
  const lilyMat = new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.5 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const lily = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.02, 12), lilyMat);
    lily.add(pad);
    const flower = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 6), flowerMat);
    flower.position.y = 0.08;
    lily.add(flower);

    const a = (i / 5) * Math.PI * 2 + 0.3;
    const r = 2.0 + (i % 2) * 1.8;
    lily.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
    pondGroup.add(lily);
  }

  scene.add(pondGroup);
  return pondGroup;
}
