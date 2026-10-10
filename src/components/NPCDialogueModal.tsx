import React from 'react';
import { NPCData } from '../types/relic';
import { X, MessageSquare, Shield, Sparkles, ShoppingBag } from 'lucide-react';
import { sounds } from '../audio/soundSystem';

interface NPCDialogueModalProps {
  npc: NPCData;
  onClose: () => void;
  onCompleteObjective?: (type: string) => void;
}

export const NPCDialogueModal: React.FC<NPCDialogueModalProps> = ({ npc, onClose, onCompleteObjective }) => {
  React.useEffect(() => {
    sounds.updateGameContext({
      inCombat: false,
      nearVillage: true,
      inDialogue: true,
    });
    return () => {
      sounds.updateGameContext({
        inCombat: false,
        nearVillage: true,
        inDialogue: false,
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl w-full max-w-xl p-6 text-white shadow-2xl relative flex flex-col gap-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* NPC Profile Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            {npc.type === 'toren' && <Shield className="w-6 h-6" />}
            {npc.type === 'mara' && <Sparkles className="w-6 h-6" />}
            {npc.type === 'merchant' && <ShoppingBag className="w-6 h-6" />}
            {npc.type === 'guard' && <Shield className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-amber-400">{npc.name}</h3>
            <p className="text-xs text-slate-400">{npc.title}</p>
          </div>
        </div>

        {/* Dialogue Lines */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 text-sm text-slate-200 font-sans leading-relaxed">
          {npc.dialogue.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        {/* Action Choices */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {npc.type === 'toren' && (
            <button
              onClick={() => {
                sounds.playChestOpen();
                onCompleteObjective?.('forge_shield');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
            >
              Forge Reinforced Shield
            </button>
          )}

          {npc.type === 'merchant' && (
            <button
              onClick={() => {
                sounds.playCoinPickup();
                onCompleteObjective?.('buy_supplies');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
            >
              Restock Arrows & Potions
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Farewell
          </button>
        </div>
      </div>
    </div>
  );
};
