import * as THREE from 'three';
import { ArrowProjectile, FloatingText } from '../../types/game';
import { sounds } from '../../audio/soundSystem';

export class CombatSystem {
  private scene: THREE.Scene;
  public arrows: ArrowProjectile[] = [];
  public floatingTexts: FloatingText[] = [];
  private particleGroup: THREE.Group;
  private particles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }[] = [];
  private slashArcs: {
    mesh: THREE.Mesh;
    life: number;
    maxLife: number;
  }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
  }

  // Visual Slash Arc Effect on sword swing
  public spawnSwordSlashArc(origin: THREE.Vector3, facingAngle: number) {
    const geom = new THREE.RingGeometry(0.8, 1.4, 16, 1, 0, Math.PI * 0.7);
    const mat = new THREE.MeshBasicMaterial({
      color: '#FACC15',
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const arcMesh = new THREE.Mesh(geom, mat);
    arcMesh.position.copy(origin).add(new THREE.Vector3(0, 1.0, 0));
    arcMesh.rotation.x = Math.PI / 2;
    arcMesh.rotation.z = -facingAngle + Math.PI / 4;

    this.scene.add(arcMesh);
    this.slashArcs.push({
      mesh: arcMesh,
      life: 0.22,
      maxLife: 0.22,
    });
  }

  // Shockwave ring on heavy impact / ground slam
  public spawnShockwave(pos: THREE.Vector3, color = '#38BDF8') {
    const ringGeom = new THREE.RingGeometry(0.3, 0.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(pos.x, 0.05, pos.z);
    this.scene.add(ringMesh);

    this.slashArcs.push({
      mesh: ringMesh,
      life: 0.45,
      maxLife: 0.45,
    });
  }

  public fireArrow(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    damage = 40
  ) {
    sounds.playBowShoot();

    const arrowGroup = new THREE.Group();
    arrowGroup.position.copy(origin);

    // Arrow Shaft
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6),
      new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.5 })
    );
    shaft.rotation.x = Math.PI / 2;
    arrowGroup.add(shaft);

    // Arrowhead (Glinting steel)
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.14, 4),
      new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.9, roughness: 0.1 })
    );
    tip.position.z = 0.52;
    tip.rotation.x = Math.PI / 2;
    arrowGroup.add(tip);

    // Fletching feathers
    const feathers = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.008),
      new THREE.MeshBasicMaterial({ color: '#FEF08A' })
    );
    feathers.position.z = -0.4;
    arrowGroup.add(feathers);

    // Arrow glow light for night flight
    const glow = new THREE.PointLight('#FBBF24', 0.8, 3.5);
    arrowGroup.add(glow);

    arrowGroup.lookAt(origin.clone().add(direction));
    this.scene.add(arrowGroup);

    const speed = 32;
    this.arrows.push({
      id: 'arrow_' + Date.now() + '_' + Math.random(),
      position: { x: origin.x, y: origin.y, z: origin.z },
      velocity: {
        x: direction.x * speed,
        y: direction.y * speed + 1.2,
        z: direction.z * speed,
      },
      rotation: { x: 0, y: 0, z: 0 },
      mesh: arrowGroup,
      life: 4.0,
      damage,
    });
  }

  public spawnSparks(pos: THREE.Vector3, count = 16, color = '#FDE047') {
    const mat = new THREE.MeshBasicMaterial({ color, blending: THREE.AdditiveBlending });
    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), mat);
      pMesh.position.copy(pos);
      this.particleGroup.add(pMesh);

      this.particles.push({
        mesh: pMesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 4.5 + 1.5,
          (Math.random() - 0.5) * 6
        ),
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  public addDamageText(
    text: string,
    x: number,
    y: number,
    z: number,
    color = '#F87171'
  ) {
    this.floatingTexts.push({
      id: 'text_' + Math.random(),
      text,
      x,
      y: y + 1.0,
      z,
      color,
      opacity: 1,
      life: 1.2,
    });
  }

  public update(delta: number): { hitEnemies: string[]; hitTargets: string[] } {
    const hitEnemies: string[] = [];
    const hitTargets: string[] = [];

    // 1. Update Arrow Physics
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arr = this.arrows[i];
      arr.life -= delta;
      arr.velocity.y -= 9.8 * 0.38 * delta;

      arr.position.x += arr.velocity.x * delta;
      arr.position.y += arr.velocity.y * delta;
      arr.position.z += arr.velocity.z * delta;

      arr.mesh.position.set(arr.position.x, arr.position.y, arr.position.z);

      const forward = new THREE.Vector3(arr.velocity.x, arr.velocity.y, arr.velocity.z).normalize();
      arr.mesh.lookAt(
        arr.position.x + forward.x,
        arr.position.y + forward.y,
        arr.position.z + forward.z
      );

      // Arrow trail sparks
      if (Math.random() < 0.4) {
        this.spawnSparks(new THREE.Vector3(arr.position.x, arr.position.y, arr.position.z), 1, '#FDE047');
      }

      if (arr.position.y <= 0.05 || arr.life <= 0) {
        sounds.playArrowHit();
        this.spawnSparks(new THREE.Vector3(arr.position.x, 0.1, arr.position.z), 5, '#84CC16');
        this.scene.remove(arr.mesh);
        this.arrows.splice(i, 1);
      }
    }

    // 2. Update Slash Arcs & Shockwaves
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const arc = this.slashArcs[i];
      arc.life -= delta;
      const progress = 1 - arc.life / arc.maxLife;

      // Expand ring and fade out
      arc.mesh.scale.set(1 + progress * 1.5, 1 + progress * 1.5, 1 + progress * 1.5);
      const mat = arc.mesh.material as THREE.Material;
      mat.opacity = Math.max(0, arc.life / arc.maxLife);

      if (arc.life <= 0) {
        this.scene.remove(arc.mesh);
        this.slashArcs.splice(i, 1);
      }
    }

    // 3. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      p.velocity.y -= 9.8 * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      const scale = p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);

      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 4. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= delta;
      ft.y += 0.8 * delta;
      ft.opacity = Math.max(0, ft.life / 1.2);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    return { hitEnemies, hitTargets };
  }
}
