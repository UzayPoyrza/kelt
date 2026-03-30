"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
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

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p
              className="text-[13px] text-[#a1a1aa]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Effective Date: March 30, 2026
            </p>
          </div>

          {/* Policy Content */}
          <div
            className="rounded-2xl bg-white border border-[#e8e8ec] p-6 sm:p-8 space-y-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {/* Section 1 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">1. Who We Are and Scope</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  This Privacy Policy explains how Incraft (&ldquo;Incraft,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by Uzay Poyraz, collects, uses, discloses, and protects personal information when you visit incraft.io, create AI-generated meditation sessions, sign in, purchase a subscription, or otherwise use our website and related services (collectively, the &ldquo;Service&rdquo;).
                </p>
                <p>
                  This Policy applies to anonymous visitors, signed-in users, and paying subscribers. It does not apply to third-party websites, apps, or services that we do not control, even if they are linked from or used with the Service.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">2. Information We Collect</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                Depending on how you use the Service, we may collect the following categories of information:
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.1 Account and sign-in information</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li><strong>Anonymous account/session data.</strong> When you first visit the Service, we may create an anonymous account through Supabase Auth so you can use the Service without immediately signing in with email. For anonymous users, we do not collect an email address through the anonymous sign-in flow.</li>
                <li><strong>OAuth sign-in information.</strong> If you choose to sign in with Google or Apple, we may receive information from that provider, such as your email address, display name or full name, and avatar or profile photo URL.</li>
                <li><strong>Profile information.</strong> We store account-related information such as your user ID, email, display name, avatar URL, whether the account is anonymous, your plan, credits, and saved preferences.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.2 Meditation content and generation data</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li>Your meditation prompts and any personal information you choose to include in them.</li>
                <li>Your selected options and settings, such as voice, duration, protocol, soundscape, category, intent, title, and sound preferences.</li>
                <li>Generated outputs and related records, such as scripts, audio file URLs, generation status, timestamps, and performance/timing data.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.3 Billing and subscription information</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li>If you purchase a paid plan, Stripe processes your payment. We receive billing and subscription metadata such as your email address, Stripe customer and subscription identifiers, plan, billing cycle, status, and related transaction metadata.</li>
                <li>We do not store full payment card numbers on our own servers.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.4 Technical, security, and anti-abuse data</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li>Authentication and session cookies used to keep you signed in and maintain secure sessions.</li>
                <li>Hashed IP information for anonymous rate limiting. For anonymous users, we store a SHA-256 hash of the IP address and a daily count to enforce usage limits; we do not store the raw IP address for that purpose.</li>
                <li>Operational metadata needed to keep the Service working, such as timestamps, request status, generation outcomes, and performance metrics.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.5 Support communications</h3>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                If you contact us, we collect the information you include in your message, such as your name, email address, and the contents of your request.
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.6 Information we do not intentionally collect through the Service</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li>We do not request access to your microphone, camera, or precise geolocation through the Service.</li>
                <li>Based on the current implementation, we do not use third-party advertising cookies, ad networks, or third-party analytics scripts.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">2.7 Sensitive information</h3>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We do not ask you to provide medical records, government identification numbers, or precise geolocation data to use the Service. However, because meditation prompts are free text, you may choose to include sensitive or health-related information about stress, sleep, anxiety, or other personal matters. Please avoid including highly sensitive personal information unless it is truly necessary for the meditation you want to generate.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">3. How We Use Information</h2>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5">
                <li>Provide, operate, personalize, and maintain the Service.</li>
                <li>Create and manage anonymous and authenticated accounts and keep you signed in.</li>
                <li>Generate personalized meditation scripts and audio sessions, and deliver playback to you.</li>
                <li>Store and organize your sessions, generations, preferences, credits, and subscriptions.</li>
                <li>Process subscriptions, billing events, credits, refunds, and account-related transactions.</li>
                <li>Enforce anonymous usage limits, detect misuse, and protect the security and integrity of the Service.</li>
                <li>Troubleshoot problems, monitor performance, improve reliability, and develop features.</li>
                <li>Respond to support requests and account inquiries.</li>
                <li>Comply with legal obligations and enforce our terms, policies, and rights.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">4. How AI and Audio Processing Works</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                When you request a meditation, we send your prompt and selected generation options to our script-generation provider so a meditation script can be created. The generated script text is then sent to our text-to-speech provider so audio can be rendered. We intentionally do not send your user ID to the script-generation API. Generated audio is stored and delivered through AWS-hosted storage/CDN infrastructure and our audio proxy.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">5. Cookies and Similar Technologies</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We use cookie-based session technology that is necessary for authentication and secure session management. These cookies help keep you signed in and allow session refresh and account continuity. Based on the current implementation, we do not use third-party advertising cookies and we do not use third-party analytics scripts. If we introduce non-essential cookies or tracking tools in the future, we will update this Policy and, where required, request consent.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">6. Legal Bases for Processing (EEA/UK/Switzerland)</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                If you are located in the European Economic Area, the United Kingdom, or Switzerland, we generally process personal data on one or more of the following bases: (a) to perform our contract with you or take steps you request before entering into a contract; (b) for our legitimate interests, such as securing, operating, improving, and supporting the Service; (c) to comply with legal obligations; and (d) with your consent where consent is required by law.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">7. How We Share Information</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                We do not sell personal information, and we do not share personal information with ad networks or for cross-context behavioral advertising.
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">7.1 Service providers and processors</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li>Supabase, which provides authentication, database, and related backend services.</li>
                <li>Stripe, which processes subscription payments, billing, and related payment events.</li>
                <li>Our script-generation provider and AWS-hosted text-to-speech, storage, and delivery infrastructure, which process prompts, scripts, and audio to provide the Service.</li>
                <li>Google or Apple, if you choose to use those providers to sign in.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">7.2 Other disclosures</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5">
                <li>We may disclose information if required by law, regulation, legal process, or governmental request.</li>
                <li>We may disclose information when we believe it is necessary to protect the rights, property, safety, or security of Incraft, our users, or others.</li>
                <li>If Incraft is involved in a merger, acquisition, financing, reorganization, sale of assets, or similar transaction, information may be transferred as part of that process, subject to applicable law.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">8. International Data Transfers</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                The Service and our service providers may process information in countries other than your own, including the United States. For example, certain AI, text-to-speech, storage, and delivery services are hosted in AWS us-east-1, and the region for Supabase depends on project configuration. If you access the Service from outside those jurisdictions, your information may be transferred to and processed in countries that may have different data protection laws from those in your home country. Where required, we will use appropriate safeguards for such transfers.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">9. Data Retention</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                We retain personal information for as long as reasonably necessary to provide the Service, maintain your account, process transactions, enforce limits, resolve disputes, comply with legal obligations, and protect the Service.
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">9.1 Retention examples</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5">
                <li>Account and profile information may be retained while your account is active and for a reasonable period afterward as needed for legal, billing, security, or recordkeeping purposes.</li>
                <li>Meditation sessions, generations, scripts, and audio-related records may be retained until you delete them, request deletion, or we no longer need them for the purposes described in this Policy.</li>
                <li>Session deletion may be implemented as a soft delete in our systems before later cleanup.</li>
                <li>Billing, subscription, and credit-ledger records may be retained as needed for accounting, tax, fraud-prevention, dispute-resolution, and compliance purposes.</li>
                <li>Audio delivered through our audio proxy may remain temporarily cached for up to approximately 24 hours.</li>
                <li>Hashed IP-based rate-limit records may be retained for as long as reasonably necessary to enforce anonymous usage limits and protect the Service.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">10. Security</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We use administrative, technical, and organizational measures designed to protect personal information. These measures include secure authentication and session handling, row-level access controls in our backend, security headers, hashed IP rate-limiting for anonymous users, allowlist-based audio proxying, route protection for restricted areas, and signature verification for Stripe webhooks. No method of transmission over the internet or electronic storage is completely secure, so we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">11. Your Rights and Choices</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                Depending on where you live, you may have privacy rights regarding your personal information. These rights may include the right to access, know about, correct, delete, restrict certain processing of, object to certain processing of, or receive a portable copy of your personal information, subject to applicable exceptions.
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">11.1 Managing information in the Service</h3>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5 mb-4">
                <li>You may be able to update certain profile details, such as your display name and preferences, through the Service.</li>
                <li>If you want to request access, correction, deletion, or a copy of your information, you can contact us using the contact details below.</li>
              </ul>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">11.2 California notice</h3>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                If you are a California resident, California law may provide rights such as the right to know, delete, correct, and opt out of the sale or sharing of personal information, subject to certain limitations. Incraft does not sell personal information and does not share personal information for cross-context behavioral advertising.
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">11.3 EEA/UK/Switzerland notice</h3>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-4">
                If you are in the EEA, UK, or Switzerland, you may also have rights to information, access, rectification, erasure, restriction, portability, objection, and to lodge a complaint with your local data protection authority, as provided by applicable law.
              </p>

              <h3 className="text-[14px] font-medium text-[#18181b] mb-2">11.4 Verification and limits</h3>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We may need to verify your identity before acting on certain requests. Some rights are limited by law and may not apply in every circumstance.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">12. Children&apos;s Privacy</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13 through the Service. If you believe that a child under 13 has provided personal information to us, please contact us so we can investigate and take appropriate action.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">13. Changes to This Privacy Policy</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We may update this Privacy Policy from time to time. If we make material changes, we will post the updated Policy on the Service and update the Effective Date above. Your continued use of the Service after an updated Policy becomes effective means the updated Policy will apply to your use of the Service, to the extent permitted by law.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">14. Contact Us</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                Incraft is operated by Uzay Poyraz.
              </p>
              <p className="text-[14px] text-[#52525b] leading-relaxed mt-2">
                If you have questions, requests, or concerns about this Privacy Policy or your personal information, you can contact us at:
              </p>
              <p className="mt-3">
                <a
                  href="mailto:contact@launchspace.org"
                  className="text-[14px] text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors"
                >
                  contact@launchspace.org
                </a>
              </p>
            </section>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-6 mt-10 text-[12px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/terms" className="hover:text-[#71717a] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#71717a] transition-colors">Contact</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
