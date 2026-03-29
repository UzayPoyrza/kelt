"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "@/lib/svg-paths";
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
  Info,
  Loader2,
} from "lucide-react";
import {
  AmbientBackground,
  Header,
  voices,
  voiceLabel,
  soundscapePresets,
  soundIdToUrl,
  soundIdToLabel,
  protocolLabel,
  downloadMixedAudio,
} from "@/lib/shared";
import { createClient } from "@/lib/supabase/client";

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const [paramPrompt, setParamPrompt] = useState(searchParams.get("prompt") || "");
  const [paramVoice, setParamVoice] = useState(searchParams.get("voice") || "aria");
  const [paramDuration, setParamDuration] = useState(parseInt(searchParams.get("duration") || "10"));
  const [paramIntent, setParamIntent] = useState(searchParams.get("intent") || "default");

  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [sessionProtocol, setSessionProtocol] = useState<string | null>(null);
  const prompt = paramPrompt;
  const voice = paramVoice;
  const duration = paramDuration;
  const detectedIntent = paramIntent;

  // Auth state for "Edit in Studio" link
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user && !user.is_anonymous);
    });
  }, []);

  // Stages: loading (fetching session) → rendering (TTS) → ready (playable)
  const [stage, setStage] = useState<"generating" | "rendering" | "ready" | "loading">(sessionId ? "loading" : "generating");
  const [renderPhase, setRenderPhase] = useState(0); // 0-3 for sub-phases during rendering
  const renderStartTime = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPct, setPlaybackPct] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const [soundscape, setSoundscape] = useState<string | null>(null);
  const [soundOptions, setSoundOptions] = useState<{ recommended: string[]; other: string[] } | null>(null);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [bgVolume, setBgVolume] = useState(50);
  const bgAudioRef = useRef<HTMLAudioElement>(null);

  // Audio playback state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Load persisted session by ID
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const session = await res.json();
        setParamPrompt(session.prompt || "");
        setParamVoice(session.voice || "aria");
        setParamDuration(session.duration || 10);
        setParamIntent(session.intent || session.category || "default");
        if (session.title) setSessionTitle(session.title);
        if (session.protocol) setSessionProtocol(session.protocol);
        if (session.soundscape) setSoundscape(session.soundscape);
        if (session.sound_options) setSoundOptions(session.sound_options);
        // Don't go to "ready" yet — let the audio fetch effect determine the next stage
        setStage("rendering");
        renderStartTime.current = Date.now();
      } else {
        setStage("ready");
      }
    } catch {
      setStage("ready");
    }
  }, [sessionId]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  // Fetch audio URL from latest generation, or trigger render if none exists
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const fetchAudio = async () => {
      try {
        const genRes = await fetch(`/api/generations?session_id=${sessionId}&limit=1`);
        if (!genRes.ok) throw new Error("Failed to fetch generations");
        const gens = await genRes.json();
        if (gens.length > 0 && gens[0].audio_url) {
          if (!cancelled) {
            setAudioUrl(gens[0].audio_url);
            setStage("ready");
          }
          return;
        }

        // No audio yet — trigger render with generation_id for unique audio file
        const latestGenId = gens.length > 0 ? gens[0].id : undefined;
        if (!cancelled) setRenderLoading(true);
        const renderRes = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, generation_id: latestGenId }),
        });
        if (!renderRes.ok) throw new Error("Render failed");
        const renderResult = await renderRes.json();
        if (!cancelled) {
          if (renderResult.audio_url) {
            setAudioUrl(renderResult.audio_url);
            setStage("ready");
          } else {
            setRenderError("Render completed but no audio URL was returned.");
            setStage("ready");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setRenderError(err instanceof Error ? err.message : "Failed to load audio");
          setStage("ready");
        }
      } finally {
        if (!cancelled) setRenderLoading(false);
      }
    };

    fetchAudio();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setPlaybackPct((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackPct(0);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    setPlaybackPct(pct * 100);
    setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (value: number) => {
    setBgVolume(value);
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = value / 100;
    }
  };

  // Refresh session data when tab regains focus
  useEffect(() => {
    if (!sessionId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchSession();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [sessionId, fetchSession]);

  // Auto-select recommended soundscape
  useEffect(() => {
    if (sessionId) return; // Skip if loading from DB
    const presets = soundscapePresets[detectedIntent] || soundscapePresets.default;
    if (presets.length > 0) {
      setSoundscape(presets[0].label);
    }
  }, [detectedIntent, sessionId]);

  // Progress through render sub-phases for the loading experience
  useEffect(() => {
    if (stage !== "rendering") return;
    // Phase 0: "Preparing your voice" (immediate)
    // Phase 1: "Shaping the soundscape" (after 8s)
    // Phase 2: "Adding final touches" (after 25s)
    // Phase 3: "Almost there" (after 45s)
    const timers = [
      setTimeout(() => setRenderPhase(1), 8000),
      setTimeout(() => setRenderPhase(2), 25000),
      setTimeout(() => setRenderPhase(3), 45000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  // Simulate generation (only for non-persisted sessions)
  useEffect(() => {
    if (sessionId) return;
    const timer = setTimeout(() => setStage("ready"), 3000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  // Resolve background sound URL from soundscape (sound ID or preset label)
  const bgSoundUrl = (() => {
    if (!soundscape) return null;
    // Check if it's a sound ID (e.g. "S04")
    const idUrl = soundIdToUrl(soundscape);
    if (idUrl) return idUrl;
    // Fall back to preset label lookup
    const allPresets = Object.values(soundscapePresets).flat();
    const preset = allPresets.find(p => p.label === soundscape);
    return preset?.src || null;
  })();

  const handleDownload = async () => {
    if (!audioUrl) return;
    const filename = `meditation-${sessionId || "session"}.mp3`;
    try {
      setDownloadProgress("Preparing...");
      await downloadMixedAudio(audioUrl, filename, bgSoundUrl, bgVolume);
    } catch (err) {
      console.error("[download] Failed, falling back to voice-only:", err);
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = filename;
      a.click();
    } finally {
      setDownloadProgress(null);
    }
  };

  const [bgSoundLoading, setBgSoundLoading] = useState(false);

  // Play/control background sound
  useEffect(() => {
    const audio = bgAudioRef.current;
    if (!audio) return;
    if (bgSoundUrl && isPlaying) {
      if (audio.src !== bgSoundUrl) {
        setBgSoundLoading(true);
        audio.src = bgSoundUrl;
        audio.loop = true;
        audio.oncanplaythrough = () => setBgSoundLoading(false);
        audio.onerror = () => setBgSoundLoading(false);
      }
      audio.volume = bgVolume / 100;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [bgSoundUrl, isPlaying, bgVolume]);

  // Clean up bg audio on unmount
  useEffect(() => {
    return () => {
      const audio = bgAudioRef.current;
      if (audio) { audio.pause(); audio.src = ""; }
    };
  }, []);

  // Compute the "Edit in Studio" href based on auth status
  const studioHref = sessionId
    ? isAuthenticated
      ? `/studio?sessionId=${sessionId}`
      : `/login?next=${encodeURIComponent(`/studio?sessionId=${sessionId}`)}`
    : "/login";

  // Redirect to studio if we have a session ID (session page is legacy)
  if (sessionId) {
    router.replace(`/studio?session=${sessionId}`);
    return null;
  }

  if (!prompt) {
    router.replace("/");
    return null;
  }

  // Build soundscape lists from API sound_options (preferred) or fallback to hardcoded presets
  const allRecommended = soundOptions?.recommended || [];
  const allOther = soundOptions?.other || [];
  const hasSoundOptions = soundOptions && (allRecommended.length > 0 || allOther.length > 0);

  // The selected sound (selected_sound_id) is always the primary recommendation
  // Rest of recommended list (excluding selected) are alternatives
  const soundIdRecommended = soundscape ? [soundscape] : allRecommended.slice(0, 1);
  const soundIdAlternatives = allRecommended.filter(sid => sid !== soundscape);
  const soundIdOther = allOther.filter(sid => sid !== soundscape);

  // Legacy preset-based lists (fallback)
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

        <div className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 pt-6 sm:pt-8 pb-6">
          {/* Audio elements — always in DOM so refs and event listeners work */}
          {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
          <audio ref={bgAudioRef} loop preload="none" />

          <AnimatePresence mode="wait">

            {/* ─── Loading (brief, fetching session data from DB) ─── */}
            {stage === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col items-center justify-center -mt-16">
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                  style={{ background: "var(--color-sand-100)" }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-5 h-5 text-[var(--color-sand-400)]" />
                </motion.div>
              </motion.div>
            )}

            {/* ─── Generating (shown on /create fallback, brief) ─── */}
            {stage === "generating" && (
              <motion.div key="generating" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex flex-col items-center justify-center -mt-16">
                <motion.div
                  className="w-16 h-16 rounded-full bg-[var(--color-sand-900)] flex items-center justify-center mb-8"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-[var(--color-sand-50)]" />
                </motion.div>
                <h2 className="text-xl text-[var(--color-sand-900)] mb-2 text-center" style={{ fontFamily: "var(--font-display)" }}>Crafting your meditation</h2>
                <p className="text-sm text-[var(--color-sand-400)] text-center" style={{ fontFamily: "var(--font-body)" }}>Composing guidance and timing pauses...</p>
              </motion.div>
            )}

            {/* ─── Rendering (the main loading experience — 30-60s of TTS) ─── */}
            {stage === "rendering" && (
              <motion.div
                key="rendering"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col items-center justify-center -mt-8"
              >
                {/* Breathing orb */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-10">
                  {/* Outer ring — slow rotation */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1px solid var(--color-sand-200)" }}
                    animate={{ rotate: 360, scale: [1, 1.04, 1] }}
                    transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                  />
                  {/* Mid ring — counter-rotate */}
                  <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{ border: "1px solid var(--color-sand-200)" }}
                    animate={{ rotate: -360, scale: [1, 1.06, 1] }}
                    transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
                  />
                  {/* Inner ring */}
                  <motion.div
                    className="absolute inset-8 rounded-full"
                    style={{ border: "1px solid var(--color-sand-300)" }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                  {/* Center orb */}
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--color-sand-800), var(--color-sand-900))" }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Waveform bars inside the orb */}
                    <div className="flex items-end gap-[3px] h-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-[3px] rounded-full bg-[var(--color-sand-300)]"
                          animate={{ height: ["30%", `${50 + Math.random() * 50}%`, "30%"] }}
                          transition={{ duration: 1.2 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Session info — fades in with real data */}
                {sessionTitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg sm:text-xl text-[var(--color-sand-900)] mb-2 text-center px-4"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {sessionTitle}
                  </motion.p>
                )}

                {/* Phase messages — crossfade between them */}
                <div className="h-12 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={renderPhase}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      className="text-sm text-[var(--color-sand-600)] text-center"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {renderPhase === 0 && "Script is ready — generating voice..."}
                      {renderPhase === 1 && "Shaping the soundscape..."}
                      {renderPhase === 2 && "Adding final touches..."}
                      {renderPhase === 3 && "Almost there..."}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Metadata pills — appear once we have the data */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex items-center justify-center gap-2 flex-wrap mt-2"
                >
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{duration} min</span>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{voiceLabel(voice)}</span>
                  {sessionProtocol && (
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>
                      {protocolLabel(sessionProtocol)}
                    </span>
                  )}
                </motion.div>

                {/* Reassurance — user can leave */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3, duration: 0.6 }}
                  className="text-[11px] text-[var(--color-sand-500)] text-center mt-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  You can close this tab — find your session in Studio when it&apos;s ready.
                </motion.p>
              </motion.div>
            )}

            {/* ─── Ready ─── */}
            {stage === "ready" && (
              <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl mx-auto">

                {/* Top row: Back + (Edit in Incraft Studio (Free) when picker is open) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sand-600)] hover:text-[var(--color-sand-900)] hover:bg-white/60 border border-[var(--color-sand-200)] hover:border-[var(--color-sand-300)] transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />Back
                  </button>
                  {showBgPicker && (
                    <a href={studioHref} className="relative rounded-lg group">
                      <div className="absolute -inset-[2px] rounded-lg bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                      <span
                        className="relative flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--color-sand-900)] text-[var(--color-sand-50)] text-sm cursor-pointer hover:bg-[var(--color-sand-800)] transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Edit in Incraft Studio (Free)
                      </span>
                    </a>
                  )}
                </motion.div>

                {/* Header */}
                <div className="text-center mb-3">
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="text-xs text-[var(--color-sage)] mb-1 font-medium" style={{ fontFamily: "var(--font-body)" }}>Your meditation is ready</motion.p>
                  <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg sm:text-xl text-[var(--color-sand-900)] mb-2 px-2 sm:px-0" style={{ fontFamily: "var(--font-display)" }}>{sessionTitle || prompt}</motion.h1>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{duration} min</span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-xs" style={{ fontFamily: "var(--font-body)" }}>{voiceLabel(voice)}</span>
                    {sessionProtocol && (
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)] text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>
                      <BrainCircuit className="w-3 h-3 inline mr-1" />
                      {protocolLabel(sessionProtocol)}
                    </span>
                    )}
                  </motion.div>
                </div>

                {/* Player card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-[var(--color-sand-200)] overflow-hidden">
                  <div className="px-3 sm:px-5 py-4">
                    {/* Waveform */}
                    <div className="flex items-end justify-center gap-[2px] h-12 sm:h-14 mb-3 overflow-hidden">
                      {Array.from({ length: 50 }).map((_, i) => {
                        const h = 15 + Math.sin(i * 0.35) * 20 + Math.cos(i * 0.7) * 15 + Math.sin(i * 0.15) * 10;
                        return (
                          <motion.div key={i} className="flex-1 max-w-[4px] rounded-full" style={{ height: `${h}%`, background: isPlaying ? "var(--color-sand-900)" : "var(--color-sand-300)" }} animate={isPlaying ? { height: [`${h}%`, `${15 + Math.random() * 65}%`, `${h}%`] } : {}} transition={isPlaying ? { duration: 0.6 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" } : {}} />
                        );
                      })}
                    </div>

                    {/* Render loading state */}
                    {renderLoading && (
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-4 h-4 border-2 border-[var(--color-sand-300)] border-t-[var(--color-sand-900)] rounded-full animate-spin" />
                        <span className="text-xs text-[var(--color-sand-500)]" style={{ fontFamily: "var(--font-body)" }}>Rendering your meditation...</span>
                      </div>
                    )}
                    {renderError && (
                      <div className="flex items-center justify-center mb-3">
                        <span className="text-xs text-red-500" style={{ fontFamily: "var(--font-body)" }}>{renderError}</span>
                      </div>
                    )}

                    {/* Play */}
                    <div className="flex items-center justify-center mb-3">
                      <button
                        onClick={audioUrl ? togglePlay : undefined}
                        disabled={!audioUrl || renderLoading}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                          audioUrl
                            ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] cursor-pointer"
                            : "bg-[var(--color-sand-300)] text-[var(--color-sand-50)] cursor-not-allowed"
                        } ${renderLoading ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        {renderLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                    </div>
                    {/* Audio status messages */}
                    {!renderLoading && !audioUrl && renderError && (
                      <div className="flex items-center justify-center mb-3">
                        <span className="text-xs text-red-500 text-center" style={{ fontFamily: "var(--font-body)" }}>
                          Audio generation failed. Try again or edit in Studio.
                        </span>
                      </div>
                    )}
                    {!sessionId && !audioUrl && !renderLoading && !renderError && (
                      <div className="flex items-center justify-center mb-3">
                        <span className="text-xs text-[var(--color-sand-500)] text-center" style={{ fontFamily: "var(--font-body)" }}>
                          Audio is being generated. This may take a moment.
                        </span>
                      </div>
                    )}
                    {sessionId && !audioUrl && !renderLoading && !renderError && (
                      <div className="flex items-center justify-center mb-3">
                        <span className="text-xs text-[var(--color-sand-400)] text-center" style={{ fontFamily: "var(--font-body)" }}>
                          Audio is being prepared...
                        </span>
                      </div>
                    )}

                    {/* Progress — interactive */}
                    <div className="mb-3">
                      <div
                        ref={progressRef}
                        className={`relative w-full h-5 flex items-center group ${audioUrl ? "cursor-pointer" : "cursor-default"}`}
                        onClick={audioUrl ? handleSeek : undefined}
                      >
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                          <div className="w-full h-1 rounded-full bg-[var(--color-sand-200)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-sand-900)] transition-[width] duration-100" style={{ width: `${playbackPct}%` }} />
                          </div>
                        </div>
                        <div
                          className="absolute w-3 h-3 rounded-full bg-[var(--color-sand-900)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ left: `calc(${playbackPct}% - 6px)` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
                          {audioUrl ? formatTime(currentTime) : `${Math.floor((playbackPct / 100) * duration)}:${String(Math.floor(((playbackPct / 100) * duration * 60) % 60)).padStart(2, "0")}`}
                        </span>
                        <span className="text-xs text-[var(--color-sand-400)]" style={{ fontFamily: "var(--font-body)" }}>
                          {audioUrl && audioDuration ? formatTime(audioDuration) : `${duration}:00`}
                        </span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => setShowBgPicker(!showBgPicker)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${showBgPicker ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)]" : "text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {bgSoundLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Music className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">{bgSoundLoading ? "Loading sound..." : "Background sound"}</span>
                        <span className="sm:hidden">{bgSoundLoading ? "Loading..." : "Sound"}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBgPicker ? "rotate-180" : ""}`} />
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleDownload}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-colors text-xs cursor-pointer ${!audioUrl || downloadProgress ? "opacity-40 pointer-events-none" : ""}`}
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {downloadProgress ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{downloadProgress || "Download"}</span>
                          <span className="sm:hidden">{downloadProgress ? "..." : ""}</span>
                        </button>
                        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-[var(--color-sand-600)] hover:bg-[var(--color-sand-100)] transition-colors text-xs cursor-pointer" style={{ fontFamily: "var(--font-body)" }}>
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
                        <div className="border-t border-[var(--color-sand-200)] px-3 sm:px-5 py-3 space-y-3">
                          {/* Background sound volume */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Music className={`w-3 h-3 ${soundscape ? "text-[var(--color-sand-500)]" : "text-[var(--color-sand-300)]"}`} />
                              <span className="text-[10px] text-[var(--color-sand-400)] uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>BG Vol</span>
                            </div>
                            <input
                              type="range" min="0" max="100" value={bgVolume}
                              onChange={(e) => handleVolumeChange(Number(e.target.value))}
                              disabled={!soundscape}
                              className="flex-1 h-1 appearance-none rounded-full cursor-pointer disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-sand-900)] [&::-webkit-slider-thumb]:cursor-pointer"
                              style={{ background: soundscape ? `linear-gradient(to right, var(--color-sand-900) ${bgVolume}%, var(--color-sand-200) ${bgVolume}%)` : "var(--color-sand-200)" }}
                            />
                            <span className="text-[10px] text-[var(--color-sand-400)] w-8 text-right tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{bgVolume}%</span>
                          </div>

                          {/* Info note */}
                          <div className="flex gap-2.5 p-2.5 rounded-lg bg-[var(--color-sand-50)] border border-[var(--color-sand-200)]">
                            <Info className="w-3.5 h-3.5 text-[var(--color-sand-400)] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-[var(--color-sand-500)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                              Background sounds are selected and ranked based on your session&apos;s protocol and intent.
                            </p>
                          </div>

                          {hasSoundOptions ? (
                            <>
                              {/* Recommended (1 sound — the default pick) */}
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Recommended</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {soundIdRecommended.map((sid) => {
                                    const isSel = soundscape === sid;
                                    return (
                                      <button key={sid} onClick={() => setSoundscape(sid)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : "var(--color-sage)" }} />
                                        {soundIdToLabel(sid)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Alternatives (rest of the recommended list) */}
                              {soundIdAlternatives.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Alternatives</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {soundIdAlternatives.map((sid) => {
                                      const isSel = soundscape === sid;
                                      return (
                                        <button key={sid} onClick={() => setSoundscape(sid)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : "var(--color-sage)" }} />
                                          {soundIdToLabel(sid)}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Other sounds */}
                              {soundIdOther.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Others</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {soundIdOther.map((sid) => {
                                      const isSel = soundscape === sid;
                                      return (
                                        <button key={sid} onClick={() => setSoundscape(sid)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : "var(--color-ocean)" }} />
                                          {soundIdToLabel(sid)}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Legacy preset-based sounds (fallback) */}
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Recommended</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {recommendedPresets.map((preset) => {
                                    const isSel = soundscape === preset.label;
                                    return (
                                      <button key={preset.label} onClick={() => setSoundscape(preset.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : preset.color }} />
                                        {preset.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {alternativePresets.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Alternatives</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {alternativePresets.map((preset) => {
                                      const isSel = soundscape === preset.label;
                                      return (
                                        <button key={preset.label} onClick={() => setSoundscape(preset.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : preset.color }} />
                                          {preset.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--color-sand-400)] mb-2 font-medium" style={{ fontFamily: "var(--font-body)" }}>Others</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {otherPresets.map((preset) => {
                                    const isSel = soundscape === preset.label;
                                    return (
                                      <button key={preset.label} onClick={() => setSoundscape(preset.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${isSel ? "bg-[var(--color-sand-900)] text-[var(--color-sand-50)] border border-[var(--color-sand-900)]" : "bg-[var(--color-sand-50)] text-[var(--color-sand-700)] hover:bg-[var(--color-sand-100)] border border-[var(--color-sand-200)]"}`} style={{ fontFamily: "var(--font-body)" }}>
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isSel ? "var(--color-sand-50)" : preset.color }} />
                                        {preset.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Edit in Incraft Studio — slim CTA with hover demo */}
                {!showBgPicker && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4">
                    <a href={studioHref} className="block relative rounded-xl group">
                      <div className="absolute -inset-[1.5px] rounded-xl bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite] opacity-70 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }} />
                      <div className="relative bg-[var(--color-sand-900)] rounded-xl overflow-hidden cursor-pointer">
                        {/* Main bar */}
                        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <div className="flex items-center gap-2 shrink-0">
                              <PenLine className="w-4 h-4 text-[var(--color-sand-50)]" />
                              <span className="text-[var(--color-sand-50)] text-xs sm:text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                                Edit in Incraft Studio
                              </span>
                            </div>
                            <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-3">
                              {[
                                { icon: Sliders, text: "Edit script" },
                                { icon: Clock, text: "Timing" },
                                { icon: Layers, text: "Sounds" },
                              ].map((item) => (
                                <div key={item.text} className="flex items-center gap-1">
                                  <item.icon className="w-3 h-3 text-white/60" />
                                  <span className="text-[10px] text-white/70" style={{ fontFamily: "var(--font-body)" }}>{item.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <span className="text-[10px] uppercase tracking-wider text-white/80 font-medium px-2 sm:px-2.5 py-0.5 rounded-full border-[1.5px] border-white/45" style={{ fontFamily: "var(--font-body)" }}>Free</span>
                            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Demo — reveals on hover */}
                        <div className="max-h-0 group-hover:max-h-[200px] transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden">
                          <div className="mx-2.5 sm:mx-4 mb-3 rounded-lg overflow-hidden border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="px-3 py-2 space-y-[4px]">
                              {/* Voice block */}
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(122,158,126,0.2)" }}>
                                  <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-sage)" }} />
                                </div>
                                <span className="text-[8px] text-white/40 truncate" style={{ fontFamily: "var(--font-body)" }}>Find a comfortable position...</span>
                              </div>

                              {/* Pause block — short */}
                              <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(161,161,170,0.15)" }}>
                                  <svg width="6" height="6" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="rgba(255,255,255,0.3)" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="rgba(255,255,255,0.3)" /></svg>
                                </div>
                                <span className="text-[7px] text-white/25" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Short Pause</span>
                                <span className="text-[7px] text-white/20 tabular-nums ml-auto" style={{ fontFamily: "var(--font-body)" }}>2s</span>
                              </div>

                              {/* Voice block — selected/editing */}
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-white/[0.1]" style={{ background: "rgba(255,255,255,0.04)" }}>
                                <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(122,158,126,0.2)" }}>
                                  <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-sage)" }} />
                                </div>
                                <span className="text-[8px] text-white/50 truncate" style={{ fontFamily: "var(--font-body)" }}>Gently close your eyes</span>
                                <div className="w-[1px] h-3 bg-white/40 animate-pulse shrink-0" />
                              </div>

                              {/* Pause block — long */}
                              <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "rgba(122,158,126,0.04)" }}>
                                <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(122,158,126,0.2)" }}>
                                  <svg width="6" height="6" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="rgba(122,158,126,0.5)" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="rgba(122,158,126,0.5)" /></svg>
                                </div>
                                <span className="text-[7px] text-white/30" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Long Pause</span>
                                <span className="text-[7px] text-white/20 tabular-nums ml-auto" style={{ fontFamily: "var(--font-body)" }}>5s</span>
                              </div>
                            </div>
                          </div>

                          <div className="px-3.5 sm:px-5 pb-3 flex justify-end">
                            <span className="flex items-center gap-1.5 text-sm" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                              <span
                                className="bg-clip-text text-transparent bg-[length:300%_300%] animate-[border-glow_4s_ease_infinite]"
                                style={{ backgroundImage: "linear-gradient(135deg, var(--color-sage), var(--color-ocean), var(--color-dusk), var(--color-ember), var(--color-sage))", backgroundSize: "300% 300%" }}
                              >
                                Open in Studio
                              </span>
                              <ArrowRight className="w-4 h-4 text-white/60" />
                            </span>
                          </div>
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
    <Suspense fallback={
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
    }>
      <SessionContent />
    </Suspense>
  );
}
