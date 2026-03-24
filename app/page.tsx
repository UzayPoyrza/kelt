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
} from "lucide-react";
import svgPaths from "@/lib/svg-paths";

/* ─── Data ─── */

const durations = [3, 5, 10, 15, 20, 30];

const voices = [
  { id: "serene-f", label: "Serene", description: "Calm, gentle female" },
  { id: "warm-m", label: "Warm", description: "Grounded, steady male" },
  { id: "whisper", label: "Whisper", description: "Soft, intimate tone" },
  { id: "resonant", label: "Resonant", description: "Deep, spacious" },
];

const ambients = [
  { id: "none", label: "Silence", icon: Volume2 },
  { id: "rain", label: "Rain", icon: CloudRain },
  { id: "ocean", label: "Ocean", icon: Waves },
  { id: "forest", label: "Forest", icon: TreePine },
  { id: "wind", label: "Wind", icon: Wind },
];

const suggestions = [
  "A 10-minute meditation for stress relief after a long day",
  "Help me fall asleep with a calming body scan",
  "Morning focus meditation to start my day sharp",
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

/* ─── Live Pause Demo ─── */

const demoScript: { type: "text" | "pause" | "breath"; content: string; duration?: number }[] = [
  { type: "text", content: "Gently close your eyes." },
  { type: "pause", content: "settling in", duration: 3000 },
  { type: "text", content: "Take a slow breath in\u2026" },
  { type: "breath", content: "inhale", duration: 4000 },
  { type: "text", content: "And release." },
  { type: "breath", content: "exhale", duration: 6000 },
  { type: "text", content: "Notice your shoulders." },
  { type: "pause", content: "body awareness", duration: 3000 },
  { type: "text", content: "Let them soften and drop." },
  { type: "pause", content: "letting go", duration: 5000 },
  { type: "text", content: "There\u2019s nowhere to be but here." },
  { type: "pause", content: "presence", duration: 4000 },
];

function PauseDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [pauseProgress, setPauseProgress] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDemo = useCallback(() => {
    setIsRunning(true);
    setVisibleSteps([]);
    setCurrentStep(-1);
    setPauseProgress(0);

    let stepIndex = 0;

    const advance = () => {
      if (stepIndex >= demoScript.length) {
        setIsRunning(false);
        setCurrentStep(-1);
        return;
      }

      const step = demoScript[stepIndex];
      setCurrentStep(stepIndex);
      setVisibleSteps((prev) => [...prev, stepIndex]);

      if (step.type === "pause" || step.type === "breath") {
        const dur = step.duration || 3000;
        setPauseProgress(0);
        const tick = 50;
        let elapsed = 0;
        intervalRef.current = setInterval(() => {
          elapsed += tick;
          setPauseProgress(Math.min(elapsed / dur, 1));
          if (elapsed >= dur) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            stepIndex++;
            advance();
          }
        }, tick);
      } else {
        stepIndex++;
        timerRef.current = setTimeout(advance, 800);
      }
    };

    timerRef.current = setTimeout(advance, 500);
  }, []);

  // Auto-start when scrolled into view
  useEffect(() => {
    if (inView && !isRunning && visibleSteps.length === 0) {
      runDemo();
    }
  }, [inView, isRunning, visibleSteps.length, runDemo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div ref={ref} className="bg-white rounded-3xl border border-[var(--color-sand-200)] overflow-hidden shadow-sm">
      {/* Terminal-style header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-sand-100)] bg-[var(--color-sand-50)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-sand-300)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-sand-300)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-sand-300)]" />
          </div>
          <span className="text-xs text-[var(--color-sand-500)] ml-2" style={{ fontFamily: "var(--font-body)" }}>
            MindFlow Session Preview — Live
          </span>
        </div>
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="text-xs text-[var(--color-sand-500)] hover:text-[var(--color-sand-900)] transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <RotateCcw className="w-3 h-3" />
          Replay
        </button>
      </div>

      {/* Content area */}
      <div className="p-6 md:p-8 min-h-[320px]">
        <div className="space-y-1">
          {demoScript.map((step, i) => {
            const isVisible = visibleSteps.includes(i);
            const isCurrent = currentStep === i;

            if (!isVisible) return null;

            if (step.type === "text") {
              return (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg text-[var(--color-sand-900)] py-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.content}
                </motion.p>
              );
            }

            // Pause or breath
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 py-2"
              >
                {/* Progress bar */}
                <div className="flex-1 h-6 rounded-lg bg-[var(--color-sand-50)] border border-[var(--color-sand-100)] overflow-hidden relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{
                      width: `${(isCurrent ? pauseProgress : 1) * 100}%`,
                      background: step.type === "breath"
                        ? "linear-gradient(90deg, var(--color-sage-light), var(--color-sage))"
                        : "linear-gradient(90deg, var(--color-sand-100), var(--color-sand-300))",
                      opacity: 0.5,
                    }}
                    transition={{ duration: 0.05 }}
                  />
                  <div className="relative z-10 flex items-center justify-between h-full px-3">
                    <span className="text-xs text-[var(--color-sand-600)]" style={{ fontFamily: "var(--font-body)" }}>
                      {step.type === "breath" ? (step.content === "inhale" ? "Breathe in\u2026" : "Breathe out\u2026") : `\u23F8 ${step.content}`}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-sand-400)]">
                      {((step.duration || 3000) / 1000).toFixed(0)}s
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Cursor when running */}
          {isRunning && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-[2px] h-5 bg-[var(--color-sand-400)] mt-1 rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function HomePage() {
  const [stage, setStage] = useState<"input" | "options" | "generating" | "ready">("input");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<number>(10);
  const [voice, setVoice] = useState<string>("serene-f");
  const [ambient, setAmbient] = useState<string>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const handleSubmitPrompt = useCallback((text: string) => {
    if (!text.trim()) return;
    setPrompt(text.trim());
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

  return (
    <div className="min-h-screen" style={{ background: "var(--color-sand-50)" }}>

      {/* ════════════════════════════════════════════
          HERO / GENERATOR
         ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <AmbientBackground />

        {/* Header */}
        <header className="relative z-50 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
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
                How it works
              </button>
              <a
                href="/login"
                className="px-4 py-2 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors text-sm cursor-pointer"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Sign in
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
                <div className="mb-8">
                  <Logo />
                </div>

                <h1 className="text-[2.5rem] md:text-[3.25rem] text-[var(--color-sand-900)] text-center mb-14 leading-tight">
                  Describe your ideal meditation
                </h1>

                {/* Suggestions */}
                <div className="w-full mb-4">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] mb-3 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                    Try something like
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06 }}
                        onClick={() => handleSubmitPrompt(s)}
                        className="bg-white/60 hover:bg-white border border-[var(--color-sand-200)] px-3.5 py-2 rounded-lg text-[var(--color-sand-700)] text-sm hover:shadow-sm transition-all text-left cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="w-full bg-white border border-[var(--color-sand-200)] rounded-xl p-3 flex items-center gap-3 shadow-sm">
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
                    placeholder="Ask me anything about meditation..."
                    className="flex-1 outline-none text-sm text-[var(--color-sand-900)] placeholder:text-[var(--color-sand-400)] bg-transparent"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <button
                    onClick={() => handleSubmitPrompt(prompt)}
                    disabled={!prompt.trim()}
                    className="shrink-0 size-9 flex items-center justify-center disabled:opacity-30 transition-opacity cursor-pointer"
                  >
                    <svg className="size-full" fill="none" viewBox="0 0 34.8962 34.8922">
                      <path
                        d={svgPaths.p2f0e8d80}
                        fill={prompt.trim() ? "var(--color-sand-900)" : "var(--color-sand-300)"}
                      />
                    </svg>
                  </button>
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
              >
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                  <p className="text-sm text-[var(--color-sand-500)] mb-2" style={{ fontFamily: "var(--font-body)" }}>Your meditation</p>
                  <p className="text-lg text-[var(--color-sand-900)] max-w-md mx-auto" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{prompt}&rdquo;</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] mb-3 font-medium" style={{ fontFamily: "var(--font-body)" }}>Duration</p>
                  <div className="flex gap-2">
                    {durations.map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={`flex-1 py-3 rounded-xl text-sm transition-all cursor-pointer ${duration === d ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-700)] hover:bg-white"}`} style={{ fontFamily: "var(--font-body)" }}>{d}m</button>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] mb-3 font-medium" style={{ fontFamily: "var(--font-body)" }}>Voice</p>
                  <div className="grid grid-cols-2 gap-2">
                    {voices.map((v) => (
                      <button key={v.id} onClick={() => setVoice(v.id)} className={`flex flex-col items-start p-3.5 rounded-xl transition-all cursor-pointer ${voice === v.id ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-900)] hover:bg-white"}`}>
                        <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{v.label}</span>
                        <span className={`text-xs mt-0.5 ${voice === v.id ? "opacity-60" : "text-[var(--color-sand-500)]"}`} style={{ fontFamily: "var(--font-body)" }}>{v.description}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] mb-3 font-medium" style={{ fontFamily: "var(--font-body)" }}>Ambient Sound</p>
                  <div className="flex gap-2">
                    {ambients.map((a) => { const Icon = a.icon; return (
                      <button key={a.id} onClick={() => setAmbient(a.id)} className={`flex flex-col items-center gap-1.5 py-2.5 px-3 rounded-xl transition-all flex-1 cursor-pointer ${ambient === a.id ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-700)] hover:bg-white"}`}>
                        <Icon className="w-4 h-4" /><span className="text-xs" style={{ fontFamily: "var(--font-body)" }}>{a.label}</span>
                      </button>
                    ); })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex items-center justify-between">
                  <button onClick={() => { setStage("input"); setPrompt(""); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[var(--color-sand-600)] hover:bg-white/60 transition-all text-sm cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                    <ChevronLeft className="w-4 h-4" />Back
                  </button>
                  <motion.button onClick={handleGenerate} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-all text-sm shadow-sm cursor-pointer" style={{ fontFamily: "var(--font-body)" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Sparkles className="w-4 h-4" />Generate Meditation
                  </motion.button>
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

        {/* Scroll hint — only on input stage */}
        {stage === "input" && (
          <motion.button
            onClick={scrollToInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-[var(--color-sand-400)] cursor-pointer"
          >
            <span className="text-xs" style={{ fontFamily: "var(--font-body)" }}>Learn more</span>
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </section>

      {/* ════════════════════════════════════════════
          SECTION 1 — LIVE PAUSE DEMO
         ════════════════════════════════════════════ */}
      <section ref={infoRef} className="relative py-32 px-6 overflow-hidden" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-sand-500)] mb-4 font-medium" style={{ fontFamily: "var(--font-body)" }}>
              See the Difference
            </p>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-900)] leading-tight mb-6">
              Most AI reads text.<br />Ours understands silence.
            </h2>
            <p className="text-lg text-[var(--color-sand-600)] max-w-2xl mx-auto leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
              Watch how MindFlow generates a meditation. Notice how the pauses aren&apos;t random &mdash;
              they&apos;re timed to your breath, calibrated to the instruction, and placed where a
              real teacher would let silence do the work.
            </p>
          </FadeIn>

          <FadeIn>
            <PauseDemo />
          </FadeIn>

          {/* Comparison: us vs typical AI */}
          <FadeIn className="mt-20">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-7 border border-[var(--color-sand-200)]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] font-medium" style={{ fontFamily: "var(--font-body)" }}>Typical AI Meditation</p>
                </div>
                <div className="space-y-2 font-mono text-sm text-[var(--color-sand-600)]" style={{ fontFamily: "var(--font-body)" }}>
                  <p>Close your eyes. Take a deep breath in.</p>
                  <p>Now breathe out. Feel your body relax.</p>
                  <p>Notice any tension in your shoulders.</p>
                  <p>Let it go. Breathe in again. And out.</p>
                  <p className="text-xs text-[var(--color-sand-400)] italic mt-3">No pauses. No pacing. Just a wall of text read aloud.</p>
                </div>
              </div>
              <div className="bg-[var(--color-sand-900)] rounded-2xl p-7 text-[var(--color-sand-50)]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="text-xs uppercase tracking-widest opacity-60 font-medium" style={{ fontFamily: "var(--font-body)" }}>MindFlow</p>
                </div>
                <div className="space-y-2 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  <p>Close your eyes.</p>
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex gap-0.5">
                      {[1,2,3].map(n => <div key={n} className="w-1 h-1 rounded-full bg-white/30" />)}
                    </div>
                    <span className="text-xs opacity-40 italic">3s — let the instruction land</span>
                  </div>
                  <p>Take a deep breath in&hellip;</p>
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
                    <span className="text-xs opacity-40 italic">4s inhale window</span>
                  </div>
                  <p>And slowly release.</p>
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
                    <span className="text-xs opacity-40 italic">6s exhale — longer to activate parasympathetic</span>
                  </div>
                  <p>Notice your shoulders&hellip; and let them drop.</p>
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <div key={n} className="w-1 h-1 rounded-full bg-white/30" />)}
                    </div>
                    <span className="text-xs opacity-40 italic">5s — body needs time to respond</span>
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
      <section className="relative py-32 px-6" style={{ background: "var(--color-sand-900)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[200px] opacity-8" style={{ top: "-10%", left: "20%", background: "#4a7a5a" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[180px] opacity-6" style={{ bottom: "-10%", right: "10%", background: "#5a6a8a" }} />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs mb-5" style={{ fontFamily: "var(--font-body)" }}>
              <Mic className="w-3.5 h-3.5" />
              Professional Audio Pipeline
            </div>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-50)] leading-tight mb-6">
              Your meditation sounds like<br />a studio recording. Because it is.
            </h2>
            <p className="text-base text-white/50 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              We didn&apos;t just train an AI and ship it. We built an audio pipeline with
              Grammy-nominated engineers and psychoacoustics researchers. Every session
              goes through the same signal chain as a professional album.
            </p>
          </FadeIn>

          {/* Audio pipeline visualization */}
          <FadeIn>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-10 mb-12">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-8 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                Signal Chain — Every Session
              </p>
              <div className="flex flex-col md:flex-row items-stretch gap-3">
                {[
                  { step: "01", label: "Voice Synthesis", detail: "Neural TTS with emotion modeling and natural prosody", icon: Mic },
                  { step: "02", label: "Pause Engine", detail: "Breath-cycle timing, semantic pause injection, silence shaping", icon: Timer },
                  { step: "03", label: "Spatial Mix", detail: "Binaural panning, room simulation, depth positioning", icon: Headphones },
                  { step: "04", label: "Ambient Layer", detail: "Field-recorded soundscapes, frequency-matched to session type", icon: TreePine },
                  { step: "05", label: "Master", detail: "48kHz/24-bit, loudness-normalized, headphone EQ'd", icon: Sliders },
                ].map((s, i) => (
                  <FadeIn key={s.step} delay={i * 0.08} className="flex-1">
                    <div className="bg-white/5 rounded-xl p-5 h-full border border-white/5 hover:border-white/15 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono text-white/30">{s.step}</span>
                        <s.icon className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <p className="text-sm font-medium text-white/90 mb-1" style={{ fontFamily: "var(--font-body)" }}>{s.label}</p>
                      <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{s.detail}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
              {/* Connecting line */}
              <div className="hidden md:block mt-4 mx-5">
                <div className="h-[1px] w-full bg-gradient-to-r from-white/5 via-white/15 to-white/5" />
              </div>
            </div>
          </FadeIn>

          {/* Audio specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "48kHz", label: "Sample rate", sub: "Studio standard" },
              { value: "24-bit", label: "Bit depth", sub: "Full dynamic range" },
              { value: "LUFS-14", label: "Loudness target", sub: "Optimized for quiet" },
              { value: "Stereo+", label: "Spatial format", sub: "Binaural compatible" },
            ].map((spec, i) => (
              <FadeIn key={spec.label} delay={i * 0.06}>
                <div className="text-center py-6 border border-white/5 rounded-xl">
                  <p className="text-xl text-white/90 mb-1" style={{ fontFamily: "var(--font-display)" }}>{spec.value}</p>
                  <p className="text-xs text-white/50 font-medium" style={{ fontFamily: "var(--font-body)" }}>{spec.label}</p>
                  <p className="text-xs text-white/25 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{spec.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — SCIENTIFIC PROTOCOLS
         ════════════════════════════════════════════ */}
      <section className="relative py-32 px-6" style={{ background: "var(--color-sand-50)" }}>
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
    </div>
  );
}
