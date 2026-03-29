"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import {
  Check,
  Sparkles,
  ArrowLeft,
  Crown,
  Zap,
  Shield,
  Download,
  Headphones,
  Users,
  Infinity as InfinityIcon,
  ChevronDown,
  X,
  Lock,
  Music,
  Heart,
} from "lucide-react";
import type { Profile } from "@/lib/types/database";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
import svgPaths from "@/lib/svg-paths";

/* ─── Logo ─── */

function Logo() {
  return (
    <svg width={28} height={30} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

/* ─── Data ─── */

const plans = [
  {
    id: "free",
    name: "Free",
    tagline: "Try it out",
    price: 0,
    yearlyPrice: 0,
    credits: 2,
    color: "var(--color-sand-500)",
    colorLight: "var(--color-sand-100)",
    colorHex: "#6b6560",
    colorLightHex: "#f0eeeb",
    recommended: false,
    features: [
      { text: "2 credits per month", highlight: true },
      { text: "All voices & soundscapes" },
      { text: "No commercial use" },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    tagline: "For your daily practice",
    price: 8,
    yearlyPrice: 6,
    credits: 30,
    color: "var(--color-sage)",
    colorLight: "var(--color-sage-light)",
    colorHex: "#7a9e7e",
    colorLightHex: "#e8f0e9",
    recommended: true,
    features: [
      { text: "30 credits per month", highlight: true },
      { text: "All voices & soundscapes" },
      { text: "Priority generation queue" },
      { text: "Commercial use included" },
    ],
  },
  {
    id: "creator",
    name: "Pro",
    tagline: "For professionals & creators",
    price: 24,
    yearlyPrice: 18,
    credits: 100,
    color: "var(--color-dusk)",
    colorLight: "var(--color-dusk-light)",
    colorHex: "#8b7ea6",
    colorLightHex: "#eee9f5",
    recommended: false,
    features: [
      { text: "100 credits per month", highlight: true },
      { text: "Everything in Personal" },
      { text: "Exclusive Aditya voice" },
      { text: "Highest priority generation" },
    ],
  },
];

const faqs = [
  {
    q: "What are credits?",
    a: "Each credit generates one meditation session. The length and complexity of the session doesn't affect credit cost — one session, one credit.",
  },
  {
    q: "Can I use generated sessions commercially?",
    a: "Yes — on Personal and Pro plans. Paid plans include full commercial rights to every session you generate. Use them in apps, courses, podcasts, client sessions, or any other context. Free plan sessions are for personal use only.",
  },
  {
    q: "What happens if I run out of credits?",
    a: "You can still access and listen to all previously generated sessions. To create new ones, wait for your monthly refresh or upgrade your plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel with one click from your settings. You'll keep access through the end of your billing period, and all generated sessions remain yours forever.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. The free plan includes 2 credits per month so you can experience Incraft before committing. Free sessions are for personal use only — upgrade to unlock commercial rights.",
  },
];

/* ─── FAQ Item ─── */

function FAQItem({ item, index }: { item: (typeof faqs)[number]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer group"
      >
        <span
          className="text-[14px] text-[#18181b] group-hover:text-[#3f3f46] transition-colors"
          style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
        >
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown className="w-4 h-4 text-[#a1a1aa]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className="text-[13px] text-[#71717a] leading-relaxed pb-5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Checkout Modal ─── */

function getPriceId(
  plan: (typeof plans)[number] | null,
  billing: "monthly" | "yearly",
  creditCount?: number
): string | null {
  if (!plan) return null;
  if (plan.id === "personal") {
    return billing === "yearly"
      ? process.env.NEXT_PUBLIC_PRICE_PERSONAL_YEARLY || null
      : process.env.NEXT_PUBLIC_PRICE_PERSONAL_MONTHLY || null;
  }
  if (plan.id === "creator") {
    return billing === "yearly"
      ? process.env.NEXT_PUBLIC_PRICE_CREATOR_YEARLY || null
      : process.env.NEXT_PUBLIC_PRICE_CREATOR_MONTHLY || null;
  }
  return null;
}


function CheckoutModal({
  plan,
  billing,
  creditCount,
  onClose,
  onSuccess,
}: {
  plan: (typeof plans)[number] | null;
  billing: "monthly" | "yearly";
  creditCount?: number;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const displayName = plan ? plan.name : "";
  const displayColor = plan ? plan.colorHex : "#c4876c";
  const displayColorLight = plan ? plan.colorLightHex : "#faf0eb";
  const price = plan
    ? billing === "yearly"
      ? plan.yearlyPrice
      : plan.price
    : 0;
  const credits = plan ? plan.credits : 0;

  useEffect(() => {
    const priceId = getPriceId(plan, billing, creditCount);
    if (!priceId) {
      setLoading(false);
      return;
    }
    const mode = "subscription";
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode }),
    })
      .then(async (res) => {
        if (res.status === 401) {
          setNeedsAuth(true);
          throw new Error("Unauthorized");
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Payment intent error:", errData);
          throw new Error(errData.error || "Failed");
        }
        return res.json();
      })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        console.error("Checkout form load error:", err);
      })
      .finally(() => setLoading(false));
  }, [plan, billing, creditCount]);

  const handleCheckoutRedirect = async () => {
    setRedirecting(true);
    try {
      const priceId = getPriceId(plan, billing, creditCount);
      if (!priceId) { setRedirecting(false); return; }
      const mode = "subscription";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });
      if (!res.ok) { setRedirecting(false); return; }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setRedirecting(false);
      }
    } catch {
      setRedirecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-auto"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4 text-[#71717a]" />
        </button>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 2rem)" }}>
        {done ? (
          <div className="p-6 sm:p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: displayColorLight }}
            >
              <Check className="w-7 h-7" style={{ color: displayColor }} />
            </motion.div>
            <h3
              className="text-xl text-[#18181b] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {`Welcome to ${displayName}`}
            </h3>
            <p
              className="text-[13px] text-[#71717a] mb-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {credits} credit{credits !== 1 ? "s have" : " has"} been added to your account. Start creating.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-white text-[13px] transition-all cursor-pointer shadow-sm hover:shadow-md"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                background: displayColor,
              }}
            >
              Go to Studio
            </button>
          </div>
        ) : (
          <>
            {/* Stripe Payment Form */}
            {loading ? (
              <div className="px-5 sm:px-8 py-12 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-[#a1a1aa]" />
                </motion.div>
                <span
                  className="ml-2 text-[13px] text-[#a1a1aa]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Loading payment form...
                </span>
              </div>
            ) : clientSecret ? (
              <div className="px-1 py-4">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            ) : needsAuth ? (
              <div className="px-5 sm:px-8 py-8 text-center space-y-4">
                <div
                  className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
                  style={{ background: displayColor + "18" }}
                >
                  <Lock className="w-5 h-5" style={{ color: displayColor }} />
                </div>
                <div>
                  <h4
                    className="text-[15px] text-[#18181b] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Sign in to continue
                  </h4>
                  <p
                    className="text-[12px] text-[#a1a1aa]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    You need to be signed in so we can add credits to your account.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/login?next=/upgrade")}
                  className="w-full py-3 rounded-xl text-white text-[13px] transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    background: displayColor,
                  }}
                >
                  Sign in
                </button>
              </div>
            ) : (
              <div className="px-5 sm:px-8 py-8 text-center">
                <p
                  className="text-[13px] text-[#71717a]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Unable to load payment form. Please try again.
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function UpgradePage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [checkoutPlan, setCheckoutPlan] = useState<(typeof plans)[number] | null>(null);
  const [checkoutCredits, setCheckoutCredits] = useState<number | undefined>(undefined);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Real user profile data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
      // silently fail — show free plan defaults
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const currentPlan = profile?.plan === "personal" ? "Personal" : profile?.plan === "creator" ? "Pro" : "Free";
  const creditsTotal = profile?.plan === "creator" ? 100 : profile?.plan === "personal" ? 30 : 2;
  const creditsRemaining = profile?.credits_remaining ?? 0;

  const openPlanCheckout = async (plan: (typeof plans)[number]) => {
    setLoadingPlan(plan.id);
    await new Promise((r) => setTimeout(r, 600));
    setCheckoutPlan(plan);
    setCheckoutCredits(undefined);
    setShowCheckout(true);
    setLoadingPlan(null);
  };


  return (
    <div
      className="min-h-screen relative"
      style={{ background: "#faf9f7" }}
    >
      {/* Grain overlay */}
      <div className="fixed inset-0 grain-overlay pointer-events-none opacity-50" />

      {/* Subtle gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07] animate-breathe"
          style={{
            background:
              "radial-gradient(circle, var(--color-sage) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.06] animate-breathe"
          style={{
            background:
              "radial-gradient(circle, var(--color-dusk) 0%, transparent 70%)",
            animationDelay: "3s",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 sm:gap-2.5 text-[13px] text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer group"
          style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Back to Studio</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="flex items-center gap-2.5 text-[#18181b]">
          <Logo />
          <span
            className="text-[15px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Incraft
          </span>
        </div>
        <div className="w-[60px] sm:w-[120px]" />
      </nav>

      {/* Heading + billing toggle */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 pb-5">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-[#18181b] mb-1"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          More sessions.{" "}
          <span style={{ fontStyle: "italic", color: "#8b7ea6" }}>
            More possibility.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.12,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-[12.5px] text-[#8a8480] max-w-md mx-auto mb-4"
          style={{ fontFamily: "var(--font-body)", lineHeight: 1.5 }}
        >
          Every session is yours to keep, share, and use commercially.
        </motion.p>

        {/* Billing toggle + credits */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.18,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex items-center justify-center gap-3"
        >
          <div className="inline-flex items-center gap-0.5 p-[3px] rounded-full bg-[#f0eeeb] border border-[#e2dfd9]">
          {(["monthly", "yearly"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setBilling(period)}
              className="relative px-4 py-1.5 rounded-full text-[11.5px] transition-all cursor-pointer"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: billing === period ? 600 : 450,
                color: billing === period ? "#18181b" : "#8a8480",
              }}
            >
              {billing === period && (
                <motion.div
                  layoutId="billingPill"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-[#e2dfd9]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {period === "monthly" ? "Monthly" : "Yearly"}
                {period === "yearly" && (
                  <span
                    className="text-[9px] px-1.5 py-[1px] rounded-full leading-tight"
                    style={{
                      background: "var(--color-sage-light)",
                      color: "var(--color-sage)",
                      fontWeight: 600,
                    }}
                  >
                    -25%
                  </span>
                )}
              </span>
            </button>
          ))}
          </div>
          {!profileLoading && profile && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11.5px] ${creditsRemaining === 0 ? "border-red-200 bg-red-50" : "border-[#e2dfd9] bg-[#f0eeeb]"}`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <circle cx="9" cy="9" r="7" stroke={creditsRemaining === 0 ? "#fca5a5" : "#e4e4e7"} strokeWidth="2" />
                <circle cx="9" cy="9" r="7" stroke={creditsRemaining === 0 ? "#ef4444" : "#18181b"} strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 7}`}
                  strokeDashoffset={`${2 * Math.PI * 7 * (1 - creditsRemaining / Math.max(1, creditsTotal))}`}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              </svg>
              <span className={creditsRemaining === 0 ? "text-red-500 font-medium" : "text-[#6b6560]"} style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                {creditsRemaining} credit{creditsRemaining !== 1 ? "s" : ""} left
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Plans */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {plans.map((plan, i) => {
            const price =
              billing === "yearly" ? plan.yearlyPrice : plan.price;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + i * 0.08,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative group h-full"
              >
                <div
                  className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 h-full flex flex-col ${
                    plan.recommended
                      ? "border-[#7a9e7e]/30 shadow-[0_4px_24px_rgba(122,158,126,0.12)] hover:shadow-[0_6px_32px_rgba(122,158,126,0.18)] ring-1 ring-[#7a9e7e]/10"
                      : "border-[#e4e2de] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#d4d4d8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                  }`}
                >
                  {plan.recommended && (
                    <div
                      className="absolute top-0 left-0 bottom-0 w-[3px]"
                      style={{
                        background: `linear-gradient(180deg, ${plan.colorHex}, ${plan.colorHex}55)`,
                      }}
                    />
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: plan.colorLightHex }}
                        >
                          {plan.id === "free" ? (
                            <Zap className="w-[15px] h-[15px]" style={{ color: plan.colorHex }} />
                          ) : plan.id === "personal" ? (
                            <Sparkles className="w-[15px] h-[15px]" style={{ color: plan.colorHex }} />
                          ) : (
                            <Crown className="w-[15px] h-[15px]" style={{ color: plan.colorHex }} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className="text-[15px] text-[#18181b] leading-none"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {plan.name}
                            </h3>
                            {plan.recommended && (
                              <span
                                className="text-[9px] px-2 py-[3px] rounded-full shrink-0 flex items-center gap-1"
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontWeight: 600,
                                  color: "#fff",
                                  background: plan.colorHex,
                                  letterSpacing: "0.02em",
                                }}
                              >
                                <Heart className="w-2.5 h-2.5 fill-current" />
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[11px] text-[#a1a1aa] mt-[3px]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {plan.tagline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Credits — hero */}
                    <div
                      className="rounded-xl mb-3.5 px-4 py-3"
                      style={{
                        background: plan.colorLightHex,
                        border: `1px solid ${plan.colorHex}20`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: plan.colorHex }} />
                          <span
                            className="text-[18px] leading-none"
                            style={{
                              fontFamily: "var(--font-display)",
                              color: plan.colorHex,
                            }}
                          >
                            {plan.credits} credits
                          </span>
                        </div>
                        <span
                          className="text-[11.5px]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            color: plan.colorHex,
                          }}
                        >
                          /month
                        </span>
                      </div>
                      <p
                        className="text-[11px] mt-1.5"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 450,
                          color: plan.colorHex,
                        }}
                      >
                        1 credit = 1 session, any length
                      </p>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-end justify-between mb-3.5">
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-[26px] text-[#18181b] leading-none"
                          style={{
                            fontFamily: "var(--font-display)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {plan.id === "free" ? "Free" : `$${price}`}
                        </span>
                        {plan.id !== "free" && (
                          <span
                            className="text-[11.5px] text-[#a1a1aa]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            /mo
                          </span>
                        )}
                      </div>
                      {billing === "yearly" && plan.id !== "free" && (
                        <span
                          className="text-[11px] text-[#a1a1aa]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Save ${(plan.price - plan.yearlyPrice) * 12} by billing yearly
                        </span>
                      )}
                    </div>

                    {profile?.plan === plan.id || (plan.id === "free" && !profile?.plan) ? (
                      <div
                        className="w-full py-2.5 rounded-xl text-[12.5px] flex items-center justify-center gap-2 border-[1.5px]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          borderColor: plan.colorHex + "35",
                          color: plan.colorHex,
                          background: plan.colorLightHex,
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Current Plan
                      </div>
                    ) : plan.id === "free" && profile?.plan && profile.plan !== "free" ? (
                      null
                    ) : (
                      <button
                        onClick={() => openPlanCheckout(plan)}
                        disabled={loadingPlan === plan.id}
                        className="w-full py-2.5 rounded-xl text-[12.5px] transition-all cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          background: plan.recommended ? plan.colorHex : "#1a1614",
                          color: "#fff",
                        }}
                      >
                        {loadingPlan === plan.id ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </motion.div>
                            Processing...
                          </>
                        ) : (
                          <>Get {plan.name}</>
                        )}
                      </button>
                    )}

                    {/* Features */}
                    <div className="mt-3.5 pt-3.5 border-t border-[#f0eee9] space-y-[7px]">
                      {plan.features.slice(1).map((feature) => (
                        <div key={feature.text} className="flex items-center gap-2">
                          <Check className="w-3 h-3 shrink-0" style={{ color: plan.colorHex + "90" }} />
                          <span
                            className="text-[11.5px]"
                            style={{
                              fontFamily: "var(--font-body)",
                              color: "#71717a",
                              fontWeight: 400,
                            }}
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Commercial use banner */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #f5f3ef 0%, #e8e4de 100%)",
            border: "1px solid rgba(26, 22, 20, 0.06)",
          }}
        >
          <div className="px-5 sm:px-8 py-6 sm:py-7 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5 text-[#8a8480]" />
              </div>
              <div>
                <h3
                  className="text-[14px] sm:text-[15px] text-[#18181b] mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Commercial use included on paid plans
                </h3>
                <p
                  className="text-[12px] sm:text-[13px] text-[#8a8480] leading-relaxed max-w-xl"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Every session you generate on a paid plan belongs to you. Use it in your
                  apps, courses, podcasts, therapy practice, or any commercial
                  product. No additional licensing required.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 shrink-0 pl-0 md:pl-0">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#b5aea3]" />
                <span
                  className="text-[11px] text-[#8a8480]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                  }}
                >
                  Full ownership
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#b5aea3]" />
                <span
                  className="text-[11px] text-[#8a8480]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                  }}
                >
                  Redistribute freely
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature highlights */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.65,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            {
              icon: Headphones,
              label: "4 distinct voices",
              desc: "Crafted for clarity",
            },
            {
              icon: Music,
              label: "40+ soundscapes",
              desc: "Ambient backgrounds",
            },
            {
              icon: Zap,
              label: "57+ protocols",
              desc: "CBT-I, NSDR, PMR...",
            },
            {
              icon: InfinityIcon,
              label: "Keep forever",
              desc: "Sessions never expire",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-[#e8e8ec] p-4 sm:p-5 text-center hover:border-[#d4d4d8] transition-colors"
            >
              <item.icon className="w-5 h-5 text-[#a1a1aa] mx-auto mb-3" />
              <p
                className="text-[13px] text-[#18181b] mb-0.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </p>
              <p
                className="text-[11px] text-[#a1a1aa]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* FAQs */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-center text-[#18181b] mb-8"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
          }}
        >
          Common questions
        </motion.h2>
        <div className="divide-y divide-[#e8e8ec]">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} item={faq} index={i} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e8e8ec] bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[#a1a1aa]">
              <Logo />
              <span
                className="text-[13px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Incraft
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a
                href="/privacy"
                className="text-[12px] text-[#a1a1aa] hover:text-[#71717a] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-[12px] text-[#a1a1aa] hover:text-[#71717a] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                className="text-[12px] text-[#a1a1aa] hover:text-[#71717a] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Contact
              </a>
            </div>
            <p
              className="text-[11px] text-[#d4d4d8]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              &copy; {new Date().getFullYear()} Incraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            plan={checkoutPlan}
            billing={billing}
            creditCount={checkoutCredits}
            onClose={() => {
              setShowCheckout(false);
              setCheckoutPlan(null);
              setCheckoutCredits(undefined);
              fetchProfile();
            }}
            onSuccess={fetchProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
