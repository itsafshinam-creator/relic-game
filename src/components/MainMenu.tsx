import React, { useEffect, useState } from 'react';
import { Play, BookOpen, Music, Volume2, VolumeX } from 'lucide-react';

interface MainMenuProps {
  resumeMode: boolean;
  isMuted: boolean;
  onPlay: () => void;
  onHelp: () => void;
  onMusic: () => void;
  onToggleMute: () => void;
}

// Start / pause menu. The blurred backdrop is the live 3D game scene rendered behind it.
export const MainMenu: React.FC<MainMenuProps> = ({ resumeMode, isMuted, onPlay, onHelp, onMusic, onToggleMute }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const btn =
    'group w-72 flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-white/20 bg-white/10 ' +
    'hover:bg-amber-400/90 hover:text-slate-900 hover:border-amber-300 text-white font-semibold tracking-wide ' +
    'backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer';

  return (
    <div
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        background: 'radial-gradient(ellipse at center, rgba(2,6,23,0.25) 0%, rgba(2,6,23,0.7) 100%)',
      }}
    >
      <div className="text-center mb-10 px-4">
        <p className="text-amber-300/90 tracking-[0.5em] text-xs sm:text-sm mb-3 uppercase">Lego Ranger</p>
        <h1
          className="text-5xl sm:text-7xl font-extrabold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}
        >
          RELIC
        </h1>
        <p className="text-slate-200/90 mt-2 text-lg sm:text-xl" style={{ fontFamily: "'Cinzel', serif" }}>
          The Lost World
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button className={btn} onClick={onPlay} autoFocus>
          <Play size={20} /> {resumeMode ? 'Resume' : 'Start Adventure'}
        </button>
        <button className={btn} onClick={onHelp}>
          <BookOpen size={20} /> How to Play
        </button>
        <button className={btn} onClick={onMusic}>
          <Music size={20} /> Music
        </button>
        <button className={btn} onClick={onToggleMute}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />} Sound: {isMuted ? 'Off' : 'On'}
        </button>
      </div>

      <p className="absolute bottom-6 text-slate-300/70 text-xs">Press Esc during the game to return to this menu</p>
    </div>
  );
};
