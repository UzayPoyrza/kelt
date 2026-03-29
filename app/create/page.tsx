"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Suspense } from "react";
import svgPaths from "@/lib/svg-paths";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "var(--color-sand-50)" }}>
      <div className="animate-[breathe_6s_ease-in-out_infinite]">
        <svg width={36} height={38} fill="none" viewBox="0 0 36 37.8281" className="text-[var(--color-sand-300)]">
          <path d={svgPaths.p1c4d2300} fill="currentColor" />
          <path d={svgPaths.p2128f680} fill="currentColor" />
          <path d={svgPaths.p1c2ff500} fill="currentColor" />
        </svg>
      </div>
      <div className="flex gap-1.5 mt-4">
        <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0s" }} />
        <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ backgroundColor: "#c9a96e", animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  FlaskConical,
  Pencil,
} from "lucide-react";
import {
  AmbientBackground,
  Header,
  voices,
  durations,
  detectIntent,
  detectSupportChoice,
  supportChoices,
  modes,
  modeRules,
  getApproaches,
} from "@/lib/shared";
import { createClient } from "@/lib/supabase/client";


function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const [prompt, setPrompt] = useState(initialPrompt);
  const detectedIntent = detectIntent(prompt);

  const [duration, setDuration] = useState<number>(7);
  const [voice, setVoice] = useState<string>("Graham");
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const generateRef = useRef<HTMLDivElement>(null);

  // Support choice, mode, and approach state
  const [supportChoice, setSupportChoice] = useState<string>("auto_detect");
  const [selectedMode, setSelectedMode] = useState<string>("still");
  const [preferredApproach, setPreferredApproach] = useState<string>("auto");

  // Auto-detect support choice suggestion when prompt changes
  const detectedSupportChoice = detectSupportChoice(prompt);
  const hasExplicitChoice = supportChoice !== "auto_detect";

  // Available modes based on support choice
  const availableModes = modeRules[supportChoice] ? modes.filter(m => modeRules[supportChoice]!.includes(m.id)) : modes;

  // Reset mode + approach when support choice changes
  const prevSupportChoice = useRef(supportChoice);
  if (prevSupportChoice.current !== supportChoice) {
    prevSupportChoice.current = supportChoice;
    if (!availableModes.find(m => m.id === selectedMode)) {
      setSelectedMode(availableModes[0]?.id || "still");
    }
    setPreferredApproach("auto");
  }

  // Derive approach options from support choice + mode
  const approachOptions = getApproaches(supportChoice, selectedMode);

  const [isGenerating, setIsGenerating] = useState(false);
  const [promptError, setPromptError] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Anonymous user detection (for signup gate at generate time)
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      setIsAnonymous(!user || !!user.is_anonymous);
    });
  }, []);

  // Scroll generate button into view after layout changes (with extra padding)
  const scrollToGenerate = useCallback((delay = 100) => {
    setTimeout(() => {
      const el = generateRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const extra = 40; // extra px below the button
      const targetY = window.scrollY + rect.bottom + extra - window.innerHeight;
      if (targetY > window.scrollY) {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }, delay);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setPromptError(true);
      return;
    }
    setPromptError(false);
    setGenerateError(null);

    // Gate: anonymous users redirect to signup page
    if (isAnonymous) {
      const voiceLabel = voices.find(v => v.id === voice)?.label || voice;
      const sc = supportChoice !== "auto_detect" ? supportChoice : (detectedSupportChoice || "mindfulness");
      const scLabel = supportChoices.find(s => s.id === sc)?.label || sc;
      const signupParams = new URLSearchParams({
        next: `/studio?prompt=${encodeURIComponent(prompt)}`,
        prompt,
        duration: String(duration),
        voice: voiceLabel,
        protocol: scLabel,
      });
      router.push(`/signup?${signupParams.toString()}`);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[create] Auth:", user ? `${user.id.slice(0, 8)}… anon=${user.is_anonymous}` : "none");

    const generateBody = {
      prompt,
      voice,
      duration,
      support_choice: supportChoice,
      mode: selectedMode,
      preferred_approach: preferredApproach,
    };

    // Helper: call /api/generate and redirect on success
    const callGenerateApi = async (): Promise<boolean> => {
      console.log("[create] Calling /api/generate...");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateBody),
      });
      console.log("[create] /api/generate response:", res.status);
      if (res.status === 402) {
        router.push("/login?reason=credits");
        return true;
      }
      if (res.status === 429) {
        setGenerateError("Daily limit reached. Sign up to continue.");
        return true;
      }
      if (res.ok) {
        const data = await res.json();
        console.log("[create] Generate success, redirecting to studio. Session:", data.session?.id);
        router.push(`/studio?session=${data.session.id}`);
        return true;
      }
      const errBody = await res.text();
      console.error("[create] Generate failed:", res.status, errBody);
      return false;
    };

    setIsGenerating(true);
    try {
      if (user) {
        const success = await callGenerateApi();
        if (success) return;
      }
      // No user or API failed — show error
      setGenerateError("Something went wrong. Please try again.");
    } catch (err) {
      console.error("[create] Generate flow error:", err);
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [router, prompt, voice, duration, supportChoice, selectedMode, preferredApproach, isAnonymous]);

  if (!initialPrompt) {
    router.replace("/");
    return null;
  }

  // Wait for auth check to complete before rendering to avoid flash of unlocked content
  if (isAnonymous === null) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-sand-50)" }}>
      <section className="relative min-h-screen flex flex-col overflow-hidden" onClick={() => voicePlaying && setVoicePlaying(null)}>
        <AmbientBackground />

        <Header hideFloatingNav />

        <div className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 pt-2 sm:pt-4 pb-8 sm:pb-10">
          <motion.div
            key="options"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl mx-auto"
            onClick={() => setVoicePlaying(null)}
          >
            {/* Back + "Your intention" on same line */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex items-center justify-center mb-3">
              <button
                onClick={() => router.back()}
                className="absolute left-0 flex items-center gap-1 text-sm text-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />Back
              </button>
              <p className="text-[11px] uppercase tracking-widest text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Your intention</p>
            </motion.div>

            {/* Prompt — centered */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 text-center">
              <p className="text-2xl sm:text-3xl text-[var(--color-sand-900)] leading-snug inline" style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-[var(--color-sand-300)] select-none">&ldquo;</span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const text = (e.currentTarget.textContent || "").slice(0, 50);
                    e.currentTarget.textContent = text;
                    setPrompt(text);
                  }}
                  onInput={(e) => {
                    let text = e.currentTarget.textContent || "";
                    if (text.length > 50) {
                      text = text.slice(0, 50);
                      e.currentTarget.textContent = text;
                      const range = document.createRange();
                      const sel = window.getSelection();
                      range.selectNodeContents(e.currentTarget);
                      range.collapse(false);
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                    }
                    setPrompt(text);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  onFocus={() => setPromptError(false)}
                  className={`outline-none border-b-2 transition-colors ${promptError ? "border-[var(--color-ember)]" : "border-transparent focus:border-[var(--color-sand-200)]"}`}
                >{prompt}</span>
                <span className="text-[var(--color-sand-300)] select-none">&rdquo;</span>
                <Pencil className="w-3 h-3 text-[var(--color-sand-300)] inline-block ml-2 mb-1.5" />
              </p>
              {promptError && (
                <p className="text-xs text-[var(--color-ember)] mt-2 block" style={{ fontFamily: "var(--font-body)" }}>
                  Write something to describe your meditation
                </p>
              )}
            </motion.div>

            {/* Duration — segmented control */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mb-5">
              <p className="text-[11px] uppercase tracking-widest text-[var(--color-sand-400)] mb-2" style={{ fontFamily: "var(--font-body)" }}>Duration</p>
              <div className="relative">
                {duration !== 7 && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-wide text-[var(--color-sand-400)] z-10" style={{ fontFamily: "var(--font-body)" }}>Popular</span>}
                <div className="flex items-center rounded-xl overflow-visible border border-[var(--color-sand-200)]">
                  {durations.map((d, i) => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`flex-1 py-2 text-[13px] relative cursor-pointer ${duration === d ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)]" : "bg-white text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)]"} ${i > 0 ? "border-l border-[var(--color-sand-200)]" : ""} ${i === 0 ? "rounded-l-xl" : ""} ${i === durations.length - 1 ? "rounded-r-xl" : ""}`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Voice — single row, compact with accent stripe */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
              <p className="text-[11px] uppercase tracking-widest text-[var(--color-sand-400)] mb-2" style={{ fontFamily: "var(--font-body)" }}>Voice</p>
              <div className="flex gap-2">
                {voices.map((v, idx) => {
                  const isActive = voice === v.id;
                  const isVoicePlaying = voicePlaying === v.id;
                  const accentColors = ["var(--color-sage)", "var(--color-ocean)", "var(--color-dusk)", "var(--color-ember)"];
                  const accent = accentColors[idx];
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => { e.stopPropagation(); setVoice(v.id); setVoicePlaying(v.id); setTimeout(() => setVoicePlaying((cur) => cur === v.id ? null : cur), 3000); }}
                      className={`flex-1 relative overflow-hidden rounded-xl transition-all border cursor-pointer ${isActive ? "shadow-md border-transparent" : "hover:shadow-sm border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)]"}`}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, var(--color-sand-900), var(--color-sand-800))`
                          : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {/* Accent top stripe */}
                      <div className="h-[3px] w-full" style={{ background: accent, opacity: isActive ? 1 : 0.3 }} />

                      <div className="px-2 pt-2 pb-2.5 flex flex-col items-center">
                        <span className={`text-[12px] font-medium ${isActive ? "text-[var(--color-sand-50)]" : "text-[var(--color-sand-900)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                          {v.label}
                        </span>
                        <span className={`text-[9px] mt-0.5 ${isActive ? "text-white/40" : "text-[var(--color-sand-400)]"}`} style={{ fontFamily: "var(--font-body)" }}>{v.description}</span>

                        {/* Play/Pause */}
                        <div className="mt-2 flex items-center gap-1.5 h-6">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setVoice(v.id);
                              setVoicePlaying(isVoicePlaying ? null : v.id);
                              if (!isVoicePlaying) setTimeout(() => setVoicePlaying((cur) => cur === v.id ? null : cur), 3000);
                            }}
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                            style={{
                              background: isActive ? "rgba(255,255,255,0.15)" : `color-mix(in srgb, ${accent} 12%, transparent)`,
                              color: isActive ? "white" : accent,
                            }}
                          >
                            {isVoicePlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 ml-px" />}
                          </div>
                          <div className="flex items-end gap-[2px] h-3 w-[20px]">
                            {isVoicePlaying && Array.from({ length: 6 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-[2px] rounded-full"
                                style={{ background: isActive ? "rgba(255,255,255,0.4)" : accent }}
                                animate={{ height: [`${20 + Math.random() * 40}%`, `${50 + Math.random() * 50}%`, `${20 + Math.random() * 40}%`] }}
                                transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Focus area */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>Focus area</p>
                <span className="text-[10px] text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>— optional</span>
              </div>
              {detectedSupportChoice !== "auto_detect" && !hasExplicitChoice && (
                <button onClick={() => { setSupportChoice(detectedSupportChoice); scrollToGenerate(150); }} className="text-[10px] text-[var(--color-sage)] hover:underline mb-1.5 block cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                  Suggested: {supportChoices.find(s => s.id === detectedSupportChoice)?.label}
                </button>
              )}
              <div className="flex flex-wrap gap-1">
                {supportChoices.filter(s => s.id !== "auto_detect").map((s) => (
                  <button key={s.id} onClick={() => { const next = supportChoice === s.id ? "auto_detect" : s.id; setSupportChoice(next); if (next !== "auto_detect") scrollToGenerate(150); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] transition-all whitespace-nowrap border cursor-pointer ${supportChoice === s.id ? "bg-[var(--color-sand-800)] text-[var(--color-sand-50)] border-transparent" : "bg-white text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] border-[var(--color-sand-200)]"}`}
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Advanced options */}
            {hasExplicitChoice && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-6">
              <button
                onClick={() => { setShowAdvanced(!showAdvanced); if (!showAdvanced) scrollToGenerate(300); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer group"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <FlaskConical className="w-3.5 h-3.5 text-[var(--color-sand-400)]" />
                <span className="text-[12px] text-[var(--color-sand-500)] group-hover:text-[var(--color-sand-700)] flex-1 text-left transition-colors">Advanced</span>
                <ChevronDown className={`w-4 h-4 text-[var(--color-sand-400)] transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="mt-3"
                >
                  {/* Body position */}
                  {availableModes.length > 1 && (
                    <div className="mb-3">
                      <p className="text-[11px] uppercase tracking-widest text-[var(--color-sand-400)] mb-1.5" style={{ fontFamily: "var(--font-body)" }}>Body position</p>
                      <div className="flex flex-wrap gap-1">
                        {availableModes.map((m) => (
                          <button key={m.id} onClick={() => setSelectedMode(m.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1 border ${selectedMode === m.id ? "bg-[var(--color-sand-800)] text-[var(--color-sand-50)] border-transparent" : "bg-white text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] border-[var(--color-sand-200)]"}`}
                            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                            <span>{m.label}</span>
                            <span className={`text-[9px] font-normal ${selectedMode === m.id ? "opacity-40" : "text-[var(--color-sand-400)]"}`}>
                              {m.id === "still" ? "Default" : m.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Protocol */}
                  <p className="text-[11px] uppercase tracking-widest text-[var(--color-sand-400)] mb-1" style={{ fontFamily: "var(--font-body)" }}>Protocol</p>
                  <p className="text-[9px] text-[var(--color-sand-400)] mb-1.5" style={{ fontFamily: "var(--font-body)" }}>For therapists, instructors, and advanced users. Overrides the auto-selected approach.</p>
                  {approachOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {approachOptions.map((a) => (
                        <button
                          key={a.value}
                          onClick={() => setPreferredApproach(preferredApproach === a.value ? "auto" : a.value)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer border ${preferredApproach === a.value ? "bg-[var(--color-sand-800)] text-[var(--color-sand-50)] border-transparent" : "bg-white text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] border-[var(--color-sand-200)]"}`}
                          style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[var(--color-sand-400)] italic" style={{ fontFamily: "var(--font-body)" }}>No specific approaches — AI will auto-select.</p>
                  )}
                </motion.div>
              )}
            </motion.div>
            )}

            {/* Generate button */}
            <motion.div ref={generateRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col items-center gap-3">
              <div className="relative rounded-2xl group w-full sm:w-auto">
                <div className="absolute -inset-[2.5px] rounded-2xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-90 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="relative flex items-center justify-center gap-3 px-10 sm:px-16 py-4 sm:py-5 rounded-2xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-all text-base sm:text-lg shadow-xl cursor-pointer w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                  whileHover={isGenerating ? {} : { scale: 1.02 }}
                  whileTap={isGenerating ? {} : { scale: 0.97 }}
                >
                  <motion.div
                    animate={isGenerating ? { rotate: 360 } : { rotate: [0, 15, -15, 0] }}
                    transition={isGenerating ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  {isGenerating ? "Generating..." : "Generate Meditation"}
                </motion.button>
              </div>

              {/* Error message */}
              {generateError && (
                <p className="text-[12px] text-[var(--color-ember)]" style={{ fontFamily: "var(--font-body)" }}>
                  {generateError}
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>

      </section>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateContent />
    </Suspense>
  );
}
