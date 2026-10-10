
// Works under any hosting sub-path (e.g. GitHub Pages)
const AUDIO_BASE: string = (import.meta as any).env?.BASE_URL ?? '/';
/**
 * Audio and Theme Music Engine for Lego Fantasy RPG
 * Features real MP3 playback with smooth crossfading, adaptive context switching,
 * low-volume defaults, procedural fallback synthesis, and complete audio controls.
 */

export type BgmThemeId = 'soft_piano' | 'adventure' | 'battle' | 'custom';

export interface ThemeTrackInfo {
  id: BgmThemeId;
  title: string;
  subtitle: string;
  description: string;
  primaryContext: string;
  filePaths: string[];
}

export const THEME_TRACKS: Record<BgmThemeId, ThemeTrackInfo> = {
  soft_piano: {
    id: 'soft_piano',
    title: 'Soft Piano Warmth',
    subtitle: 'Safe Haven & Village Theme',
    description: 'Gentle, warm acoustic piano melodies for peaceful villages, dialogues, and campfires',
    primaryContext: 'Village, Campfire, NPC Dialogue, Character Studio',
    filePaths: [`${AUDIO_BASE}audio/Soft Piano Warmth.mp3`, `${AUDIO_BASE}audio/soft-piano-warmth.mp3`],
  },
  adventure: {
    id: 'adventure',
    title: 'Adventure Theme',
    subtitle: 'Overworld Exploration Theme',
    description: 'Heroic, uplifting fantasy fanfare for wandering open plains, forests, and ruins',
    primaryContext: 'Overworld Roaming & Ruins Exploration',
    filePaths: [`${AUDIO_BASE}audio/Adventure Theme.mp3`, `${AUDIO_BASE}audio/adventure-theme.mp3`],
  },
  battle: {
    id: 'battle',
    title: 'Adventure Theme (Battle)',
    subtitle: 'Combat & Danger Theme',
    description: 'Driving, high-energy battle theme for hostile mob encounters and dungeon guardians',
    primaryContext: 'Enemy Aggro, Hostile Skeletons & Boss Combat',
    filePaths: [`${AUDIO_BASE}audio/Adventure Theme (1).mp3`, `${AUDIO_BASE}audio/adventure-theme-battle.mp3`],
  },
  custom: {
    id: 'custom',
    title: 'Custom User Theme',
    subtitle: 'User Loaded Audio',
    description: 'Custom uploaded audio track loaded by player',
    primaryContext: 'User Preference',
    filePaths: [],
  },
};

export interface AudioState {
  currentTheme: BgmThemeId;
  isPlaying: boolean;
  isMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  masterVolume: number;
  isAdaptive: boolean;
  contextMode: 'village' | 'exploration' | 'combat';
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  // Volumes (Default: gentle low volume as requested "با صدای کم")
  private masterVolume: number = 0.85;
  private musicVolume: number = 0.15; // 15% gentle background volume
  private sfxVolume: number = 0.32;   // 32% crisp sound effects volume
  private isMuted: boolean = false;

  // Theme Management
  private currentTheme: BgmThemeId = 'adventure';
  private isPlaying: boolean = false;
  private isAdaptive: boolean = true;
  private activeContext: 'village' | 'exploration' | 'combat' = 'exploration';
  private combatCooldownTimer: any = null;

  // HTMLAudio Elements for crossfading
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  private crossfadeInterval: any = null;

  // Custom audio blobs
  private customAudioUrl: string | null = null;

  // State change listeners
  private stateListeners: Set<(state: AudioState) => void> = new Set();

  constructor() {
    // Resume audio context & unlock HTML5 Audio on user interaction
    const unlockAudio = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume * this.masterVolume;
        this.sfxGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.isMuted ? 0 : this.musicVolume * this.masterVolume;
        this.bgmGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getState(): AudioState {
    return {
      currentTheme: this.currentTheme,
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      masterVolume: this.masterVolume,
      isAdaptive: this.isAdaptive,
      contextMode: this.activeContext,
    };
  }

  public subscribe(listener: (state: AudioState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.stateListeners.forEach((fn) => {
      try {
        fn(s);
      } catch (err) {
        console.error('Audio state listener error:', err);
      }
    });
  }

  // --- Volume Controls ---

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.currentAudio) {
      this.currentAudio.muted = mute;
    }
    if (this.nextAudio) {
      this.nextAudio.muted = mute;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = mute ? 0 : this.sfxVolume * this.masterVolume;
    }
    this.notify();
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    const effectiveVol = this.isMuted ? 0 : this.musicVolume * this.masterVolume;
    if (this.currentAudio) {
      this.currentAudio.volume = effectiveVol;
    }
    if (this.bgmGain) {
      this.bgmGain.gain.value = effectiveVol;
    }
    this.notify();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume * this.masterVolume;
    }
    this.notify();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.setMusicVolume(this.musicVolume);
    this.setSfxVolume(this.sfxVolume);
  }

  public setAdaptiveMusic(enabled: boolean) {
    this.isAdaptive = enabled;
    this.notify();
  }

  // --- Background Music Management & Crossfading ---

  public toggleBGM(enable?: boolean) {
    const targetState = enable !== undefined ? enable : !this.isPlaying;
    if (targetState === this.isPlaying) return;

    this.isPlaying = targetState;
    if (this.isPlaying) {
      this.playTrack(this.currentTheme, false);
    } else {
      this.stopBGM(true);
    }
    this.notify();
  }

  public setTheme(theme: BgmThemeId, crossfade: boolean = true) {
    if (this.currentTheme === theme && this.isPlaying) return;
    this.currentTheme = theme;
    if (this.isPlaying) {
      this.playTrack(theme, crossfade);
    }
    this.notify();
  }

  public setCustomAudio(file: File) {
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }
    this.customAudioUrl = URL.createObjectURL(file);
    THEME_TRACKS.custom.title = file.name.replace(/\.[^/.]+$/, '');
    this.setTheme('custom', true);
  }

  private getAudioSrc(theme: BgmThemeId): string | null {
    if (theme === 'custom') {
      return this.customAudioUrl;
    }
    const info = THEME_TRACKS[theme];
    return info && info.filePaths.length > 0 ? info.filePaths[0] : null;
  }

  private playTrack(theme: BgmThemeId, crossfade: boolean) {
    const targetSrc = this.getAudioSrc(theme);
    if (!targetSrc) return;

    const effectiveTargetVol = this.isMuted ? 0 : this.musicVolume * this.masterVolume;

    const newAudio = new Audio();
    newAudio.src = targetSrc;
    newAudio.loop = true;
    newAudio.muted = this.isMuted;
    newAudio.volume = crossfade ? 0.001 : effectiveTargetVol;

    // Handle alternate filename fallback if error occurs
    newAudio.onerror = () => {
      const info = THEME_TRACKS[theme];
      if (info && info.filePaths.length > 1 && newAudio.src !== info.filePaths[1]) {
        newAudio.src = info.filePaths[1];
        newAudio.play().catch(() => {});
      }
    };

    const playPromise = newAudio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay policy or gesture required; will resume on first click
      });
    }

    if (!crossfade || !this.currentAudio) {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      }
      this.currentAudio = newAudio;
      this.currentAudio.volume = effectiveTargetVol;
      return;
    }

    // Smooth Crossfade over 1.2 seconds
    const oldAudio = this.currentAudio;
    this.nextAudio = newAudio;

    const steps = 24;
    const stepDuration = 1200 / steps;
    let step = 0;

    if (this.crossfadeInterval) clearInterval(this.crossfadeInterval);

    this.crossfadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      if (oldAudio) {
        oldAudio.volume = Math.max(0, effectiveTargetVol * (1 - progress));
      }
      if (this.nextAudio) {
        this.nextAudio.volume = Math.min(effectiveTargetVol, effectiveTargetVol * progress);
      }

      if (step >= steps) {
        clearInterval(this.crossfadeInterval);
        this.crossfadeInterval = null;
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = '';
        }
        this.currentAudio = this.nextAudio;
        this.nextAudio = null;
        if (this.currentAudio) {
          this.currentAudio.volume = effectiveTargetVol;
        }
      }
    }, stepDuration);
  }

  private stopBGM(fadeOut: boolean = true) {
    if (!fadeOut || !this.currentAudio) {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      return;
    }

    const audioToStop = this.currentAudio;
    const initialVol = audioToStop.volume;
    let step = 0;
    const steps = 15;
    const interval = setInterval(() => {
      step++;
      audioToStop.volume = Math.max(0, initialVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(interval);
        audioToStop.pause();
        if (this.currentAudio === audioToStop) {
          this.currentAudio = null;
        }
      }
    }, 40);
  }

  // --- Dynamic Adaptive Music Engine ---

  public updateGameContext(context: { inCombat: boolean; nearVillage: boolean; inDialogue: boolean }) {
    if (!this.isAdaptive || !this.isPlaying) return;

    let targetContext: 'village' | 'exploration' | 'combat' = 'exploration';
    let targetTheme: BgmThemeId = 'adventure';

    if (context.inCombat) {
      targetContext = 'combat';
      targetTheme = 'battle';
      // Reset combat cooldown
      if (this.combatCooldownTimer) {
        clearTimeout(this.combatCooldownTimer);
        this.combatCooldownTimer = null;
      }
    } else if (context.inDialogue || context.nearVillage) {
      targetContext = 'village';
      targetTheme = 'soft_piano';
    } else {
      targetContext = 'exploration';
      targetTheme = 'adventure';
    }

    if (this.activeContext === targetContext && this.currentTheme === targetTheme) {
      return;
    }

    // Debounce combat exit by 3 seconds to avoid abrupt music bouncing
    if (this.activeContext === 'combat' && targetContext !== 'combat') {
      if (!this.combatCooldownTimer) {
        this.combatCooldownTimer = setTimeout(() => {
          this.combatCooldownTimer = null;
          this.activeContext = targetContext;
          this.setTheme(targetTheme, true);
        }, 2800);
      }
      return;
    }

    this.activeContext = targetContext;
    this.setTheme(targetTheme, true);
  }

  // --- SFX & SPARKLE SOUND EFFECTS ---

  /**
   * Authentic Coin Collecting Sparkle
   * Uses real MP3 with instant HTML5 Audio + Web Audio synthesizer fallback!
   */
  public playCoinSparkle() {
    this.playCoinPickup();
  }

  public playCoinPickup() {
    if (this.isMuted) return;

    // 1. Play real sparkle audio file
    const sparkleAudio = new Audio();
    sparkleAudio.src = `${AUDIO_BASE}audio/Coin Collecting Sparkle.mp3`;
    sparkleAudio.volume = Math.min(1, this.sfxVolume * this.masterVolume * 1.1);
    sparkleAudio.play().catch(() => {
      // Fallback to high-frequency crystalline chime synthesizer
      this.playSyntheticSparkle();
    });
  }

  private playSyntheticSparkle() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const freqs = [587.33, 739.99, 880.0, 1108.73, 1174.66, 1479.98, 1760.0, 2349.32]; // D5 to D7 arpeggio
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = now + idx * 0.042;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.08 * (this.sfxVolume * 2), now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playSwordSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const now = this.ctx.currentTime;
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playBowShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playArrowHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playChestOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const freqs = [392, 523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + i * 0.07;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });

    // Also trigger sparkle jingle for opening treasure chest!
    setTimeout(() => {
      this.playCoinSparkle();
    }, 180);
  }

  public playEnemyHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playDodgeRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const sounds = new SoundSystem();
