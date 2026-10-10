import React from 'react';
import { CharacterCustomization, PlayerStats, Quest, WeaponType } from '../types/game';
import {
  Shield,
  Heart,
  Zap,
  Target,
  Swords,
  Crosshair,
  Volume2,
  VolumeX,
  Music,
  User,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  FolderCode,
} from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  quests: Quest[];
  combo: number;
  custom: CharacterCustomization;
  onSetWeapon: (w: WeaponType) => void;
  onOpenStudio: () => void;
  onOpenFiles: () => void;
  onToggleHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bgmActive: boolean;
  onToggleBgm: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  quests,
  combo,
  custom,
  onSetWeapon,
  onOpenStudio,
  onOpenFiles,
  onToggleHelp,
  isMuted,
  onToggleMute,
  bgmActive,
  onToggleBgm,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (stats.stamina / stats.maxStamina) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none font-sans z-10">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between gap-4 pointer-events-auto">
        {/* Brand & Hero Identity */}
        <div className="flex items-center gap-3 bg-slate-950/75 border border-slate-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">
              Lego Ranger: Brick Realm
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-semibold text-amber-400">Level {stats.level}</span>
              <span aria-hidden="true">·</span>
              <span>Forest Vanguard</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 bg-slate-950/75 border border-slate-800/80 p-1.5 rounded-2xl backdrop-blur-md shadow-lg">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
            title="Inspect & Customize 3D Character"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Hero Studio</span>
          </button>

          <button
            onClick={onOpenFiles}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-colors"
            title="View Project Code & Download ZIP"
          >
            <FolderCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Files & ZIP</span>
          </button>

          <button
            onClick={onToggleBgm}
            className={`p-2 rounded-xl transition-colors ${
              bgmActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white transition-colors"
            title="Sound Effects"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleHelp}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white transition-colors"
            title="Controls & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Middle Center Floating Notifications / Combo Counter */}
      {combo > 1 && (
        <div className="self-center flex flex-col items-center animate-bounce pointer-events-none">
          <div className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-extrabold text-sm md:text-base tracking-wider shadow-2xl border border-yellow-300/50">
            {combo}x STRIKE COMBO!
          </div>
        </div>
      )}

      {/* Bottom Interface HUD (Vitals, Weapon Selector, Quests) */}
      <footer className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 pointer-events-none">
        {/* Left: Player Vitals (HP, Stamina, XP) */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md shadow-xl pointer-events-auto flex flex-col gap-2.5 max-w-xs">
          {/* Health Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5 text-red-400">
                <Heart className="w-3.5 h-3.5 fill-red-500" />
                Health
              </span>
              <span className="font-mono text-[11px] tabular-nums">
                {stats.health} / {stats.maxHealth}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-emerald-500 rounded-full transition-all duration-200"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
                Stamina
              </span>
              <span className="font-mono text-[11px] tabular-nums">{Math.floor(stats.stamina)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-150"
                style={{ width: `${staminaPercent}%` }}
              />
            </div>
          </div>

          {/* Inventory Counters (Gold Bricks & Arrows) */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.goldBricks}</span>
              <span className="text-[10px] text-slate-400 font-normal">Gold Bricks</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>{stats.arrows}</span>
              <span className="text-[10px] text-slate-400 font-normal">Arrows</span>
            </div>
          </div>
        </div>

        {/* Center: Weapon Hotbar (1: Sword / 2: Bow) */}
        <div className="justify-self-center pointer-events-auto flex items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-xl">
          <button
            onClick={() => onSetWeapon('sword')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              custom.weapon === 'sword'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-950/40'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <div className="text-start">
              <div className="text-[10px] font-mono text-slate-400">[1]</div>
              <div>Steel Broadsword</div>
            </div>
          </button>

          <button
            onClick={() => onSetWeapon('bow')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              custom.weapon === 'bow'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-950/40'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <div className="text-start">
              <div className="text-[10px] font-mono text-slate-400">[2]</div>
              <div>Recurve Bow</div>
            </div>
          </button>
        </div>

        {/* Right: Quest Tracker */}
        <div className="justify-self-end bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md shadow-xl pointer-events-auto w-full max-w-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Active Quests
            </span>
            <span className="text-[11px] text-slate-400">
              {quests.filter((q) => q.completed).length}/{quests.length}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {quests.map((q) => (
              <div
                key={q.id}
                className={`p-2 rounded-lg text-xs border transition-colors ${
                  q.completed
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="truncate">{q.titleEn}</span>
                  {q.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="font-mono text-[10px] text-amber-400 shrink-0">
                      {q.currentCount}/{q.targetCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{q.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
