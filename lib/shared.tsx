"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
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

export const durations = [3, 5, 10, 15];

export const voices = [
  { id: "aria", label: "Aria", description: "Calm, gentle female" },
  { id: "james", label: "James", description: "Grounded, steady male" },
  { id: "luna", label: "Luna", description: "Soft, intimate tone" },
  { id: "kai", label: "Kai", description: "Deep, spacious" },
];

const AUDIO_BASE = "https://audio.neurotypeapp.com/faded";

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
    { label: "Deep Night", description: "Engineered for CBT-I sleep onset", layers: ["Low drone", "Distant rain", "Delta wave undertone"], protocol: "CBT-I", color: "var(--color-dusk)", src: `${AUDIO_BASE}/sleep_train.mp3` },
    { label: "Soft Drift", description: "NSDR-optimized descent into rest", layers: ["White noise fade", "Heartbeat sync", "Ocean bed"], protocol: "NSDR", color: "var(--color-ocean)", src: `${AUDIO_BASE}/white_noise.mp3` },
    { label: "Moonlit Forest", description: "PMR tension release atmosphere", layers: ["Night crickets", "Gentle stream", "Warm pad"], protocol: "PMR", color: "var(--color-sage)", src: `${AUDIO_BASE}/summer_night.mp3` },
  ],
  focus: [
    { label: "Flow State", description: "MBSR sustained attention scaffold", layers: ["Brown noise", "Minimal piano", "Room tone"], protocol: "MBSR", color: "var(--color-sage)", src: `${AUDIO_BASE}/brown_noise.mp3` },
    { label: "Deep Work", description: "HRV-BF coherence at 0.1Hz", layers: ["Binaural 40Hz", "Soft static", "Clock pulse"], protocol: "HRV-BF", color: "var(--color-ocean)", src: `${AUDIO_BASE}/40hz_binurual.mp3` },
    { label: "Morning Clear", description: "ACT present-moment grounding", layers: ["Bird dawn chorus", "Wind through leaves", "Singing bowl"], protocol: "ACT", color: "var(--color-ember)", src: `${AUDIO_BASE}/spring_field.mp3` },
  ],
  stress: [
    { label: "Safe Harbor", description: "PMR progressive release sequence", layers: ["Ocean waves", "Warm sub-bass", "Breath guide tone"], protocol: "PMR", color: "var(--color-ocean)", src: `${AUDIO_BASE}/waves.mp3` },
    { label: "Forest Floor", description: "MBSR body scan environment", layers: ["Rain on canopy", "Earth resonance", "Distant thunder"], protocol: "MBSR", color: "var(--color-sage)", src: `${AUDIO_BASE}/rain.mp3` },
    { label: "Letting Go", description: "ACT defusion through sound", layers: ["Tibetan bowls", "Wind", "Resonant hum"], protocol: "ACT", color: "var(--color-dusk)", src: `${AUDIO_BASE}/soundbowl_soundbath.mp3` },
  ],
  default: [
    { label: "Sanctuary", description: "Adaptive all-purpose soundscape", layers: ["Ambient pad", "Nature blend", "Breath sync"], protocol: "MBSR", color: "var(--color-sage)", src: `${AUDIO_BASE}/peaceful_moment.mp3` },
    { label: "Still Water", description: "Minimal, spacious atmosphere", layers: ["Water droplets", "Room reverb", "Soft drone"], protocol: "PMR", color: "var(--color-ocean)", src: `${AUDIO_BASE}/river.mp3` },
    { label: "Open Sky", description: "Expansive, grounding presence", layers: ["Wind layers", "Distant chimes", "Earth tone"], protocol: "ACT", color: "var(--color-ember)", src: `${AUDIO_BASE}/distant_wind_chimes.mp3` },
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
  "5-min breathing reset",
  "PMR session for muscle tension",
  "HRV coherence breathing at 5.5 breaths/min",
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
    voice: "Aditya", ambient: "Calm Drone",
    sounds: [
      { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
    ],
  },
  {
    id: "U008", label: "Shoulder Drop Scan", duration: "9:00", protocol: "Progressive Muscle Relaxation",
    src: `${VOICE_BASE}/U008.mp3`,
    prompt: "Help me release tension in my shoulders and upper body",
    description: "A 9-min PMR session focused on the shoulders and neck. Progressive tension-release cues guide you through each muscle group.",
    voice: "Aditya", ambient: "Rain",
    sounds: [
      { label: "Rain", src: `${AUDIO_BASE}/rain.mp3` },
      { label: "River", src: `${AUDIO_BASE}/river.mp3` },
      { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
    ],
  },
  {
    id: "U020", label: "Probability Rebalance", duration: "13:00", protocol: "CBT-style Cognitive Skill",
    src: `${VOICE_BASE}/U020.mp3`,
    prompt: "Help me challenge catastrophic thinking and see things more clearly",
    description: "A 13-min CBT session that walks through probability estimation and cognitive reframing. Background layers shift as the session deepens.",
    voice: "Aditya", ambient: "Fireplace",
    sounds: [
      { label: "Fireplace", src: `${AUDIO_BASE}/fireplace.mp3` },
      { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
      { label: "River", src: `${AUDIO_BASE}/river.mp3` },
      { label: "Rain", src: `${AUDIO_BASE}/rain.mp3` },
      { label: "Deep Space", src: `${AUDIO_BASE}/deep_space.mp3` },
    ],
  },
  {
    id: "U006", label: "Gentle Even Breathing", duration: "5:00", protocol: "Slow Breathing", sampleStart: 80, sampleLimit: 30,
    src: `${VOICE_BASE}/U006.mp3`,
    prompt: "Guide me through calm, even breathing to settle my nerves",
    description: "A 5-min slow breathing session with gentle pacing cues. Pink noise and a calm drone layer underneath to ease you into rhythm.",
    voice: "Aditya", ambient: "Pink Noise",
    sounds: [
      { label: "Pink Noise", src: `${AUDIO_BASE}/pink_noise.mp3` },
      { label: "Room Tone", src: `${AUDIO_BASE}/room_tone.mp3` },
      { label: "Calm Drone", src: `${AUDIO_BASE}/plain_stereo_calm_drone.mp3` },
      { label: "Rain", src: `${AUDIO_BASE}/rain.mp3` },
    ],
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
        className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-30"
        style={{ top: "5%", right: "-15%", background: "#d4cfc6" }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-25"
        style={{ bottom: "-5%", left: "-10%", background: "#e8e4de" }}
      />
      <div
        className="animate-breathe absolute w-[300px] h-[300px] rounded-full blur-[120px] opacity-15"
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
              MindFlow
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
              href="/login"
              className="px-3 sm:px-4 py-2 rounded-xl bg-[var(--color-sand-900)] hover:bg-[var(--color-sand-800)] transition-colors text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              <span className="text-[var(--color-sand-50)]">Sign in / </span>
              <span
                className="bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]"
                style={{ backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
              >
                Kelt Studio
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
              <a href="/" className="flex items-center gap-2 text-[var(--color-sand-50)] pl-1 cursor-pointer">
                <Logo />
                <span className="text-sm tracking-tight hidden sm:inline" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  MindFlow
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
                href="/login"
                className="flex items-center gap-0 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs sm:text-sm transition-colors cursor-pointer text-[var(--color-sand-50)]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Sign in
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
