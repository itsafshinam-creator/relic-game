import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  ShieldAlert,
  Compass,
  Headphones,
  Upload,
  Radio,
  Sliders,
  Check,
} from 'lucide-react';
import { sounds, AudioState, THEME_TRACKS, BgmThemeId } from '../audio/soundSystem';

interface MusicThemeModalProps {
  onClose: () => void;
}

export const MusicThemeModal: React.FC<MusicThemeModalProps> = ({ onClose }) => {
  const [audioState, setAudioState] = useState<AudioState>(sounds.getState());
  const [testSparkleActive, setTestSparkleActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = sounds.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    sounds.toggleBGM();
  };

  const handleSelectTheme = (themeId: BgmThemeId) => {
    if (!audioState.isPlaying) {
      sounds.toggleBGM(true);
    }
    sounds.setAdaptiveMusic(false);
    sounds.setTheme(themeId, true);
  };

  const handleToggleAdaptive = () => {
    const next = !audioState.isAdaptive;
    sounds.setAdaptiveMusic(next);
    if (!audioState.isPlaying) {
      sounds.toggleBGM(true);
    }
  };

  const handleTestSparkle = () => {
    sounds.playCoinSparkle();
    setTestSparkleActive(true);
    setTimeout(() => setTestSparkleActive(false), 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.setCustomAudio(file);
      if (!audioState.isPlaying) {
        sounds.toggleBGM(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-5 md:p-6 text-white shadow-2xl relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="بستن / Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              تنظیمات تم‌های موسیقی و صدا
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                صدای ملایم (Low Volume)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Game Music Themes & Dynamic Adaptive Audio System
            </p>
          </div>
        </div>

        {/* Currently Playing Bar */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleTogglePlay}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                audioState.isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {audioState.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 truncate">
                  {THEME_TRACKS[audioState.currentTheme]?.title || 'Unknown Theme'}
                </span>
                {audioState.isPlaying && (
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                    <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-2.5 bg-amber-400 animate-pulse delay-150" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {audioState.isAdaptive
                  ? `حالت خودکار هوشمند (${audioState.contextMode})`
                  : 'پخش دستی ثابت'}
              </p>
            </div>
          </div>

          {/* Adaptive Mode Switcher */}
          <button
            onClick={handleToggleAdaptive}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              audioState.isAdaptive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="تغییر خودکار تم‌ها بسته به وضعیت بازی (روستا، ماجراجویی، نبرد)"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{audioState.isAdaptive ? 'تطبیقی فعال' : 'تطبیقی خاموش'}</span>
          </button>
        </div>

        {/* The 4 Game Themes Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>تم‌های طراحی‌شده برای بخش‌های مختلف بازی:</span>
            <span>انتخاب تم</span>
          </div>

          {/* 1. Soft Piano Warmth */}
          <div
            onClick={() => handleSelectTheme('soft_piano')}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
              audioState.currentTheme === 'soft_piano'
                ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base">
                🎹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-200">Soft Piano Warmth</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    روستا و آرامش
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  پیانو گرم و آرامش‌بخش برای اردوگاه، صحبت با شخصیت‌ها و محیط امن
                </p>
              </div>
            </div>
            {audioState.currentTheme === 'soft_piano' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* 2. Adventure Theme */}
          <div
            onClick={() => handleSelectTheme('adventure')}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
              audioState.currentTheme === 'adventure'
                ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-200">Adventure Theme</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    گشت‌وگذار در جهان
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تم حماسی و الهام‌بخش برای دویدن در دشت‌ها، کشف خرابه‌ها و جنگل‌ها
                </p>
              </div>
            </div>
            {audioState.currentTheme === 'adventure' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* 3. Adventure Theme (1) / Battle */}
          <div
            onClick={() => handleSelectTheme('battle')}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
              audioState.currentTheme === 'battle'
                ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-200">Adventure Theme (1) [Battle]</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    نبرد و هیجان
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تم پرتپش و رزمی هنگام نزدیک شدن دشمنان، تیراندازی و باس‌فایت
                </p>
              </div>
            </div>
            {audioState.currentTheme === 'battle' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* 4. Coin Collecting Sparkle SFX */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-200">Coin Collecting Sparkle</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    افکت صوتی
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  افکت زنگوله درخشان هنگام جمع‌آوری طلا، باز کردن صندوق و اتمام مراحل
                </p>
              </div>
            </div>
            <button
              onClick={handleTestSparkle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                testSparkleActive
                  ? 'bg-amber-400 text-slate-950 scale-105'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>پخش تست</span>
            </button>
          </div>
        </div>

        {/* Volume Controls Section */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>کنترل بلندی صدا (Volume Mix)</span>
            </div>
            <button
              onClick={() => sounds.setMute(!audioState.isMuted)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 transition-colors"
            >
              {audioState.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">صدا قطع</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>بی‌صدا کردن</span>
                </>
              )}
            </button>
          </div>

          {/* Music Volume (Default low) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>صدای موزیک پس‌زمینه (BGM):</span>
              <span className="font-mono text-amber-300 font-bold">
                {Math.round(audioState.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.01"
              value={audioState.musicVolume}
              onChange={(e) => sounds.setMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>صدای افکت‌ها و ضربات (SFX):</span>
              <span className="font-mono text-amber-300 font-bold">
                {Math.round(audioState.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.01"
              value={audioState.sfxVolume}
              onChange={(e) => sounds.setSfxVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Audio Upload Option */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-slate-500" />
            <span>آپلود فایل صوتی دلخواه (MP3):</span>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/mp3,audio/wav,audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>انتخاب فایل MP3</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
