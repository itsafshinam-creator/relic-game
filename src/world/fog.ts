import * as THREE from 'three';
import { GAME_CONFIG } from '../core/config';

export interface FogSystem {
  fog: THREE.FogExp2;
  groundMist: THREE.Points;
  highMist: THREE.Points;
  update: (delta: number) => void;
}

export function createAtmosphericFog(scene: THREE.Scene): FogSystem {
  const fogColor = new THREE.Color(GAME_CONFIG.ENVIRONMENT.FOG_COLOR);

  // 1. Scene Fog and Background (dense atmospheric mystery fog)
  const fog = new THREE.FogExp2(fogColor, GAME_CONFIG.ENVIRONMENT.FOG_DENSITY);
  scene.fog = fog;
  scene.background = fogColor;

  // Procedural soft circle mist sprite
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(210, 230, 255, 0.65)');
  grad.addColorStop(0.4, 'rgba(180, 205, 235, 0.40)');
  grad.addColorStop(0.8, 'rgba(148, 175, 210, 0.12)');
  grad.addColorStop(1, 'rgba(148, 175, 210, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);

  // 2. Layer 1: Dense Ground-to-Waist Mist Particles
  const count = GAME_CONFIG.ENVIRONMENT.MIST_PARTICLE_COUNT;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 1] = 0.2 + Math.random() * 1.8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 110;
    speeds[i] = 0.3 + Math.random() * 0.7;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const matGround = new THREE.PointsMaterial({
    color: '#94A3B8',
    size: 11.5,
    map: texture,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const groundMist = new THREE.Points(geom, matGround);
  scene.add(groundMist);

  // 3. Layer 2: Atmospheric Ambient Mist filling mid-height space (1.5m to 4.5m)
  const countHigh = 90;
  const geomHigh = new THREE.BufferGeometry();
  const positionsHigh = new Float32Array(countHigh * 3);
  const speedsHigh = new Float32Array(countHigh);

  for (let i = 0; i < countHigh; i++) {
    positionsHigh[i * 3] = (Math.random() - 0.5) * 120;
    positionsHigh[i * 3 + 1] = 1.6 + Math.random() * 3.2;
    positionsHigh[i * 3 + 2] = (Math.random() - 0.5) * 120;
    speedsHigh[i] = 0.2 + Math.random() * 0.5;
  }

  geomHigh.setAttribute('position', new THREE.BufferAttribute(positionsHigh, 3));

  const matHigh = new THREE.PointsMaterial({
    color: '#64748B',
    size: 15.0,
    map: texture,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const highMist = new THREE.Points(geomHigh, matHigh);
  scene.add(highMist);

  let time = 0;
  const update = (delta: number) => {
    time += delta;

    // Update Ground Mist
    const pos = groundMist.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(time * 0.4 + i) * delta * speeds[i];
      pos[i * 3 + 2] += Math.cos(time * 0.25 + i) * delta * speeds[i];
      pos[i * 3 + 1] = 0.4 + Math.sin(time * 0.7 + i) * 0.35;

      if (pos[i * 3] > 60) pos[i * 3] = -60;
      if (pos[i * 3] < -60) pos[i * 3] = 60;
      if (pos[i * 3 + 2] > 60) pos[i * 3 + 2] = -60;
      if (pos[i * 3 + 2] < -60) pos[i * 3 + 2] = 60;
    }
    groundMist.geometry.attributes.position.needsUpdate = true;

    // Update High Volumetric Mist
    const posHigh = highMist.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < countHigh; i++) {
      posHigh[i * 3] += Math.cos(time * 0.3 + i * 2) * delta * speedsHigh[i];
      posHigh[i * 3 + 2] += Math.sin(time * 0.2 + i * 2) * delta * speedsHigh[i];
      posHigh[i * 3 + 1] = 2.0 + Math.sin(time * 0.5 + i) * 0.8;

      if (posHigh[i * 3] > 65) posHigh[i * 3] = -65;
      if (posHigh[i * 3] < -65) posHigh[i * 3] = 65;
      if (posHigh[i * 3 + 2] > 65) posHigh[i * 3 + 2] = -65;
      if (posHigh[i * 3 + 2] < -65) posHigh[i * 3 + 2] = 65;
    }
    highMist.geometry.attributes.position.needsUpdate = true;
  };

  return { fog, groundMist, highMist, update };
}
