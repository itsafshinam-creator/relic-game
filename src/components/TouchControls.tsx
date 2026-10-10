import React, { useRef, useState } from 'react';
import { Swords, Target, ArrowUp, RefreshCw, Zap, Hand } from 'lucide-react';
import { WeaponType } from '../types/game';

interface TouchControlsProps {
  onVirtualMove: (x: number, y: number, sprint: boolean) => void;
  onAttack: () => void;
  onJump: () => void;
  onRoll: () => void;
  onInteract?: () => void;
  weapon: WeaponType;
  onSwitchWeapon: () => void;
  lang: 'fa' | 'en';
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onVirtualMove,
  onAttack,
  onJump,
  onRoll,
  onInteract,
  weapon,
  onSwitchWeapon,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activeTouchId, setActiveTouchId] = useState<number | null>(null);
  const [isSprinting, setIsSprinting] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTouchId !== null) return;
    const touch = e.changedTouches[0];
    setActiveTouchId(touch.identifier);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        setActiveTouchId(null);
        setKnobPos({ x: 0, y: 0 });
        onVirtualMove(0, 0, false);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2 - 16;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * clampedDist) / maxRadius;
    const ny = (Math.sin(angle) * clampedDist) / maxRadius;

    setKnobPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });

    // In Three.js camera-relative coordinates: pushing UP (-dy) is forward (+ny)
    onVirtualMove(nx, -ny, isSprinting);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-4 md:p-6 select-none md:hidden">
      {/* Virtual Analog Joystick (Left Side) */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-32 h-32 rounded-full bg-slate-950/70 border border-slate-700/70 backdrop-blur-md relative flex items-center justify-center pointer-events-auto touch-none shadow-2xl"
      >
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-white/50 shadow-lg flex items-center justify-center text-white"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/70" />
        </div>
      </div>

      {/* Action Buttons (Right Side) */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {/* Secondary Row: Weapon Switch, Sprint, Interact */}
        <div className="flex gap-2.5">
          {onInteract && (
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onInteract();
              }}
              className="w-12 h-12 rounded-full bg-amber-600/90 border border-amber-400 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              title="Interact / Harvest / Talk"
            >
              <Hand className="w-5 h-5" />
            </button>
          )}

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              const nextSprint = !isSprinting;
              setIsSprinting(nextSprint);
              onVirtualMove(knobPos.x ? knobPos.x / 40 : 0, knobPos.y ? -knobPos.y / 40 : 0, nextSprint);
            }}
            className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs font-bold shadow-lg transition-transform active:scale-95 ${
              isSprinting
                ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 border-slate-700 text-amber-400'
            }`}
            title="Sprint"
          >
            <Zap className="w-5 h-5" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onSwitchWeapon();
            }}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            title="Switch Weapon"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Row: Roll, Jump, Attack */}
        <div className="flex items-center gap-2.5">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onRoll();
            }}
            className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold shadow-lg active:scale-95 transition-transform"
          >
            ROLL
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onJump();
            }}
            className="w-14 h-14 rounded-full bg-blue-600/95 border border-blue-400 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <ArrowUp className="w-6 h-6" />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onAttack();
            }}
            className="w-16 h-16 rounded-full bg-red-600/95 border border-red-400 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            {weapon === 'sword' ? <Swords className="w-7 h-7" /> : <Target className="w-7 h-7" />}
          </button>
        </div>
      </div>
    </div>
  );
};
