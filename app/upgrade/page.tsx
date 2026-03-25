"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  CreditCard,
  Lock,
  Music,
  Plus,
  Minus,
} from "lucide-react";
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
    id: "personal",
    name: "Personal",
    tagline: "For your daily practice",
    price: 9,
    yearlyPrice: 7,
    credits: 30,
    color: "var(--color-sage)",
    colorLight: "var(--color-sage-light)",
    colorHex: "#7a9e7e",
    colorLightHex: "#e8f0e9",
    recommended: true,
    features: [
      { text: "30 credits per month", highlight: true },
      { text: "All voices & soundscapes" },
      { text: "Up to 20-minute sessions" },
      { text: "Commercial use included" },
    ],
    idealFor: "Ideal for personal meditation, sleep aid, and stress relief",
  },
  {
    id: "creator",
    name: "Creator",
    tagline: "For professionals & creators",
    price: 29,
    yearlyPrice: 23,
    credits: 150,
    color: "var(--color-dusk)",
    colorLight: "var(--color-dusk-light)",
    colorHex: "#8b7ea6",
    colorLightHex: "#eee9f5",
    recommended: false,
    features: [
      { text: "150 credits per month", highlight: true },
      { text: "Everything in Personal" },
      { text: "Extended sessions up to 45 min" },
      { text: "Priority generation queue" },
    ],
    idealFor: "Ideal for therapists, content creators, and wellness coaches",
  },
];

const faqs = [
  {
    q: "What are credits?",
    a: "Each credit generates one meditation session. The length and complexity of the session doesn't affect credit cost — one session, one credit.",
  },
  {
    q: "Can I use generated sessions commercially?",
    a: "Yes. All plans include full commercial rights to every session you generate. Use them in apps, courses, podcasts, client sessions, or any other context.",
  },
  {
    q: "What happens if I run out of credits?",
    a: "You can still access and listen to all previously generated sessions. To create new ones, wait for your monthly refresh, purchase single credits, or upgrade your plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel with one click from your settings. You'll keep access through the end of your billing period, and all generated sessions remain yours forever.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. The free plan includes 3 credits per month so you can experience Kelt before committing. Free sessions also include commercial rights.",
  },
  {
    q: "How do single credits work?",
    a: "Purchase credits individually at $0.99 each — no subscription needed. They never expire and work exactly like monthly credits. Great for occasional use or topping up.",
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

function CheckoutModal({
  plan,
  billing,
  creditCount,
  onClose,
}: {
  plan: (typeof plans)[number] | null;
  billing: "monthly" | "yearly" | "single";
  creditCount?: number;
  onClose: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const isSingleCredit = !plan && creditCount;
  const displayName = plan ? plan.name : `${creditCount} Credit${creditCount !== 1 ? "s" : ""}`;
  const displayColor = plan ? plan.colorHex : "#c4876c";
  const displayColorLight = plan ? plan.colorLightHex : "#faf0eb";
  const price = isSingleCredit
    ? (creditCount! * 0.99).toFixed(2)
    : plan
      ? billing === "yearly"
        ? plan.yearlyPrice
        : plan.price
      : 0;
  const credits = plan ? plan.credits : creditCount || 0;

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const priceId = getPriceId(plan, billing, creditCount);
      if (!priceId) {
        setProcessing(false);
        return;
      }
      const mode = isSingleCredit ? "payment" : "subscription";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });
      if (!res.ok) {
        setProcessing(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setProcessing(false);
      }
    } catch {
      setProcessing(false);
    }
  };

  function getPriceId(
    plan: (typeof plans)[number] | null,
    billing: "monthly" | "yearly" | "single",
    creditCount?: number
  ): string | null {
    if (!plan && creditCount) {
      return process.env.NEXT_PUBLIC_PRICE_SINGLE_CREDIT || null;
    }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4 text-[#71717a]" />
        </button>

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
              {isSingleCredit ? "Credits Added" : `Welcome to ${displayName}`}
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
            {/* Header */}
            <div
              className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5"
              style={{
                background: `linear-gradient(135deg, ${displayColorLight}, white)`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: displayColor + "18" }}
                >
                  {isSingleCredit ? (
                    <Zap className="w-5 h-5" style={{ color: displayColor }} />
                  ) : plan?.id === "personal" ? (
                    <Sparkles className="w-5 h-5" style={{ color: displayColor }} />
                  ) : (
                    <Crown className="w-5 h-5" style={{ color: displayColor }} />
                  )}
                </div>
                <div>
                  <h3
                    className="text-lg text-[#18181b]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {displayName}
                  </h3>
                  <p
                    className="text-[11px] text-[#a1a1aa]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {isSingleCredit ? `${credits} one-time credit${credits !== 1 ? "s" : ""}` : `${credits} credits/month`}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl text-[#18181b]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                  }}
                >
                  ${price}
                </span>
                <span
                  className="text-[13px] text-[#a1a1aa]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {isSingleCredit ? (
                    " one-time"
                  ) : (
                    <>
                      /month
                      {billing === "yearly" && (
                        <span className="ml-1 text-[11px]">(billed annually)</span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Mock payment form */}
            <div className="px-5 sm:px-8 py-6 space-y-4">
              <div>
                <label
                  className="block text-[11px] text-[#71717a] mb-1.5 uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                  }}
                >
                  Card number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] text-[13px] text-[#18181b] outline-none focus:border-[#a1a1aa] transition-colors placeholder:text-[#d4d4d8]"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4d4d8]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[11px] text-[#71717a] mb-1.5 uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                    }}
                  >
                    Expiry
                  </label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] text-[13px] text-[#18181b] outline-none focus:border-[#a1a1aa] transition-colors placeholder:text-[#d4d4d8]"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] text-[#71717a] mb-1.5 uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                    }}
                  >
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] text-[13px] text-[#18181b] outline-none focus:border-[#a1a1aa] transition-colors placeholder:text-[#d4d4d8]"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={processing}
                className="w-full py-3 rounded-xl text-white text-[13px] transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  background: displayColor,
                }}
              >
                {processing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    {isSingleCredit ? `Buy for $${price}` : `Subscribe for $${price}/mo`}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Shield className="w-3 h-3 text-[#d4d4d8]" />
                <span
                  className="text-[10px] text-[#a1a1aa]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Secured by Stripe. {isSingleCredit ? "One-time charge." : "Cancel anytime."}
                </span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function UpgradePage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly" | "single">("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<(typeof plans)[number] | null>(null);
  const [checkoutCredits, setCheckoutCredits] = useState<number | undefined>(undefined);
  const [showCheckout, setShowCheckout] = useState(false);
  const [singleCreditQty, setSingleCreditQty] = useState(5);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Mock user data
  const creditsUsed = 2;
  const creditsTotal = 3;
  const creditsRemaining = creditsTotal - creditsUsed;
  const currentPlan = "Free";

  const openPlanCheckout = async (plan: (typeof plans)[number]) => {
    setLoadingPlan(plan.id);
    await new Promise((r) => setTimeout(r, 600));
    setCheckoutPlan(plan);
    setCheckoutCredits(undefined);
    setShowCheckout(true);
    setLoadingPlan(null);
  };

  const openCreditCheckout = async () => {
    setLoadingPlan("single");
    await new Promise((r) => setTimeout(r, 600));
    setCheckoutPlan(null);
    setCheckoutCredits(singleCreditQty);
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
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
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
            Kelt
          </span>
        </div>
        <div className="w-[60px] sm:w-[120px]" />
      </nav>

      {/* Compact heading + billing toggle */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-[#18181b] mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          More sessions.{" "}
          <span style={{ fontStyle: "italic", color: "#8b7ea6" }}>
            More possibility.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-[14px] text-[#71717a] leading-relaxed max-w-lg mx-auto mb-5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Every session is yours to keep, share, and use commercially.
        </motion.p>

        {/* Current Plan + Credits — compact inline cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
        >
          {/* Current plan pill */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#e8e8ec] shadow-sm w-full sm:w-auto">
            <div className="w-6 h-6 rounded-lg bg-[#f4f4f5] flex items-center justify-center">
              <Crown className="w-3 h-3 text-[#a1a1aa]" />
            </div>
            <div className="text-left">
              <p
                className="text-[10px] text-[#a1a1aa] uppercase tracking-wider leading-none mb-0.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Current plan
              </p>
              <p
                className="text-[14px] text-[#18181b] leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentPlan}
              </p>
            </div>
          </div>

          {/* Credits remaining pill */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#e8e8ec] shadow-sm w-full sm:w-auto">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: creditsRemaining > 0 ? "#e8f0e9" : "#faf0eb" }}
            >
              <Zap
                className="w-3 h-3"
                style={{ color: creditsRemaining > 0 ? "#7a9e7e" : "#c4876c" }}
              />
            </div>
            <div className="text-left">
              <p
                className="text-[10px] text-[#a1a1aa] uppercase tracking-wider leading-none mb-0.5"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Credits remaining
              </p>
              <div className="flex items-baseline gap-1">
                <p
                  className="text-[14px] leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: creditsRemaining > 0 ? "#7a9e7e" : "#c4876c",
                  }}
                >
                  {creditsRemaining}
                </p>
                <span
                  className="text-[11px] text-[#a1a1aa]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  / {creditsTotal}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.25,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-flex items-center gap-1 p-1 rounded-full bg-[#f0eeeb] border border-[#e2dfd9]"
        >
          {(["monthly", "yearly", "single"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setBilling(period)}
              className="relative px-5 py-2 rounded-full text-[12px] transition-all cursor-pointer"
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
                {period === "monthly" ? "Monthly" : period === "yearly" ? "Yearly" : "Single Credits"}
                {period === "yearly" && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "var(--color-sage-light)",
                      color: "var(--color-sage)",
                      fontWeight: 600,
                    }}
                  >
                    -20%
                  </span>
                )}
              </span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Plans */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {billing === "single" ? (
          <motion.div
            key="single-credits"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg mx-auto"
          >
            <div className="rounded-2xl bg-white border border-[#e8e8ec] overflow-hidden shadow-sm">
              <div className="px-6 sm:px-8 pt-7 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#faf0eb" }}>
                    <Zap className="w-5 h-5" style={{ color: "#c4876c" }} />
                  </div>
                  <div>
                    <h3 className="text-[17px] text-[#18181b]" style={{ fontFamily: "var(--font-display)" }}>Single Credits</h3>
                    <p className="text-[13px] text-[#8a8480]" style={{ fontFamily: "var(--font-body)" }}>No subscription — buy what you need</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[36px] text-[#18181b] leading-none" style={{ fontFamily: "var(--font-display)" }}>$0.99</span>
                  <span className="text-[13px] text-[#8a8480]" style={{ fontFamily: "var(--font-body)" }}>/ credit</span>
                </div>
                <p className="text-[12px] text-[#a1a1aa] mb-5" style={{ fontFamily: "var(--font-body)" }}>Credits never expire. Use them anytime.</p>
              </div>
              <div className="px-6 sm:px-8 pb-7">
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-0 bg-[#f4f4f5] rounded-lg border border-[#e4e4e7]">
                    <button
                      onClick={() => setSingleCreditQty(Math.max(1, singleCreditQty - 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer rounded-l-lg hover:bg-[#e8e8ec]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-[16px] text-[#18181b] tabular-nums" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                      {singleCreditQty}
                    </span>
                    <button
                      onClick={() => setSingleCreditQty(Math.min(50, singleCreditQty + 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer rounded-r-lg hover:bg-[#e8e8ec]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[13px] text-[#8a8480]" style={{ fontFamily: "var(--font-body)" }}>
                    {singleCreditQty} credit{singleCreditQty !== 1 ? "s" : ""} = {singleCreditQty} session{singleCreditQty !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={openCreditCheckout}
                  disabled={loadingPlan === "single"}
                  className="w-full py-3 rounded-xl text-white text-[14px] transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 600, background: "#c4876c" }}
                >
                  {loadingPlan === "single" ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Buy for ${(singleCreditQty * 0.99).toFixed(2)}
                    </>
                  )}
                </button>
                <div className="mt-5 space-y-2.5">
                  {["One session per credit, any length", "All voices & soundscapes included", "Commercial use rights", "Never expires"].map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#c4876c" }} />
                      <span className="text-[13px] text-[#52525b]" style={{ fontFamily: "var(--font-body)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan, i) => {
            const price =
              billing === "yearly" ? plan.yearlyPrice : plan.price;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.25 + i * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative group h-full"
              >
                {/* Card */}
                <div
                  className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 h-full flex flex-col ${
                    plan.recommended
                      ? "border-[#d4cfc6] shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                      : "border-[#e8e8ec] hover:border-[#d4d4d8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                  }`}
                >
                  {/* Recommended badge */}
                  {plan.recommended && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, ${plan.colorHex}, ${plan.colorHex}88)`,
                      }}
                    />
                  )}

                  <div className="p-5 sm:p-7 flex flex-col flex-1">
                    {/* Plan header */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: plan.colorLightHex }}
                          >
                            {plan.id === "personal" ? (
                              <Sparkles
                                className="w-[18px] h-[18px]"
                                style={{ color: plan.colorHex }}
                              />
                            ) : (
                              <Crown
                                className="w-[18px] h-[18px]"
                                style={{ color: plan.colorHex }}
                              />
                            )}
                          </div>
                          <div>
                            <h3
                              className="text-[16px] text-[#18181b]"
                              style={{
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              {plan.name}
                            </h3>
                          </div>
                        </div>
                        <p
                          className="text-[12px] text-[#a1a1aa] pl-[46px]"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {plan.tagline}
                        </p>
                      </div>
                      {plan.recommended && (
                        <span
                          className="text-[10px] px-2.5 py-1 rounded-full border shrink-0"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            borderColor: plan.colorHex + "40",
                            color: plan.colorHex,
                            background: plan.colorLightHex,
                          }}
                        >
                          Suggested
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span
                        className="text-[28px] sm:text-[36px] text-[#18181b] leading-none"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 400,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        ${price}
                      </span>
                      <span
                        className="text-[13px] text-[#a1a1aa]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        /month
                      </span>
                    </div>
                    {billing === "yearly" && (
                      <p
                        className="text-[11px] text-[#a1a1aa] mb-5"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span className="line-through mr-1">
                          ${plan.price}
                        </span>
                        billed as ${plan.yearlyPrice * 12}/year
                      </p>
                    )}
                    {billing === "monthly" && <div className="mb-5" />}

                    {/* Credits highlight */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
                      style={{
                        background: plan.colorLightHex,
                        border: `1px solid ${plan.colorHex}18`,
                      }}
                    >
                      <Zap
                        className="w-4 h-4 shrink-0"
                        style={{ color: plan.colorHex }}
                      />
                      <div>
                        <span
                          className="text-[13px] block"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            color: plan.colorHex,
                          }}
                        >
                          {plan.credits} credits per month
                        </span>
                        <span
                          className="text-[11px]"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: plan.colorHex + "99",
                          }}
                        >
                          1 credit = 1 session of any length
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => openPlanCheckout(plan)}
                      disabled={loadingPlan === plan.id}
                      className="w-full py-3 rounded-xl text-[13px] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        background: plan.recommended
                          ? plan.colorHex
                          : "#18181b",
                        color: "#fff",
                      }}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>Get {plan.name} Plan</>
                      )}
                    </button>

                    {/* Features */}
                    <div className="mt-6 space-y-2.5">
                      {plan.features.map((feature) => (
                        <div
                          key={feature.text}
                          className="flex items-start gap-2.5"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-[1px]"
                            style={{
                              background: feature.highlight
                                ? plan.colorLightHex
                                : "#f4f4f5",
                            }}
                          >
                            <Check
                              className="w-2.5 h-2.5"
                              style={{
                                color: feature.highlight
                                  ? plan.colorHex
                                  : "#a1a1aa",
                              }}
                            />
                          </div>
                          <span
                            className="text-[13px] leading-snug"
                            style={{
                              fontFamily: "var(--font-body)",
                              color: feature.highlight
                                ? "#18181b"
                                : "#71717a",
                              fontWeight: feature.highlight ? 500 : 400,
                            }}
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Ideal for */}
                    <div className="grow" />
                    <div className="pt-5 mt-5 border-t border-[#f0f0f3]">
                      <p
                        className="text-[11px] text-[#a1a1aa] italic"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {plan.idealFor}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>

      {/* Single Credit Purchase (shown only when viewing plans) */}
      {billing !== "single" && <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="rounded-2xl bg-white border border-[#e8e8ec] overflow-hidden hover:border-[#d4d4d8] transition-colors"
        >
          <div className="px-5 sm:px-7 py-6 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#faf0eb" }}
              >
                <Zap className="w-5 h-5" style={{ color: "#c4876c" }} />
              </div>
              <div>
                <h3
                  className="text-[15px] text-[#18181b] mb-0.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Buy single credits
                </h3>
                <p
                  className="text-[13px] text-[#8a8480] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  No subscription needed. $0.99 per credit — they never expire.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 pl-0 md:pl-0 w-full md:w-auto">
              {/* Quantity selector */}
              <div className="flex items-center gap-0 bg-[#f4f4f5] rounded-lg border border-[#e4e4e7]">
                <button
                  onClick={() => setSingleCreditQty(Math.max(1, singleCreditQty - 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer rounded-l-lg hover:bg-[#e8e8ec]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  className="w-10 text-center text-[14px] text-[#18181b] tabular-nums"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  {singleCreditQty}
                </span>
                <button
                  onClick={() => setSingleCreditQty(Math.min(50, singleCreditQty + 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer rounded-r-lg hover:bg-[#e8e8ec]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={openCreditCheckout}
                disabled={loadingPlan === "single"}
                className="px-5 py-2.5 rounded-xl text-white text-[13px] transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2 shrink-0 flex-1 md:flex-none disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  background: "#c4876c",
                }}
              >
                {loadingPlan === "single" ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Processing...
                  </>
                ) : (
                  <>Buy for ${(singleCreditQty * 0.99).toFixed(2)}</>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Free tier reminder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-4 text-center"
        >
          <p
            className="text-[12px] text-[#a1a1aa]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Currently on{" "}
            <span
              className="text-[#71717a]"
              style={{ fontWeight: 500 }}
            >
              {currentPlan}
            </span>{" "}
            — {creditsTotal} credits/month included.
          </p>
        </motion.div>
      </div>}

      {/* Commercial use banner */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16">
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
                  Commercial use included on all plans
                </h3>
                <p
                  className="text-[12px] sm:text-[13px] text-[#8a8480] leading-relaxed max-w-xl"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Every session you generate belongs to you. Use it in your
                  apps, courses, podcasts, therapy practice, or any commercial
                  product. No additional licensing required — even on the free
                  tier.
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
              label: "10+ soundscapes",
              desc: "Ambient backgrounds",
            },
            {
              icon: Zap,
              label: "6 protocols",
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
                Kelt
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
                href="mailto:support@kelt.app"
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
              &copy; {new Date().getFullYear()} Kelt. All rights reserved.
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
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
