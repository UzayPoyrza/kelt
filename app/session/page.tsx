"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  Play,
  Pause,
  ChevronLeft,
  ChevronDown,
  Download,
  RotateCcw,
  Sparkles,
  BrainCircuit,
  Music,
  PenLine,
  Sliders,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  AmbientBackground,
  Header,
  voices,
  soundscapePresets,
} from "@/lib/shared";

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";
  const voice = searchParams.get("voice") || "aria";
  const duration = parseInt(searchParams.get("duration") || "10");
  const detectedIntent = searchParams.get("intent") || "default";

  const [stage, setStage] = useState<"generating" | "ready">("generating");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPct, setPlaybackPct] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const [soundscape, setSoundscape] = useState<string | null>(null);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [bgVolume, setBgVolume] = useState(50);

  // Auto-select recommended soundscape
  useEffect(() => {
    const presets = soundscapePresets[detectedIntent] || soundscapePresets.default;
    if (presets.length > 0) {
      setSoundscape(presets[0].label);
    }
  }, [detectedIntent]);

  // Simulate generation
  useEffect(() => {
    const timer = setTimeout(() => setStage("ready"), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!prompt) {
    router.push("/");
    return null;
  }

  // Build soundscape lists: recommended (1 default), alternatives (rest from same intent), others (from other intents, deduplicated)
  const intentPresets = soundscapePresets[detectedIntent] || soundscapePresets.default;
  const recommendedPresets = intentPresets.slice(0, 1);
  const alternativePresets = intentPresets.slice(1);
  const usedLabels = new Set(intentPresets.map((p) => p.label));
  const otherPresets = Object.values(soundscapePresets).flat()
    .filter((p, i, arr) => arr.findIndex((x) => x.label === p.label) === i)
    .filter((p) => !usedLabels.has(p.label))
    .slice(0, 8);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-sand-50)" }}>
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <AmbientBackground />

        <Header />

        <div className="relative z-10 flex-1 flex items-start justify-center px-6 pt-8 pb-6">
          <AnimatePresence mode="wait">

            {/* ─── Generating ─── */}
            {stage === "generating" && (
              <motion.div key="generating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex flex-col items-center justify-center -mt-16">
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

            {/* ─── Ready ─── */}
            {stage === "ready" && (
              <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl mx-auto">
                {/* Top row: Back + (Edit in Kilt Studio (Free) when picker is open) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => router.push(`/create?prompt=${encodeURIComponent(prompt)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />Back
                  </button>
                  {showBgPicker && (
                    <a href="/login" className="relative rounded-lg group">
                      <div className="absolute -inset-[2px] rounded-lg bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                      <span
                        className="relative flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--color-sand-900)] text-[var(--color-sand-50)] text-sm cursor-pointer hover:bg-[var(--color-sand-800)] transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Edit in Kilt Studio (Free)
                      </span>
                    </a>
                  )}
                </motion.div>

                {/* Header */}
                <div className="text-center mb-3">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xs text-[var(--color-sand-500)] mb-1" style={{ fontFamily: "var(--font-body)" }}>Your meditation is ready</motion.p>
                  <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl text-[var(--color-sand-900)] mb-2" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{prompt}&rdquo;</motion.h1>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{duration} min</span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{voices.find((v) => v.id === voice)?.label}</span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)] text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      <BrainCircuit className="w-3 h-3 inline mr-1" />
                      {detectedIntent === "sleep" ? "CBT-I + NSDR" : detectedIntent === "focus" ? "MBSR" : detectedIntent === "stress" ? "PMR + ACT" : "MBSR"}
                    </span>
                  </motion.div>
                </div>

                {/* Player card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-[var(--color-sand-200)] overflow-hidden">
                  <div className="px-5 py-4">
                    {/* Waveform */}
                    <div className="flex items-end justify-center gap-[2px] h-14 mb-3">
                      {Array.from({ length: 50 }).map((_, i) => {
                        const h = 15 + Math.sin(i * 0.35) * 20 + Math.cos(i * 0.7) * 15 + Math.sin(i * 0.15) * 10;
                        return (
                          <motion.div key={i} className="flex-1 max-w-[4px] rounded-full" style={{ height: `${h}%`, background: isPlaying ? "var(--color-sand-900)" : "var(--color-sand-300)" }} animate={isPlaying ? { height: [`${h}%`, `${15 + Math.random() * 65}%`, `${h}%`] } : {}} transition={isPlaying ? { duration: 0.6 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" } : {}} />
                        );
                      })}
                    </div>

                    {/* Play */}
                    <div className="flex items-center justify-center mb-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-[var(--color-sand-900)] text-[var(--color-sand-50)] flex items-center justify-center hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-lg">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                    </div>

                    {/* Progress — interactive */}
                    <div className="mb-3">
                      <div
                        ref={progressRef}
                        className="relative w-full h-5 flex items-center cursor-pointer group"
                        onClick={(e) => {
                          if (!progressRef.current) return;
                          const rect = progressRef.current.getBoundingClientRect();
                          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          setPlaybackPct(pct);
                        }}
                      >
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                          <div className="w-full h-1 rounded-full bg-[var(--color-sand-200)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-sand-900)] transition-[width] duration-100" style={{ width: `${playbackPct * 100}%` }} />
                          </div>
                        </div>
                        <div
                          className="absolute w-3 h-3 rounded-full bg-[var(--color-sand-900)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ left: `calc(${playbackPct * 100}% - 6px)` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
                          {Math.floor(playbackPct * duration)}:{String(Math.floor((playbackPct * duration * 60) % 60)).padStart(2, "0")}
                        </span>
                        <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>{duration}:00</span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowBgPicker(!showBgPicker)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showBgPicker ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)]" : "text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <Music className="w-3.5 h-3.5" />
                        Change background sound
                        <ChevronDown className={`w-3 h-3 transition-transform ${showBgPicker ? "rotate-180" : ""}`} />
                      </button>
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-colors text-xs cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                          <Download className="w-3.5 h-3.5" />Download
                        </button>
                        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-colors text-xs cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                          <RotateCcw className="w-3.5 h-3.5" />New
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compact background sound picker */}
                  <AnimatePresence>
                    {showBgPicker && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[var(--color-sand-200)] px-5 py-3 space-y-2">
                          {/* Volume slider — always visible */}
                          <div className="flex items-center gap-3">
                            <Volume2 className={`w-3.5 h-3.5 shrink-0 ${soundscape ? "text-[var(--color-sand-400)]" : "text-[var(--color-sand-300)]"}`} />
                            <input
                              type="range" min="0" max="100" value={bgVolume}
                              onChange={(e) => setBgVolume(Number(e.target.value))}
                              disabled={!soundscape}
                              className="flex-1 h-1 appearance-none bg-[var(--color-sand-200)] rounded-full cursor-pointer disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-sand-900)]"
                            />
                            <span className="text-[10px] text-[var(--color-sand-400)] w-8 text-right font-mono">{bgVolume}%</span>
                          </div>

                          {/* Recommended — single default */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Recommended</p>
                            <div className="flex flex-wrap gap-1.5">
                              {recommendedPresets.map((preset) => {
                                const isSel = soundscape === preset.label;
                                return (
                                  <button key={preset.label} onClick={() => setSoundscape(isSel ? null : preset.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : preset.color }} />
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Alternatives */}
                          {alternativePresets.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Alternatives</p>
                              <div className="flex flex-wrap gap-1.5">
                                {alternativePresets.map((preset) => {
                                  const isSel = soundscape === preset.label;
                                  return (
                                    <button key={preset.label} onClick={() => setSoundscape(isSel ? null : preset.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : preset.color }} />
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Others */}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Others</p>
                            <div className="flex flex-wrap gap-1.5">
                              {otherPresets.map((preset) => {
                                const isSel = soundscape === preset.label;
                                return (
                                  <button key={preset.label} onClick={() => setSoundscape(isSel ? null : preset.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : preset.color }} />
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Edit in Kilt Studio — card with mini demo */}
                {!showBgPicker && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-5">
                    <a href="/login" className="block relative rounded-2xl group">
                      <div className="absolute -inset-[2px] rounded-2xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                      <div className="relative bg-[var(--color-sand-900)] rounded-2xl overflow-hidden cursor-pointer group-hover:bg-[var(--color-sand-800)] transition-colors">
                        {/* Header with features inline */}
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <PenLine className="w-4 h-4 text-[var(--color-sand-50)]" />
                            <span className="text-[var(--color-sand-50)] text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                              Take this to Kilt Studio
                            </span>
                          </div>
                          <div className="flex items-center gap-3.5">
                            {[
                              { icon: Sliders, text: "Edit script" },
                              { icon: Clock, text: "Adjust timing" },
                              { icon: Layers, text: "Layer sounds" },
                            ].map((item) => (
                              <div key={item.text} className="flex items-center gap-1">
                                <item.icon className="w-3 h-3 text-white/25" />
                                <span className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-body)" }}>{item.text}</span>
                              </div>
                            ))}
                            <span className="text-[10px] uppercase tracking-wider text-white/70 px-2.5 py-0.5 rounded-full border border-white/25" style={{ fontFamily: "var(--font-body)" }}>Free</span>
                          </div>
                        </div>

                        {/* Studio demo — 4 blocks, pause focused */}
                        <div className="mx-4 mb-3 rounded-lg overflow-hidden border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.02)" }}>
                          {/* Script blocks */}
                          <div className="px-3 py-2 space-y-[4px]">
                            {/* Voice segment */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(122,158,126,0.2)" }}>
                                <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-sage)" }} />
                              </div>
                              <span className="text-[8px] text-white/40 truncate" style={{ fontFamily: "var(--font-body)" }}>Find a comfortable position...</span>
                            </div>

                            {/* Pause — short, highlighted */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-white/[0.12]" style={{ background: "rgba(139,126,158,0.08)" }}>
                              <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(139,126,158,0.25)" }}>
                                <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-dusk)" }} />
                              </div>
                              <span className="text-[8px] text-white/35 italic flex-1" style={{ fontFamily: "var(--font-body)" }}>⏸ Settle in</span>
                              <span className="text-[7px] text-white/30 px-1.5 py-0.5 rounded-full border border-white/15">Short</span>
                              <span className="text-[7px] text-white/15 px-1.5 py-0.5 rounded-full border border-white/[0.06]">Long</span>
                            </div>

                            {/* Voice segment — editing state */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-white/[0.1]" style={{ background: "rgba(255,255,255,0.04)" }}>
                              <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(122,158,126,0.2)" }}>
                                <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-sage)" }} />
                              </div>
                              <span className="text-[8px] text-white/50 truncate" style={{ fontFamily: "var(--font-body)" }}>Gently close your eyes</span>
                              <div className="w-[1px] h-3 bg-white/40 animate-pulse shrink-0" />
                            </div>

                            {/* Pause — long, highlighted */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-white/[0.12]" style={{ background: "rgba(139,126,158,0.08)" }}>
                              <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(139,126,158,0.25)" }}>
                                <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-dusk)" }} />
                              </div>
                              <span className="text-[8px] text-white/35 italic flex-1" style={{ fontFamily: "var(--font-body)" }}>⏸ Body responds</span>
                              <span className="text-[7px] text-white/15 px-1.5 py-0.5 rounded-full border border-white/[0.06]">Short</span>
                              <span className="text-[7px] text-white/30 px-1.5 py-0.5 rounded-full border border-white/15" style={{ background: "rgba(139,126,158,0.15)" }}>Long</span>
                            </div>
                          </div>
                        </div>

                        {/* Open Studio action */}
                        <div className="px-5 pb-4 flex justify-end">
                          <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                            Open Studio
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--color-sand-50)" }} />}>
      <SessionContent />
    </Suspense>
  );
}
