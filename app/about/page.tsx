"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Brain, Shield, Heart, FlaskConical, Users, Award } from "lucide-react";
import Link from "next/link";
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

const principles = [
  {
    icon: FlaskConical,
    title: "Evidence-Based Protocols",
    description:
      "Every meditation protocol in Incraft is grounded in peer-reviewed research. From Cognitive Behavioral Therapy for Insomnia (CBT-I) to Mindfulness-Based Stress Reduction (MBSR), we implement clinically validated techniques — not trends.",
  },
  {
    icon: Brain,
    title: "Intelligent Personalization",
    description:
      "Our AI analyzes your prompt to detect intent, recommend the most appropriate therapeutic approach, and match you with curated soundscapes — adapting each session to what you actually need.",
  },
  {
    icon: Shield,
    title: "Safety by Design",
    description:
      "Incraft is a wellness tool, not a substitute for professional care. We include clear health disclaimers, encourage users to seek qualified help for clinical needs, and never store or train on sensitive personal data.",
  },
  {
    icon: Heart,
    title: "Accessibility First",
    description:
      "Guided meditation should be available to everyone. We offer free sessions with no paywall for core functionality, anonymous access for privacy-conscious users, and a simple interface that requires no prior meditation experience.",
  },
];

export default function AboutPage() {
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
        <Link href="/" className="flex items-center gap-2.5 text-[#18181b]">
          <Logo />
          <span className="text-[15px]" style={{ fontFamily: "var(--font-display)" }}>
            Incraft
          </span>
        </Link>
        <div className="w-[60px]" />
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1
              className="text-[#18181b] mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
              }}
            >
              About Incraft
            </h1>
            <p
              className="text-[14px] text-[#71717a] max-w-md mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Generate studio-quality guided meditation in 1 prompt. Tailored scripts, natural voice narration, timed pauses — AI powered by science-based protocols. Free.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Company Section */}
            <div
              className="rounded-2xl bg-white border border-[#e8e8ec] p-6 sm:p-8 space-y-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <section>
                <h2 className="text-[16px] font-semibold text-[#18181b] mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8b7ea6]" />
                  Who We Are
                </h2>
                <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                  <p>
                    Incraft is built and operated by <strong>Launchspace LLC</strong>, a technology company focused on applying artificial intelligence to evidence-based health and wellness practices.
                  </p>
                  <p>
                    Our team&rsquo;s work in this space began with <strong>Neurotype</strong> — a science-based meditation app that uses AI to deliver personalized session recommendations grounded in cognitive and behavioral research. Neurotype demonstrated that intelligent systems can meaningfully improve how people access and engage with meditation by matching users to clinically validated protocols based on their needs, rather than offering one-size-fits-all content.
                  </p>
                  <p>
                    Through years of building and refining Neurotype, we identified a deeper opportunity: not just recommending the right meditation, but <em>generating</em> it. That insight led to Incraft — an AI-powered meditation generator that creates complete, personalized sessions on demand, including scripts, voice narration, and ambient soundscapes.
                  </p>
                </div>
              </section>

              <div className="border-t border-[#e8e8ec]" />

              <section>
                <h2 className="text-[16px] font-semibold text-[#18181b] mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#7a9e7e]" />
                  Our Approach
                </h2>
                <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                  <p>
                    Incraft is not a generic relaxation app. Every session is generated using a structured pipeline that draws on established therapeutic frameworks:
                  </p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#7a9e7e] mt-1.5 text-[8px]">&#9679;</span>
                      <span><strong>Cognitive Behavioral Therapy (CBT &amp; CBT-I)</strong> for anxiety, rumination, and sleep difficulties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7a9e7e] mt-1.5 text-[8px]">&#9679;</span>
                      <span><strong>Mindfulness-Based Stress Reduction (MBSR)</strong> and <strong>Mindfulness-Based Cognitive Therapy (MBCT)</strong> for stress and emotional regulation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7a9e7e] mt-1.5 text-[8px]">&#9679;</span>
                      <span><strong>Progressive Muscle Relaxation (PMR)</strong> and <strong>Body Scan</strong> techniques for physical tension and somatic awareness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7a9e7e] mt-1.5 text-[8px]">&#9679;</span>
                      <span><strong>Breathwork protocols</strong> including HRV biofeedback-informed pacing for autonomic regulation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7a9e7e] mt-1.5 text-[8px]">&#9679;</span>
                      <span><strong>Non-Sleep Deep Rest (NSDR)</strong> for recovery and focus restoration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7a9e7e] mt-1.5 text-[8px]">&#9679;</span>
                      <span><strong>Compassion-Focused Therapy (CFT)</strong> and <strong>Mindful Self-Compassion (MSC)</strong> for self-criticism and emotional resilience</span>
                    </li>
                  </ul>
                  <p>
                    When you describe what you need, our system analyzes your intent and routes your session through the most appropriate protocol — the same way a trained practitioner would select an approach for a client, informed by evidence rather than guesswork.
                  </p>
                </div>
              </section>

              <div className="border-t border-[#e8e8ec]" />

              <section>
                <h2 className="text-[16px] font-semibold text-[#18181b] mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[#6d9ab5]" />
                  From Neurotype to Incraft
                </h2>
                <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                  <p>
                    Neurotype taught us what works in AI-assisted meditation: protocol accuracy, personalization depth, and clinical rigor. Users consistently reported better outcomes when matched to the right technique rather than browsing a library of pre-recorded sessions.
                  </p>
                  <p>
                    Incraft takes that foundation further. Instead of recommending from a fixed catalog, we generate each session from scratch — tailoring the script language, pacing, therapeutic structure, voice, and soundscape to the individual. This means no two sessions are identical, and every session is built around what you actually asked for.
                  </p>
                  <p>
                    The underlying generation engine has been developed through extensive testing and iteration, drawing on our experience with thousands of meditation sessions and continuous refinement of our clinical protocol library.
                  </p>
                </div>
              </section>
            </div>

            {/* Principles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {principles.map((principle) => (
                <motion.div
                  key={principle.title}
                  className="rounded-2xl bg-white border border-[#e8e8ec] p-5 sm:p-6"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f4f4f5] flex items-center justify-center">
                      <principle.icon className="w-4 h-4 text-[#52525b]" />
                    </div>
                    <h3
                      className="text-[14px] font-semibold text-[#18181b]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {principle.title}
                    </h3>
                  </div>
                  <p
                    className="text-[13px] text-[#71717a] leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {principle.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Health & Safety Commitment */}
            <div
              className="rounded-2xl bg-white border border-[#e8e8ec] p-6 sm:p-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c4876c]" />
                Health &amp; Safety Commitment
              </h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  We take the responsibility of operating in the wellness space seriously. Incraft is designed as a supportive tool for general wellbeing — it is <strong>not</strong> a medical device, and it does not provide medical advice, diagnosis, or treatment.
                </p>
                <p>
                  We encourage anyone experiencing clinical mental health conditions to work with a qualified healthcare professional. Our content is intended to complement, not replace, professional care.
                </p>
                <p>
                  Our commitment to responsible AI in wellness includes:
                </p>
                <ul className="space-y-2 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-[#c4876c] mt-1.5 text-[8px]">&#9679;</span>
                    <span>Clear disclaimers that generated content is for wellness purposes only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c4876c] mt-1.5 text-[8px]">&#9679;</span>
                    <span>No collection or storage of sensitive health data beyond what users voluntarily include in prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c4876c] mt-1.5 text-[8px]">&#9679;</span>
                    <span>Protocols sourced from established clinical research, not proprietary or unvalidated methods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c4876c] mt-1.5 text-[8px]">&#9679;</span>
                    <span>Transparent <Link href="/privacy" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">Privacy Policy</Link> and <Link href="/terms" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">Terms of Service</Link></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Company Info */}
            <div
              className="rounded-2xl bg-[#f9f9fa] border border-[#e8e8ec] p-6 sm:p-8 text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                Incraft is a product of <strong>Launchspace LLC</strong>.
              </p>
              <p className="text-[13px] text-[#71717a] mt-2">
                For questions, partnerships, or press inquiries, reach us at{" "}
                <a
                  href="mailto:contact@launchspace.org"
                  className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors"
                >
                  contact@launchspace.org
                </a>
              </p>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-6 mt-10 text-[12px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/privacy" className="hover:text-[#71717a] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#71717a] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#71717a] transition-colors">Contact</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
