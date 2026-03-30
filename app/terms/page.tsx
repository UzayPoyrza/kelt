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

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <div
              className="text-[13px] text-[#a1a1aa] space-y-0.5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <p>Effective Date: March 30, 2026</p>
              <p>Last Updated: March 30, 2026</p>
            </div>
          </div>

          {/* Terms Content */}
          <div
            className="rounded-2xl bg-white border border-[#e8e8ec] p-6 sm:p-8 space-y-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {/* Preamble */}
            <section>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) form a legal agreement between you and LaunchSpace LLC, the operator of Incraft (&ldquo;Incraft,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), and govern your access to and use of www.incraft.io, the Incraft Studio, and any related websites, applications, generated scripts, audio files, and services (collectively, the &ldquo;Service&rdquo;).
                </p>
                <p>
                  By accessing or using the Service, creating an account, signing in anonymously or through Google or Apple, or purchasing a plan, you agree to these Terms. If you do not agree, do not use the Service.
                </p>
                <p>
                  If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms, and &ldquo;you&rdquo; includes that organization.
                </p>
              </div>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">1. Eligibility and Accounts</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>1.1 Age requirement.</strong> You must be at least 13 years old, or the minimum age required in your jurisdiction to use online services like Incraft. If you are under 18, you may use the Service only with permission from a parent or legal guardian.
                </p>
                <p>
                  <strong>1.2 Account types.</strong> We may allow anonymous access, as well as account creation or sign-in through third-party providers such as Google and Apple. Anonymous access may be limited, rate-limited, or revoked at any time.
                </p>
                <p>
                  <strong>1.3 Account responsibility.</strong> You are responsible for any activity occurring under your account or session and for maintaining the security of your login credentials and devices. You must promptly notify us at <a href="mailto:contact@launchspace.org" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">contact@launchspace.org</a> if you believe your account has been compromised.
                </p>
                <p>
                  <strong>1.4 Accurate information.</strong> If you register or subscribe, you agree to provide accurate, current information and keep it updated.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">2. The Service</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  Incraft is an AI-guided meditation generator that lets users submit prompts and select options such as voice, duration, protocol, and soundscape to generate personalized meditation scripts and audio sessions.
                </p>
                <p>
                  We may add, remove, suspend, or modify features, voices, models, plans, limits, or functionality at any time, including to improve safety, quality, performance, or legal compliance.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">3. Important Health and Safety Disclaimer</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>3.1 Wellness only.</strong> Incraft provides AI-generated meditation and wellness content for informational, educational, creative, and general wellbeing purposes only.
                </p>
                <p>
                  <strong>3.2 Not medical care.</strong> The Service is not medical, psychiatric, psychological, therapeutic, counseling, crisis, or other professional advice, diagnosis, or treatment, and it does not create a doctor-patient, therapist-patient, or other fiduciary relationship.
                </p>
                <p>
                  <strong>3.3 Use common sense.</strong> Do not use the Service while driving, cycling, operating machinery, supervising tasks that require full attention, or in any situation where distraction could create risk or harm.
                </p>
                <p>
                  <strong>3.4 Emergencies.</strong> If you are experiencing a medical emergency, mental health crisis, or risk of self-harm or harm to others, do not rely on the Service; contact emergency services, a qualified clinician, or a crisis resource immediately.
                </p>
                <p>
                  <strong>3.5 Your responsibility.</strong> You are solely responsible for evaluating whether any generated content is appropriate for your needs, health, and circumstances.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">4. User Content</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>4.1 Your content.</strong> You may submit prompts, preferences, account information, and other content through the Service (&ldquo;User Content&rdquo;). You retain any ownership rights you already have in your User Content.
                </p>
                <p>
                  <strong>4.2 License to us.</strong> You grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, process, transmit, adapt, and display your User Content only as reasonably necessary to operate, provide, secure, troubleshoot, improve, and support the Service and to comply with law.
                </p>
                <p>
                  <strong>4.3 Your promises.</strong> You represent and warrant that you have all rights necessary to submit User Content and that your User Content and use of the Service will not violate these Terms, any applicable law, or any third-party rights.
                </p>
                <p>
                  <strong>4.4 Sensitive content.</strong> Do not submit highly sensitive personal information unless you are comfortable with it being processed to generate your session. You are responsible for the content you choose to provide.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">5. Generated Output</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>5.1 Output.</strong> The Service may generate scripts, audio, titles, metadata, and other output based on your prompts and selections (&ldquo;Output&rdquo;).
                </p>
                <p>
                  <strong>5.2 No guarantee of accuracy or suitability.</strong> Output is AI-generated and may be incomplete, inaccurate, generic, repetitive, or unsuitable for your intended use. You must review Output before relying on it or sharing it with others.
                </p>
                <p>
                  <strong>5.3 Similarity.</strong> Because AI systems can generate similar results for different users, Output may not be unique and others may receive similar or identical content.
                </p>
                <p>
                  <strong>5.4 Your use of Output.</strong> Subject to these Terms, applicable law, and any third-party rights, you may use Output generated for you. However, commercial use is allowed only if your current plan or written agreement with us expressly includes commercial rights. Unless such rights are included, Output is for personal, non-commercial use only.
                </p>
                <p>
                  <strong>5.5 Restrictions.</strong> You may not represent Output as medical, clinical, or professional advice, or use it in a manner that is unlawful, deceptive, infringing, or harmful.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">6. Acceptable Use</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-[lower-alpha] pl-5">
                <li>use the Service for any unlawful, fraudulent, misleading, or abusive purpose;</li>
                <li>submit or generate content that infringes intellectual property, privacy, publicity, confidentiality, or other rights;</li>
                <li>attempt to probe, scan, disable, disrupt, or interfere with the Service or its infrastructure;</li>
                <li>reverse engineer, decompile, scrape, copy, or extract source code, models, prompts, datasets, or system behavior except as allowed by applicable law;</li>
                <li>bypass rate limits, session limits, access restrictions, or credit controls, or create multiple accounts to evade usage restrictions;</li>
                <li>use bots or automated means to access the Service in a manner that burdens or harms the Service without our prior written permission;</li>
                <li>upload or transmit malware, malicious code, or harmful material;</li>
                <li>impersonate any person or entity or misrepresent your affiliation;</li>
                <li>use the Service to generate content that promotes violence, self-harm, harassment, exploitation, or illegal activity; or</li>
                <li>use the Service or Output in a way that could reasonably cause harm to others or damage to Incraft.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">7. Plans, Credits, Billing, and Renewals</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>7.1 Plans.</strong> We may offer free, anonymous, trial, and paid plans. Plan features, usage limits, credit allotments, prices, billing intervals, and commercial-use rights are as displayed at checkout or in the Service at the time of purchase.
                </p>
                <p>
                  <strong>7.2 Credits.</strong> We may use a credits system for generation requests. Unless we state otherwise in the Service, one generation may consume one credit. Credits have no cash value, are non-transferable, and are not property.
                </p>
                <p>
                  <strong>7.3 Expiration and resets.</strong> Unless we expressly state otherwise, credits may expire or reset at the end of the applicable billing period, and unused credits do not roll over.
                </p>
                <p>
                  <strong>7.4 Failed generations.</strong> If a generation fails and we determine that a refund of the associated credit is appropriate, we may restore that credit automatically.
                </p>
                <p>
                  <strong>7.5 Recurring billing.</strong> Paid subscriptions automatically renew for the subscription term you selected (for example, monthly or yearly) unless canceled before renewal. You authorize us and our payment processor to charge your selected payment method for recurring fees, taxes, and other amounts due.
                </p>
                <p>
                  <strong>7.6 Payments.</strong> Payments are processed by third parties such as Stripe. We do not store full payment card details on our servers. Your payment relationship with the processor is governed by its terms and policies.
                </p>
                <p>
                  <strong>7.7 Cancellations.</strong> You may cancel renewal of your subscription through your account settings, the billing portal made available through the Service, or the payment processor flow we provide. Unless required by law, cancellation prevents future renewal charges but does not entitle you to a refund for the current billing period.
                </p>
                <p>
                  <strong>7.8 Refunds.</strong> Except as required by law or expressly stated by us, subscription fees and purchased credits are non-refundable. Chargebacks, payment disputes, or abuse of the billing system may result in suspension or termination of your account.
                </p>
                <p>
                  <strong>7.9 Price changes.</strong> We may change prices, plan structure, limits, or credit allocations from time to time. If we do, the updated terms will apply no earlier than your next renewal or purchase unless we state otherwise and applicable law allows.
                </p>
                <p>
                  <strong>7.10 Taxes.</strong> You are responsible for any taxes, duties, or governmental charges associated with your purchase, except for taxes based on our net income.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">8. Third-Party Services</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                The Service may rely on or integrate with third-party services, including authentication providers, cloud hosting providers, payment processors, text-to-speech providers, and other API providers. Your use of third-party services may be subject to separate terms and privacy policies. We are not responsible for third-party services and do not guarantee their ongoing availability, accuracy, or security.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">9. Service Ownership and License</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>9.1 Our property.</strong> The Service, including the website, software, design, branding, trademarks, service marks, logos, compilations, and underlying technology, is owned by or licensed to us and protected by intellectual property and other laws.
                </p>
                <p>
                  <strong>9.2 Limited license.</strong> Subject to these Terms, we grant you a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to access and use the Service for its intended purpose.
                </p>
                <p>
                  <strong>9.3 Restrictions.</strong> Except as expressly allowed in these Terms, you may not copy, sell, resell, distribute, publicly perform, publicly display, modify, or create derivative works from the Service itself.
                </p>
                <p>
                  <strong>9.4 Feedback.</strong> If you provide suggestions, ideas, or feedback, you grant us a worldwide, perpetual, irrevocable, royalty-free license to use it for any lawful purpose without compensation or attribution to you.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">10. Privacy and Communications</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>10.1 Privacy.</strong> Our <Link href="/privacy" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">Privacy Policy</Link> explains how we collect, use, and disclose personal information in connection with the Service.
                </p>
                <p>
                  <strong>10.2 Electronic communications.</strong> By using the Service, you consent to receive service-related notices and communications electronically, including through email, in-app notices, or postings on the Service.
                </p>
                <p>
                  <strong>10.3 Authentication and notices.</strong> Certain features of the Service may rely on cookies or similar technical measures that are reasonably necessary for login, security, and session management.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">11. Suspension, Termination, and Discontinuation</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>11.1 By you.</strong> You may stop using the Service at any time. If you have a paid subscription, you must cancel before renewal to avoid future charges.
                </p>
                <p>
                  <strong>11.2 By us.</strong> We may suspend, limit, or terminate your access to the Service, in whole or in part, with or without notice, if we believe you violated these Terms, created risk or possible legal exposure, failed to pay fees, engaged in abuse or fraud, or if suspension is needed for security, legal, or operational reasons.
                </p>
                <p>
                  <strong>11.3 Discontinuation.</strong> We may discontinue the Service or any part of it at any time. Where reasonably practicable, we will attempt to provide advance notice for material discontinuations affecting paid users.
                </p>
                <p>
                  <strong>11.4 Survival.</strong> Sections that by their nature should survive termination will survive, including sections on ownership, disclaimers, limitations of liability, indemnity, disputes, and any payment obligations accrued before termination.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">12. Availability and No Warranty</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. To the maximum extent permitted by law, we disclaim all warranties, whether express, implied, statutory, or otherwise, including any implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, quiet enjoyment, accuracy, availability, or that the Service will be uninterrupted, error-free, secure, or free from harmful components. We do not warrant that Output will meet your expectations, be unique, be clinically appropriate, or be suitable for any particular use.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">13. Limitation of Liability</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  To the maximum extent permitted by law, Incraft and its operator, affiliates, licensors, service providers, and suppliers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or any loss of profits, revenues, goodwill, data, use, or other intangible losses, arising out of or related to the Service or these Terms, even if advised of the possibility of such damages.
                </p>
                <p>
                  To the maximum extent permitted by law, the aggregate liability of Incraft and its operator arising out of or relating to the Service or these Terms will not exceed the greater of (a) the total amount you paid us for the Service in the 12 months preceding the event giving rise to the claim, or (b) US$100.
                </p>
                <p>
                  Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.
                </p>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">14. Indemnification</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                You will defend, indemnify, and hold harmless Incraft, its operator, affiliates, contractors, licensors, and service providers from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys&apos; fees, arising out of or related to: (a) your User Content; (b) your Output use; (c) your breach of these Terms; (d) your misuse of the Service; or (e) your violation of any law or third-party rights.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">15. Disputes; Governing Law</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>15.1 Informal resolution.</strong> Before filing a formal claim, you agree to first contact us at <a href="mailto:contact@launchspace.org" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">contact@launchspace.org</a> and try to resolve the dispute informally.
                </p>
                <p>
                  <strong>15.2 Governing law.</strong> These Terms are governed by the laws of New York, USA, without regard to conflict-of-law rules.
                </p>
                <p>
                  <strong>15.3 Venue.</strong> Unless applicable law requires otherwise, any dispute arising from or relating to these Terms or the Service will be brought exclusively in the state or federal courts located in New York, USA, and you and Incraft consent to personal jurisdiction and venue there.
                </p>
                <p>
                  <strong>15.4 Time limit.</strong> To the extent permitted by law, any claim relating to the Service or these Terms must be filed within one year after the claim arose; otherwise, it is permanently barred.
                </p>
              </div>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">16. Changes to These Terms</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We may update these Terms from time to time. If we make material changes, we may notify you by posting the updated Terms on the Service, updating the effective date, emailing you if we have your email address, or using another reasonable method. By continuing to use the Service after updated Terms become effective, you agree to the revised Terms.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">17. Miscellaneous</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>17.1 Entire agreement.</strong> These Terms constitute the entire agreement between you and Incraft regarding the Service and supersede prior or contemporaneous understandings relating to the Service.
                </p>
                <p>
                  <strong>17.2 Severability.</strong> If any provision of these Terms is found unenforceable, the remaining provisions will remain in full force and effect.
                </p>
                <p>
                  <strong>17.3 No waiver.</strong> Our failure to enforce any provision is not a waiver of that provision or any other provision.
                </p>
                <p>
                  <strong>17.4 Assignment.</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, asset sale, or by operation of law.
                </p>
                <p>
                  <strong>17.5 Force majeure.</strong> We are not liable for delay or failure caused by events beyond our reasonable control, including outages, internet or cloud failures, labor disputes, acts of government, natural disasters, or third-party service interruptions.
                </p>
                <p>
                  <strong>17.6 Contact.</strong> Questions about these Terms may be sent to <a href="mailto:contact@launchspace.org" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">contact@launchspace.org</a>.
                </p>
              </div>
            </section>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-6 mt-10 text-[12px] text-[#a1a1aa]" style={{ fontFamily: "var(--font-body)" }}>
            <Link href="/privacy" className="hover:text-[#71717a] transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-[#71717a] transition-colors">Contact</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
