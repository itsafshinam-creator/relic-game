import * as THREE from 'three';
import { GAME_CONFIG } from '../core/config';

export interface WorldLighting {
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  ambientLight: THREE.AmbientLight;
}

export function createWorldLighting(scene: THREE.Scene): WorldLighting {
  // Soft ambient hemisphere light
  const hemiLight = new THREE.HemisphereLight('#CBD5E1', '#334155', 0.85);
  scene.add(hemiLight);

  // Soft overall ambient
  const ambientLight = new THREE.AmbientLight('#1E293B', 0.5);
  scene.add(ambientLight);

  // Directional Sun Light casting detailed shadows
  const sunLight = new THREE.DirectionalLight('#FEF3C7', 1.8);
  sunLight.position.set(24, 42, 22);
  sunLight.castShadow = true;

  sunLight.shadow.mapSize.width = GAME_CONFIG.GRAPHICS.SHADOW_MAP_SIZE;
  sunLight.shadow.mapSize.height = GAME_CONFIG.GRAPHICS.SHADOW_MAP_SIZE;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 130;
  sunLight.shadow.camera.left = -38;
  sunLight.shadow.camera.right = 38;
  sunLight.shadow.camera.top = 38;
  sunLight.shadow.camera.bottom = -38;
  sunLight.shadow.bias = GAME_CONFIG.GRAPHICS.SHADOW_BIAS;

  scene.add(sunLight);

  return { sunLight, hemiLight, ambientLight };
}
