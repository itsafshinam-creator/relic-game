import * as THREE from 'three';
import { GAME_CONFIG } from '../core/config';

export class ThirdPersonCameraController {
  public camera: THREE.PerspectiveCamera;
  private currentYaw: number = 0;
  private currentPitch: number = 0.35;
  private targetYaw: number = 0;
  private targetPitch: number = 0.35;
  private currentDistance: number = GAME_CONFIG.CONTROLS.CAMERA_DEFAULT_DISTANCE;
  private targetDistance: number = GAME_CONFIG.CONTROLS.CAMERA_DEFAULT_DISTANCE;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public handleInput(lookX: number, lookY: number, zoomDelta: number) {
    this.targetYaw -= lookX;
    this.targetPitch = Math.max(
      GAME_CONFIG.CONTROLS.CAMERA_MIN_PITCH,
      Math.min(GAME_CONFIG.CONTROLS.CAMERA_MAX_PITCH, this.targetPitch + lookY)
    );

    this.targetDistance = Math.max(
      GAME_CONFIG.CONTROLS.CAMERA_MIN_DISTANCE,
      Math.min(GAME_CONFIG.CONTROLS.CAMERA_MAX_DISTANCE, this.targetDistance + zoomDelta)
    );
  }

  public update(targetPos: THREE.Vector3, delta: number) {
    // Smooth damp towards target yaw, pitch, and zoom
    const damping = Math.min(1, GAME_CONFIG.CONTROLS.CAMERA_DAMPING * 60 * delta);
    this.currentYaw += (this.targetYaw - this.currentYaw) * damping;
    this.currentPitch += (this.targetPitch - this.currentPitch) * damping;
    this.currentDistance += (this.targetDistance - this.currentDistance) * damping;

    const shoulderHeight = 1.35;
    const focusPoint = targetPos.clone().add(new THREE.Vector3(0, shoulderHeight, 0));

    // Spherical coordinate offset
    const cosPitch = Math.cos(this.currentPitch);
    const sinPitch = Math.sin(this.currentPitch);
    const sinYaw = Math.sin(this.currentYaw);
    const cosYaw = Math.cos(this.currentYaw);

    const camX = focusPoint.x + sinYaw * cosPitch * this.currentDistance;
    const camY = Math.max(0.4, focusPoint.y + sinPitch * this.currentDistance); // Prevent dipping below ground
    const camZ = focusPoint.z + cosYaw * cosPitch * this.currentDistance;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(focusPoint);
  }

  public getYaw(): number {
    return this.currentYaw;
  }
}
