import * as THREE from 'three';
import { CharacterPose } from '../../types/game';
import { CharacterRigs } from './legoRangerModel';

export class CharacterAnimator {
  private rigs: CharacterRigs;
  private currentPose: CharacterPose = 'idle';
  private poseTime: number = 0;
  private comboStep: number = 1;
  private isAttacking: boolean = false;
  private attackDuration: number = 0.45;
  private isAimingBow: boolean = false;
  private isRolling: boolean = false;
  private rollDuration: number = 0.55;

  constructor(rigs: CharacterRigs) {
    this.rigs = rigs;
  }

  public setPose(pose: CharacterPose) {
    if (this.isRolling && pose !== 'roll') return;
    if (this.isAttacking && (pose === 'idle' || pose === 'run')) return;
    if (this.currentPose !== pose) {
      this.currentPose = pose;
      this.poseTime = 0;
    }
  }

  public triggerSwordAttack(onHit?: () => void) {
    if (this.isRolling) return;
    this.isAttacking = true;
    this.poseTime = 0;
    this.currentPose = this.comboStep % 2 === 1 ? 'attack_slash' : 'attack_combo';
    this.comboStep = (this.comboStep % 3) + 1;
    if (onHit) {
      setTimeout(onHit, 160);
    }
  }

  public startAimingBow() {
    if (this.isRolling || this.isAttacking) return;
    this.isAimingBow = true;
    this.currentPose = 'aim_bow';
    this.poseTime = 0;
    this.rigs.arrowInHand.visible = true;
  }

  public releaseBow(onShoot?: () => void) {
    if (!this.isAimingBow) return;
    this.isAimingBow = false;
    this.currentPose = 'shoot_bow';
    this.poseTime = 0;
    this.rigs.arrowInHand.visible = false;
    if (onShoot) {
      onShoot();
    }
  }

  public triggerRoll() {
    if (this.isRolling) return;
    this.isRolling = true;
    this.isAttacking = false;
    this.isAimingBow = false;
    this.currentPose = 'roll';
    this.poseTime = 0;
  }

  public update(delta: number, speedRatio: number = 0, isGrounded: boolean = true) {
    this.poseTime += delta;

    // Reset base rotations to neutral before applying pose
    this.resetLimbs();

    // Cape dynamics
    const capeWind = Math.sin(this.poseTime * 3.5) * 0.08;
    const speedCapeOffset = speedRatio * 0.65;
    if (this.rigs.capeSegments.length >= 3) {
      this.rigs.capeSegments[0].rotation.x = -speedCapeOffset * 0.5 - capeWind * 0.5;
      this.rigs.capeSegments[1].rotation.x = -speedCapeOffset * 0.4 - capeWind * 0.8;
      this.rigs.capeSegments[2].rotation.x = -speedCapeOffset * 0.3 - capeWind * 1.2;
    }

    // Front tabard sway
    if (this.rigs.tabardFront) {
      this.rigs.tabardFront.rotation.x = Math.sin(this.poseTime * 4) * 0.05 + speedRatio * 0.2;
    }

    if (this.isRolling) {
      this.animateRoll(delta);
      return;
    }

    if (this.isAttacking) {
      this.animateAttack(delta);
      return;
    }

    if (this.isAimingBow) {
      this.animateAimBow();
      return;
    }

    if (this.currentPose === 'shoot_bow') {
      if (this.poseTime < 0.25) {
        this.animateShootBow();
      } else {
        this.currentPose = 'idle';
      }
      return;
    }

    // Airborne / Jump handling
    if (!isGrounded || this.currentPose === 'jump') {
      if (!isGrounded) {
        this.animateJump();
        return;
      } else {
        // Just landed!
        this.currentPose = speedRatio > 0.05 ? 'run' : 'idle';
      }
    }

    if (this.currentPose === 'run' || speedRatio > 0.05) {
      this.animateRun(delta, Math.max(speedRatio, 0.8));
    } else if (this.currentPose === 'victory') {
      this.animateVictory();
    } else {
      this.animateIdle();
    }
  }

  private resetLimbs() {
    this.rigs.head.rotation.set(0, 0, 0);
    this.rigs.torso.rotation.set(0, 0, 0);
    this.rigs.leftArm.rotation.set(0, 0, 0);
    this.rigs.rightArm.rotation.set(0, 0, 0);
    this.rigs.leftForearm.rotation.set(0, 0, 0);
    this.rigs.rightForearm.rotation.set(0, 0, 0);
    this.rigs.leftLeg.rotation.set(0, 0, 0);
    this.rigs.rightLeg.rotation.set(0, 0, 0);
    this.rigs.body.position.y = 1.05;
    this.rigs.body.rotation.set(0, 0, 0);
  }

  private animateIdle() {
    const t = this.poseTime * 2.2;
    // Breathing bob
    this.rigs.body.position.y = 1.05 + Math.sin(t) * 0.015;
    this.rigs.head.rotation.y = Math.sin(t * 0.5) * 0.05;
    this.rigs.head.rotation.x = Math.sin(t) * 0.02;

    // Subtle arm sway
    this.rigs.leftArm.rotation.x = 0.05 + Math.sin(t) * 0.04;
    this.rigs.leftArm.rotation.z = 0.08;
    this.rigs.rightArm.rotation.x = -0.05 + Math.sin(t) * 0.04;
    this.rigs.rightArm.rotation.z = -0.08;

    // Sturdy warrior stance
    this.rigs.leftLeg.rotation.z = 0.04;
    this.rigs.rightLeg.rotation.z = -0.04;
  }

  private animateRun(delta: number, speed: number) {
    const t = this.poseTime * 12 * speed;
    const stride = Math.sin(t) * 0.85;
    const armStride = Math.sin(t) * 0.95;

    // Body lean forward and vertical bounce
    this.rigs.body.position.y = 1.05 + Math.abs(Math.sin(t)) * 0.08;
    this.rigs.body.rotation.x = 0.15;
    this.rigs.torso.rotation.y = -armStride * 0.12;

    // Alternating leg strides
    this.rigs.leftLeg.rotation.x = stride;
    this.rigs.rightLeg.rotation.x = -stride;

    // Opposing arm swings
    this.rigs.leftArm.rotation.x = -armStride * 0.8;
    this.rigs.leftArm.rotation.z = 0.12;
    this.rigs.rightArm.rotation.x = armStride * 0.8;
    this.rigs.rightArm.rotation.z = -0.12;

    // Forearms bent
    this.rigs.leftForearm.rotation.x = -0.4;
    this.rigs.rightForearm.rotation.x = -0.4;
  }

  private animateAttack(delta: number) {
    const progress = Math.min(this.poseTime / this.attackDuration, 1);

    if (this.currentPose === 'attack_slash') {
      // Horizontal Slash
      if (progress < 0.3) {
        // Wind-up: Right arm pulls back
        const p = progress / 0.3;
        this.rigs.torso.rotation.y = 0.45 * p;
        this.rigs.rightArm.rotation.x = -0.6 * p;
        this.rigs.rightArm.rotation.y = 0.8 * p;
        this.rigs.rightArm.rotation.z = -0.5 * p;
      } else if (progress < 0.7) {
        // Strike: Swift forward slash
        const p = (progress - 0.3) / 0.4;
        this.rigs.torso.rotation.y = 0.45 - 0.9 * p;
        this.rigs.rightArm.rotation.x = -0.6 + 1.6 * p;
        this.rigs.rightArm.rotation.y = 0.8 - 1.2 * p;
        this.rigs.rightArm.rotation.z = -0.5 + 0.9 * p;
        this.rigs.sword.rotation.z = p * 1.5;
      } else {
        // Recover
        const p = (progress - 0.7) / 0.3;
        this.rigs.torso.rotation.y = -0.45 * (1 - p);
        this.rigs.rightArm.rotation.x = 1.0 * (1 - p);
      }
    } else {
      // Overhead Downward Strike
      if (progress < 0.35) {
        const p = progress / 0.35;
        this.rigs.rightArm.rotation.x = -1.8 * p;
        this.rigs.torso.rotation.x = -0.2 * p;
      } else if (progress < 0.7) {
        const p = (progress - 0.35) / 0.35;
        this.rigs.rightArm.rotation.x = -1.8 + 2.8 * p;
        this.rigs.torso.rotation.x = 0.25 * p;
      } else {
        const p = (progress - 0.7) / 0.3;
        this.rigs.rightArm.rotation.x = 1.0 * (1 - p);
        this.rigs.torso.rotation.x = 0.25 * (1 - p);
      }
    }

    if (progress >= 1) {
      this.isAttacking = false;
      this.currentPose = 'idle';
      this.rigs.sword.rotation.z = 0;
    }
  }

  private animateAimBow() {
    // Left arm extends holding bow forward
    this.rigs.leftArm.rotation.x = -1.45;
    this.rigs.leftArm.rotation.y = 0.25;
    this.rigs.leftArm.rotation.z = 0.15;
    this.rigs.leftForearm.rotation.x = -0.15;

    // Right arm draws string back to cheek
    this.rigs.rightArm.rotation.x = -1.4;
    this.rigs.rightArm.rotation.y = -0.6;
    this.rigs.rightArm.rotation.z = -0.3;
    this.rigs.rightForearm.rotation.x = -1.2;

    // Torso turned side-on for archer stance
    this.rigs.torso.rotation.y = -0.55;
    this.rigs.head.rotation.y = 0.55; // Looking down the arrow

    // Stance legs
    this.rigs.leftLeg.rotation.x = 0.2;
    this.rigs.rightLeg.rotation.x = -0.2;
  }

  private animateShootBow() {
    const p = Math.min(this.poseTime / 0.25, 1);
    // Recoil on right arm
    this.rigs.rightArm.rotation.x = -1.4;
    this.rigs.rightArm.rotation.y = -0.6 - 0.4 * (1 - p);
    this.rigs.leftArm.rotation.x = -1.45 - 0.1 * (1 - p);
  }

  private animateRoll(delta: number) {
    const progress = Math.min(this.poseTime / this.rollDuration, 1);
    // Full 360 forward tumble
    this.rigs.body.rotation.x = progress * Math.PI * 2;
    this.rigs.body.position.y = 0.65 + Math.sin(progress * Math.PI) * 0.3;

    // Tuck limbs
    this.rigs.leftLeg.rotation.x = 1.2;
    this.rigs.rightLeg.rotation.x = 1.2;
    this.rigs.leftArm.rotation.x = -1.2;
    this.rigs.rightArm.rotation.x = -1.2;

    if (progress >= 1) {
      this.isRolling = false;
      this.currentPose = 'idle';
      this.resetLimbs();
    }
  }

  private animateJump() {
    this.rigs.body.position.y = 1.25;
    this.rigs.leftLeg.rotation.x = -0.4;
    this.rigs.rightLeg.rotation.x = 0.3;
    this.rigs.leftArm.rotation.x = -0.8;
    this.rigs.rightArm.rotation.x = -0.8;
  }

  private animateVictory() {
    const t = this.poseTime * 3;
    // Sword raised high
    this.rigs.rightArm.rotation.x = -2.4;
    this.rigs.rightArm.rotation.z = -0.3 + Math.sin(t) * 0.1;
    this.rigs.head.rotation.y = Math.sin(t * 0.5) * 0.2;
    this.rigs.leftArm.rotation.z = 0.5;
  }
}
