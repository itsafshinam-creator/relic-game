import React, { useState, useEffect } from 'react';
import { RelicInventory, RelicQuest, NPCData } from '../types/relic';
import {
  Shield,
  Heart,
  Zap,
  Crosshair,
  Volume2,
  VolumeX,
  Music,
  Compass,
  Package,
  User,
  Sparkles,
  Map,
  Settings,
  X,
  Check,
  MessageSquare,
  Flame,
  Swords,
  Target,
} from 'lucide-react';
import { sounds } from '../audio/soundSystem';

interface RelicHUDProps {
  health: number;
  maxHealth: number;
  xp: number;
  nextLevelXp: number;
  level: number;
  stamina: number;
  maxStamina: number;
  inventory: RelicInventory;
  activeQuest: RelicQuest;
  nearbyNPC: NPCData | null;
  onTalkNPC: (npc: NPCData) => void;
  playerPos: { x: number; z: number };
  playerYaw: number;
  onSetWeapon: (w: 'sword' | 'bow') => void;
  onOpenFiles: () => void;
  onOpenStudio?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bgmActive: boolean;
  onToggleBgm: () => void;
  onOpenMusicThemes?: () => void;
}

export const RelicHUD: React.FC<RelicHUDProps> = ({
  health,
  maxHealth,
  xp,
  nextLevelXp,
  level,
  stamina,
  maxStamina,
  inventory,
  activeQuest,
  nearbyNPC,
  onTalkNPC,
  playerPos,
  playerYaw,
  onSetWeapon,
  onOpenFiles,
  onOpenStudio,
  isMuted,
  onToggleMute,
  bgmActive,
  onToggleBgm,
  onOpenMusicThemes,
}) => {
  const [activeTab, setActiveTab] = useState<'none' | 'inventory' | 'character' | 'skills' | 'map' | 'settings'>('none');
  const [audioState, setAudioState] = useState(sounds.getState());

  useEffect(() => {
    return sounds.subscribe((s) => setAudioState({ ...s }));
  }, []);

  const hpPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const xpPercent = Math.max(0, Math.min(100, (xp / nextLevelXp) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (stamina / maxStamina) * 100));

  // Compass degrees based on camera/player yaw
  const compassAngle = (playerYaw * (180 / Math.PI)) % 360;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none font-sans z-10 text-white">
      {/* ------------------------------------------------------------- */}
      {/* TOP ROW: Character Card & Main Quest (Left), Compass (Right)  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-start justify-between gap-4 pointer-events-auto">
        {/* Top-Left: Game Title Banner & SEEKER Profile Card */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/90 border border-amber-500/40 rounded-xl backdrop-blur-md w-fit shadow-md">
            <span className="text-amber-400 font-extrabold font-serif tracking-wider text-xs">RELIC</span>
            <span className="text-slate-400 text-[10px] uppercase tracking-widest font-sans font-semibold">The Lost World</span>
          </div>

          {/* Character Identity & Status Bars */}
          <div className="flex items-center gap-3.5 bg-slate-950/85 border border-slate-700/80 p-3 rounded-2xl backdrop-blur-md shadow-2xl">
            {/* Seeker Portrait Icon */}
            <div className="w-14 h-14 rounded-xl border border-amber-500/50 bg-gradient-to-b from-slate-800 to-slate-950 p-0.5 flex items-center justify-center relative overflow-hidden shadow-inner">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <rect width="64" height="64" fill="#1e293b" rx="8" />
                {/* Green cowl collar */}
                <path d="M14 60 C14 42 20 36 32 36 C44 36 50 42 50 60 Z" fill="#284638" />
                {/* Crimson sash and tan tunic */}
                <path d="M22 44 L38 60 L44 60 L28 44 Z" fill="#932029" />
                <circle cx="23" cy="45" r="2.5" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="0.8" />
                {/* Face base */}
                <rect x="22" y="18" width="20" height="20" rx="3" fill="#e5aa82" />
                {/* Dark styled hair */}
                <path d="M19 19 C19 12 24 10 32 10 C40 10 45 12 45 19 L45 25 L41 23 L41 18 L23 18 L23 23 L19 25 Z" fill="#2a1a12" />
                <path d="M22 18 L30 22 L38 18 Z" fill="#2a1a12" />
                {/* Beard stubble & chin */}
                <rect x="27" y="32" width="10" height="5" rx="1.5" fill="#261914" />
                <path d="M26 30 Q32 29 38 30 Q35 32 32 31 Q29 32 26 30 Z" fill="#261914" />
                {/* Determined Eyes with catchlights */}
                <ellipse cx="27" cy="25" rx="2.5" ry="2.2" fill="#1e293b" />
                <circle cx="26.3" cy="24.3" r="0.8" fill="#ffffff" />
                <ellipse cx="37" cy="25" rx="2.5" ry="2.2" fill="#1e293b" />
                <circle cx="36.3" cy="24.3" r="0.8" fill="#ffffff" />
                {/* Brows */}
                <line x1="24" y1="21" x2="29" y2="22" stroke="#1b130e" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="40" y1="21" x2="35" y2="22" stroke="#1b130e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-slate-950 font-extrabold text-[9px] text-center uppercase tracking-wider">
                Lv {level}
              </div>
            </div>

            {/* Vitals Bars */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold tracking-wider">
                <span className="text-slate-100 font-serif">SEEKER</span>
                <span className="text-[10px] text-red-400 font-mono">
                  HP {health}/{maxHealth}
                </span>
              </div>

              {/* Health Bar (Red Gradient) */}
              <div className="w-48 h-2.5 bg-slate-900 border border-slate-700/80 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-red-700 via-red-500 to-rose-400 rounded-full transition-all duration-200"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* XP Bar (Cyan/Blue Gradient) */}
              <div className="w-48 h-2 bg-slate-900 border border-slate-700/80 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* MAIN QUEST Tracker Widget (Direct replication of reference sheet) */}
          <div className="bg-slate-950/85 border border-slate-700/80 p-3.5 rounded-2xl backdrop-blur-md shadow-xl flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-amber-400 uppercase font-serif">
              <span>MAIN QUEST</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div className="font-semibold text-slate-100">{activeQuest.title}</div>

            <div className="flex flex-col gap-1 mt-1 text-[11px]">
              {activeQuest.objectives.map((obj, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 ${
                    obj.completed ? 'text-emerald-400 line-through opacity-80' : 'text-slate-300'
                  }`}
                >
                  <span className="font-mono text-xs">{obj.completed ? '✓' : '•'}</span>
                  <span>{obj.text}</span>
                  <span className="font-mono text-[10px] text-slate-400 ml-auto">
                    ({obj.current}/{obj.target})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top-Right: Circular Minimap / Compass & System Controls */}
        <div className="flex flex-col items-end gap-2.5">
          {/* System Action Controls */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 p-1 rounded-2xl backdrop-blur-md shadow-lg">
            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                title="3D Character Inspector"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Hero</span>
              </button>
            )}
            <button
              onClick={onOpenFiles}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors"
              title="Project Files & ZIP"
            >
              Files & ZIP
            </button>
            <button
              onClick={onOpenMusicThemes || onToggleBgm}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                audioState.isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="تنظیمات تم‌های موسیقی و صدا / Music Themes"
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {audioState.isPlaying
                  ? audioState.currentTheme === 'soft_piano'
                    ? 'Piano Warmth'
                    : audioState.currentTheme === 'battle'
                    ? 'Battle Theme'
                    : 'Adventure'
                  : 'Music'}
              </span>
            </button>
            <button onClick={onToggleMute} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Compass Radar Widget (from Asset Sheet) */}
          <div className="w-28 h-28 rounded-full bg-slate-950/90 border-2 border-slate-700/90 backdrop-blur-md shadow-2xl relative flex items-center justify-center p-1.5 overflow-hidden">
            {/* Compass Outer Ring with Cardinal Directions */}
            <div className="absolute inset-1 rounded-full border border-slate-600/40" />

            <div className="absolute top-1 font-mono text-[10px] font-bold text-amber-400">N</div>
            <div className="absolute bottom-1 font-mono text-[10px] font-bold text-slate-400">S</div>
            <div className="absolute right-1.5 font-mono text-[10px] font-bold text-slate-400">E</div>
            <div className="absolute left-1.5 font-mono text-[10px] font-bold text-slate-400">W</div>

            {/* Rotating dial needle */}
            <div
              className="w-12 h-12 flex items-center justify-center transition-transform duration-100"
              style={{ transform: `rotate(${-compassAngle}deg)` }}
            >
              <div className="w-0.5 h-7 bg-gradient-to-t from-transparent via-red-500 to-red-400 rounded-full" />
            </div>

            {/* Center Player Dot */}
            <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white/40 shadow-sm z-10" />

            {/* Temple Relic Radar Blip (North) */}
            <div className="absolute top-5 left-12 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MIDDLE: NPC Interaction Prompt (Talk with E)                  */}
      {/* ------------------------------------------------------------- */}
      {nearbyNPC && (
        <div className="self-center pointer-events-auto bg-slate-950/90 border-2 border-amber-500/70 px-5 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-3 animate-bounce">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <span className="text-slate-400">Press </span>
            <kbd className="px-2 py-0.5 rounded bg-amber-500 font-bold text-slate-950 font-mono text-xs">E</kbd>
            <span className="text-slate-200"> to speak with </span>
            <strong className="text-amber-300">{nearbyNPC.name} ({nearbyNPC.title})</strong>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM ROW: Hotbar (Center) & Action Buttons Dock (Bottom)     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col items-center gap-3 pointer-events-auto">
        {/* Weapon Hotbar: [1] Sword & Shield, [2] Bow */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/85 border border-slate-700/80 rounded-2xl backdrop-blur-md shadow-xl">
          <button
            onClick={() => onSetWeapon('sword')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              inventory.equipment.weapon === 'sword'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>[1] Steel Sword & Shield</span>
          </button>

          <button
            onClick={() => onSetWeapon('bow')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              inventory.equipment.weapon === 'bow'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>[2] Hunting Bow ({inventory.consumables.arrow})</span>
          </button>
        </div>

        {/* Bottom Dock Icons (Matching Asset Sheet: Inventory, Character, Skills, Map, Settings) */}
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 p-2 rounded-2xl backdrop-blur-md shadow-2xl">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'character', label: 'Character', icon: User },
            { id: 'skills', label: 'Skills', icon: Swords },
            { id: 'map', label: 'Map', icon: Map },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(isActive ? 'none' : (tab.id as any))}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-lg'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INVENTORY / CHARACTER / SKILLS MODAL PANELS                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab !== 'none' && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h2 className="text-base font-bold font-serif uppercase tracking-wider text-amber-400">
                {activeTab} Overview
              </h2>
              <button
                onClick={() => setActiveTab('none')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'inventory' && (
                <div className="flex flex-col gap-6">
                  {/* Resources Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Harvested Resources (Crafting)
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { label: 'Wood', count: inventory.resources.wood, color: 'text-amber-500' },
                        { label: 'Iron Ore', count: inventory.resources.iron, color: 'text-slate-300' },
                        { label: 'Arcane Crystal', count: inventory.resources.crystal, color: 'text-cyan-400' },
                        { label: 'Gold Nuggets', count: inventory.resources.gold, color: 'text-yellow-400' },
                        { label: 'Relic Shards', count: inventory.resources.relic_shard, color: 'text-sky-300' },
                      ].map((r, i) => (
                        <div
                          key={i}
                          className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col items-center text-center"
                        >
                          <span className={`text-xl font-bold font-mono ${r.color}`}>{r.count}</span>
                          <span className="text-[11px] text-slate-400 mt-1">{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consumables & Gear */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Consumables & Tools
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Healing Elixirs', count: inventory.consumables.potion },
                        { label: 'Provisions / Food', count: inventory.consumables.food },
                        { label: 'Arrows', count: inventory.consumables.arrow },
                        { label: 'Explosive Bombs', count: inventory.consumables.bomb },
                        { label: 'Dungeon Keys', count: inventory.consumables.key },
                        { label: 'Ancient Scrolls', count: inventory.consumables.scroll },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-300">{item.label}</span>
                          <span className="font-mono font-bold text-amber-400">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'character' && (
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Equipped Gear</h3>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Primary Weapon</span>
                      <span className="font-semibold text-slate-200">Steel Broadsword</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Off-Hand</span>
                      <span className="font-semibold text-slate-200">Round Viking Shield</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Armor</span>
                      <span className="font-semibold text-slate-200">Studded Leather Cuirass</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Cloak</span>
                      <span className="font-semibold text-slate-200">Forest Green Mantle</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Base Attributes</h3>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Strength</span>
                      <span className="font-mono font-bold text-slate-200">18</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Agility</span>
                      <span className="font-mono font-bold text-slate-200">22</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Archery</span>
                      <span className="font-mono font-bold text-slate-200">24</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Vitality</span>
                      <span className="font-mono font-bold text-slate-200">20</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-amber-300">Blade Flurry (Passive)</div>
                    <div className="text-slate-400 mt-1">Converts consecutive sword strikes into critical combos.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-amber-300">Hawkeye Archery (Passive)</div>
                    <div className="text-slate-400 mt-1">Increases arrow flight speed and grants bonus damage on distant foes.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="font-bold text-amber-300">Relic Resonator (Active)</div>
                    <div className="text-slate-400 mt-1">Channels arcane energy from the lost relic shard to stun guardians.</div>
                  </div>
                </div>
              )}

              {activeTab === 'map' && (
                <div className="text-center p-6 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <Compass className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <div className="font-bold text-slate-200 mb-1">Realm Map: The Lost World</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    • Outpost (South-West)<br />
                    • Village & Blacksmith Forge (East)<br />
                    • Crystal Pond & Bridge (Central-West)<br />
                    • Ancient Temple & Relic (Far North)<br />
                    • Dungeon Entrance (North-West)
                  </p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span>Atmospheric Fog & Ground Mist</span>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span>Audio & Sound Effects</span>
                    <button
                      onClick={onToggleMute}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-200 font-semibold"
                    >
                      {isMuted ? 'Muted' : 'Enabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">تم‌های موسیقی بازی (4 قطعه با صدای ملایم)</div>
                      <div className="text-[11px] text-amber-400/90 font-mono">
                        {audioState.isPlaying ? `در حال پخش: ${audioState.currentTheme}` : 'توقف'}
                      </div>
                    </div>
                    <button
                      onClick={onOpenMusicThemes}
                      className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 transition-colors"
                    >
                      تنظیمات تم‌ها
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
