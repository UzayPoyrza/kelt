"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Volume2,
  Play,
  Pause,
  ChevronDown,
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
import {
  Logo,
  AmbientBackground,
  FadeIn,
  Header,
  rotatingPhrases,
  suggestions,
  protocols,
  samples,
  soundscapePresets,
} from "@/lib/shared";

/* ─── Transition Interstitial ─── */

const testimonials = [
  { name: "Mia Torres", location: "Meditation Instructor, Austin", text: "...honestly it replaced like 4 hours of recording and editing per week. I just type what the client needs and it's done." },
  { name: "James Chen", location: "San Francisco", text: "I've tried every meditation app out there. This is the first one where I actually fall asleep before it ends." },
  { name: "Dr. Anita Kapoor", location: "Psychiatrist, Chicago", text: "The PMR timing is clinically accurate. I've started recommending it to patients between sessions." },
];

function CinematicTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });

  return (
    <div
      ref={ref}
      className="relative py-32 px-6 overflow-hidden"
      style={{ background: "var(--color-sand-800)" }}
    >
      {/* Giant ghost text — slow drift */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ top: "-10%" }}
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

      {/* Heading */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-20">
        <motion.p
          className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4"
          style={{ fontFamily: "var(--font-body)" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Now you&apos;ve heard it
        </motion.p>

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

      {/* Testimonials — integrated, minimal */}
      <div className="relative z-10 max-w-4xl mx-auto grid md:grid-cols-3 gap-x-12 gap-y-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 + i * 0.15, ease: "easeOut" }}
            className="text-center"
          >
            {/* Stars */}
            <div className="flex justify-center gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, si) => (
                <svg key={si} className="w-3 h-3 text-[var(--color-sage)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p
              className="text-[13px] text-white/50 leading-relaxed mb-4 italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="w-6 h-[1px] mx-auto mb-3 bg-white/10" />

            <p className="text-[11px] text-white/35 uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-body)" }}>
              {t.name}
            </p>
            <p className="text-[10px] text-white/20 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
              {t.location}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
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
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [sampleProgress, setSampleProgress] = useState<Record<string, number>>({});
  const [sampleSound, setSampleSound] = useState<Record<string, string>>(
    Object.fromEntries(samples.map((s) => [s.id, s.ambient]))
  );
  const sampleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);

  const handleSubmitPrompt = useCallback((text: string) => {
    if (!text.trim()) return;
    router.push(`/create?prompt=${encodeURIComponent(text.trim())}`);
  }, [router]);

  const scrollToInfo = () => {
    if (infoRef.current) {
      // Section has pt-32 (128px) before heading. Blob nav clears ~76px from top.
      // So: section_top + 128 (padding) - 76 (nav) = +52
      const top = infoRef.current.getBoundingClientRect().top + window.scrollY + 52;
      window.scrollTo({ top, behavior: "smooth" });
    }
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
    if (measureRef.current) {
      setPhraseWidth(measureRef.current.offsetWidth);
    }
  }, [phraseIndex]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
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
          HERO / INPUT
         ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <AmbientBackground />

        <Header
          showNavLinks
          onScrollToInfo={scrollToInfo}
          onScrollToHow={() => howRef.current?.scrollIntoView({ behavior: "smooth" })}
        />

        {/* Generator */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
        </div>

        {/* Scroll hint — prominent samples CTA */}
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
      </section>

      {/* ════════════════════════════════════════════
          SECTION 0 — AUDIO SAMPLES
         ════════════════════════════════════════════ */}
      <section ref={infoRef} className="relative min-h-screen pb-24 px-6 scroll-mt-0" style={{ background: "var(--color-sand-900)" }}>
        <div className="max-w-6xl mx-auto w-full pt-32">
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
                  <div onClick={() => handleSamplePlay(s.id, s.duration)} className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/15 transition-all cursor-pointer">
                    {isActive && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-white/[0.04]"
                        style={{ width: `${pct * 100}%` }}
                      />
                    )}

                    <div className="relative z-10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base text-white/90 font-medium" style={{ fontFamily: "var(--font-display)" }}>{s.label}</span>
                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-white text-[var(--color-sand-900)]" : "bg-white/10 text-white/60"}`}>
                          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3" style={{ fontFamily: "var(--font-body)" }}>
                        <div className="flex items-baseline gap-3">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-16 shrink-0">Prompt</span>
                          <span className="text-xs text-white/50 italic">&ldquo;{s.prompt}&rdquo;</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-16 shrink-0">Voice</span>
                          <span className="text-xs text-white/50">{s.voice}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-16 shrink-0">Sound</span>
                          <div className="flex flex-wrap gap-1">
                            {(soundscapePresets[s.id] || soundscapePresets.default).map((preset) => {
                              const isSelected = sampleSound[s.id] === preset.label;
                              return (
                                <button
                                  key={preset.label}
                                  onClick={(e) => { e.stopPropagation(); setSampleSound((prev) => ({ ...prev, [s.id]: preset.label })); }}
                                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${isSelected ? "bg-white/20 text-white/90" : "bg-white/[0.04] text-white/35 hover:bg-white/10 hover:text-white/60"}`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-[10px] uppercase tracking-wider text-white/25 w-16 shrink-0">Protocol</span>
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
      <section ref={howRef} className="relative py-20 px-6 overflow-hidden" style={{ background: "var(--color-sand-50)" }}>
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

          <FadeIn>
            <div className="relative bg-white rounded-2xl border border-[var(--color-sand-200)] overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-sand-100)] bg-[var(--color-sand-50)]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sand-300)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sand-300)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-sand-300)]" />
                </div>
                <span className="text-[10px] text-[var(--color-sand-400)] ml-1" style={{ fontFamily: "var(--font-body)" }}>MindFlow Session — First 24 seconds</span>
              </div>

              <div className="p-5 md:p-7">
                <div className="relative">
                  {timelineSteps.map((step, i) => (
                    <FadeIn key={i} delay={i * 0.06}>
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center w-11 shrink-0 pt-1">
                          <div className={`w-2 h-2 rounded-full ${step.type === "text" ? "bg-[var(--color-sand-800)]" : step.type === "breath" ? "bg-[var(--color-sage)]" : "bg-[var(--color-sand-300)]"}`} />
                          {i < timelineSteps.length - 1 && (
                            <div className="w-[1px] flex-1 min-h-[12px] bg-[var(--color-sand-200)]" />
                          )}
                        </div>

                        <div className={`flex-1 ${step.type === "text" ? "pb-3" : "pb-3"}`}>
                          {step.type === "text" ? (
                            <p className="text-[15px] text-[var(--color-sand-900)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>{step.content}</p>
                          ) : (
                            <div className="flex items-center gap-2">
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.07]" style={{ top: "10%", left: "15%", background: "var(--color-sage)" }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.05]" style={{ bottom: "5%", right: "10%", background: "var(--color-dusk)" }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
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

          <FadeIn>
            <div className="relative mb-16">
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

              <div className="flex justify-between px-2">
                <span className="text-[9px] uppercase tracking-wider text-white/20" style={{ fontFamily: "var(--font-body)" }}>Voice</span>
                <span className="text-[9px] uppercase tracking-wider text-white/20" style={{ fontFamily: "var(--font-body)" }}>Spatial Mix</span>
                <span className="text-[9px] uppercase tracking-wider text-white/20" style={{ fontFamily: "var(--font-body)" }}>Ambient</span>
              </div>
            </div>
          </FadeIn>

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
      <section className="relative py-24 px-6" style={{ background: "var(--color-sand-50)" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-sand-500)] mb-5" style={{ fontFamily: "var(--font-body)" }}>
              Built on clinical research
            </p>
            <h2 className="text-[2.5rem] md:text-[3.5rem] text-[var(--color-sand-900)] leading-tight mb-5">
              Not vibes. Science.
            </h2>
            <p className="text-base text-[var(--color-sand-600)] max-w-md mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Every session is built on clinical techniques we researched and carefully
              incorporated into our AI. Tell us what you need, and we match
              the right approach automatically.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="bg-white rounded-2xl border border-[var(--color-sand-200)] overflow-hidden shadow-sm mb-14">
              <div className="px-5 py-3 border-b border-[var(--color-sand-100)] bg-[var(--color-sand-50)]">
                <span className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>How it works — prompt to protocol</span>
              </div>

              <div className="p-5 md:p-7">
                <div className="space-y-5">
                  {[
                    {
                      prompt: "I can\u2019t fall asleep",
                      protocols: [
                        { label: "CBT-I", color: "var(--color-sage)", bg: "var(--color-sage-light)" },
                        { label: "PMR", color: "var(--color-dusk)", bg: "var(--color-dusk-light)" },
                        { label: "NSDR", color: "var(--color-ocean)", bg: "var(--color-ocean-light)" },
                      ],
                      why: "Restructure sleep thoughts, release body tension, guide into deep rest",
                    },
                    {
                      prompt: "Anxious before a meeting",
                      protocols: [
                        { label: "HRV-BF", color: "var(--color-ocean)", bg: "var(--color-ocean-light)" },
                        { label: "ACT", color: "var(--color-ember)", bg: "var(--color-ember-light)" },
                      ],
                      why: "Regulate heart rate with paced breathing, defuse anxious thoughts",
                    },
                    {
                      prompt: "Help me focus deeply",
                      protocols: [
                        { label: "MBSR", color: "var(--color-sage)", bg: "var(--color-sage-light)" },
                        { label: "HRV-BF", color: "var(--color-ocean)", bg: "var(--color-ocean-light)" },
                      ],
                      why: "Open monitoring attention training with coherence breathing",
                    },
                  ].map((example, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-2 md:w-52 shrink-0">
                          <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>&ldquo;</span>
                          <span className="text-sm text-[var(--color-sand-800)] italic" style={{ fontFamily: "var(--font-display)" }}>{example.prompt}</span>
                          <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>&rdquo;</span>
                        </div>

                        <motion.div
                          className="hidden md:block"
                          initial={{ width: 0, opacity: 0 }}
                          whileInView={{ width: 32, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                        >
                          <div className="h-[1px] w-full bg-[var(--color-sand-300)]" />
                        </motion.div>

                        <div className="flex items-center gap-1.5 flex-1">
                          {example.protocols.map((p, pi) => (
                            <motion.span
                              key={p.label}
                              className="px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{ fontFamily: "var(--font-body)", background: p.bg, color: p.color }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 + pi * 0.08 }}
                            >
                              {p.label}
                            </motion.span>
                          ))}
                        </div>

                        <p className="text-[11px] text-[var(--color-sand-400)] md:w-64 shrink-0 md:text-right leading-snug" style={{ fontFamily: "var(--font-body)" }}>
                          {example.why}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {protocols.map((p, i) => (
              <FadeIn key={p.abbr} delay={i * 0.05}>
                <div className="group flex items-center gap-3 py-3 px-4 rounded-lg bg-[var(--color-sand-100)]/60 hover:bg-[var(--color-sand-100)] transition-colors">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[var(--color-sand-600)] shrink-0" style={{ fontFamily: "var(--font-body)" }}>
                    {p.abbr}
                  </span>
                  <div className="w-[1px] h-4 bg-[var(--color-sand-300)]" />
                  <p className="text-xs text-[var(--color-sand-700)] leading-snug" style={{ fontFamily: "var(--font-body)" }}>
                    {p.name}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA
         ════════════════════════════════════════════ */}
      <section className="relative py-24 px-6" style={{ background: "var(--color-sand-900)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center">
            <h2 className="text-[2rem] md:text-[2.75rem] text-[var(--color-sand-50)] leading-tight mb-4">
              Try it now. No signup required.
            </h2>
            <p className="text-base text-white/50 mb-8 max-w-lg mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              Describe what you need, choose your preferences, and your meditation is ready in seconds.
            </p>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[var(--color-sand-50)] text-[var(--color-sand-900)] hover:bg-white transition-all text-sm shadow-sm cursor-pointer"
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
      <footer className="border-t border-white/10 py-10 px-6" style={{ background: "var(--color-sand-900)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-sand-50)]">
            <Logo />
            <span className="text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>MindFlow</span>
          </div>
          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            &copy; 2026 MindFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
