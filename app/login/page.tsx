"use client";

import { useState } from "react";
import { motion } from "motion/react";
import svgPaths from "@/lib/svg-paths";

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

/* ─── Google Icon ─── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ─── Apple Icon ─── */

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/* ─── Background ─── */

function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
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

/* ─── Login Page ─── */

export default function LoginPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--color-sand-50)" }}>
      <AmbientBackground />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm mx-auto flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[var(--color-sand-900)] mb-6"
          >
            <Logo />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-[2.5rem] md:text-[3.25rem] text-[var(--color-sand-900)] leading-tight mb-3">
              Welcome to
              <br />
              <span className="italic">MindFlow</span>
            </h1>
            <p className="text-[var(--color-sand-500)] text-sm" style={{ fontFamily: "var(--font-body)" }}>
              AI-crafted meditations that adapt to you.
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-full bg-white rounded-3xl p-8 shadow-sm border border-[var(--color-sand-200)]"
          >
            <p
              className="text-xs uppercase tracking-widest text-[var(--color-sand-500)] mb-4 font-medium text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Sign in to continue
            </p>

            {/* Google Button */}
            <motion.button
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-[var(--color-sand-900)] text-[var(--color-sand-50)] hover:bg-[var(--color-sand-800)] transition-colors cursor-pointer shadow-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <GoogleIcon />
              </motion.div>
              <span className="text-sm font-medium">Continue with Google</span>
            </motion.button>

            {/* Apple Button */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-white/60 text-[var(--color-sand-900)] border border-[var(--color-sand-200)] hover:bg-white hover:shadow-sm transition-all cursor-pointer mt-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <AppleIcon />
              <span className="text-sm font-medium">Continue with Apple</span>
            </motion.button>

            {/* Terms */}
            <p
              className="text-center text-[var(--color-sand-500)] text-xs mt-5 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              By continuing, you agree to our{" "}
              <a href="#" className="underline underline-offset-2 decoration-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 decoration-[var(--color-sand-400)] hover:text-[var(--color-sand-700)] transition-colors">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
