#!/usr/bin/env python3
import os
import math
import struct
import wave
import subprocess

SAMPLE_RATE = 44100
TWO_PI = 2 * math.pi

def note_freq(semitone_from_a4):
    # A4 = 440 Hz
    return 440.0 * (2.0 ** (semitone_from_a4 / 12.0))

# Semitone offsets from A4 (A4 = 0)
NOTE_OFFSETS = {
    'C2': -33, 'D2': -31, 'E2': -29, 'F2': -28, 'F#2': -27, 'G2': -26, 'A2': -24, 'B2': -22,
    'C3': -21, 'C#3': -20, 'D3': -19, 'Eb3': -18, 'E3': -17, 'F3': -16, 'F#3': -15, 'G3': -14, 'G#3': -13, 'A3': -12, 'Bb3': -11, 'B3': -10,
    'C4': -9,  'C#4': -8,  'D4': -7,  'Eb4': -6,  'E4': -5,  'F4': -4,  'F#4': -3,  'G4': -2,  'G#4': -1,  'A4': 0,   'Bb4': 1,   'B4': 2,
    'C5': 3,   'C#5': 4,   'D5': 5,   'Eb5': 6,   'E5': 7,   'F5': 8,   'F#5': 9,   'G5': 10,  'G#5': 11,  'A5': 12,  'Bb5': 13,  'B5': 14,
    'C6': 15,  'C#6': 16,  'D6': 17,  'Eb6': 18,  'E6': 19,  'F6': 20,  'F#6': 21,  'G6': 22,  'G#6': 23,  'A6': 24,  'B6': 26,
    'C7': 27,  'D7': 29
}

def get_freq(note_str):
    return note_freq(NOTE_OFFSETS[note_str])

def synth_piano_note(buffer_l, buffer_r, note_str, start_time, duration, volume=0.3, pan=0.0):
    freq = get_freq(note_str)
    start_sample = int(start_time * SAMPLE_RATE)
    num_samples = int(duration * SAMPLE_RATE)
    pan_l = math.cos((pan + 1.0) * math.pi / 4.0)
    pan_r = math.sin((pan + 1.0) * math.pi / 4.0)

    # Piano harmonics profile
    harmonics = [(1.0, 1.0, 1.6), (2.0, 0.45, 1.2), (3.0, 0.22, 0.9), (4.0, 0.12, 0.6), (5.0, 0.05, 0.4)]
    detune = 0.6 # Hz detuning for rich chorus

    for s in range(num_samples):
        idx = start_sample + s
        if idx >= len(buffer_l):
            break
        t = s / SAMPLE_RATE

        # Attack envelope (soft mallet: 12ms rise)
        if t < 0.012:
            env = t / 0.012
        else:
            env = 1.0

        sample_val = 0.0
        for h_mult, h_amp, decay_time in harmonics:
            h_env = env * math.exp(-t / decay_time)
            w1 = TWO_PI * (freq * h_mult) * t
            w2 = TWO_PI * ((freq + detune) * h_mult) * t
            sample_val += 0.5 * (math.sin(w1) + math.sin(w2)) * h_amp * h_env

        sample_val *= volume
        buffer_l[idx] += sample_val * pan_l
        buffer_r[idx] += sample_val * pan_r

def synth_brass_strings_note(buffer_l, buffer_r, note_str, start_time, duration, volume=0.25, pan=0.0, is_brass=False):
    freq = get_freq(note_str)
    start_sample = int(start_time * SAMPLE_RATE)
    num_samples = int(duration * SAMPLE_RATE)
    pan_l = math.cos((pan + 1.0) * math.pi / 4.0)
    pan_r = math.sin((pan + 1.0) * math.pi / 4.0)

    attack = 0.04 if is_brass else 0.08
    decay = 0.15
    release = 0.15
    sustain_level = 0.75

    for s in range(num_samples):
        idx = start_sample + s
        if idx >= len(buffer_l):
            break
        t = s / SAMPLE_RATE

        # ADSR Envelope
        if t < attack:
            env = t / attack
        elif t < attack + decay:
            progress = (t - attack) / decay
            env = 1.0 - (1.0 - sustain_level) * progress
        elif t < duration - release:
            env = sustain_level
        else:
            rel_t = t - (duration - release)
            env = max(0.0, sustain_level * (1.0 - rel_t / release))

        # Rich saw / pulse hybrid with warm vibrato
        vibrato = math.sin(TWO_PI * 5.2 * t) * 0.006 * freq
        f = freq + vibrato

        # Additive blend mimicking brass / rich strings
        s1 = math.sin(TWO_PI * f * t)
        s2 = 0.55 * math.sin(TWO_PI * 2 * f * t)
        s3 = 0.35 * math.sin(TWO_PI * 3 * f * t)
        s4 = 0.20 * math.sin(TWO_PI * 4 * f * t)
        s5 = 0.12 * math.sin(TWO_PI * 5 * f * t)

        val = (s1 + s2 + s3 + s4 + s5) * 0.45 * env * volume
        buffer_l[idx] += val * pan_l
        buffer_r[idx] += val * pan_r

def synth_timpani_hit(buffer_l, buffer_r, note_str, start_time, volume=0.3):
    freq = get_freq(note_str)
    start_sample = int(start_time * SAMPLE_RATE)
    duration = 0.8
    num_samples = int(duration * SAMPLE_RATE)

    for s in range(num_samples):
        idx = start_sample + s
        if idx >= len(buffer_l):
            break
        t = s / SAMPLE_RATE
        # Pitch drop characteristic of drum impact
        f = freq * (1.0 + 0.8 * math.exp(-t * 28.0))
        env = math.exp(-t * 4.2)
        val = math.sin(TWO_PI * f * t) * env * volume
        buffer_l[idx] += val * 0.7
        buffer_r[idx] += val * 0.7

def synth_bell_chime(buffer_l, buffer_r, note_str, start_time, duration=1.2, volume=0.25, pan=0.0):
    freq = get_freq(note_str)
    start_sample = int(start_time * SAMPLE_RATE)
    num_samples = int(duration * SAMPLE_RATE)
    pan_l = math.cos((pan + 1.0) * math.pi / 4.0)
    pan_r = math.sin((pan + 1.0) * math.pi / 4.0)

    partials = [(1.0, 0.7, 1.2), (2.76, 0.4, 0.8), (4.07, 0.25, 0.5), (5.43, 0.15, 0.35)]

    for s in range(num_samples):
        idx = start_sample + s
        if idx >= len(buffer_l):
            break
        t = s / SAMPLE_RATE
        val = 0.0
        for p_mult, p_amp, p_decay in partials:
            env = math.exp(-t / p_decay)
            val += math.sin(TWO_PI * freq * p_mult * t) * p_amp * env

        val *= volume
        buffer_l[idx] += val * pan_l
        buffer_r[idx] += val * pan_r

def write_wav_and_mp3(buffer_l, buffer_r, wav_path, mp3_path):
    # Master peak normalizer with soft limiter
    max_peak = 0.0001
    for i in range(len(buffer_l)):
        max_peak = max(max_peak, abs(buffer_l[i]), abs(buffer_r[i]))

    gain = min(1.0, 0.90 / max_peak)

    interleaved = bytearray()
    for i in range(len(buffer_l)):
        l_val = math.tanh(buffer_l[i] * gain)
        r_val = math.tanh(buffer_r[i] * gain)
        l_int = max(-32768, min(32767, int(l_val * 32767)))
        r_int = max(-32768, min(32767, int(r_val * 32767)))
        interleaved += struct.pack('<hh', l_int, r_int)

    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(interleaved)

    cmd = ['ffmpeg', '-y', '-i', wav_path, '-b:a', '192k', mp3_path]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode != 0:
        print(f"Error encoding {mp3_path}: {res.stderr.decode()}")
    else:
        print(f"Generated {mp3_path} ({os.path.getsize(mp3_path)} bytes)")

# -------------------------------------------------------------
# 1. SOFT PIANO WARMTH (Calm, Peaceful, Safe Zone, Campfire)
# -------------------------------------------------------------
def generate_soft_piano():
    bpm = 72
    beat_sec = 60.0 / bpm
    total_beats = 32 # 8 measures of 4/4
    duration = total_beats * beat_sec
    samples_len = int(duration * SAMPLE_RATE)
    buf_l = [0.0] * samples_len
    buf_r = [0.0] * samples_len

    # Chord progression:
    # Bar 1: D major
    # Bar 2: G major
    # Bar 3: B minor
    # Bar 4: A major (with sus4 resolving)
    # Bar 5: G maj7
    # Bar 6: D/F#
    # Bar 7: Em9
    # Bar 8: Asus4 -> A
    chords = [
        # (root, bass, arpeggio notes, melody note, melody_time_offset)
        ('D3', 'D2', ['F#3', 'A3', 'D4', 'F#4'], [('A4', 0.0, 2.0), ('F#4', 2.0, 1.8)]),
        ('G3', 'G2', ['B3', 'D4', 'G4', 'B4'],   [('G4', 0.0, 1.8), ('B4', 2.0, 2.0)]),
        ('B3', 'B2', ['D4', 'F#4', 'B4', 'D5'],  [('D5', 0.0, 2.2), ('C#5', 2.2, 1.6)]),
        ('A3', 'A2', ['E4', 'A4', 'C#5', 'E5'],  [('B4', 0.0, 1.5), ('A4', 1.8, 2.0)]),
        ('G3', 'G2', ['B3', 'D4', 'F#4', 'B4'],  [('F#4', 0.0, 2.0), ('E4', 2.0, 1.8)]),
        ('F#3', 'F#2', ['A3', 'D4', 'F#4', 'A4'], [('D4', 0.0, 1.8), ('F#4', 2.0, 2.0)]),
        ('E3', 'E2', ['G3', 'B3', 'D4', 'G4'],   [('E4', 0.0, 1.8), ('G4', 2.0, 1.8)]),
        ('A3', 'A2', ['E4', 'A4', 'D5', 'C#5'],  [('A4', 0.0, 2.0), ('D4', 2.0, 2.0)]),
    ]

    for bar_idx, (chord_root, bass_note, arp_notes, melody) in enumerate(chords):
        bar_start = bar_idx * 4 * beat_sec
        # Deep warm piano bass
        synth_piano_note(buf_l, buf_r, bass_note, bar_start, beat_sec * 3.8, volume=0.45, pan=-0.1)
        synth_piano_note(buf_l, buf_r, chord_root, bar_start + 0.02, beat_sec * 3.5, volume=0.35, pan=0.1)

        # Arpeggio pattern (quarter/eighth notes)
        arp_pattern = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5]
        for step_idx, step_beat in enumerate(arp_pattern):
            note = arp_notes[step_idx % len(arp_notes)]
            t = bar_start + step_beat * beat_sec
            pan = 0.3 * (1 if step_idx % 2 == 0 else -1)
            synth_piano_note(buf_l, buf_r, note, t, beat_sec * 1.5, volume=0.22, pan=pan)

        # Gentle lyrical melody on top
        for mel_note, mel_offset, mel_dur in melody:
            m_time = bar_start + mel_offset * beat_sec
            synth_piano_note(buf_l, buf_r, mel_note, m_time, mel_dur * beat_sec, volume=0.40, pan=0.15)

    write_wav_and_mp3(buf_l, buf_r, '/tmp/soft_piano.wav', 'public/audio/Soft Piano Warmth.mp3')

# -------------------------------------------------------------
# 2. ADVENTURE THEME (Main Overworld Exploration, Heroic)
# -------------------------------------------------------------
def generate_adventure_theme():
    bpm = 112
    beat_sec = 60.0 / bpm
    total_beats = 48 # 12 bars of 4/4
    duration = total_beats * beat_sec
    samples_len = int(duration * SAMPLE_RATE)
    buf_l = [0.0] * samples_len
    buf_r = [0.0] * samples_len

    # Heroic fantasy adventure progression in G Major
    # G -> C -> Em -> D -> G -> C -> Bm -> D
    # Fanfare peak: Em -> C -> G -> D -> G -> D -> G
    bars = [
        ('G2', 'G3', ['G3', 'B3', 'D4'], 'G4'),
        ('C2', 'C3', ['G3', 'C4', 'E4'], 'A4'),
        ('E2', 'E3', ['G3', 'B3', 'E4'], 'B4'),
        ('D2', 'D3', ['F#3', 'A3', 'D4'], 'D5'),
        ('G2', 'G3', ['G3', 'B3', 'D4'], 'B4'),
        ('C2', 'C3', ['G3', 'C4', 'E4'], 'C5'),
        ('B2', 'B3', ['F#3', 'B3', 'D4'], 'D5'),
        ('D2', 'D3', ['F#3', 'A3', 'D4'], 'A4'),
        ('E2', 'E3', ['G3', 'B3', 'E4'], 'G5'),
        ('C2', 'C3', ['G3', 'C4', 'E4'], 'E5'),
        ('D2', 'D3', ['F#3', 'A3', 'D4'], 'F#5'),
        ('G2', 'G3', ['G3', 'B3', 'D4'], 'G5'),
    ]

    for bar_idx, (sub_bass, bass, chord, mel_note) in enumerate(bars):
        bar_start = bar_idx * 4 * beat_sec

        # Galloping rhythmic bass (dotted 8th + 16th + 8th + 8th)
        timpani_note = 'G2' if 'G' in sub_bass else ('D2' if 'D' in sub_bass else 'C2')
        synth_timpani_hit(buf_l, buf_r, timpani_note, bar_start, volume=0.35)
        if bar_idx % 2 == 1:
            synth_timpani_hit(buf_l, buf_r, timpani_note, bar_start + 2 * beat_sec, volume=0.25)

        for b in [0.0, 1.0, 2.0, 3.0]:
            synth_brass_strings_note(buf_l, buf_r, bass, bar_start + b * beat_sec, beat_sec * 0.9, volume=0.28, pan=-0.2)

        # Sustained string/brass harmonies
        for c_note in chord:
            synth_brass_strings_note(buf_l, buf_r, c_note, bar_start, beat_sec * 3.9, volume=0.20, pan=0.2, is_brass=True)

        # Shimmering glockenspiel bell accent on downbeat
        synth_bell_chime(buf_l, buf_r, mel_note, bar_start, duration=beat_sec * 2.0, volume=0.25, pan=0.25)

        # Heroic fanfare lead melody
        synth_brass_strings_note(buf_l, buf_r, mel_note, bar_start, beat_sec * 1.8, volume=0.38, pan=0.05, is_brass=True)
        # Passing melodic note on beat 3
        pass_freq = get_freq(mel_note)
        synth_brass_strings_note(buf_l, buf_r, mel_note, bar_start + 2.0 * beat_sec, beat_sec * 1.7, volume=0.34, pan=0.05, is_brass=True)

    write_wav_and_mp3(buf_l, buf_r, '/tmp/adventure_theme.wav', 'public/audio/Adventure Theme.mp3')

# -------------------------------------------------------------
# 3. ADVENTURE THEME (1) (Battle, Danger, Combat Encounter)
# -------------------------------------------------------------
def generate_adventure_battle():
    bpm = 132
    beat_sec = 60.0 / bpm
    total_beats = 48 # 12 bars of 4/4
    duration = total_beats * beat_sec
    samples_len = int(duration * SAMPLE_RATE)
    buf_l = [0.0] * samples_len
    buf_r = [0.0] * samples_len

    # D Minor tension battle progression
    # Dm -> Dm -> Bb -> A7 -> Dm -> Gm -> Bb -> A7
    bars = [
        ('D2', ['F3', 'A3', 'D4'], 'D5'),
        ('D2', ['F3', 'A3', 'D4'], 'F5'),
        ('Bb2', ['F3', 'Bb3', 'D4'], 'G5'),
        ('A2', ['E3', 'A3', 'C#4'], 'E5'),
        ('D2', ['F3', 'A3', 'D4'], 'D5'),
        ('G2', ['D3', 'G3', 'Bb3'], 'G5'),
        ('Bb2', ['F3', 'Bb3', 'D4'], 'F5'),
        ('A2', ['E3', 'A3', 'C#4'], 'A5'),
        ('D2', ['F3', 'A3', 'D4'], 'D5'),
        ('F2', ['A3', 'C4', 'F4'], 'C5'),
        ('Bb2', ['F3', 'Bb3', 'D4'], 'D5'),
        ('A2', ['E3', 'A3', 'C#4'], 'C#5'),
    ]

    for bar_idx, (bass_root, chord_notes, lead_note) in enumerate(bars):
        bar_start = bar_idx * 4 * beat_sec

        # Driving 16th-note battle ostinato bass (D-D-D-D...)
        for sixteenth in range(16):
            t = bar_start + (sixteenth * 0.25) * beat_sec
            vol = 0.32 if (sixteenth % 4 == 0) else 0.18
            synth_brass_strings_note(buf_l, buf_r, bass_root, t, beat_sec * 0.22, volume=vol, pan=-0.2)

        # Timpani & punchy percussion on beats 1 and 3
        synth_timpani_hit(buf_l, buf_r, bass_root, bar_start, volume=0.45)
        synth_timpani_hit(buf_l, buf_r, bass_root, bar_start + 2.0 * beat_sec, volume=0.35)

        # Urgent brass stabs on beats 2 and 4
        for c in chord_notes:
            synth_brass_strings_note(buf_l, buf_r, c, bar_start + 1.0 * beat_sec, beat_sec * 0.7, volume=0.30, pan=0.25, is_brass=True)
            synth_brass_strings_note(buf_l, buf_r, c, bar_start + 3.0 * beat_sec, beat_sec * 0.7, volume=0.30, pan=0.25, is_brass=True)

        # Driving battle lead theme
        synth_brass_strings_note(buf_l, buf_r, lead_note, bar_start, beat_sec * 1.8, volume=0.40, pan=0.0, is_brass=True)
        synth_brass_strings_note(buf_l, buf_r, lead_note, bar_start + 2.0 * beat_sec, beat_sec * 1.7, volume=0.38, pan=0.0, is_brass=True)

    write_wav_and_mp3(buf_l, buf_r, '/tmp/adventure_battle.wav', 'public/audio/Adventure Theme (1).mp3')

# -------------------------------------------------------------
# 4. COIN COLLECTING SPARKLE (Treasure & Gold Chime)
# -------------------------------------------------------------
def generate_coin_sparkle():
    duration = 2.0
    samples_len = int(duration * SAMPLE_RATE)
    buf_l = [0.0] * samples_len
    buf_r = [0.0] * samples_len

    # Rapid ascending glissando / sparkle chime: D5, F#5, A5, C#6, D6, F#6, A6
    sparkle_notes = ['D5', 'F#5', 'A5', 'C#6', 'D6', 'F#6', 'A6', 'D7']
    step_time = 0.045 # 45ms per note cascading upwards

    for idx, note in enumerate(sparkle_notes):
        t = idx * step_time
        pan = -0.5 + (idx / float(len(sparkle_notes))) * 1.0
        # High bell chime
        synth_bell_chime(buf_l, buf_r, note, t, duration=1.2, volume=0.35, pan=pan)

        # Sparkling high octave shimmer
        freq = get_freq(note)
        start_samp = int(t * SAMPLE_RATE)
        for s in range(int(0.6 * SAMPLE_RATE)):
            pos = start_samp + s
            if pos >= len(buf_l):
                break
            st = s / SAMPLE_RATE
            shimmer = math.sin(TWO_PI * freq * 2.0 * st) * math.exp(-st * 12.0) * 0.15
            buf_l[pos] += shimmer * 0.7
            buf_r[pos] += shimmer * 0.7

    write_wav_and_mp3(buf_l, buf_r, '/tmp/coin_sparkle.wav', 'public/audio/Coin Collecting Sparkle.mp3')

def main():
    os.makedirs('public/audio', exist_ok=True)
    print("Generating audio assets...")
    generate_soft_piano()
    generate_adventure_theme()
    generate_adventure_battle()
    generate_coin_sparkle()

    # Also create sanitized alias copies for robust URL loading
    aliases = [
        ('Soft Piano Warmth.mp3', 'soft-piano-warmth.mp3'),
        ('Adventure Theme.mp3', 'adventure-theme.mp3'),
        ('Adventure Theme (1).mp3', 'adventure-theme-battle.mp3'),
        ('Coin Collecting Sparkle.mp3', 'coin-collecting-sparkle.mp3'),
    ]
    for orig, alias in aliases:
        src = os.path.join('public/audio', orig)
        dst = os.path.join('public/audio', alias)
        if os.path.exists(src):
            subprocess.run(['cp', src, dst])
            print(f"Copied {orig} -> {alias}")

    print("All audio assets successfully prepared!")

if __name__ == '__main__':
    main()
