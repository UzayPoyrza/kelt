"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import {
  CloudRain,
  Waves,
  TreePine,
  Wind,
  Volume2,
  Sparkles,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";

/* ─── Data ─── */

export const durations = [3, 5, 7, 10, 12];

const SAMPLE_BASE = "https://audio.neurotypeapp.com/incraft_audio";
export const voices = [
  { id: "Claire", label: "Aria", description: "Calm, gentle female", sample: `${SAMPLE_BASE}/breath_sample_claire.mp3` },
  { id: "Luna", label: "Lin", description: "Soft, intimate tone", sample: `${SAMPLE_BASE}/breath_sample_luna_v3.mp3`, popular: true },
  { id: "Graham", label: "James", description: "Grounded, steady male", sample: `${SAMPLE_BASE}/breath_sample_graham_f2.mp3` },
  { id: "Silas", label: "Aditya", description: "Deep, spacious", sample: `${SAMPLE_BASE}/breath_sample_silas_f3.mp3` },
];

/** Map old frontend voice IDs to new API voice IDs (for legacy sessions) */
export const legacyVoiceMap: Record<string, string> = {
  aria: "Claire",
  james: "Graham",
  lin: "Luna",
  aditya: "Silas",
};

/** Resolve a voice ID (legacy or new) to a display label */
export function voiceLabel(id: string): string {
  const found = voices.find(v => v.id === id);
  if (found) return found.label;
  // Legacy lookup
  const mapped = legacyVoiceMap[id];
  if (mapped) return voices.find(v => v.id === mapped)?.label || id;
  return id;
}

export const supportChoices = [
  { id: "mindfulness", label: "Mindfulness", description: "General awareness practice" },
  { id: "burnout", label: "Burnout", description: "Recovery from exhaustion" },
  { id: "anxiety", label: "Anxiety", description: "Calm anxious thoughts" },
  { id: "panic", label: "Panic", description: "Acute panic relief" },
  { id: "adhd_focus", label: "ADHD Focus", description: "Structured attention support" },
  { id: "sleep", label: "Sleep", description: "Fall asleep or improve rest" },
  { id: "depression", label: "Depression", description: "Gentle mood support" },
  { id: "addiction_support", label: "Addiction Support", description: "Craving and urge management" },
  { id: "self_compassion", label: "Self-Compassion", description: "Kindness toward yourself" },
  { id: "just_meditate", label: "Just Meditate", description: "No specific goal" },
  { id: "auto_detect", label: "Auto-Detect", description: "Let AI choose the best fit" },
];

export const modes = [
  { id: "still", label: "Still", description: "Seated or lying down" },
  { id: "walking", label: "Walking", description: "Slow, mindful walk" },
  { id: "gentle_movement", label: "Gentle Movement", description: "Light stretching or yoga" },
];

/** Which modes are available for each support choice (null = all modes allowed) */
export const modeRules: Record<string, string[] | null> = {
  sleep: ["still"],
  panic: ["still"],
  adhd_focus: null,
  mindfulness: null,
  burnout: ["still", "walking"],
  anxiety: null,
  depression: ["still", "walking"],
  addiction_support: ["still"],
  self_compassion: null,
  just_meditate: null,
  auto_detect: null,
};

/* ─── Approaches (hardcoded until /v1/options is deployed) ─── */

const APPROACH_LABELS: Record<string, string> = {
  focused_attention: "Focused Attention (FA)",
  open_monitoring: "Open Monitoring",
  breathwork: "Breathwork",
  body_scan_pmr: "Body Scan / PMR",
  grounding: "Grounding",
  nsdr: "NSDR / Deep Rest",
  cbt: "CBT",
  cbt_i: "CBT-I",
  mbct: "MBCT",
  mbrp: "MBRP",
  cft_msc: "CFT/MSC",
  visualization: "Visualization",
  mantra: "Mantra",
  sound_meditation: "Sound Meditation",
  movement: "Movement",
  interoceptive_exposure: "Interoceptive Exposure",
};

const VALID_APPROACHES: Record<string, string[]> = {
  mindfulness: ["focused_attention", "open_monitoring", "breathwork", "body_scan_pmr", "cbt", "mbct", "visualization", "mantra", "sound_meditation"],
  burnout: ["focused_attention", "open_monitoring", "breathwork", "body_scan_pmr", "grounding", "nsdr", "cbt", "mbct", "cft_msc", "visualization", "mantra", "sound_meditation"],
  anxiety: ["focused_attention", "open_monitoring", "breathwork", "body_scan_pmr", "grounding", "cbt", "mbct", "cft_msc", "mantra", "sound_meditation"],
  panic: ["focused_attention", "breathwork", "body_scan_pmr", "grounding", "cbt", "sound_meditation", "interoceptive_exposure"],
  adhd_focus: ["focused_attention", "breathwork", "grounding", "visualization", "mantra", "sound_meditation"],
  sleep: ["breathwork", "body_scan_pmr", "nsdr", "cbt", "cbt_i", "cft_msc", "sound_meditation"],
  depression: ["focused_attention", "breathwork", "cbt", "mbct", "cft_msc", "visualization", "mantra"],
  addiction_support: ["focused_attention", "body_scan_pmr", "cbt", "mbrp", "visualization", "sound_meditation"],
  self_compassion: ["cft_msc", "mantra"],
  just_meditate: ["focused_attention", "open_monitoring", "breathwork", "body_scan_pmr", "nsdr", "mbct", "cft_msc", "visualization", "mantra", "sound_meditation"],
};

const STILL_ONLY = ["nsdr", "body_scan_pmr", "cbt_i"];
const MOVEMENT_ONLY = ["movement"];

/** Get valid approaches for a support choice + mode combination.
 *  Replace with /v1/options fetch when deployed. */
export function getApproaches(supportChoice: string, mode: string): { value: string; label: string }[] {
  let approaches = VALID_APPROACHES[supportChoice] || [];
  if (mode === "still") {
    approaches = approaches.filter(a => !MOVEMENT_ONLY.includes(a));
  } else {
    approaches = approaches.filter(a => !STILL_ONLY.includes(a));
    if (!approaches.includes("movement")) approaches.push("movement");
  }
  return approaches.map(value => ({ value, label: APPROACH_LABELS[value] || value }));
}

const AUDIO_BASE = "https://audio.neurotypeapp.com/faded";

/* Sound ID → filename mapping (from MindFlow API) */
/** Map API routed_protocol codes to display labels */
export function protocolLabel(code: string): string {
  // Clean up common patterns: "BREATH_SLOW" → "Slow Breathing", "FA_BREATH" → "Focused Attention"
  const map: Record<string, string> = {
    BREATH_SLOW: "Slow Breathing",
    BREATH_FAST: "Energizing Breathwork",
    FA_BREATH: "Focused Attention",
    FA_OBJECT: "Focused Attention",
    BODY_SCAN: "Body Scan",
    BODY_SCAN_PMR: "Body Scan / PMR",
    PMR: "Progressive Relaxation",
    OPEN_MONITORING: "Open Monitoring",
    GROUNDING: "Grounding",
    NSDR: "NSDR / Deep Rest",
    CBT: "CBT",
    CBT_I: "CBT-I",
    MBCT: "MBCT",
    MBRP: "MBRP",
    CFT_MSC: "Self-Compassion",
    VISUALIZATION: "Visualization",
    MANTRA: "Mantra",
    SOUND_MEDITATION: "Sound Meditation",
    MOVEMENT: "Movement",
    INTEROCEPTIVE: "Interoceptive Exposure",
  };
  if (map[code]) return map[code];
  // Fallback: try partial match then title-case
  const partial = Object.entries(map).find(([k]) => code.includes(k));
  if (partial) return partial[1];
  return code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export const SOUND_MAP: Record<string, string> = {
  S01: "chimes_and_tones.mp3",
  S02: "fireplace.mp3",
  S03: "peaceful_moment.mp3",
  S04: "rain.mp3",
  S05: "river.mp3",
  S06: "safe_haven.mp3",
  S07: "shower.mp3",
  S08: "spring_field.mp3",
  S09: "white_noise.mp3",
  S10: "summer_night.mp3",
  S11: "waves.mp3",
  S12: "distant_wind_chimes.mp3",
  S13: "athens_street_cafe.mp3",
  S14: "40hz_binurual.mp3",
  S15: "10hz_alpha_wave_binurual.mp3",
  S16: "sleep_train.mp3",
  S17: "soundbowl_soundbath.mp3",
  S18: "snowfall.mp3",
  S19: "soft_piano.mp3",
  S20: "deep_space.mp3",
  S21: "brown_noise.mp3",
  S22: "underwater.mp3",
  S23: "rainforest_wildlife.mp3",
  S24: "soft_metronome_60_bpm.mp3",
  S25: "60_bpm_wood_metronome.mp3",
  S26: "110_hz.mp3",
  S27: "220_hz.mp3",
  S28: "4_6_pacer.mp3",
  S29: "room_tone.mp3",
  S30: "pink_noise.mp3",
  S31: "plain_stereo_focus_drone.mp3",
  S32: "plain_stereo_calm_drone.mp3",
  S33: "anchor_bell_single_source.mp3",
  S34: "shamanic_drums.mp3",
};

/** Convert a sound ID (e.g. "S04") to a full audio URL */
export function soundIdToUrl(id: string): string {
  const filename = SOUND_MAP[id];
  if (!filename) return "";
  return `${AUDIO_BASE}/${filename}`;
}

/** Convert a sound ID to a display label via the audioCatalog */
export function soundIdToLabel(id: string): string {
  const filename = SOUND_MAP[id];
  if (!filename) return id;
  const base = filename.replace(/\.mp3$/, "");
  // Find in audioCatalog by matching src filename
  const found = audioCatalog.find(s => s.src.endsWith(`/${filename}`));
  return found?.label || base.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

/** Fetch audio via same-origin proxy to avoid CORS issues with S3/CDN URLs */
async function fetchAudioProxied(url: string): Promise<ArrayBuffer> {
  // Same-origin URLs can be fetched directly
  if (url.startsWith("/") || url.startsWith(window.location.origin)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.arrayBuffer();
  }
  // Cross-origin: proxy through our API
  const res = await fetch(`/api/audio-proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
  return res.arrayBuffer();
}

export async function downloadMixedAudio(
  audioUrl: string,
  filename: string,
  bgSoundUrl?: string | null,
  bgVolume?: number,
): Promise<void> {
  const hasBg = bgSoundUrl && (bgVolume ?? 0) > 0;
  console.log("[download] Starting download", { audioUrl, bgSoundUrl, bgVolume: bgVolume ?? 0, hasBg });

  if (!hasBg) {
    console.log("[download] No background sound — downloading voice only");
    // Still proxy to get a downloadable blob (cross-origin <a> downloads may not trigger)
    try {
      const buf = await fetchAudioProxied(audioUrl);
      const blob = new Blob([buf], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Last resort: direct link (works if server sets Content-Disposition)
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = filename;
      a.click();
    }
    return;
  }

  console.log("[download] Fetching audio files via proxy...");
  const [voiceArrayBuf, bgArrayBuf] = await Promise.all([
    fetchAudioProxied(audioUrl),
    fetchAudioProxied(bgSoundUrl!),
  ]);
  console.log("[download] Voice buffer:", voiceArrayBuf.byteLength, "BG buffer:", bgArrayBuf.byteLength);

  const audioCtx = new AudioContext();
  console.log("[download] Decoding audio...");
  const [voiceBuf, bgBuf] = await Promise.all([
    audioCtx.decodeAudioData(voiceArrayBuf),
    audioCtx.decodeAudioData(bgArrayBuf),
  ]);
  console.log("[download] Voice decoded:", voiceBuf.duration.toFixed(1) + "s", voiceBuf.numberOfChannels + "ch", voiceBuf.sampleRate + "Hz");
  console.log("[download] BG decoded:", bgBuf.duration.toFixed(1) + "s", bgBuf.numberOfChannels + "ch", bgBuf.sampleRate + "Hz");

  const sampleRate = voiceBuf.sampleRate;
  const channels = Math.max(voiceBuf.numberOfChannels, 2);
  const length = voiceBuf.length;
  const offline = new OfflineAudioContext(channels, length, sampleRate);

  // Voice at 80% volume
  const voiceGain = offline.createGain();
  voiceGain.gain.value = 0.8;
  voiceGain.connect(offline.destination);
  const voiceSource = offline.createBufferSource();
  voiceSource.buffer = voiceBuf;
  voiceSource.connect(voiceGain);

  // Background sound at the user's knob volume
  const bgGain = offline.createGain();
  bgGain.gain.value = (bgVolume ?? 50) / 100;
  bgGain.connect(offline.destination);

  const bgSource = offline.createBufferSource();
  bgSource.buffer = bgBuf;
  bgSource.loop = true;
  bgSource.connect(bgGain);

  voiceSource.start(0);
  bgSource.start(0);

  console.log("[download] Mixing audio (bg volume: " + (bgVolume ?? 50) + "%)...");
  const renderedBuffer = await offline.startRendering();
  console.log("[download] Mix complete, encoding MP3...");

  // Load lamejs on demand
  if (!(window as any).lamejs) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/lamejs.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MP3 encoder"));
      document.head.appendChild(script);
    });
  }
  const { Mp3Encoder } = (window as any).lamejs;
  const encoder = new Mp3Encoder(channels, sampleRate, 192);
  const left = renderedBuffer.getChannelData(0);
  const right = channels > 1 ? renderedBuffer.getChannelData(1) : left;
  const blockSize = 1152;
  const mp3Data: Int8Array[] = [];
  for (let i = 0; i < left.length; i += blockSize) {
    const end = Math.min(i + blockSize, left.length);
    const leftChunk = new Int16Array(end - i);
    const rightChunk = new Int16Array(end - i);
    for (let j = 0; j < end - i; j++) {
      leftChunk[j] = Math.max(-32768, Math.min(32767, Math.round(left[i + j] * 32767)));
      rightChunk[j] = Math.max(-32768, Math.min(32767, Math.round(right[i + j] * 32767)));
    }
    const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
  }
  const flushBuf = encoder.flush();
  if (flushBuf.length > 0) mp3Data.push(flushBuf);

  const blob = new Blob(mp3Data, { type: "audio/mp3" });
  console.log("[download] MP3 encoded:", (blob.size / 1024 / 1024).toFixed(1) + "MB");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.mp3$/, "") + ".mp3";
  a.click();
  URL.revokeObjectURL(url);
  audioCtx.close();
  console.log("[download] Done!");
}

export const ambients = [
  { id: "none", label: "Silence", icon: Volume2, src: null },
  { id: "rain", label: "Rain", icon: CloudRain, src: `${AUDIO_BASE}/rain.mp3` },
  { id: "ocean", label: "Ocean", icon: Waves, src: `${AUDIO_BASE}/waves.mp3` },
  { id: "forest", label: "Forest", icon: TreePine, src: `${AUDIO_BASE}/rainforest_wildlife.mp3` },
  { id: "wind", label: "Wind", icon: Wind, src: `${AUDIO_BASE}/distant_wind_chimes.mp3` },
];

/* Protocol-aware soundscape suggestions — auto-selected based on session intent */
export const soundscapePresets: Record<string, { label: string; description: string; layers: string[]; protocol: string; color: string; src: string }[]> = {
  sleep: [
    { label: "Sleep Train", description: "Engineered for CBT-I sleep onset", layers: ["Low drone", "Distant rain", "Delta wave undertone"], protocol: "CBT-I", color: "var(--color-dusk)", src: `${AUDIO_BASE}/sleep_train.mp3` },
    { label: "White Noise", description: "NSDR-optimized descent into rest", layers: ["White noise fade", "Heartbeat sync", "Ocean bed"], protocol: "NSDR", color: "var(--color-ocean)", src: `${AUDIO_BASE}/white_noise.mp3` },
    { label: "Summer Night", description: "PMR tension release atmosphere", layers: ["Night crickets", "Gentle stream", "Warm pad"], protocol: "PMR", color: "var(--color-sage)", src: `${AUDIO_BASE}/summer_night.mp3` },
  ],
  focus: [
    { label: "Brown Noise", description: "MBSR sustained attention scaffold", layers: ["Brown noise", "Minimal piano", "Room tone"], protocol: "MBSR", color: "var(--color-sage)", src: `${AUDIO_BASE}/brown_noise.mp3` },
    { label: "40Hz Binaural", description: "HRV-BF coherence at 0.1Hz", layers: ["Binaural 40Hz", "Soft static", "Clock pulse"], protocol: "HRV-BF", color: "var(--color-ocean)", src: `${AUDIO_BASE}/40hz_binurual.mp3` },
    { label: "Spring Field", description: "ACT present-moment grounding", layers: ["Bird dawn chorus", "Wind through leaves", "Singing bowl"], protocol: "ACT", color: "var(--color-ember)", src: `${AUDIO_BASE}/spring_field.mp3` },
  ],
  stress: [
    { label: "Waves", description: "PMR progressive release sequence", layers: ["Ocean waves", "Warm sub-bass", "Breath guide tone"], protocol: "PMR", color: "var(--color-ocean)", src: `${AUDIO_BASE}/waves.mp3` },
    { label: "Rain", description: "MBSR body scan environment", layers: ["Rain on canopy", "Earth resonance", "Distant thunder"], protocol: "MBSR", color: "var(--color-sage)", src: `${AUDIO_BASE}/rain.mp3` },
    { label: "Sound Bowl Bath", description: "ACT defusion through sound", layers: ["Tibetan bowls", "Wind", "Resonant hum"], protocol: "ACT", color: "var(--color-dusk)", src: `${AUDIO_BASE}/soundbowl_soundbath.mp3` },
  ],
  default: [
    { label: "Peaceful Moment", description: "Adaptive all-purpose soundscape", layers: ["Ambient pad", "Nature blend", "Breath sync"], protocol: "MBSR", color: "var(--color-sage)", src: `${AUDIO_BASE}/peaceful_moment.mp3` },
    { label: "River", description: "Minimal, spacious atmosphere", layers: ["Water droplets", "Room reverb", "Soft drone"], protocol: "PMR", color: "var(--color-ocean)", src: `${AUDIO_BASE}/river.mp3` },
    { label: "Distant Wind Chimes", description: "Expansive, grounding presence", layers: ["Wind layers", "Distant chimes", "Earth tone"], protocol: "ACT", color: "var(--color-ember)", src: `${AUDIO_BASE}/distant_wind_chimes.mp3` },
  ],
};

/* Full audio catalog — all available background sounds from R2 */
export const audioCatalog = [
  { id: "10hz_alpha_wave_binurual", label: "10Hz Alpha Binaural", category: "binaural", src: `${AUDIO_BASE}/10hz_alpha_wave_binurual.mp3` },
  { id: "110_hz", label: "110 Hz Tone", category: "frequency", src: `${AUDIO_BASE}/110_hz.mp3` },
  { id: "220_hz", label: "220 Hz Tone", category: "frequency", src: `${AUDIO_BASE}/220_hz.mp3` },
  { id: "40hz_binurual", label: "40Hz Binaural", category: "binaural", src: `${AUDIO_BASE}/40hz_binurual.mp3` },
  { id: "4_6_pacer", label: "4-6 Breath Pacer", category: "guide", src: `${AUDIO_BASE}/4_6_pacer.mp3` },
  { id: "60_bpm_wood_metronome", label: "Wood Metronome 60 BPM", category: "guide", src: `${AUDIO_BASE}/60_bpm_wood_metronome.mp3` },
  { id: "anchor_bell", label: "Anchor Bell", category: "guide", src: `${AUDIO_BASE}/anchor_bell_single_source.mp3` },
  { id: "athens_street_cafe", label: "Athens Street Café", category: "environment", src: `${AUDIO_BASE}/athens_street_cafe.mp3` },
  { id: "brown_noise", label: "Brown Noise", category: "noise", src: `${AUDIO_BASE}/brown_noise.mp3` },
  { id: "chimes_and_tones", label: "Chimes & Tones", category: "ambient", src: `${AUDIO_BASE}/chimes_and_tones.mp3` },
  { id: "deep_space", label: "Deep Space", category: "ambient", src: `${AUDIO_BASE}/deep_space.mp3` },
  { id: "distant_wind_chimes", label: "Distant Wind Chimes", category: "ambient", src: `${AUDIO_BASE}/distant_wind_chimes.mp3` },
  { id: "fireplace", label: "Fireplace", category: "environment", src: `${AUDIO_BASE}/fireplace.mp3` },
  { id: "peaceful_moment", label: "Peaceful Moment", category: "ambient", src: `${AUDIO_BASE}/peaceful_moment.mp3` },
  { id: "pink_noise", label: "Pink Noise", category: "noise", src: `${AUDIO_BASE}/pink_noise.mp3` },
  { id: "calm_drone", label: "Calm Drone", category: "ambient", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
  { id: "focus_drone", label: "Focus Drone", category: "ambient", src: `${AUDIO_BASE}/plain_stereo_focus_drone.mp3` },
  { id: "rain", label: "Rain", category: "nature", src: `${AUDIO_BASE}/rain.mp3` },
  { id: "rainforest_wildlife", label: "Rainforest Wildlife", category: "nature", src: `${AUDIO_BASE}/rainforest_wildlife.mp3` },
  { id: "river", label: "River", category: "nature", src: `${AUDIO_BASE}/river.mp3` },
  { id: "room_tone", label: "Room Tone", category: "ambient", src: `${AUDIO_BASE}/room_tone.mp3` },
  { id: "safe_haven", label: "Safe Haven", category: "ambient", src: `${AUDIO_BASE}/safe_haven.mp3` },
  { id: "shamanic_drums", label: "Shamanic Drums", category: "ambient", src: `${AUDIO_BASE}/shamanic_drums.mp3` },
  { id: "shower", label: "Shower", category: "environment", src: `${AUDIO_BASE}/shower.mp3` },
  { id: "sleep_train", label: "Sleep Train", category: "ambient", src: `${AUDIO_BASE}/sleep_train.mp3` },
  { id: "snowfall", label: "Snowfall", category: "nature", src: `${AUDIO_BASE}/snowfall.mp3` },
  { id: "soft_metronome", label: "Soft Metronome 60 BPM", category: "guide", src: `${AUDIO_BASE}/soft_metronome_60_bpm.mp3` },
  { id: "soft_piano", label: "Soft Piano", category: "ambient", src: `${AUDIO_BASE}/soft_piano.mp3` },
  { id: "soundbowl_soundbath", label: "Sound Bowl Bath", category: "ambient", src: `${AUDIO_BASE}/soundbowl_soundbath.mp3` },
  { id: "spring_field", label: "Spring Field", category: "nature", src: `${AUDIO_BASE}/spring_field.mp3` },
  { id: "summer_night", label: "Summer Night", category: "nature", src: `${AUDIO_BASE}/summer_night.mp3` },
  { id: "underwater", label: "Underwater", category: "nature", src: `${AUDIO_BASE}/underwater.mp3` },
  { id: "waves", label: "Waves", category: "nature", src: `${AUDIO_BASE}/waves.mp3` },
  { id: "white_noise", label: "White Noise", category: "noise", src: `${AUDIO_BASE}/white_noise.mp3` },
];

export const rotatingPhrases = [
  "a guided meditation",
  "a CBT session",
  "a body scan",
  "a guided meditation",
  "a breathing exercise",
  "a sleep story",
];

export const suggestions = [
  "Calm my anxiety before a big meeting",
  "Help me wind down and fall asleep",
  "I want singing bowls while I decompress",
  "PMR session for muscle tension",
  "CBT-i session to help me sleep",
];

export const protocols = [
  {
    abbr: "CBT-I",
    name: "Cognitive Behavioral Therapy for Insomnia",
    description: "Evidence-based sleep restructuring techniques adapted into guided sessions with proper stimulus control and sleep restriction protocols.",
  },
  {
    abbr: "PMR",
    name: "Progressive Muscle Relaxation",
    description: "Jacobson's systematic tension-release method with precise timing cues calibrated to physiological response curves.",
  },
  {
    abbr: "MBSR",
    name: "Mindfulness-Based Stress Reduction",
    description: "Kabat-Zinn's 8-week protocol distilled into adaptive sessions with body scan, sitting meditation, and mindful movement.",
  },
  {
    abbr: "NSDR",
    name: "Non-Sleep Deep Rest",
    description: "Yoga Nidra-derived protocols for conscious relaxation, optimized for dopamine restoration and neural recovery.",
  },
  {
    abbr: "ACT",
    name: "Acceptance & Commitment Therapy",
    description: "Defusion and present-moment awareness exercises structured as guided meditations for psychological flexibility.",
  },
  {
    abbr: "HRV-BF",
    name: "Heart Rate Variability Biofeedback",
    description: "Resonance frequency breathing at 4.5-6.5 breaths per minute with precision-timed inhale/exhale ratio guidance.",
  },
];

const VOICE_BASE = "https://audio.neurotypeapp.com/meditation_voices";

export const samples = [
  {
    id: "U010", label: "Low-Drone Calm", duration: "8:00", protocol: "Supportive Ambient Sound",
    src: `${VOICE_BASE}/U010.mp3`,
    prompt: "I just need something calming in the background while I decompress",
    description: "An 8-min ambient session built around a single warm drone. Minimal guidance lets the sound do the work.",
    voice: "Aditya",
    sounds: {
      recommended: { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
      alternatives: [],
      others: [],
    },
  },
  {
    id: "U008", label: "Shoulder Drop Scan", duration: "9:00", protocol: "Progressive Muscle Relaxation", defaultVoiceVolume: 0.75,
    src: "https://audio.neurotypeapp.com/meditation_voices/luna/U008_l.mp3",
    prompt: "Help me release tension in my shoulders and upper body",
    description: "A 9-min PMR session focused on the shoulders and neck. Progressive tension-release cues guide you through each muscle group.",
    voice: "Luna",
    sounds: {
      recommended: { label: "Rain", src: `${AUDIO_BASE}/rain.mp3` },
      alternatives: [
        { label: "River", src: `${AUDIO_BASE}/river.mp3` },
      ],
      others: [
        { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
      ],
    },
  },
  {
    id: "U020", label: "Probability Rebalance", duration: "13:00", protocol: "CBT-style Cognitive Skill", defaultBgVolume: 0.7, defaultVoiceVolume: 0.75,
    src: "https://audio.neurotypeapp.com/meditation_voices/luna/U020_l.mp3",
    prompt: "Help me challenge catastrophic thinking and see things more clearly",
    description: "A 13-min CBT session that walks through probability estimation and cognitive reframing. Background layers shift as the session deepens.",
    voice: "Luna",
    sounds: {
      recommended: { label: "Fireplace", src: `${AUDIO_BASE}/fireplace.mp3` },
      alternatives: [
        { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
        { label: "River", src: `${AUDIO_BASE}/river.mp3` },
      ],
      others: [
        { label: "Rain", src: `${AUDIO_BASE}/rain.mp3` },
        { label: "Deep Space", src: `${AUDIO_BASE}/deep_space.mp3` },
      ],
    },
  },
  {
    id: "U006", label: "Gentle Even Breathing", duration: "5:00", protocol: "Slow Breathing", sampleStart: 80, sampleLimit: 30,
    src: `${VOICE_BASE}/U006.mp3`,
    prompt: "Guide me through calm, even breathing to settle my nerves",
    description: "A 5-min slow breathing session with gentle pacing cues. Pink noise and a calm drone layer underneath to ease you into rhythm.",
    voice: "Aditya",
    sounds: {
      recommended: { label: "Pink Noise", src: `${AUDIO_BASE}/pink_noise.mp3` },
      alternatives: [
        { label: "Room Tone", src: `${AUDIO_BASE}/room_tone.mp3` },
        { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
      ],
      others: [
        { label: "Rain", src: `${AUDIO_BASE}/rain.mp3` },
      ],
    },
  },
];

/* ─── Intent detection ─── */

export function detectIntent(text: string): string {
  const lower = text.toLowerCase();
  if (/sleep|insomnia|bed|night|dream|rest|tired/i.test(lower)) return "sleep";
  if (/focus|concentrat|work|study|morning|sharp|productivity|attention/i.test(lower)) return "focus";
  if (/stress|anxi|worry|overwhelm|calm|relax|tension|panic/i.test(lower)) return "stress";
  return "default";
}

/** Auto-detect a support choice from the user's prompt text */
export function detectSupportChoice(text: string): string {
  const lower = text.toLowerCase();
  if (/sleep|insomnia|bed|night|dream|tired|rest(?:ful|less)/i.test(lower)) return "sleep";
  if (/panic|panic\s*attack|can'?t breathe|heart\s*racing/i.test(lower)) return "panic";
  if (/anxi|anxious|worry|worries|nervous|dread|uneasy/i.test(lower)) return "anxiety";
  if (/burnout|burned?\s*out|exhaust|depleted|overwhelm/i.test(lower)) return "burnout";
  if (/adhd|add|focus|concentrat|distract|attention\s*deficit/i.test(lower)) return "adhd_focus";
  if (/depress|sad|low\s*mood|hopeless|empty|unmotivated/i.test(lower)) return "depression";
  if (/addict|craving|urge|sober|relapse|substance/i.test(lower)) return "addiction_support";
  if (/self.?compassion|self.?love|self.?care|kind\s*to\s*my|forgive\s*my/i.test(lower)) return "self_compassion";
  if (/mindful|present|aware|body\s*scan|grounding/i.test(lower)) return "mindfulness";
  if (/just\s*meditat|no\s*goal|general|simple/i.test(lower)) return "just_meditate";
  return "auto_detect";
}

/* ─── Logo ─── */

export function Logo() {
  return (
    <svg width={36} height={38} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

/* ─── Background ─── */

export function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="grain-overlay absolute inset-0" />
      <div
        className="absolute w-[200px] h-[200px] sm:w-[800px] sm:h-[800px] rounded-full blur-[40px] sm:blur-[180px] opacity-20 sm:opacity-30"
        style={{ top: "5%", right: "-15%", background: "#d4cfc6" }}
      />
      <div
        className="absolute hidden sm:block w-[600px] h-[600px] rounded-full blur-[160px] opacity-25"
        style={{ bottom: "-5%", left: "-10%", background: "#e8e4de" }}
      />
      <div
        className="animate-breathe absolute hidden sm:block w-[300px] h-[300px] rounded-full blur-[120px] opacity-15"
        style={{ top: "40%", left: "50%", transform: "translate(-50%, -50%)", background: "#c8d5ca" }}
      />
    </div>
  );
}

/* ─── Fade-in section wrapper ─── */

export function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Shared Header ─── */

export function Header({ showNavLinks = false, hideFloatingNav = false, onScrollToInfo, onScrollToHow, onGenerate }: { showNavLinks?: boolean; hideFloatingNav?: boolean; onScrollToInfo?: () => void; onScrollToHow?: () => void; onGenerate?: () => void }) {
  const [showBlob, setShowBlob] = useState(false);
  const lastScrollY = useRef(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user && !user.is_anonymous);
    });
  }, []);

  useEffect(() => {
    if (hideFloatingNav) return;
    const handleScroll = () => {
      const y = window.scrollY;
      const goingUp = y < lastScrollY.current;
      lastScrollY.current = y;

      if (y <= 80) {
        setShowBlob(false);
      } else {
        setShowBlob(goingUp);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideFloatingNav]);

  return (
    <>
      {/* Default header */}
      <header className="relative z-50 px-4 sm:px-8 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[var(--color-sand-900)] cursor-pointer">
            <Logo />
            <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
              Incraft
            </span>
          </a>
          <div className="flex items-center gap-3 sm:gap-5">
            {showNavLinks && (
              <div className="hidden sm:flex items-center gap-5">
                <button
                  onClick={onScrollToInfo}
                  className="text-sm text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Listen to examples
                </button>
                <button
                  onClick={onScrollToHow}
                  className="text-sm text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  How it works
                </button>
              </div>
            )}
            <a
              href={isAuthenticated ? "/studio" : "/login"}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[var(--color-sand-900)] hover:bg-[var(--color-sand-800)] transition-colors text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {!isAuthenticated && <span className="text-[var(--color-sand-50)]">Sign in / </span>}
              <span
                className="bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]"
                style={{ backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
              >
                Incraft Studio
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Floating blob nav — hides while scrolling, reappears when you stop */}
      <AnimatePresence>
        {showBlob && (
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-full bg-[var(--color-sand-900)]/95 backdrop-blur-md shadow-lg border border-white/[0.08]">
              <a href="/" className="flex items-center gap-2 text-[var(--color-sand-50)] pl-1 cursor-pointer" aria-label="Incraft home">
                <Logo />
                <span className="text-sm tracking-tight hidden sm:inline" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  Incraft
                </span>
              </a>

              <div className="w-[1px] h-5 bg-white/10" />

              <button
                onClick={onGenerate || (() => window.scrollTo({ top: 0, behavior: "smooth" }))}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[var(--color-sand-50)] text-xs sm:text-sm transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </button>

              <a
                href={isAuthenticated ? "/studio" : "/login"}
                className="flex items-center gap-0 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs sm:text-sm transition-colors cursor-pointer text-[var(--color-sand-50)]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                {isAuthenticated ? "Studio" : "Sign in"}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
