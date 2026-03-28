"use client";

import { useState, useCallback, useRef } from "react";
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

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setPromptError(true);
      return;
    }
    setPromptError(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateBody),
      });
      if (res.status === 402) {
        // Out of credits — redirect to login for upgrade
        router.push("/login?reason=credits");
        return true;
      }
      if (res.ok) {
        const data = await res.json();
        router.push(`/session?id=${data.session.id}`);
        return true;
      }
      return false;
    };

    if (user) {
      // Already authenticated — call generate directly
      setIsGenerating(true);
      try {
        if (await callGenerateApi()) return;
      } catch {
        // Fall through to unauthenticated flow
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Not authenticated — try anonymous sign-in
      setIsGenerating(true);
      try {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (!anonError && anonData.user) {
          // Create anonymous profile with 1 credit
          await fetch("/api/anon-profile", { method: "POST" });
          // Now generate
          if (await callGenerateApi()) return;
        }
      } catch {
        // Fall through to URL params flow
      } finally {
        setIsGenerating(false);
      }
    }

    // Fallback: unauthenticated URL params flow
    const params = new URLSearchParams({
      prompt,
      voice,
      duration: String(duration),
      intent: detectedIntent,
    });
    router.push(`/session?${params.toString()}`);
  }, [router, prompt, voice, duration, detectedIntent, supportChoice, selectedMode, preferredApproach]);

  if (!initialPrompt) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-sand-50)" }}>
      <section className="relative min-h-screen flex flex-col overflow-hidden" onClick={() => voicePlaying && setVoicePlaying(null)}>
        <AmbientBackground />

        <Header hideFloatingNav />

        <div className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-10">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer mb-6 sm:mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <ChevronLeft className="w-4 h-4" />Back
            </motion.button>

            {/* Step indicator */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex items-center justify-center gap-1.5 mb-6 sm:mb-8 text-[11px]" style={{ fontFamily: "var(--font-body)" }}>
              <span className="text-[var(--color-sand-400)] flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] border border-[var(--color-sand-300)] text-[var(--color-sand-400)] font-medium">1</span>
                Prompt
              </span>
              <span className="text-[var(--color-sand-300)]">→</span>
              <span className="text-[var(--color-sand-900)] flex items-center gap-1 font-medium">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] bg-[var(--color-sand-900)] text-[var(--color-sand-50)] font-medium">2</span>
                Customize
              </span>
              <span className="text-[var(--color-sand-300)]">→</span>
              <span className="text-[var(--color-sand-300)] flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] !leading-[0] border border-[var(--color-sand-300)] text-[var(--color-sand-300)] font-medium">3</span>
                Generate
              </span>
            </motion.div>

            {/* Editable prompt */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-10 text-center max-w-md mx-auto">
              <p className="text-xl sm:text-2xl text-[var(--color-sand-900)] leading-snug inline" style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-[var(--color-sand-400)] select-none">&ldquo;</span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const text = (e.currentTarget.textContent || "").slice(0, 50);
                    e.currentTarget.textContent = text;
                    setPrompt(text);
                  }}
                  onInput={(e) => {
                    const text = e.currentTarget.textContent || "";
                    if (text.length > 50) {
                      e.currentTarget.textContent = text.slice(0, 50);
                      const range = document.createRange();
                      const sel = window.getSelection();
                      range.selectNodeContents(e.currentTarget);
                      range.collapse(false);
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  onFocus={() => setPromptError(false)}
                  className={`outline-none border-b transition-colors ${promptError ? "border-[var(--color-ember)]" : "border-transparent focus:border-[var(--color-sand-300)]"}`}
                >{prompt}</span>
                <span className="text-[var(--color-sand-400)] select-none">&rdquo;</span>
                <Pencil className="w-3 h-3 text-[var(--color-sand-400)] inline-block ml-1.5 mb-1" />
              </p>
              {promptError && (
                <p className="text-xs text-[var(--color-ember)] mt-2 block" style={{ fontFamily: "var(--font-body)" }}>
                  Write something to describe your meditation
                </p>
              )}
            </motion.div>

            {/* Support Choice (optional) */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-8">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>What do you need support with?</p>
                <span className="text-[10px] text-[var(--color-sand-400)] italic" style={{ fontFamily: "var(--font-body)" }}>Optional</span>
              </div>
              {detectedSupportChoice !== "auto_detect" && !hasExplicitChoice && (
                <button onClick={() => setSupportChoice(detectedSupportChoice)} className="text-[10px] text-[var(--color-sage)] hover:underline mb-2 block cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
                  Suggested: {supportChoices.find(s => s.id === detectedSupportChoice)?.label}
                </button>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {supportChoices.filter(s => s.id !== "auto_detect").map((s) => (
                  <button key={s.id} onClick={() => setSupportChoice(supportChoice === s.id ? "auto_detect" : s.id)}
                    className={`px-3 py-2 rounded-lg text-xs text-left transition-all cursor-pointer ${supportChoice === s.id ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`}
                    style={{ fontFamily: "var(--font-body)" }}>
                    <span className="font-medium block">{s.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Duration */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Duration</p>
              <div className="flex gap-1.5 sm:gap-2 items-end">
                {durations.map((d) => (
                  <div key={d} className="flex-1 flex flex-col items-center">
                    <span className={`text-[8px] tracking-wide uppercase mb-1 h-3 ${d === 7 && duration !== 7 ? "text-[var(--color-sand-400)]" : "text-transparent select-none"}`} style={{ fontFamily: "var(--font-body)" }}>{d === 7 ? "Default" : "\u00A0"}</span>
                    <button onClick={() => setDuration(d)} className={`w-full py-2.5 rounded-full text-sm transition-all cursor-pointer ${duration === d ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>{d}m</button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Voice */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-3" style={{ fontFamily: "var(--font-body)" }}>Voice</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {voices.map((v) => {
                  const isActive = voice === v.id;
                  const isVoicePlaying = voicePlaying === v.id;
                  return (
                    <button key={v.id} onClick={(e) => { e.stopPropagation(); setVoice(v.id); setVoicePlaying(v.id); setTimeout(() => setVoicePlaying((cur) => cur === v.id ? null : cur), 3000); }} className={`relative flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer text-left overflow-hidden ${isActive ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md" : "bg-white text-[var(--color-sand-900)] hover:shadow-sm border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)]"}`}>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)" }}>
                          {v.label}
                          {v.id === "Graham" && isActive && <span className="text-[8px] uppercase tracking-wide opacity-40 font-normal px-1.5 py-px rounded-full bg-white/15">Default</span>}
                        </span>
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

            {/* Advanced — Mode + Approach (only when a support choice is selected) */}
            {hasExplicitChoice && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
              <button
                onClick={() => { setShowAdvanced(!showAdvanced); setTimeout(() => generateRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] hover:bg-white transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <FlaskConical className="w-4 h-4 text-[var(--color-sand-500)]" />
                <span className="text-sm text-[var(--color-sand-600)] flex-1 text-left">Advanced options</span>
                <ChevronDown className={`w-5 h-5 text-[var(--color-sand-400)] transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25 }}
                  className="mt-4"
                >
                  {/* Mode */}
                  {availableModes.length > 1 && (
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-2" style={{ fontFamily: "var(--font-body)" }}>Mode</p>
                      <div className="flex gap-1.5">
                        {availableModes.map((m) => (
                          <button key={m.id} onClick={() => setSelectedMode(m.id)}
                            className={`flex-1 py-2.5 rounded-full text-sm transition-all cursor-pointer ${selectedMode === m.id ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-sm" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`}
                            style={{ fontFamily: "var(--font-body)" }}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approach */}
                  <p className="text-xs uppercase tracking-widest text-[var(--color-sand-400)] mb-1.5" style={{ fontFamily: "var(--font-body)" }}>Approach</p>
                  <p className="text-[11px] text-[var(--color-sand-400)] mb-3 italic" style={{ fontFamily: "var(--font-body)" }}>
                    Auto-chosen during generation based on your support choice. Override below for more control.
                  </p>

                  {approachOptions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => setPreferredApproach("auto")}
                        className={`p-3 rounded-xl text-left text-sm transition-all cursor-pointer ${preferredApproach === "auto" ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span className="font-medium">Auto</span>
                        <span className={`text-[10px] block mt-0.5 ${preferredApproach === "auto" ? "opacity-50" : "text-[var(--color-sand-500)]"}`}>Let AI choose</span>
                      </button>
                      {approachOptions.map((a) => (
                        <button
                          key={a.value}
                          onClick={() => setPreferredApproach(a.value)}
                          className={`p-3 rounded-xl text-left text-sm transition-all cursor-pointer ${preferredApproach === a.value ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] shadow-md" : "bg-white/60 text-[var(--color-sand-600)] hover:bg-white border border-[var(--color-sand-200)]"}`}
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <span className="font-medium">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--color-sand-400)] italic" style={{ fontFamily: "var(--font-body)" }}>No specific approaches available for this combination — AI will auto-select.</p>
                  )}
                </motion.div>
              )}
            </motion.div>
            )}

            {/* Generate button */}
            <motion.div ref={generateRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex justify-center">
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
