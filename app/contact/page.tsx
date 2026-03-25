"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, MessageCircle, Bug, Lightbulb, Mail } from "lucide-react";
import svgPaths from "@/lib/svg-paths";

function Logo() {
  return (
    <svg width={28} height={30} fill="none" viewBox="0 0 36 37.8281">
      <path d={svgPaths.p1c4d2300} fill="currentColor" />
      <path d={svgPaths.p2128f680} fill="currentColor" />
      <path d={svgPaths.p1c2ff500} fill="currentColor" />
    </svg>
  );
}

const reasons = [
  {
    icon: Bug,
    title: "Report a Bug",
    desc: "Something broken or not working as expected? We want to fix it.",
    subject: "Bug%20Report",
    color: "#c4876c",
    colorLight: "#faf0eb",
  },
  {
    icon: Lightbulb,
    title: "Feature Request",
    desc: "Have an idea that would make Kelt better? We'd love to hear it.",
    subject: "Feature%20Request",
    color: "#7a9e7e",
    colorLight: "#e8f0e9",
  },
  {
    icon: MessageCircle,
    title: "General Support",
    desc: "Billing, account, or anything else — we're here to help.",
    subject: "Support%20Request",
    color: "#6d9ab5",
    colorLight: "#e5eef4",
  },
];

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative" style={{ background: "#faf9f7" }}>
      <div className="fixed inset-0 grain-overlay pointer-events-none opacity-50" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 sm:gap-2.5 text-[13px] text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer group"
          style={{ fontFamily: "var(--font-body)", fontWeight: 450 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <div className="flex items-center gap-2.5 text-[#18181b]">
          <Logo />
          <span className="text-[15px]" style={{ fontFamily: "var(--font-display)" }}>
            Kelt
          </span>
        </div>
        <div className="w-[60px]" />
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <h1
            className="text-[#18181b] mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Get in touch
          </h1>
          <p
            className="text-[14px] text-[#71717a] leading-relaxed max-w-md mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Whether you found a bug, have a feature idea, or just need help — we read every message and typically respond within 24 hours.
          </p>
        </motion.div>

        {/* Reason cards */}
        <div className="space-y-3 mb-10">
          {reasons.map((reason, i) => (
            <motion.a
              key={reason.title}
              href={`mailto:contact@launchspace.org?subject=${reason.subject}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#e8e8ec] hover:border-[#d4d4d8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: reason.colorLight }}
              >
                <reason.icon className="w-5 h-5" style={{ color: reason.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-[14px] text-[#18181b] mb-0.5"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                >
                  {reason.title}
                </h3>
                <p
                  className="text-[13px] text-[#a1a1aa] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {reason.desc}
                </p>
              </div>
              <ArrowLeft className="w-4 h-4 text-[#d4d4d8] group-hover:text-[#a1a1aa] rotate-180 shrink-0 mt-3 transition-colors" />
            </motion.a>
          ))}
        </div>

        {/* Email display */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-[#e8e8ec] shadow-sm">
            <Mail className="w-4 h-4 text-[#a1a1aa]" />
            <div className="text-left">
              <p
                className="text-[10px] text-[#a1a1aa] uppercase tracking-wider leading-none mb-1"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                Email us directly
              </p>
              <a
                href="mailto:contact@launchspace.org"
                className="text-[15px] text-[#18181b] hover:text-[#8b7ea6] transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                contact@launchspace.org
              </a>
            </div>
          </div>
          <p
            className="text-[12px] text-[#d4d4d8] mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Clicking any card above or the email will open your mail app.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
