"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  CloudRain,
  Waves,
  TreePine,
  Wind,
  Volume2,
  Play,
  Pause,
  ChevronLeft,
  ChevronDown,
  Download,
  RotateCcw,
  Sparkles,
  AudioWaveform,
  BrainCircuit,
  Timer,
  ShieldCheck,
  Headphones,
  Activity,
  FlaskConical,
  GraduationCap,
  Mic,
  Sliders,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";

/* ─── Data ─── */

const durations = [3, 5, 10, 15];

const voices = [
  { id: "aria", label: "Aria", description: "Calm, gentle female" },
  { id: "james", label: "James", description: "Grounded, steady male" },
  { id: "luna", label: "Luna", description: "Soft, intimate tone" },
  { id: "kai", label: "Kai", description: "Deep, spacious" },
];

const ambients = [
  { id: "none", label: "Silence", icon: Volume2 },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "ocean", label: "Ocean", icon: Waves },
  { id: "forest", label: "Forest", icon: TreePine },
  { id: "wind", label: "Wind", icon: Wind },
];

/* Protocol-aware soundscape suggestions — auto-selected based on session intent */
const soundscapePresets: Record<string, { label: string; description: string; layers: string[]; protocol: string; color: string }[]> = {
  sleep: [
    { label: "Deep Night", description: "Engineered for CBT-I sleep onset", layers: ["Low drone", "Distant rain", "Delta wave undertone"], protocol: "CBT-I", color: "var(--color-dusk)" },
    { label: "Soft Drift", description: "NSDR-optimized descent into rest", layers: ["White noise fade", "Heartbeat sync", "Ocean bed"], protocol: "NSDR", color: "var(--color-ocean)" },
    { label: "Moonlit Forest", description: "PMR tension release atmosphere", layers: ["Night crickets", "Gentle stream", "Warm pad"], protocol: "PMR", color: "var(--color-sage)" },
  ],
  focus: [
    { label: "Flow State", description: "MBSR sustained attention scaffold", layers: ["Brown noise", "Minimal piano", "Room tone"], protocol: "MBSR", color: "var(--color-sage)" },
    { label: "Deep Work", description: "HRV-BF coherence at 0.1Hz", layers: ["Binaural 40Hz", "Soft static", "Clock pulse"], protocol: "HRV-BF", color: "var(--color-ocean)" },
    { label: "Morning Clear", description: "ACT present-moment grounding", layers: ["Bird dawn chorus", "Wind through leaves", "Singing bowl"], protocol: "ACT", color: "var(--color-ember)" },
  ],
  stress: [
    { label: "Safe Harbor", description: "PMR progressive release sequence", layers: ["Ocean waves", "Warm sub-bass", "Breath guide tone"], protocol: "PMR", color: "var(--color-ocean)" },
    { label: "Forest Floor", description: "MBSR body scan environment", layers: ["Rain on canopy", "Earth resonance", "Distant thunder"], protocol: "MBSR", color: "var(--color-sage)" },
    { label: "Letting Go", description: "ACT defusion through sound", layers: ["Tibetan bowls", "Wind", "Resonant hum"], protocol: "ACT", color: "var(--color-dusk)" },
  ],
  default: [
    { label: "Sanctuary", description: "Adaptive all-purpose soundscape", layers: ["Ambient pad", "Nature blend", "Breath sync"], protocol: "MBSR", color: "var(--color-sage)" },
    { label: "Still Water", description: "Minimal, spacious atmosphere", layers: ["Water droplets", "Room reverb", "Soft drone"], protocol: "PMR", color: "var(--color-ocean)" },
    { label: "Open Sky", description: "Expansive, grounding presence", layers: ["Wind layers", "Distant chimes", "Earth tone"], protocol: "ACT", color: "var(--color-ember)" },
  ],
};

const rotatingPhrases = [
  "a guided meditation",
  "a CBT session",
  "a body scan",
  "a guided meditation",
  "a breathing exercise",
  "a sleep story",
];

const suggestions = [
  "Calm my anxiety before a big meeting",
  "Help me wind down and fall asleep",
  "5-min breathing reset",
  "PMR session for muscle tension",
  "HRV coherence breathing at 5.5 breaths/min",
];

const protocols = [
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

const samples = [
  { id: "sleep", label: "Deep Sleep", duration: "0:30", protocol: "CBT-I + NSDR", src: "/samples/sleep.mp3", prompt: "I can't fall asleep, my mind keeps racing with tomorrow's tasks", description: "A 20-min sleep onset session blending cognitive restructuring with yoga nidra body scan. Notice how pauses lengthen as the session progresses.", voice: "Aria", ambient: "Soft Drift" },
  { id: "focus", label: "Sharp Focus", duration: "0:25", protocol: "MBSR", src: "/samples/focus.mp3", prompt: "Morning focus session before a big presentation", description: "10-min attention anchor using breath counting and open monitoring. The pacing adapts to build sustained concentration.", voice: "James", ambient: "Flow State" },
  { id: "stress", label: "Stress Relief", duration: "0:30", protocol: "PMR + ACT", src: "/samples/stress.mp3", prompt: "I'm overwhelmed and need to calm down right now", description: "15-min progressive muscle release paired with acceptance exercises. Each muscle group gets precise tension-release timing.", voice: "Luna", ambient: "Safe Harbor" },
  { id: "anxiety", label: "Ease Anxiety", duration: "0:20", protocol: "HRV-BF", src: "/samples/anxiety.mp3", prompt: "Help me breathe through this anxiety before my flight", description: "8-min resonance breathing at 5.5 breaths/min with real-time pace guidance. Inhale and exhale windows are precision-timed.", voice: "Kai", ambient: "Still Water" },
];

/* ─── Logo ─── */

function Logo() {
  return (
    <svg width={36} height={38} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

/* ─── Background ─── */

function AmbientBackground() {
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

/* ─── Transition Interstitial ─── */

function CinematicTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40%" });

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "var(--color-sand-800)" }}
    >
      {/* Giant ghost text — slow drift */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <motion.span
          className="text-[18vw] leading-none whitespace-nowrap tracking-tighter"
          style={{
            fontFamily: "var(--font-display)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.06)",
          }}
          initial={{ opacity: 0, x: 80 }}
          animate={inView ? { opacity: 1, x: -20 } : {}}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        >
          sound different
        </motion.span>
      </div>

      {/* Readable text on top */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4"
          style={{ fontFamily: "var(--font-body)" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Now you&apos;ve heard it
        </motion.p>

        {/* Clip-reveal each line from below */}
        {["Why our AI sessions", "sound different"].map((line, lineIdx) => (
          <div key={lineIdx} className="overflow-hidden">
            <motion.p
              className="text-[2.5rem] md:text-[3.5rem] text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ y: "100%" }}
              animate={inView ? { y: "0%" } : {}}
              transition={{
                duration: 0.7,
                delay: 0.25 + lineIdx * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {line}
            </motion.p>
          </div>
        ))}

        <motion.div
          className="w-16 h-[2px] mx-auto mt-8 rounded-full"
          style={{ background: "var(--color-sage)" }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Animated down indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <span className="text-xs uppercase tracking-[0.2em] text-white/30" style={{ fontFamily: "var(--font-body)" }}>
          Keep scrolling
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-white/40" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Fade-in section wrapper ─── */

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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

/* ─── Pause Timeline Demo ─── */

const timelineSteps = [
  { type: "text" as const, content: "Gently close your eyes.", time: "0:00" },
  { type: "pause" as const, label: "settle in", seconds: 3, time: "0:02" },
  { type: "text" as const, content: "Breathe in for 4 seconds\u2026", time: "0:05" },
  { type: "breath" as const, label: "inhale", seconds: 4, time: "0:06" },
  { type: "text" as const, content: "Now exhale slowly for 6 seconds.", time: "0:10" },
  { type: "breath" as const, label: "exhale", seconds: 6, time: "0:11" },
  { type: "text" as const, content: "Notice your shoulders\u2026 let them drop.", time: "0:17" },
  { type: "pause" as const, label: "body responds", seconds: 5, time: "0:19" },
];

/* ─── Main Page ─── */

export default function HomePage() {
  const [stage, setStage] = useState<"input" | "options" | "generating" | "ready">("input");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<number>(10);
  const [voice, setVoice] = useState<string>("aria");
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);
  const voiceGridRef = useRef<HTMLDivElement>(null);
  const [ambient, setAmbient] = useState<string>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundscape, setSoundscape] = useState<string | null>(null);
  const [detectedIntent, setDetectedIntent] = useState<string>("default");
  const [playing, setPlaying] = useState<string | null>(null);
  const [sampleProgress, setSampleProgress] = useState<Record<string, number>>({});
  const [sampleSound, setSampleSound] = useState<Record<string, string>>(
    Object.fromEntries(samples.map((s) => [s.id, s.ambient]))
  );
  const sampleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const handleSubmitPrompt = useCallback((text: string) => {
    if (!text.trim()) return;
    const t = text.trim();
    setPrompt(t);

    // Detect intent for protocol-aware soundscapes
    const lower = t.toLowerCase();
    let intent = "default";
    if (/sleep|insomnia|bed|night|dream|rest|tired/i.test(lower)) intent = "sleep";
    else if (/focus|concentrat|work|study|morning|sharp|productivity|attention/i.test(lower)) intent = "focus";
    else if (/stress|anxi|worry|overwhelm|calm|relax|tension|panic/i.test(lower)) intent = "stress";
    setDetectedIntent(intent);
    setSoundscape(null);

    setStage("options");
  }, []);

  const handleGenerate = useCallback(async () => {
    setStage("generating");
    // TODO: Replace with actual API call to your backend
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setStage("ready");
  }, []);

  const handleStartOver = useCallback(() => {
    setStage("input");
    setPrompt("");
    setDuration(10);
    setVoice("serene-f");
    setAmbient("none");
    setIsPlaying(false);
  }, []);

  const scrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSamplePlay = useCallback((id: string, durationStr: string) => {
    if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);

    if (playing === id) {
      setPlaying(null);
      return;
    }

    setPlaying(id);
    setSampleProgress((p) => ({ ...p, [id]: 0 }));

    const parts = durationStr.split(":");
    const totalMs = (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
    const tick = 50;
    let elapsed = 0;

    // TODO: Replace with actual audio playback
    sampleIntervalRef.current = setInterval(() => {
      elapsed += tick;
      const pct = Math.min(elapsed / totalMs, 1);
      setSampleProgress((p) => ({ ...p, [id]: pct }));
      if (pct >= 1) {
        if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);
        setPlaying(null);
      }
    }, tick);
  }, [playing]);

  useEffect(() => {
    return () => { if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current); };
  }, []);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseWidth, setPhraseWidth] = useState<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Measure the current phrase width
    if (measureRef.current) {
      setPhraseWidth(measureRef.current.offsetWidth);
    }
  }, [phraseIndex]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    // Show "a guided meditation" for 7s initially, then rotate every 2.5s
    const initialDelay = setTimeout(() => {
      hasAnimatedRef.current = true;
      setPhraseIndex(1);

      intervalId = setInterval(() => {
        setPhraseIndex((i) => (i + 1) % rotatingPhrases.length);
      }, 2500);
    }, 7000);

    return () => {
      clearTimeout(initialDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-sand-50)" }}>

      {/* ════════════════════════════════════════════
          HERO / GENERATOR
         ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" onClick={() => voicePlaying && setVoicePlaying(null)}>
        <AmbientBackground />

        {/* Header */}
        <header className="relative z-50 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={handleStartOver} className="flex items-center gap-2 text-[var(--color-sand-900)] cursor-pointer">
              <Logo />
              <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                MindFlow
              </span>
            </button>
            <div className="flex items-center gap-5">
              <button
                onClick={scrollToInfo}
                className="text-sm text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Listen to examples
              </button>
              <button
                onClick={scrollToInfo}
                className="text-sm text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                How it works
              </button>
              <a
                href="/login"
                className="px-4 py-2 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors text-sm cursor-pointer"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Sign in / Kilt Studio
              </a>
            </div>
          </div>
        </header>

        {/* Generator */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
          <AnimatePresence mode="wait">

            {/* ─── Stage: Text Input ─── */}
            {stage === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl mx-auto flex flex-col items-center"
              >
                {/* Hidden measurer */}
                <span
                  ref={measureRef}
                  className="absolute opacity-0 pointer-events-none text-[2rem] md:text-[2.75rem] italic font-bold whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}
                  aria-hidden="true"
                >
                  {rotatingPhrases[phraseIndex]}
                </span>

                <h1 className="text-[2rem] md:text-[2.75rem] text-[var(--color-sand-900)] text-center mb-8 leading-[1.2] whitespace-nowrap flex items-baseline justify-center">
                  <span>Generate&nbsp;</span>
                  <motion.span
                    className="relative inline-block overflow-hidden pl-[0.05em]"
                    style={{ height: "1.2em" }}
                    animate={{ width: phraseWidth ? phraseWidth + 2 : "auto" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        initial={hasAnimatedRef.current ? { y: "110%", opacity: 0 } : false}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-110%", opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-0 italic font-bold whitespace-nowrap"
                      >
                        {rotatingPhrases[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                    {/* Invisible sizer for baseline */}
                    <span className="invisible italic font-bold" aria-hidden="true">
                      {rotatingPhrases[phraseIndex]}
                    </span>
                  </motion.span>
                </h1>

                {/* Input */}
                <div className="w-full mb-8 relative rounded-xl group">
                  <div className="absolute -inset-[2px] rounded-xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-focus-within:opacity-100 transition-opacity duration-300 blur-[0.5px]" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                <div className="relative bg-white rounded-xl p-3 flex items-center gap-3">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitPrompt(prompt);
                      }
                    }}
                    placeholder="Create a guided meditation on..."
                    className="flex-1 outline-none text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] bg-transparent"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <button
                    onClick={() => handleSubmitPrompt(prompt)}
                    disabled={!prompt.trim()}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer disabled:opacity-30"
                    style={{ background: prompt.trim() ? "var(--color-sand-900)" : "transparent", color: prompt.trim() ? "var(--color-sand-50)" : "var(--color-sand-400)" }}
                  >
                    {prompt.trim() ? <ArrowRight className="w-4 h-4" /> : <MessageCircle className="w-5 h-5" />}
                  </button>
                </div>
                </div>

                {/* Suggestions */}
                <div className="w-full flex flex-col items-center gap-3">
                  <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
                    or try one of these
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        onClick={() => handleSubmitPrompt(s)}
                        className="text-[var(--color-sand-600)] bg-white/70 hover:bg-white border border-[var(--color-sand-200)] text-xs px-3.5 py-2 rounded-full transition-all cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ─── Stage: Voice + Duration ─── */}
            {stage === "options" && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl mx-auto"
                onClick={() => setVoicePlaying(null)}
              >
                {/* Back button — top left, visible */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => { setStage("input"); setPrompt(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <ChevronLeft className="w-4 h-4" />Back
                </motion.button>

                {/* Prompt display — editable feel */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                  <p className="text-2xl text-[var(--color-sand-900)] max-w-md mx-auto leading-snug" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{prompt}&rdquo;</p>
                </motion.div>

                {/* Duration — compact inline pills */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Duration</p>
                  <div className="flex gap-2">
                    {durations.map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={`flex-1 py-2.5 rounded-full text-sm transition-all cursor-pointer ${duration === d ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>{d}m</button>
                    ))}
                  </div>
                </motion.div>

                {/* Voice — prominent cards with waveform */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Voice</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {voices.map((v) => {
                      const isActive = voice === v.id;
                      const isVoicePlaying = voicePlaying === v.id;
                      return (
                        <button key={v.id} onClick={(e) => { e.stopPropagation(); setVoice(v.id); setVoicePlaying(v.id); /* TODO: play voice sample */ setTimeout(() => setVoicePlaying((cur) => cur === v.id ? null : cur), 3000); }} className={`relative flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer text-left overflow-hidden ${isActive ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md" : "bg-white text-[var(--color-sand-900)] hover:shadow-sm border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)]"}`}>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block" style={{ fontFamily: "var(--font-body)" }}>{v.label}</span>
                            <span className={`text-xs mt-0.5 block ${isActive ? "opacity-50" : "text-[var(--color-sand-500)]"}`} style={{ fontFamily: "var(--font-body)" }}>{v.description}</span>
                            {/* Mini waveform — space always reserved */}
                            <div className="flex items-end gap-[2px] h-3 mt-2">
                              {isVoicePlaying && Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className={`w-[2px] rounded-full ${isActive ? "bg-white/50" : "bg-[var(--color-sand-400)]"}`}
                                  animate={{ height: [`${20 + Math.random() * 40}%`, `${40 + Math.random() * 60}%`, `${20 + Math.random() * 40}%`] }}
                                  transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" }}
                                  style={{ height: "30%" }}
                                />
                              ))}
                            </div>
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setVoicePlaying(voicePlaying === v.id ? null : v.id);
                            }}
                            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-white/20 text-white hover:bg-white/30" : "bg-[var(--color-sand-100)] text-[var(--color-sand-500)] hover:bg-[var(--color-sand-200)]"}`}
                          >
                            {isVoicePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Soundscape — subtle inline note */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10 text-center">
                  <p className="text-xs text-[var(--color-sand-400)] flex items-center justify-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                    <Headphones className="w-3 h-3" />
                    Soundscape &amp; ambient layers will be matched after generation
                  </p>
                </motion.div>

                {/* Generate button — large, centered, animated gradient border + text */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex justify-center">
                  <div className="relative rounded-2xl group">
                    <div className="absolute -inset-[2.5px] rounded-2xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-90 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                    <motion.button
                      onClick={handleGenerate}
                      className="relative flex items-center justify-center gap-3 px-16 py-5 rounded-2xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-all text-lg shadow-xl cursor-pointer"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Generate Meditation
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── Stage: Generating ─── */}
            {stage === "generating" && (
              <motion.div key="generating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="w-full max-w-md mx-auto flex flex-col items-center">
                <div className="relative w-40 h-40 flex items-center justify-center mb-12">
                  <div className="absolute inset-0 rounded-full border border-[var(--color-sand-300)] animate-pulse-ring" />
                  <div className="absolute inset-3 rounded-full border border-[var(--color-sand-300)] animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute inset-6 rounded-full border border-[var(--color-sand-300)] animate-pulse-ring" style={{ animationDelay: "1s" }} />
                  <motion.div className="w-16 h-16 rounded-full bg-[var(--color-sand-900)] flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <Sparkles className="w-6 h-6 text-[var(--color-sand-50)]" />
                  </motion.div>
                </div>
                <h2 className="text-3xl text-[var(--color-sand-900)] mb-3 text-center">Crafting your meditation</h2>
                <p className="text-[var(--color-sand-500)] text-center" style={{ fontFamily: "var(--font-body)" }}>Composing guidance, timing pauses, mixing audio...</p>
              </motion.div>
            )}

            {/* ─── Stage: Ready ─── */}
            {stage === "ready" && (
              <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-[2.5rem] md:text-[3rem] text-[var(--color-sand-900)] mb-2">Ready to play</h1>
                  <p className="text-[var(--color-sand-500)] text-sm max-w-sm mx-auto" style={{ fontFamily: "var(--font-body)" }}>&ldquo;{prompt}&rdquo;</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--color-sand-200)]">
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{duration} min</span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{voices.find((v) => v.id === voice)?.label}</span>
                    {ambient !== "none" && <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{ambients.find((a) => a.id === ambient)?.label}</span>}
                  </div>
                  <div className="flex items-end justify-center gap-[3px] h-16 mb-6">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const h = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.7) * 10;
                      return <motion.div key={i} className="w-[3px] rounded-full bg-[var(--color-sand-300)]" style={{ height: `${h}%` }} animate={isPlaying ? { height: [`${h}%`, `${20 + Math.random() * 60}%`, `${h}%`] } : {}} transition={isPlaying ? { duration: 0.8 + Math.random() * 0.6, repeat: Infinity, ease: "easeInOut" } : {}} />;
                    })}
                  </div>
                  <div className="flex items-center justify-center mb-6">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] flex items-center justify-center hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-lg">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                  </div>
                  <div className="mb-5">
                    <div className="w-full h-1 rounded-full bg-[var(--color-sand-200)] overflow-hidden">
                      <motion.div className="h-full rounded-full bg-[var(--color-sand-900)]" initial={{ width: "0%" }} animate={isPlaying ? { width: "100%" } : {}} transition={isPlaying ? { duration: duration * 60, ease: "linear" } : {}} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>0:00</span>
                      <span className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>{duration}:00</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-colors text-xs cursor-pointer" style={{ fontFamily: "var(--font-body)" }}><Download className="w-3.5 h-3.5" />Download</button>
                    <button onClick={handleStartOver} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-colors text-xs cursor-pointer" style={{ fontFamily: "var(--font-body)" }}><RotateCcw className="w-3.5 h-3.5" />New meditation</button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Scroll hint — prominent samples CTA */}
        {stage === "input" && (
          <motion.button
            onClick={scrollToInfo}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer group"
          >
            <span className="relative rounded-full">
              <span className="absolute -inset-[2px] rounded-full bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
              <span
                className="relative flex items-center gap-3 px-10 py-5 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-lg group-hover:bg-[var(--color-sand-800)] group-hover:shadow-xl transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Headphones className="w-5 h-5" />
                <span className="text-base font-medium">Listen to examples</span>
              </span>
            </span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-6 h-6 text-[var(--color-sand-900)]" />
            </motion.div>
          </motion.button>
        )}
      </section>

      {stage === "input" && (<>
      {/* ════════════════════════════════════════════
          SECTION 0 — AUDIO SAMPLES
         ════════════════════════════════════════════ */}
      <section ref={infoRef} className="relative min-h-screen pt-10 pb-24 px-6 flex flex-col justify-start" style={{ background: "var(--color-sand-900)" }}>
        <div className="max-w-6xl mx-auto w-full">
          <FadeIn className="text-center mb-10">
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-50)] leading-tight mb-4">
              Don&apos;t take our word for it.<br />Listen.
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Real sessions generated by real prompts. Every voice, pause, and ambient layer
              you hear was created entirely by MindFlow.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {samples.map((s, idx) => {
              const isActive = playing === s.id;
              const pct = sampleProgress[s.id] || 0;
              return (
                <FadeIn key={s.id} delay={idx * 0.06}>
                  <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/15 transition-all">
                    {isActive && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-white/[0.04]"
                        style={{ width: `${pct * 100}%` }}
                      />
                    )}

                    <div className="relative z-10 p-4">
                      {/* Title + play */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base text-white/90 font-medium" style={{ fontFamily: "var(--font-display)" }}>{s.label}</span>
                        <button
                          onClick={() => handleSamplePlay(s.id, s.duration)}
                          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${isActive ? "bg-white text-[var(--color-sand-900)]" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                        >
                          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      </div>

                      {/* Labeled fields */}
                      <div className="space-y-2.5 mb-3" style={{ fontFamily: "var(--font-body)" }}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-14 shrink-0">Prompt</span>
                          <span className="text-xs text-white/50 italic">&ldquo;{s.prompt}&rdquo;</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-14 shrink-0">Voice</span>
                          <span className="text-xs text-white/50">{s.voice}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-20 shrink-0 mt-1">Change sound</span>
                          <div className="flex flex-wrap gap-1">
                            {(soundscapePresets[s.id] || soundscapePresets.default).map((preset) => {
                              const isSelected = sampleSound[s.id] === preset.label;
                              return (
                                <button
                                  key={preset.label}
                                  onClick={() => setSampleSound((prev) => ({ ...prev, [s.id]: preset.label }))}
                                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${isSelected ? "bg-white/20 text-white/90" : "bg-white/[0.04] text-white/35 hover:bg-white/10 hover:text-white/60"}`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 shrink-0">Protocol (Advanced)</span>
                          <span className="text-xs text-white/50">{s.protocol}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25" style={{ fontFamily: "var(--font-body)" }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          TRANSITION — Cinematic Focus Pull
         ════════════════════════════════════════════ */}
      <CinematicTransition />

      {/* ════════════════════════════════════════════
          SECTION 1 — PAUSE INTELLIGENCE
         ════════════════════════════════════════════ */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-sand-500)] mb-4 font-medium" style={{ fontFamily: "var(--font-body)" }}>
              Pause Intelligence
            </p>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-900)] leading-tight mb-5">
              Most AI reads text.<br />Ours understands silence.
            </h2>
            <p className="text-base text-[var(--color-sand-600)] max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Every pause is intentional &mdash; timed to your breath, calibrated to the instruction.
            </p>
          </FadeIn>

          {/* Timeline visualization */}
          <FadeIn>
            <div className="relative bg-white rounded-2xl border border-[var(--color-sand-200)] overflow-hidden shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-sand-100)] bg-[var(--color-sand-50)]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sand-300)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sand-300)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sand-300)]" />
                </div>
                <span className="text-[10px] text-[var(--color-sand-400)] ml-1" style={{ fontFamily: "var(--font-body)" }}>MindFlow Session — First 24 seconds</span>
              </div>

              <div className="p-5 md:p-7">
                {/* Timeline */}
                <div className="relative">
                  {timelineSteps.map((step, i) => (
                    <FadeIn key={i} delay={i * 0.06}>
                      <div className="flex items-start gap-3">
                        {/* Vertical line + dot */}
                        <div className="flex flex-col items-center w-11 shrink-0 pt-1">
                          <div className={`w-2 h-2 rounded-full ${step.type === "text" ? "bg-[var(--color-sand-800)]" : step.type === "breath" ? "bg-[var(--color-sage)]" : "bg-[var(--color-sand-300)]"}`} />
                          {i < timelineSteps.length - 1 && (
                            <div className="w-[1px] flex-1 min-h-[12px] bg-[var(--color-sand-200)]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 ${step.type === "text" ? "pb-3" : "pb-3"}`}>
                          {step.type === "text" ? (
                            <p className="text-[15px] text-[var(--color-sand-900)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>{step.content}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              {/* Proportional bar — width reflects duration relative to max (6s) */}
                              <div className="h-1 rounded-full overflow-hidden" style={{ width: `${(step.seconds / 6) * 60}%` }}>
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: step.type === "breath" ? "var(--color-sage)" : "var(--color-sand-300)" }}
                                  initial={{ width: "0%" }}
                                  whileInView={{ width: "100%" }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                                />
                              </div>
                              <span className="text-[10px] text-[var(--color-sand-400)] shrink-0" style={{ fontFamily: "var(--font-body)" }}>
                                {step.label} · {step.seconds}s
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>

                {/* Bottom insight */}
                <div className="mt-4 pt-4 border-t border-[var(--color-sand-100)] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-sage-light)] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-sand-900)] font-medium" style={{ fontFamily: "var(--font-body)" }}>12 of 24 seconds are intentional silence</p>
                    <p className="text-xs text-[var(--color-sand-500)] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>Exhale windows are longer than inhales to activate parasympathetic response</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2 — STUDIO AUDIO
         ════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "var(--color-sand-900)" }}>
        {/* Atmospheric glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.07]" style={{ top: "10%", left: "15%", background: "var(--color-sage)" }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.05]" style={{ bottom: "5%", right: "10%", background: "var(--color-dusk)" }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-5" style={{ fontFamily: "var(--font-body)" }}>
              Engineered with professional sound designers
            </p>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-50)] leading-tight mb-5">
              Every session is mixed<br />like a professional album.
            </h2>
            <p className="text-base text-white/40 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              We partnered with audio engineers to make sure every meditation
              sounds warm, spacious, and crafted for headphones.
            </p>
          </FadeIn>

          {/* Living equalizer visualization */}
          <FadeIn>
            <div className="relative mb-16">
              {/* EQ bars — ambient, always-moving visualization */}
              <div className="flex items-end justify-center gap-[3px] h-24 mb-6">
                {Array.from({ length: 48 }).map((_, i) => {
                  const center = 24;
                  const dist = Math.abs(i - center) / center;
                  const baseH = 20 + (1 - dist) * 55 + Math.sin(i * 0.6) * 15;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 max-w-[6px] rounded-full"
                      style={{
                        background: `linear-gradient(to top, rgba(122,158,126,${0.15 + (1 - dist) * 0.35}), rgba(122,158,126,${0.05 + (1 - dist) * 0.15}))`,
                      }}
                      animate={{
                        height: [
                          `${baseH}%`,
                          `${baseH + 10 + Math.random() * 20}%`,
                          `${baseH - 5 + Math.random() * 10}%`,
                          `${baseH}%`,
                        ],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.04,
                      }}
                    />
                  );
                })}
              </div>

              {/* Labels under EQ */}
              <div className="flex justify-between px-2">
                <span className="text-[9px] uppercase tracking-wider text-white/20" style={{ fontFamily: "var(--font-body)" }}>Voice</span>
                <span className="text-[9px] uppercase tracking-wider text-white/20" style={{ fontFamily: "var(--font-body)" }}>Spatial Mix</span>
                <span className="text-[9px] uppercase tracking-wider text-white/20" style={{ fontFamily: "var(--font-body)" }}>Ambient</span>
              </div>
            </div>
          </FadeIn>

          {/* Three pillars — what makes the audio special */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: "Voice that breathes",
                text: "Natural inflection and emotion, not robotic text-to-speech. Every word sounds human.",
              },
              {
                icon: Headphones,
                title: "Mixed for headphones",
                text: "Binaural spatial audio places the voice and sounds around you, not just in front of you.",
              },
              {
                icon: Sliders,
                title: "Studio mastered",
                text: "48kHz, 24-bit audio with loudness optimization. The same quality standard as streaming music.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:border-white/20 transition-colors">
                      <item.icon className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
                    </div>
                    <h3 className="text-base text-white/90" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed pl-12" style={{ fontFamily: "var(--font-body)" }}>{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — SCIENTIFIC PROTOCOLS
         ════════════════════════════════════════════ */}
      <section className="relative py-20 px-6" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs mb-5" style={{ fontFamily: "var(--font-body)" }}>
              <FlaskConical className="w-3.5 h-3.5" />
              Evidence-Based Protocols
            </div>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-900)] leading-tight mb-6">
              Not vibes. Science.
            </h2>
            <p className="text-lg text-[var(--color-sand-600)] max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Every MindFlow session is structured around peer-reviewed clinical protocols.
              When you ask for a sleep meditation, you get a CBT-I informed session &mdash; not
              a generic &ldquo;relax and breathe&rdquo; script. Our AI selects and adapts the right
              protocol for your specific need.
            </p>
          </FadeIn>

          <FadeIn className="mb-12">
            <div className="bg-white rounded-2xl border border-[var(--color-sand-200)] p-6 md:p-8 mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-sand-500)] mb-5 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                Example: You type &ldquo;I can&apos;t sleep&rdquo; &rarr; MindFlow selects:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)] text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>CBT-I sleep restructuring</span>
                <span className="text-[var(--color-sand-400)] text-xs self-center">+</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-dusk-light)] text-[var(--color-dusk)] text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>PMR tension release</span>
                <span className="text-[var(--color-sand-400)] text-xs self-center">+</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-ocean-light)] text-[var(--color-ocean)] text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>NSDR for neural recovery</span>
              </div>
              <p className="text-sm text-[var(--color-sand-600)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                It doesn&apos;t just pick one &mdash; it blends protocols based on your input, time of day, and session
                length to create a clinically-informed sequence that actually targets your problem.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {protocols.map((p, i) => (
              <FadeIn key={p.abbr} delay={i * 0.06}>
                <div className="group bg-white rounded-2xl p-6 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:shadow-sm transition-all h-full">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xs font-mono font-semibold tracking-wider text-[var(--color-sand-900)] bg-[var(--color-sand-100)] px-2 py-1 rounded">
                      {p.abbr}
                    </span>
                    <div className="h-[1px] flex-1 bg-[var(--color-sand-100)]" />
                  </div>
                  <h3 className="text-base text-[var(--color-sand-900)] mb-2 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                    {p.name}
                  </h3>
                  <p className="text-xs text-[var(--color-sand-600)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {p.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Trust strip */}
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[var(--color-sand-200)] pt-12">
              {[
                { value: "6", label: "Clinical protocols supported", icon: ShieldCheck },
                { value: "<2s", label: "Generation latency", icon: Activity },
                { value: "PhD", label: "Advisory board reviewed", icon: GraduationCap },
                { value: "48kHz", label: "Studio sample rate", icon: AudioWaveform },
              ].map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 0.08}>
                  <div className="text-center py-4">
                    <stat.icon className="w-4 h-4 text-[var(--color-sand-400)] mx-auto mb-2" />
                    <p className="text-2xl text-[var(--color-sand-900)] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>
                      {stat.label}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA
         ════════════════════════════════════════════ */}
      <section className="relative py-24 px-6" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center">
            <h2 className="text-[2rem] md:text-[2.75rem] text-[var(--color-sand-900)] leading-tight mb-4">
              Try it now. No signup required.
            </h2>
            <p className="text-base text-[var(--color-sand-600)] mb-8 max-w-lg mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              Describe what you need, choose your preferences, and your meditation is ready in seconds.
            </p>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-all text-sm shadow-sm cursor-pointer"
              style={{ fontFamily: "var(--font-body)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              Create Your Meditation
            </motion.button>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-sand-200)] py-10 px-6" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-sand-900)]">
            <Logo />
            <span className="text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>MindFlow</span>
          </div>
          <p className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>
            &copy; 2026 MindFlow. All rights reserved.
          </p>
        </div>
      </footer>
      </>)}
    </div>
  );
}
