/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { CharacterCustomization, PlayerStats } from './types/game';
import { RelicInventory, RelicQuest, NPCData } from './types/relic';
import { RelicHUD } from './components/RelicHUD';
import { NPCDialogueModal } from './components/NPCDialogueModal';
import { CharacterInspector } from './components/CharacterInspector';
import { TouchControls } from './components/TouchControls';
import { HelpModal } from './components/HelpModal';
import { ProjectFilesModal } from './components/ProjectFilesModal';
import { MainMenu } from './components/MainMenu';
import { MusicThemeModal } from './components/MusicThemeModal';
import { sounds } from './audio/soundSystem';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Player Vitals & Attributes
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    arrows: 30,
    maxArrows: 40,
    goldBricks: 5,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
  });

  // Authentic RELIC Inventory
  const [inventory, setInventory] = useState<RelicInventory>({
    resources: {
      wood: 1,
      iron: 0,
      crystal: 0,
      gold: 5,
      relic_shard: 0,
    },
    consumables: {
      potion: 3,
      food: 2,
      arrow: 30,
      bomb: 1,
      key: 0,
      scroll: 1,
    },
    equipment: {
      weapon: 'sword',
      offhand: 'shield',
      helmet: false,
      armor: true,
      gloves: true,
      boots: true,
    },
  });

  // Main Quest System
  const [activeQuest, setActiveQuest] = useState<RelicQuest>({
    id: 'main_find_relic',
    title: 'Find the lost relic',
    description: 'Explore the ancient forgotten world, gather materials, and discover the divine relic shard.',
    objectives: [
      { text: 'Collect 3 Wood', target: 3, current: 1, completed: false },
      { text: 'Collect 2 Iron', target: 2, current: 0, completed: false },
      { text: 'Find the Relic Shard at Ancient Temple', target: 1, current: 0, completed: false },
    ],
    reward: { gold: 50, xp: 200 },
    completed: false,
  });

  // 3D Lego Ranger Customization
  const [custom, setCustom] = useState<CharacterCustomization>({
    capeVisible: true,
    backpackVisible: false,
    quiverVisible: true,
    weapon: 'sword',
    cowlColor: '#284638',
    sashColor: '#932029',
  });

  // NPC Interaction States
  const [nearbyNPC, setNearbyNPC] = useState<NPCData | null>(null);
  const [activeDialogueNPC, setActiveDialogueNPC] = useState<NPCData | null>(null);

  // Player Transform for Compass
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 15 });
  const [playerYaw, setPlayerYaw] = useState<number>(0);

  // Modal Views
  const [showStudio, setShowStudio] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showFiles, setShowFiles] = useState<boolean>(false);
  const [showMusicThemes, setShowMusicThemes] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bgmActive, setBgmActive] = useState<boolean>(false);

  useEffect(() => {
    return sounds.subscribe((s) => {
      setIsMuted(s.isMuted);
      setBgmActive(s.isPlaying);
    });
  }, []);

  // Freeze the world while the menu is open; Esc toggles the menu during play
  useEffect(() => {
    if (engineRef.current) engineRef.current.paused = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hasStarted && !showHelp && !showMusicThemes && !showStudio && !showFiles && !activeDialogueNPC) {
        setMenuOpen((m) => !m);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasStarted, showHelp, showMusicThemes, showStudio, showFiles, activeDialogueNPC]);

  const handlePlay = () => {
    setHasStarted(true);
    setMenuOpen(false);
    if (!bgmActive) sounds.toggleBGM(true);
  };

  // Initialize GameEngine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onStatsUpdate: (s) => setStats({ ...s }),
      onInventoryUpdate: (inv) => setInventory({ ...inv }),
      onQuestUpdate: (q) => setActiveQuest({ ...q }),
      onNearbyNPCChange: (npc) => setNearbyNPC(npc),
    });
    engineRef.current = engine;
    engine.paused = true; // start on the main menu

    // Tracker interval for player position & yaw
    const trackerId = setInterval(() => {
      if (engine && !engine['isDestroyed']) {
        setPlayerPos({ x: engine.physics.position.x, z: engine.physics.position.z });
        setPlayerYaw(engine.cameraController.getYaw());
      }
    }, 120);

    return () => {
      clearInterval(trackerId);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleSetWeapon = (w: 'sword' | 'bow') => {
    if (engineRef.current) {
      engineRef.current.setWeapon(w);
    }
    setInventory((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        weapon: w,
      },
    }));
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sounds.setMute(nextMute);
  };

  const handleToggleBgm = () => {
    const nextBgm = !bgmActive;
    setBgmActive(nextBgm);
    sounds.toggleBGM(nextBgm);
  };

  const handleApplyCustomization = (updated: CharacterCustomization) => {
    setCustom(updated);
    if (engineRef.current) {
      engineRef.current.customization = updated;
      engineRef.current.rigs.cape.visible = updated.capeVisible;
      engineRef.current.rigs.backpack.visible = updated.backpackVisible;
      engineRef.current.rigs.quiver.visible = updated.quiverVisible;
      engineRef.current.setWeapon(updated.weapon === 'sword' ? 'sword' : 'bow');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans" dir="ltr">
      {/* 3D WebGL Game Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Authentic RELIC HUD Interface */}
      {!menuOpen && !showStudio && !showFiles && !activeDialogueNPC && (
        <RelicHUD
          health={stats.health}
          maxHealth={stats.maxHealth}
          xp={stats.exp}
          nextLevelXp={stats.nextLevelExp}
          level={stats.level}
          stamina={stats.stamina}
          maxStamina={stats.maxStamina}
          inventory={inventory}
          activeQuest={activeQuest}
          nearbyNPC={nearbyNPC}
          onTalkNPC={(npc) => setActiveDialogueNPC(npc)}
          playerPos={playerPos}
          playerYaw={playerYaw}
          onSetWeapon={handleSetWeapon}
          onOpenFiles={() => setShowFiles(true)}
          onOpenStudio={() => setShowStudio(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          bgmActive={bgmActive}
          onToggleBgm={handleToggleBgm}
          onOpenMusicThemes={() => setShowMusicThemes(true)}
        />
      )}

      {/* On-screen Touch Controls (for mobile & tablet cross-platform gameplay) */}
      {!menuOpen && !showStudio && !showFiles && !showMusicThemes && !activeDialogueNPC && (
        <TouchControls
          onVirtualMove={(x, y, sprint) => {
            if (engineRef.current) {
              engineRef.current.input.virtualTouch.x = x;
              engineRef.current.input.virtualTouch.y = y;
              engineRef.current.input.virtualTouch.sprint = sprint;
            }
          }}
          onAttack={() => engineRef.current?.attack()}
          onJump={() => engineRef.current?.jump()}
          onRoll={() => engineRef.current?.dodgeRoll()}
          onInteract={() => engineRef.current?.interact()}
          weapon={inventory.equipment.weapon === 'sword' ? 'sword' : 'bow'}
          onSwitchWeapon={() => handleSetWeapon(inventory.equipment.weapon === 'sword' ? 'bow' : 'sword')}
          lang="en"
        />
      )}

      {/* Floating menu button (mobile has no Esc key) */}
      {!menuOpen && hasStarted && (
        <button
          onClick={() => setMenuOpen(true)}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1 rounded-full bg-slate-900/70 text-white text-xs border border-white/20 backdrop-blur-md"
        >
          Menu
        </button>
      )}

      {/* Main / Pause Menu over a blurred live view of the game world */}
      {menuOpen && (
        <MainMenu
          resumeMode={hasStarted}
          isMuted={isMuted}
          onPlay={handlePlay}
          onHelp={() => setShowHelp(true)}
          onMusic={() => setShowMusicThemes(true)}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* NPC Interactive Dialogue Modal */}
      {activeDialogueNPC && (
        <NPCDialogueModal
          npc={activeDialogueNPC}
          onClose={() => setActiveDialogueNPC(null)}
          onCompleteObjective={(type) => {
            if (type === 'forge_shield') {
              setInventory((prev) => ({
                ...prev,
                equipment: { ...prev.equipment, offhand: 'shield' },
              }));
            }
          }}
        />
      )}

      {/* 3D Character Inspector Modal / Studio */}
      {showStudio && (
        <CharacterInspector
          initialCustomization={custom}
          onApplyCustomization={handleApplyCustomization}
          onClose={() => setShowStudio(false)}
          lang="en"
        />
      )}

      {/* Project Files & ZIP Export Modal */}
      {showFiles && <ProjectFilesModal onClose={() => setShowFiles(false)} />}

      {/* Music Themes & Audio Manager Modal */}
      {showMusicThemes && <MusicThemeModal onClose={() => setShowMusicThemes(false)} />}

      {/* Controls & Gameplay Guide Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
