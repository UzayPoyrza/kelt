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
            <p
              className="text-[13px] text-[#a1a1aa]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Effective Date: March 30, 2026
            </p>
          </div>

          {/* Terms Content */}
          <div
            className="rounded-2xl bg-white border border-[#e8e8ec] p-6 sm:p-8 space-y-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {/* Section 1 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">1. Agreement to Terms</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Incraft website at incraft.io and all related services (collectively, the &ldquo;Service&rdquo;), operated by Uzay Poyraz (&ldquo;Incraft,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
                </p>
                <p>
                  By accessing or using the Service, you agree to be bound by these Terms and our <Link href="/privacy" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">Privacy Policy</Link>. If you do not agree to these Terms, do not use the Service.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">2. Eligibility</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that you have your parent&apos;s or guardian&apos;s permission to use the Service and that they have read and agree to these Terms on your behalf.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">3. Accounts and Authentication</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>Anonymous access.</strong> You may browse certain parts of the Service without creating a full account. An anonymous session may be created automatically to enable limited functionality, subject to daily usage limits.
                </p>
                <p>
                  <strong>Authenticated accounts.</strong> To access the full Service, including the studio, session history, and extended features, you must sign in using Google or Apple OAuth. You are responsible for maintaining the security of your account and for all activities that occur under your account.
                </p>
                <p>
                  <strong>Account linking.</strong> If you sign in after using the Service anonymously, your anonymous session may be linked to your authenticated account. Prior anonymous activity will carry over but will not retroactively consume credits.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">4. The Service</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  Incraft is an AI-guided meditation generator. You provide a text prompt and configuration options, and the Service generates a personalized meditation script and audio session using artificial intelligence and text-to-speech technology.
                </p>
                <p>
                  <strong>AI-generated content.</strong> All meditation scripts and audio are generated by AI. The Service does not provide medical, therapeutic, psychological, or professional health advice. Generated content is not a substitute for professional care. If you are experiencing a mental health crisis, please contact a qualified professional or emergency service.
                </p>
                <p>
                  <strong>No guarantees of accuracy or suitability.</strong> AI-generated meditations may not always be accurate, appropriate, or suitable for your specific needs. You use the generated content at your own discretion and risk.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">5. Plans, Credits, and Billing</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>Free plan.</strong> Authenticated users on the free plan receive 2 credits per month. Anonymous users are limited to 2 generations per day with restricted options (3-minute maximum duration, limited voices and categories).
                </p>
                <p>
                  <strong>Paid plans.</strong> We offer paid subscription plans (Personal and Pro) with additional credits and features. Pricing, credit amounts, and features for each plan are described on the <Link href="/upgrade" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">Pricing page</Link> and may change. Changes will apply to future billing periods.
                </p>
                <p>
                  <strong>Credits.</strong> Each meditation generation consumes 1 credit. Credits are allocated at the start of each billing period and do not roll over to the next period. If a generation fails (script generation or audio rendering), the credit is automatically refunded.
                </p>
                <p>
                  <strong>Billing.</strong> Paid subscriptions are billed through Stripe on a monthly or yearly basis. By subscribing, you authorize us to charge your payment method on a recurring basis. You can manage your subscription, change your plan, or cancel through the Stripe Billing Portal accessible from your account settings.
                </p>
                <p>
                  <strong>Cancellation.</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. You will retain access to paid features and remaining credits until the end of the period. After cancellation, your account reverts to the free plan.
                </p>
                <p>
                  <strong>Refunds.</strong> Subscription fees are generally non-refundable, except where required by applicable law. Automatic credit refunds for failed generations are handled as described above.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">6. User Content and Prompts</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  <strong>Your prompts.</strong> You retain ownership of the text prompts you submit to the Service. By submitting a prompt, you grant Incraft a limited license to process it for the purpose of generating your meditation session.
                </p>
                <p>
                  <strong>Generated content.</strong> Generated meditation scripts and audio are created by AI based on your prompts. Subject to your plan and these Terms, you may use generated content for personal purposes. Commercial use of generated content (such as redistribution, resale, or incorporation into commercial products) is permitted only on paid plans that include commercial use rights, as described on the Pricing page.
                </p>
                <p>
                  <strong>Prohibited content.</strong> You must not use the Service to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to refuse or remove content and to suspend or terminate accounts that violate these Terms.
                </p>
                <p>
                  <strong>Sensitive prompts.</strong> Because prompts are free text, you may include personal or health-related information. Please review our <Link href="/privacy" className="text-[#8b7ea6] hover:text-[#6b5e8a] transition-colors">Privacy Policy</Link> for details on how we handle this information. We recommend avoiding highly sensitive personal information in prompts unless necessary.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">7. Acceptable Use</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5">
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.</li>
                <li>Attempt to circumvent usage limits, rate limiting, authentication, or access controls.</li>
                <li>Interfere with, disrupt, or place an undue burden on the Service or its infrastructure.</li>
                <li>Use automated means (bots, scrapers, etc.) to access the Service without our prior written consent.</li>
                <li>Reverse engineer, decompile, or attempt to extract the source code of the Service or its underlying AI models.</li>
                <li>Resell, sublicense, or redistribute access to the Service itself.</li>
                <li>Misrepresent AI-generated content as human-created professional medical or therapeutic advice.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">8. Intellectual Property</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  The Service, including its design, code, branding, visual identity, and all non-user-generated content, is owned by Incraft and protected by intellectual property laws. These Terms do not grant you any rights to our trademarks, logos, or brand assets.
                </p>
                <p>
                  Third-party trademarks, logos, and brand names mentioned in the Service belong to their respective owners.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">9. Third-Party Services</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                The Service integrates with third-party services, including Supabase (authentication and database), Stripe (payment processing), Google and Apple (OAuth sign-in), and AWS infrastructure (AI script generation, text-to-speech, audio storage and delivery). Your use of those services is subject to their respective terms and privacy policies. We are not responsible for third-party services or their availability.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">10. Service Availability and Modifications</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  We strive to keep the Service available and reliable, but we do not guarantee uninterrupted or error-free operation. The Service depends on third-party infrastructure and APIs that may experience downtime or degradation.
                </p>
                <p>
                  We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at any time, with or without notice. We will make reasonable efforts to notify you of material changes that affect your use.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">11. Disclaimer of Warranties</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT AI-GENERATED CONTENT WILL BE ACCURATE, COMPLETE, OR SUITABLE FOR ANY PARTICULAR PURPOSE.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">12. Limitation of Liability</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, INCRAFT AND ITS OPERATOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) $50 USD.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">13. Indemnification</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                You agree to indemnify, defend, and hold harmless Incraft and its operator from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the Service, your violation of these Terms, your content or prompts, or your violation of any third-party rights.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">14. Termination</h2>
              <div className="text-[14px] text-[#52525b] leading-relaxed space-y-3">
                <p>
                  We may suspend or terminate your access to the Service at any time, with or without cause and with or without notice, including if we reasonably believe you have violated these Terms.
                </p>
                <p>
                  You may stop using the Service at any time. If you have a paid subscription, you can cancel it through the Billing Portal in your account settings. Cancellation takes effect at the end of your current billing period.
                </p>
                <p>
                  Upon termination, your right to use the Service ceases. Sections that by their nature should survive termination (including but not limited to disclaimers, limitations of liability, and indemnification) will survive.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">15. Governing Law and Disputes</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising out of or relating to these Terms or the Service shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction, as applicable.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">16. Changes to These Terms</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                We may update these Terms from time to time. If we make material changes, we will post the updated Terms on the Service and update the Effective Date above. Your continued use of the Service after updated Terms become effective means you accept the updated Terms, to the extent permitted by law.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">17. General</h2>
              <ul className="text-[14px] text-[#52525b] leading-relaxed space-y-2 list-disc pl-5">
                <li>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</li>
                <li>Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.</li>
                <li>These Terms, together with the Privacy Policy, constitute the entire agreement between you and Incraft regarding the Service.</li>
                <li>You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.</li>
              </ul>
            </section>

            {/* Section 18 */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#18181b] mb-3">18. Contact Us</h2>
              <p className="text-[14px] text-[#52525b] leading-relaxed">
                If you have questions or concerns about these Terms, you can contact us at:
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
            <Link href="/privacy" className="hover:text-[#71717a] transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-[#71717a] transition-colors">Contact</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
