export const GAME_CONFIG = {
  TITLE: 'RELIC: The Lost World',
  VERSION: '2.0.0',

  // Atmospheric Fog & Sky Settings (Deep, thick volumetric fog filling the world)
  ENVIRONMENT: {
    SKY_COLOR: '#151D2A', // Deep atmospheric twilight slate
    FOG_COLOR: '#151D2A', // Seamlessly conceals horizons and wraps world
    FOG_DENSITY: 0.042,   // Dense, rich atmospheric fog filling space
    FOG_NEAR: 4,
    FOG_FAR: 38,
    MIST_PARTICLE_COUNT: 160,
    MIST_HEIGHT: 3.5,
  },

  // Graphics & Rendering
  GRAPHICS: {
    SHADOW_MAP_SIZE: 2048,
    SHADOW_BIAS: -0.0004,
    ANTIALIAS: true,
    TONE_MAPPING_EXPOSURE: 1.15,
  },

  // Responsive Player Movement & Controls
  CONTROLS: {
    ACCELERATION: 45.0,
    DECELERATION: 16.0,
    WALK_SPEED: 6.2,
    SPRINT_SPEED: 10.5,
    ROTATION_SPEED: 15.0,
    JUMP_IMPULSE: 7.8,
    GRAVITY: 22.0,
    ROLL_IMPULSE: 12.0,
    ROLL_STAMINA_COST: 15,
    STAMINA_REGEN: 14.0,

    // Mouse & Camera Orbit
    MOUSE_SENSITIVITY: 0.0035,
    TOUCH_SENSITIVITY: 0.005,
    CAMERA_MIN_DISTANCE: 2.2,
    CAMERA_MAX_DISTANCE: 9.0,
    CAMERA_DEFAULT_DISTANCE: 4.8,
    CAMERA_MIN_PITCH: 0.05,
    CAMERA_MAX_PITCH: 1.25,
    CAMERA_DAMPING: 0.12,
  },

  // Combat Mechanics
  COMBAT: {
    SWORD_DAMAGE_MIN: 28,
    SWORD_DAMAGE_MAX: 44,
    SWORD_RANGE: 2.2,
    ARROW_SPEED: 34.0,
    ARROW_DAMAGE_MIN: 38,
    ARROW_DAMAGE_MAX: 52,
    MAX_ARROWS: 40,
    COMBO_TIMEOUT: 2200,
  },

  // Audio Volumes
  AUDIO: {
    SFX_VOLUME: 0.4,
    BGM_VOLUME: 0.15,
  },
};
