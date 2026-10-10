import * as THREE from 'three';
import { createMaterials } from './materials';

export function createTerrain(scene: THREE.Scene) {
  const mats = createMaterials();

  // 1. Base Grassy Plane
  const groundGeom = new THREE.PlaneGeometry(180, 180, 48, 48);
  const groundMesh = new THREE.Mesh(groundGeom, mats.grass);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // 2. Main Cobblestone Road Network
  const pathGeom = new THREE.PlaneGeometry(14, 56);
  const pathMesh = new THREE.Mesh(pathGeom, mats.stoneRoad);
  pathMesh.rotation.x = -Math.PI / 2;
  pathMesh.position.set(0, 0.015, 10);
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  const crossPathGeom = new THREE.PlaneGeometry(68, 8);
  const crossPathMesh = new THREE.Mesh(crossPathGeom, mats.stoneRoad);
  crossPathMesh.rotation.x = -Math.PI / 2;
  crossPathMesh.position.set(0, 0.02, -5);
  crossPathMesh.receiveShadow = true;
  scene.add(crossPathMesh);

  // 3. Stylized Lego Studs Scatter
  const studGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10);
  const studInstanced = new THREE.InstancedMesh(studGeom, mats.grassDark, 340);
  const dummy = new THREE.Object3D();
  let studIdx = 0;
  for (let x = -36; x <= 36; x += 4) {
    for (let z = -36; z <= 36; z += 4) {
      if (Math.abs(x) > 3 || z < -6 || z > 36) {
        dummy.position.set(x + (Math.random() - 0.5) * 1.5, 0.02, z + (Math.random() - 0.5) * 1.5);
        dummy.updateMatrix();
        studInstanced.setMatrixAt(studIdx++, dummy.matrix);
      }
    }
  }
  studInstanced.receiveShadow = true;
  scene.add(studInstanced);

  return { groundMesh, pathMesh, crossPathMesh };
}
