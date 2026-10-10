import * as THREE from 'three';
import { createMaterials } from './materials';

export function buildRelicFoliage(scene: THREE.Scene, colliders: THREE.Box3[]) {
  const mats = createMaterials();

  const matOakLeaf = new THREE.MeshStandardMaterial({ color: '#3A7D44', roughness: 0.65 });
  const matDeadWood = new THREE.MeshStandardMaterial({ color: '#574136', roughness: 0.85 });
  const matPalmLeaf = new THREE.MeshStandardMaterial({ color: '#16A34A', roughness: 0.55 });
  const matMoss = new THREE.MeshStandardMaterial({ color: '#4D7C0F', roughness: 0.8 });
  const matFern = new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.6 });

  // 1. Oak Trees (Broad leafy trees)
  function createOakTree(x: number, z: number, scale = 1.0) {
    const oak = new THREE.Group();
    oak.position.set(x, 0, z);

    // Thick trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * scale, 0.6 * scale, 3.2 * scale, 8), mats.woodLog);
    trunk.position.y = 1.6 * scale;
    trunk.castShadow = true;
    oak.add(trunk);

    // Broad round canopy spheres
    const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4 * scale, 1), matOakLeaf);
    canopy1.position.y = 4.0 * scale;
    canopy1.castShadow = true;
    oak.add(canopy1);

    const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), matOakLeaf);
    canopy2.position.set(1.1 * scale, 3.8 * scale, 0.5 * scale);
    canopy2.castShadow = true;
    oak.add(canopy2);

    const canopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7 * scale, 1), matOakLeaf);
    canopy3.position.set(-1.0 * scale, 3.6 * scale, -0.6 * scale);
    canopy3.castShadow = true;
    oak.add(canopy3);

    scene.add(oak);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 2.0 * scale, z), new THREE.Vector3(1.2 * scale, 4.0 * scale, 1.2 * scale));
    colliders.push(box);
  }

  // 2. Dead Trees (Gnarled spooky bare branches)
  function createDeadTree(x: number, z: number, scale = 1.0) {
    const dead = new THREE.Group();
    dead.position.set(x, 0, z);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 4.5 * scale, 7), matDeadWood);
    trunk.position.y = 2.25 * scale;
    trunk.castShadow = true;
    dead.add(trunk);

    // Bare crooked branches
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 2.2 * scale, 6), matDeadWood);
      branch.position.set(Math.cos(angle) * 0.7 * scale, (3.2 + (i % 2) * 0.6) * scale, Math.sin(angle) * 0.7 * scale);
      branch.rotation.z = Math.PI / 3;
      branch.rotation.y = angle;
      branch.castShadow = true;
      dead.add(branch);
    }

    scene.add(dead);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 2.0 * scale, z), new THREE.Vector3(1.0 * scale, 4.0 * scale, 1.0 * scale));
    colliders.push(box);
  }

  // 3. Palm Trees (Near the river pond)
  function createPalmTree(x: number, z: number) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Curved slender segmented trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 6.2, 8), mats.woodLog);
    trunk.position.set(0.4, 3.1, 0);
    trunk.rotation.z = -0.12;
    trunk.castShadow = true;
    palm.add(trunk);

    // Radiating Palm Fronds
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 2.6), matPalmLeaf);
      frond.position.set(Math.cos(angle) * 1.3, 6.1, Math.sin(angle) * 1.3);
      frond.rotation.y = angle;
      frond.rotation.x = 0.4;
      frond.castShadow = true;
      palm.add(frond);
    }

    scene.add(palm);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 3.0, z), new THREE.Vector3(0.8, 6.0, 0.8));
    colliders.push(box);
  }

  // 4. Mossy Boulders & Ferns
  function createMossyRock(x: number, z: number, size = 1.0) {
    const rock = new THREE.Group();
    rock.position.set(x, 0, z);

    const rockMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(size), mats.ruinStone);
    rockMesh.position.y = size * 0.7;
    rockMesh.scale.set(1.2, 0.9, 1.1);
    rockMesh.castShadow = true;
    rock.add(rockMesh);

    // Moss cap
    const mossCap = new THREE.Mesh(new THREE.SphereGeometry(size * 0.95, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), matMoss);
    mossCap.position.y = size * 0.75;
    mossCap.scale.set(1.2, 0.9, 1.1);
    rock.add(mossCap);

    scene.add(rock);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, size * 0.7, z), new THREE.Vector3(size * 2, size * 1.4, size * 2));
    colliders.push(box);
  }

  // Scatter across the world map
  createOakTree(8, 24, 1.1);
  createOakTree(-10, 26, 0.95);
  createOakTree(24, 26, 1.2);

  createDeadTree(-14, -22, 1.0);
  createDeadTree(14, -22, 1.1);
  createDeadTree(0, -20, 0.9);

  createPalmTree(-22, 18);
  createPalmTree(-15, 24);

  createMossyRock(-14, 16, 0.9);
  createMossyRock(12, -8, 1.1);
  createMossyRock(-6, -26, 1.3);

  // 5. Conifer Pine Trees
  const matPineNeedle = new THREE.MeshStandardMaterial({ color: '#1B4D3E', roughness: 0.6 });
  function createPineTree(x: number, z: number, scale = 1.0) {
    const pine = new THREE.Group();
    pine.position.set(x, 0, z);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 3.8 * scale, 8), mats.woodLog);
    trunk.position.y = 1.9 * scale;
    trunk.castShadow = true;
    pine.add(trunk);

    [
      { y: 3.2, r: 1.8, h: 2.2 },
      { y: 4.6, r: 1.4, h: 2.0 },
      { y: 5.8, r: 0.9, h: 1.8 },
    ].forEach((tier) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r * scale, tier.h * scale, 7), matPineNeedle);
      cone.position.y = tier.y * scale;
      cone.castShadow = true;
      pine.add(cone);
    });

    scene.add(pine);

    const box = new THREE.Box3();
    box.setFromCenterAndSize(new THREE.Vector3(x, 2.5 * scale, z), new THREE.Vector3(1.2 * scale, 5.0 * scale, 1.2 * scale));
    colliders.push(box);
  }

  createPineTree(-26, -10, 1.1);
  createPineTree(-28, 2, 1.25);
  createPineTree(24, -14, 1.15);
  createPineTree(28, 10, 1.0);

  // 6. Lush Bush & Flower Scatter
  const matFlowerRed = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.4 });
  const matFlowerYellow = new THREE.MeshStandardMaterial({ color: '#FACC15', roughness: 0.4 });
  const matFlowerBlue = new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.4 });

  for (let i = 0; i < 24; i++) {
    const flower = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12),
      i % 3 === 0 ? matFlowerRed : i % 3 === 1 ? matFlowerYellow : matFlowerBlue
    );
    const fx = (Math.random() - 0.5) * 44;
    const fz = (Math.random() - 0.5) * 44;
    flower.position.set(fx, 0.1, fz);
    scene.add(flower);
  }
}
