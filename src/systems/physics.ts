import * as THREE from 'three';
import { GAME_CONFIG } from '../core/config';

/**
 * High-performance 3D Character Physics and Collision Engine
 * Features:
 * - Continuous Collision Detection (CCD) with sub-stepping to prevent tunneling
 * - Minimum Penetration Depth Push-Out resolution (prevents clipping through walls)
 * - Dynamic Walkable Platform & Step-Climbing support (Temple plinths, bridges, stairs, furniture)
 * - Smooth 2-axis tangential wall-sliding
 * - Coyote time and buffered jumps for responsive action-RPG controls
 */
export class MovementPhysics {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 15);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public rotation: number = 0;
  public isGrounded: boolean = true;
  private colliders: THREE.Box3[] = [];
  private platforms: THREE.Box3[] = [];
  public playerRadius: number = 0.42;
  public playerHeight: number = 1.65;

  // Jump responsiveness (coyote time & jump buffer)
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  constructor(initialPos: THREE.Vector3, colliders: THREE.Box3[]) {
    this.position.copy(initialPos);
    this.colliders = colliders;
    this.ensureSafeSpawn();
  }

  private ensureSafeSpawn() {
    // If spawned inside or too close to a collider, resolve penetration
    for (let attempts = 0; attempts < 10; attempts++) {
      let resolved = false;
      const testBox = new THREE.Box3();
      testBox.setFromCenterAndSize(
        new THREE.Vector3(this.position.x, this.position.y + 0.8, this.position.z),
        new THREE.Vector3(this.playerRadius * 2, 1.6, this.playerRadius * 2)
      );

      for (const col of this.colliders) {
        if (testBox.intersectsBox(col)) {
          // Push away towards origin/forward
          this.position.z += 1.2;
          resolved = true;
          break;
        }
      }
      if (!resolved) break;
    }
  }

  public setColliders(colliders: THREE.Box3[]) {
    this.colliders = colliders;
  }

  public addCollider(box: THREE.Box3) {
    this.colliders.push(box);
  }

  public addPlatform(box: THREE.Box3) {
    this.platforms.push(box);
  }

  public removeCollider(box: THREE.Box3) {
    const idx = this.colliders.indexOf(box);
    if (idx !== -1) {
      this.colliders.splice(idx, 1);
    }
  }

  public jump(): boolean {
    this.jumpBufferTimer = 0.16; // Queue jump request for next 160ms
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.executeJump();
      return true;
    }
    return false;
  }

  private executeJump(): void {
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.velocity.y = GAME_CONFIG.CONTROLS.JUMP_IMPULSE;
  }

  public roll(): void {
    const forwardX = Math.sin(this.rotation);
    const forwardZ = Math.cos(this.rotation);
    this.velocity.x = forwardX * GAME_CONFIG.CONTROLS.ROLL_IMPULSE;
    this.velocity.z = forwardZ * GAME_CONFIG.CONTROLS.ROLL_IMPULSE;
  }

  /**
   * Evaluates the highest solid walkable surface beneath the player
   */
  public getGroundHeight(x: number, z: number, currentY: number): number {
    let groundY = 0; // Default terrain level
    const r = this.playerRadius * 0.75;

    // Check dedicated platforms and horizontal tops of colliders
    const allSurfaces = [...this.platforms, ...this.colliders];
    for (const surface of allSurfaces) {
      // Check if horizontal footprint overlaps
      if (
        x + r >= surface.min.x &&
        x - r <= surface.max.x &&
        z + r >= surface.min.z &&
        z - r <= surface.max.z
      ) {
        // Only standable if player is near or above the surface top
        if (currentY >= surface.max.y - 0.45 && surface.max.y > groundY) {
          groundY = surface.max.y;
        }
      }
    }

    return groundY;
  }

  public update(
    inputX: number,
    inputZ: number,
    isSprinting: boolean,
    cameraYaw: number,
    delta: number
  ): { speedRatio: number } {
    // 1. Coyote time & Jump buffer
    if (this.isGrounded) {
      this.coyoteTimer = 0.14;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
      if (this.isGrounded || this.coyoteTimer > 0) {
        this.executeJump();
      }
    }

    // 2. Movement Intent
    const hasMoveInput = Math.abs(inputX) > 0.01 || Math.abs(inputZ) > 0.01;
    let targetSpeed = 0;

    if (hasMoveInput) {
      targetSpeed = isSprinting
        ? GAME_CONFIG.CONTROLS.SPRINT_SPEED
        : GAME_CONFIG.CONTROLS.WALK_SPEED;

      // Project input relative to camera yaw
      const worldDirX = inputX * Math.cos(cameraYaw) - inputZ * Math.sin(cameraYaw);
      const worldDirZ = -inputX * Math.sin(cameraYaw) - inputZ * Math.cos(cameraYaw);

      const dirLen = Math.sqrt(worldDirX * worldDirX + worldDirZ * worldDirZ);
      const normDirX = dirLen > 0.001 ? worldDirX / dirLen : 0;
      const normDirZ = dirLen > 0.001 ? worldDirZ / dirLen : 0;

      // Smooth rotate towards movement direction
      const targetRotation = Math.atan2(normDirX, normDirZ);
      let diff = targetRotation - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation += diff * Math.min(1, GAME_CONFIG.CONTROLS.ROTATION_SPEED * delta);

      // Accelerate
      const accel = GAME_CONFIG.CONTROLS.ACCELERATION * (this.isGrounded ? 1.0 : 0.65);
      this.velocity.x += (normDirX * targetSpeed - this.velocity.x) * accel * delta;
      this.velocity.z += (normDirZ * targetSpeed - this.velocity.z) * accel * delta;
    } else {
      // Deceleration
      const decel = GAME_CONFIG.CONTROLS.DECELERATION * (this.isGrounded ? 1.0 : 0.45);
      this.velocity.x += (0 - this.velocity.x) * decel * delta;
      this.velocity.z += (0 - this.velocity.z) * decel * delta;
    }

    // Gravity
    if (!this.isGrounded) {
      this.velocity.y -= GAME_CONFIG.CONTROLS.GRAVITY * delta;
    }

    // 3. Sub-stepping Continuous Collision Detection (prevents high-speed tunneling)
    const displacement = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z) * delta;
    const numSubSteps = Math.min(4, Math.max(1, Math.ceil(displacement / 0.14)));
    const subDelta = delta / numSubSteps;

    for (let step = 0; step < numSubSteps; step++) {
      // Step A: Vertical integration & ground height
      const currentGroundY = this.getGroundHeight(this.position.x, this.position.z, this.position.y);
      const nextY = this.position.y + this.velocity.y * subDelta;

      if (nextY <= currentGroundY) {
        this.position.y = currentGroundY;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else {
        this.position.y = nextY;
        this.isGrounded = false;
      }

      // Step B: Horizontal integration with Penetration Push-Out
      let testX = this.position.x + this.velocity.x * subDelta;
      let testZ = this.position.z + this.velocity.z * subDelta;

      // Check step-up: if moving onto a small elevated platform / stair
      const targetGroundY = this.getGroundHeight(testX, testZ, this.position.y);
      if (this.isGrounded && targetGroundY > this.position.y && targetGroundY - this.position.y <= 0.42) {
        this.position.y = targetGroundY;
      }

      // Resolve against each solid collider
      const pr = this.playerRadius;
      const py = this.position.y;
      const ph = this.playerHeight;

      for (const col of this.colliders) {
        // If player is standing cleanly on top of this collider, it does not block horizontal motion
        if (py >= col.max.y - 0.08) {
          continue;
        }

        // Check vertical overlap between player cylinder and collider
        const isVerticallyOverlapping = py + ph > col.min.y && py < col.max.y;
        if (!isVerticallyOverlapping) {
          continue;
        }

        // Check horizontal overlap with expanded bounding box
        const minX = col.min.x - pr;
        const maxX = col.max.x + pr;
        const minZ = col.min.z - pr;
        const maxZ = col.max.z + pr;

        if (testX > minX && testX < maxX && testZ > minZ && testZ < maxZ) {
          // Inside collision volume! Calculate minimum penetration distances to all 4 faces
          const distLeft = testX - minX;
          const distRight = maxX - testX;
          const distBack = testZ - minZ;
          const distFront = maxZ - testZ;

          const minDist = Math.min(distLeft, distRight, distBack, distFront);

          if (minDist === distLeft) {
            testX = minX;
            if (this.velocity.x > 0) this.velocity.x = 0;
          } else if (minDist === distRight) {
            testX = maxX;
            if (this.velocity.x < 0) this.velocity.x = 0;
          } else if (minDist === distBack) {
            testZ = minZ;
            if (this.velocity.z > 0) this.velocity.z = 0;
          } else {
            testZ = maxZ;
            if (this.velocity.z < 0) this.velocity.z = 0;
          }
        }
      }

      // Commit sub-step position
      this.position.x = testX;
      this.position.z = testZ;
    }

    // World Map Boundaries clamp
    this.position.x = Math.max(-74, Math.min(74, this.position.x));
    this.position.z = Math.max(-74, Math.min(74, this.position.z));

    const currentHozSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    const speedRatio = Math.min(1, currentHozSpeed / GAME_CONFIG.CONTROLS.SPRINT_SPEED);

    return { speedRatio };
  }
}
