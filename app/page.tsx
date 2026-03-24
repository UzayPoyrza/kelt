"use client";

import { useState, useCallback, useRef } from "react";
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
          HOW IT WORKS
         ════════════════════════════════════════════ */}
      <section ref={infoRef} className="relative py-32 px-6" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-sand-500)] mb-4 font-medium" style={{ fontFamily: "var(--font-body)" }}>
              The MindFlow Difference
            </p>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-900)] leading-tight mb-6">
              Not another meditation app.<br />A clinical-grade session engine.
            </h2>
            <p className="text-lg text-[var(--color-sand-600)] max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Every session is generated with semantic understanding of therapeutic language,
              pause-aware pacing modeled on human breath cycles, and studio-mastered audio
              engineered in collaboration with professional sound designers.
            </p>
          </FadeIn>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-6 mb-32">
            {[
              {
                icon: BrainCircuit,
                title: "Semantic Intelligence",
                description: "Our model understands the meaning behind therapeutic language — not just words, but intent. It knows when to guide, when to suggest, and when silence is the most powerful instruction.",
                detail: "Trained on thousands of hours of clinical meditation transcripts with licensed therapist oversight.",
              },
              {
                icon: Timer,
                title: "Pause-Aware Pacing",
                description: "Pauses aren't gaps — they're the meditation. MindFlow models natural breath cycles and inserts silences that feel intentional, allowing your nervous system to actually respond.",
                detail: "Adaptive timing calibrated to session type: shorter pauses for focus, longer holds for body scans.",
              },
              {
                icon: Headphones,
                title: "Studio-Mastered Audio",
                description: "Every session is mixed with spatial audio, binaural entrainment, and layered ambient soundscapes — engineered by professional sound designers, not generated by algorithms.",
                detail: "48kHz / 24-bit output. Professionally EQ'd for headphones, speakers, and sleep environments.",
              },
            ].map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-[var(--color-sand-200)] h-full flex flex-col">
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-sand-100)] flex items-center justify-center mb-5">
                    <pillar.icon className="w-5 h-5 text-[var(--color-sand-700)]" />
                  </div>
                  <h3 className="text-xl text-[var(--color-sand-900)] mb-3">{pillar.title}</h3>
                  <p className="text-sm text-[var(--color-sand-600)] leading-relaxed mb-4 flex-1" style={{ fontFamily: "var(--font-body)" }}>
                    {pillar.description}
                  </p>
                  <p className="text-xs text-[var(--color-sand-500)] leading-relaxed border-t border-[var(--color-sand-100)] pt-4" style={{ fontFamily: "var(--font-body)" }}>
                    {pillar.detail}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Audio engineering detail */}
          <FadeIn className="mb-32">
            <div className="bg-[var(--color-sand-900)] rounded-3xl p-10 md:p-14 text-[var(--color-sand-50)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10" style={{ background: "#c8d5ca" }} />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-50 mb-4 font-medium" style={{ fontFamily: "var(--font-body)" }}>
                    Audio Engineering
                  </p>
                  <h2 className="text-[2rem] md:text-[2.5rem] leading-tight mb-6" style={{ color: "var(--color-sand-50)" }}>
                    Built with sound engineers, not just engineers
                  </h2>
                  <p className="text-sm leading-relaxed opacity-70 mb-6" style={{ fontFamily: "var(--font-body)" }}>
                    We partnered with Grammy-nominated audio engineers and psychoacoustics researchers
                    to build an audio pipeline that treats every session like a studio production.
                    The result: meditations that sound as good as professional recordings, generated in seconds.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Spatial Audio", sub: "3D soundfield positioning" },
                      { label: "Binaural Beats", sub: "Frequency-tuned entrainment" },
                      { label: "Dynamic Range", sub: "Mastered for quiet listening" },
                      { label: "Ambient Layers", sub: "Field-recorded soundscapes" },
                    ].map((item) => (
                      <div key={item.label} className="border border-white/10 rounded-xl p-3">
                        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{item.label}</p>
                        <p className="text-xs opacity-50 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {/* Waveform visualization */}
                  <div className="flex items-end gap-[2px] h-40 opacity-40">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const h = 15 + Math.sin(i * 0.3) * 25 + Math.cos(i * 0.5) * 20 + Math.sin(i * 0.8) * 10;
                      return (
                        <div
                          key={i}
                          className="w-[2px] rounded-full bg-white/60"
                          style={{ height: `${Math.max(8, h)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Scientific Protocols */}
          <FadeIn className="mb-32">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs mb-5" style={{ fontFamily: "var(--font-body)" }}>
                <FlaskConical className="w-3.5 h-3.5" />
                Evidence-Based
              </div>
              <h2 className="text-[2rem] md:text-[2.75rem] text-[var(--color-sand-900)] leading-tight mb-4">
                Grounded in clinical protocols
              </h2>
              <p className="text-base text-[var(--color-sand-600)] max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                MindFlow doesn&apos;t generate generic relaxation scripts. Every session is structured
                around peer-reviewed therapeutic protocols, adapted by our AI to your specific needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {protocols.map((p, i) => (
                <FadeIn key={p.abbr} delay={i * 0.06}>
                  <div className="group bg-white rounded-2xl p-6 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:shadow-sm transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono font-semibold tracking-wider text-[var(--color-sand-900)] bg-[var(--color-sand-100)] px-2 py-1 rounded">
                        {p.abbr}
                      </span>
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
          </FadeIn>

          {/* Trust / Numbers strip */}
          <FadeIn className="mb-32">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "48kHz", label: "Audio sample rate", icon: AudioWaveform },
                { value: "6", label: "Clinical protocols", icon: ShieldCheck },
                { value: "<2s", label: "Generation latency", icon: Activity },
                { value: "PhD", label: "Advisor-reviewed", icon: GraduationCap },
              ].map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 0.08}>
                  <div className="text-center py-6">
                    <stat.icon className="w-5 h-5 text-[var(--color-sand-400)] mx-auto mb-3" />
                    <p className="text-2xl text-[var(--color-sand-900)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
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

          {/* CTA */}
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
