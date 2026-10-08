export const GAME_CONFIG = Object.freeze({
  name: 'RELIC',
  version: 'MODULAR FINAL 1.0',
  threeVersion: '0.158.0',
  renderer: { maxPixelRatio: 1.5, antialias: true, powerPreference: 'high-performance' },
  camera: { fov: 64, near: 0.1, far: 240, distance: 7, height: 3, followLerp: 0.12 },
  world: { minX: -95, maxX: 95, minZ: -100, maxZ: 95, fogDensity: 0.018, lightFogDensity: 0.006, dungeonFogDensity: 0.028 },
  player: { maxHp: 100, attack: 12, moveSpeed: 5.2, critChance: 0.12, critMultiplier: 1.8, attackCooldown: 0.42, dodgeCooldown: 0.7, dodgeDistance: 3 },
  save: { key: 'relic_modular_final_10' },
  paths: { assets: './assets/' }
});
