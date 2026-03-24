"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Suspense } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  Sparkles,
  Headphones,
} from "lucide-react";
import {
  AmbientBackground,
  Header,
  voices,
  durations,
  detectIntent,
} from "@/lib/shared";

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";
  const detectedIntent = detectIntent(prompt);

  const [duration, setDuration] = useState<number>(10);
  const [voice, setVoice] = useState<string>("aria");
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    const params = new URLSearchParams({
      prompt,
      voice,
      duration: String(duration),
      intent: detectedIntent,
    });
    router.push(`/session?${params.toString()}`);
  }, [router, prompt, voice, duration, detectedIntent]);

  if (!prompt) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-sand-50)" }}>
      <section className="relative min-h-screen flex flex-col overflow-hidden" onClick={() => voicePlaying && setVoicePlaying(null)}>
        <AmbientBackground />

        <Header />

        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
          <motion.div
            key="options"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl mx-auto"
            onClick={() => setVoicePlaying(null)}
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <ChevronLeft className="w-4 h-4" />Back
            </motion.button>

            {/* Prompt display */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
              <p className="text-2xl text-[var(--color-sand-900)] max-w-md mx-auto leading-snug" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{prompt}&rdquo;</p>
            </motion.div>

            {/* Duration */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Duration</p>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button key={d} onClick={() => setDuration(d)} className={`flex-1 py-2.5 rounded-full text-sm transition-all cursor-pointer ${duration === d ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>{d}m</button>
                ))}
              </div>
            </motion.div>

            {/* Voice */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Voice</p>
              <div className="grid grid-cols-2 gap-2.5">
                {voices.map((v) => {
                  const isActive = voice === v.id;
                  const isVoicePlaying = voicePlaying === v.id;
                  return (
                    <button key={v.id} onClick={(e) => { e.stopPropagation(); setVoice(v.id); setVoicePlaying(v.id); setTimeout(() => setVoicePlaying((cur) => cur === v.id ? null : cur), 3000); }} className={`relative flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer text-left overflow-hidden ${isActive ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md" : "bg-white text-[var(--color-sand-900)] hover:shadow-sm border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)]"}`}>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block" style={{ fontFamily: "var(--font-body)" }}>{v.label}</span>
                        <span className={`text-xs mt-0.5 block ${isActive ? "opacity-50" : "text-[var(--color-sand-500)]"}`} style={{ fontFamily: "var(--font-body)" }}>{v.description}</span>
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

            {/* Soundscape note */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10 text-center">
              <p className="text-xs text-[var(--color-sand-400)] flex items-center justify-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                <Headphones className="w-3 h-3" />
                Soundscape &amp; ambient layers will be matched after generation
              </p>
            </motion.div>

            {/* Generate button */}
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
        </div>
      </section>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--color-sand-50)" }} />}>
      <CreateContent />
    </Suspense>
  );
}
