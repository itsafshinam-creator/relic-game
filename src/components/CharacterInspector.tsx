import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterCustomization, CharacterPose, WeaponType } from '../types/game';
import { CharacterRigs, createLegoRanger } from '../game/character/legoRangerModel';
import { CharacterAnimator } from '../game/character/characterAnimator';
import { sounds } from '../audio/soundSystem';
import { Shield, Sparkles, RefreshCw, Eye, Swords, Compass, Layers } from 'lucide-react';

interface CharacterInspectorProps {
  initialCustomization: CharacterCustomization;
  onApplyCustomization: (custom: CharacterCustomization) => void;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const CharacterInspector: React.FC<CharacterInspectorProps> = ({
  initialCustomization,
  onApplyCustomization,
  onClose,
  lang,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState<CharacterCustomization>(initialCustomization);
  const [pose, setPose] = useState<CharacterPose>('idle');
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraView, setCameraView] = useState<'front' | 'side' | 'back' | 'face' | 'gear'>('front');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rigsRef = useRef<CharacterRigs | null>(null);
  const animatorRef = useRef<CharacterAnimator | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCamPos = useRef(new THREE.Vector3(0, 1.2, 3.2));
  const targetCamLook = useRef(new THREE.Vector3(0, 1.0, 0));

  useEffect(() => {
    sounds.updateGameContext({
      inCombat: false,
      nearVillage: true,
      inDialogue: true,
    });
    return () => {
      sounds.updateGameContext({
        inCombat: false,
        nearVillage: false,
        inDialogue: false,
      });
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0F172A'); // Dark slate studio backdrop
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.2, 3.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const keyLight = new THREE.DirectionalLight('#FFFBEB', 2.2);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#93C5FD', 1.0);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#FBBF24', 1.6);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight('#334155', 0.8);
    scene.add(ambient);

    // Studio Pedestal / Round Platform
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.4, metalness: 0.2 })
    );
    pedestal.position.y = -0.09;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Stud ring around pedestal
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const stud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })
      );
      stud.position.set(Math.cos(angle) * 1.35, 0.02, Math.sin(angle) * 1.35);
      scene.add(stud);
    }

    // 5. Spawn 3D Character
    const rigs = createLegoRanger(custom);
    rigs.root.position.set(0, 0, 0);
    scene.add(rigs.root);
    rigsRef.current = rigs;

    const animator = new CharacterAnimator(rigs);
    animatorRef.current = animator;

    // 6. Mouse Orbit & Drag
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let orbitAngleH = 0;
    let orbitAngleV = 0.2;
    let orbitDist = 3.2;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      orbitAngleH -= dx * 0.008;
      orbitAngleV = Math.max(-0.4, Math.min(0.8, orbitAngleV + dy * 0.008));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      orbitDist = Math.max(1.2, Math.min(5.5, orbitDist + e.deltaY * 0.003));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    // 7. Render Loop
    let lastTime = performance.now();
    let animId: number;

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.06);
      lastTime = time;

      if (autoRotate && !isDragging) {
        orbitAngleH += delta * 0.5;
      }

      // Smooth camera interpolation towards target
      if (!isDragging) {
        camera.position.lerp(targetCamPos.current, 0.08);
      } else {
        const cx = Math.sin(orbitAngleH) * Math.cos(orbitAngleV) * orbitDist;
        const cy = 1.0 + Math.sin(orbitAngleV) * orbitDist;
        const cz = Math.cos(orbitAngleH) * Math.cos(orbitAngleV) * orbitDist;
        camera.position.set(cx, cy, cz);
      }

      camera.lookAt(targetCamLook.current);

      animator.update(delta, pose === 'run' ? 1.0 : 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Pose in Animator
  useEffect(() => {
    if (!animatorRef.current) return;
    if (pose === 'attack_slash') {
      animatorRef.current.triggerSwordAttack();
    } else if (pose === 'aim_bow') {
      animatorRef.current.startAimingBow();
    } else {
      animatorRef.current.setPose(pose);
    }
  }, [pose]);

  // Update Camera Presets matching reference sheet
  const setPresetView = (view: 'front' | 'side' | 'back' | 'face' | 'gear') => {
    setCameraView(view);
    setAutoRotate(false);

    if (view === 'front') {
      targetCamPos.current.set(0, 1.15, 2.9);
      targetCamLook.current.set(0, 1.0, 0);
    } else if (view === 'side') {
      targetCamPos.current.set(2.8, 1.15, 0.2);
      targetCamLook.current.set(0, 1.0, 0);
    } else if (view === 'back') {
      targetCamPos.current.set(0, 1.15, -2.9);
      targetCamLook.current.set(0, 1.0, 0);
    } else if (view === 'face') {
      targetCamPos.current.set(0, 1.52, 1.25);
      targetCamLook.current.set(0, 1.48, 0);
    } else if (view === 'gear') {
      targetCamPos.current.set(0.6, 0.95, 1.6);
      targetCamLook.current.set(0, 0.9, 0);
    }
  };

  const handleWeaponChange = (w: WeaponType) => {
    const updated = { ...custom, weapon: w };
    setCustom(updated);
    if (rigsRef.current) {
      rigsRef.current.sword.visible = w === 'sword';
      rigsRef.current.bow.visible = w === 'bow';
    }
    onApplyCustomization(updated);
  };

  const handleToggleCape = () => {
    const updated = { ...custom, capeVisible: !custom.capeVisible };
    setCustom(updated);
    if (rigsRef.current) {
      rigsRef.current.cape.visible = updated.capeVisible;
    }
    onApplyCustomization(updated);
  };

  const handleToggleBackpack = () => {
    const updated = { ...custom, backpackVisible: !custom.backpackVisible };
    setCustom(updated);
    if (rigsRef.current) {
      rigsRef.current.backpack.visible = updated.backpackVisible;
    }
    onApplyCustomization(updated);
  };

  const handleToggleQuiver = () => {
    const updated = { ...custom, quiverVisible: !custom.quiverVisible };
    setCustom(updated);
    if (rigsRef.current) {
      rigsRef.current.quiver.visible = updated.quiverVisible;
    }
    onApplyCustomization(updated);
  };

  const isFa = lang === 'fa';

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col backdrop-blur-md text-white select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-100">
              3D Hero Studio: Lego Fantasy Ranger
            </h2>
            <p className="text-xs text-slate-400">
              High-fidelity 3D procedural model built from the reference turnaround sheet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              autoRotate
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            Auto Rotate
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-colors"
          >
            Play Game
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* 3D Canvas Viewport */}
        <div ref={mountRef} className="flex-1 h-full cursor-grab active:cursor-grabbing relative" />

        {/* Floating Camera Angle Presets (Matches photo sheets!) */}
        <div className="absolute top-4 left-6 flex flex-wrap gap-1.5 p-1.5 bg-slate-900/80 border border-slate-700/60 rounded-xl backdrop-blur-md">
          {[
            { id: 'front', label: 'Front View' },
            { id: 'side', label: 'Side View' },
            { id: 'back', label: 'Back View' },
            { id: 'face', label: 'Face Detail' },
            { id: 'gear', label: 'Armor & Gear' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setPresetView(v.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                cameraView === v.id
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Right Configuration Inspector Panel */}
        <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900/90 backdrop-blur-md p-5 flex flex-col gap-6 overflow-y-auto">
          {/* Poses Section */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Animation Poses
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'idle', label: 'Idle Stance' },
                { id: 'run', label: 'Sprint / Run' },
                { id: 'attack_slash', label: 'Sword Strike' },
                { id: 'aim_bow', label: 'Bow Aim' },
                { id: 'victory', label: 'Victory Emote' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPose(p.id as any)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-start transition-all ${
                    pose === p.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Weapon Section */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              Equipped Weapon
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleWeaponChange('sword')}
                className={`flex-1 py-2.5 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  custom.weapon === 'sword'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Steel Broadsword
              </button>
              <button
                onClick={() => handleWeaponChange('bow')}
                className={`flex-1 py-2.5 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  custom.weapon === 'bow'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Recurve Bow
              </button>
            </div>
          </div>

          {/* Gear & Layer Toggles (Backpack, Quiver, Cape) */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Gear & Accessories
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleToggleCape}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                  custom.capeVisible
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                }`}
              >
                <span>Forest Cape & Cowl</span>
                <span className="font-mono text-[11px]">{custom.capeVisible ? 'EQUIPPED' : 'HIDDEN'}</span>
              </button>

              <button
                onClick={handleToggleBackpack}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                  custom.backpackVisible
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                }`}
              >
                <span>Explorer Backpack & Lantern</span>
                <span className="font-mono text-[11px]">{custom.backpackVisible ? 'EQUIPPED' : 'HIDDEN'}</span>
              </button>

              <button
                onClick={handleToggleQuiver}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                  custom.quiverVisible
                    ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                }`}
              >
                <span>Leather Quiver & Arrows</span>
                <span className="font-mono text-[11px]">{custom.quiverVisible ? 'EQUIPPED' : 'HIDDEN'}</span>
              </button>
            </div>
          </div>

          {/* Model Features Highlights */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
            <div className="font-semibold text-slate-200">Model Fidelity Highlights</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>Tiered stepped Lego brick hair with top studs</li>
              <li>Circular silver brooch medallion & crimson sash</li>
              <li>Tattered segmented cape with motion physics</li>
              <li>Studded leather greaves & adventurer boots</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
