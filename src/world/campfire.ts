import * as THREE from 'three';
import { createMaterials } from './materials';

export interface CampfireObject {
  group: THREE.Group;
  fireLight: THREE.PointLight;
  flameMesh: THREE.Mesh;
  embers: THREE.Points;
  update: (delta: number) => void;
}

export function createCampfire(scene: THREE.Scene, posX = -6, posZ = 8, colliders?: THREE.Box3[]): CampfireObject {
  const mats = createMaterials();
  const group = new THREE.Group();
  group.position.set(posX, 0, posZ);

  // Wooden Fire Logs
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.3, 8), mats.woodLog);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = angle;
    log.position.y = 0.08;
    log.castShadow = true;
    group.add(log);
  }

  // Surrounding Stone Ring
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), mats.ruinStone);
    stone.position.set(Math.cos(angle) * 0.95, 0.1, Math.sin(angle) * 0.95);
    stone.castShadow = true;
    group.add(stone);
  }

  // Dynamic Warm Campfire Point Light
  const fireLight = new THREE.PointLight('#FFA500', 3.2, 18);
  fireLight.position.set(0, 0.9, 0);
  fireLight.castShadow = true;
  fireLight.shadow.bias = -0.002;
  group.add(fireLight);

  // Flame Mesh
  const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.75, 8), mats.fireGlow);
  flameMesh.position.y = 0.38;
  group.add(flameMesh);

  // Campsite Bench
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 0.5), mats.woodLog);
  benchSeat.position.set(2.2, 0.45, 0);
  benchSeat.castShadow = true;
  group.add(benchSeat);
  [-0.8, 0.8].forEach((bx) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 6), mats.woodLog);
    leg.position.set(2.2 + bx, 0.22, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  scene.add(group);

  if (colliders) {
    // Fire ring solid collider
    const fireBox = new THREE.Box3();
    fireBox.setFromCenterAndSize(new THREE.Vector3(posX, 0.5, posZ), new THREE.Vector3(1.8, 1.0, 1.8));
    colliders.push(fireBox);

    // Bench collider
    const benchBox = new THREE.Box3();
    benchBox.setFromCenterAndSize(new THREE.Vector3(posX + 2.2, 0.35, posZ), new THREE.Vector3(2.1, 0.7, 0.7));
    colliders.push(benchBox);
  }

  // Drifting Embers Particles
  const emberCount = 35;
  const emberGeom = new THREE.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    emberPos[i * 3] = posX + (Math.random() - 0.5) * 0.8;
    emberPos[i * 3 + 1] = 0.4 + Math.random() * 2.5;
    emberPos[i * 3 + 2] = posZ + (Math.random() - 0.5) * 0.8;
  }
  emberGeom.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const emberMat = new THREE.PointsMaterial({
    color: '#FFB703',
    size: 0.14,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(emberGeom, emberMat);
  scene.add(embers);

  let time = 0;
  const update = (delta: number) => {
    time += delta;
    fireLight.intensity = 2.8 + Math.sin(time * 16) * 0.4 + Math.cos(time * 26) * 0.3;
    flameMesh.scale.y = 1 + Math.sin(time * 18) * 0.18;

    const positions = embers.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3 + 1] += delta * 1.5;
      positions[i * 3] += Math.sin(time * 2 + i) * 0.012;
      if (positions[i * 3 + 1] > 3.2) {
        positions[i * 3 + 1] = 0.4;
        positions[i * 3] = posX + (Math.random() - 0.5) * 0.8;
      }
    }
    embers.geometry.attributes.position.needsUpdate = true;
  };

  return { group, fireLight, flameMesh, embers, update };
}
