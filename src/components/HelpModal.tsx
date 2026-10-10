import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Controls & Gameplay Guide</h3>
            <p className="text-xs text-slate-400">Master your Lego Ranger in the Brick Realm</p>
          </div>
        </div>

        {/* Keybindings Grid */}
        <div className="space-y-2.5 text-xs mb-6">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Movement & Sprint</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                W A S D
              </kbd>
              <span className="text-slate-500">+</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                Shift
              </kbd>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Sword Strike Combo</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                F
              </kbd>
              <span className="text-slate-500">or</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                Left Click
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Recurve Bow Aim & Shoot</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                Q
              </kbd>
              <span className="text-slate-500">or</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                Right Click
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Dodge Roll / Evasive Tumble</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
              C
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Jump</span>
            <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
              Space
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Switch Weapon (Sword / Bow)</span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">1</kbd>
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">2</kbd>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Interact / Open Treasure Chest</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
              E
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-300 font-medium">Camera Orbit / Zoom</span>
            <span className="text-slate-400 text-[11px]">Mouse Drag + Scroll Wheel</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-950/40"
        >
          Got It, Resume Adventure
        </button>
      </div>
    </div>
  );
};
