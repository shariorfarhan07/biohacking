import type { Metadata } from "next";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Biohacking.",
};

export default function PrivacyPage() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-content">
        <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-fog-500">Last updated: 7 September 2026</p>

        <GlassPanel className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col gap-8 text-sm leading-relaxed text-fog-300">
            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">1. Introduction</h2>
              <p className="mt-2">
                This Privacy Policy explains how Biohacking ("we", "us", or "our") collects,
                uses, and protects information when you use our website, create an account,
                complete onboarding, or use our coaching dashboard (together, the "Service"). It
                also explains how information is shared with Everfit, the coaching application
                used to deliver your programme.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">2. Information We Collect</h2>
              <p className="mt-2">We collect the following categories of information:</p>
              <ul className="mt-2 flex flex-col gap-1.5 pl-5">
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Account information:</span> name,
                  email address, and password (stored in hashed form).
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Onboarding and health information:</span>{" "}
                  your goals, age, height, weight, training experience and preferences, lifestyle
                  and nutrition details, and pre-exercise health-screening answers.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Progress photographs:</span> if you
                  choose to provide them, shared securely with your coach.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Payment information:</span> processed
                  directly by Stripe; we do not store full card details on our servers.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Usage information:</span> pages
                  visited, actions taken in the dashboard, and similar technical data.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Communications:</span> messages you
                  send us through the Contact form or elsewhere.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">3. How We Use Your Information</h2>
              <p className="mt-2">We use the information we collect to:</p>
              <ul className="mt-2 flex flex-col gap-1.5 pl-5">
                <li className="list-disc">Create and manage your account and subscription</li>
                <li className="list-disc">Assign and personalise your coaching programme</li>
                <li className="list-disc">Provision and maintain your Everfit account</li>
                <li className="list-disc">Process payments and manage billing through Stripe</li>
                <li className="list-disc">Respond to support and contact requests</li>
                <li className="list-disc">Maintain the security and integrity of the Service</li>
                <li className="list-disc">Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">4. Health Information</h2>
              <p className="mt-2">
                Health-related information you provide during onboarding (such as injuries,
                physical limitations, and screening answers) is treated as sensitive information.
                It is used solely to inform your coach's programming decisions and to flag
                relevant considerations — it is never sold, and is never used for advertising. You
                can update this information at any time through your dashboard, and you may
                request its deletion subject to our legitimate need to retain records related to
                an active or past coaching relationship.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">5. Sharing Your Information</h2>
              <p className="mt-2">We share information with:</p>
              <ul className="mt-2 flex flex-col gap-1.5 pl-5">
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Everfit:</span> your name, contact
                  details, onboarding answers, and progress photos (if provided) are shared with
                  Everfit to create your coaching account and deliver your programme.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Stripe:</span> payment and billing
                  information necessary to process your subscription.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Our coaching team:</span> internal
                  staff and contracted coaches who need access to deliver your programme.
                </li>
                <li className="list-disc">
                  <span className="font-medium text-fog-200">Legal and safety:</span> where
                  required by law or to protect the rights, property, or safety of Biohacking,
                  our customers, or others.
                </li>
              </ul>
              <p className="mt-2">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">6. Cookies and Sessions</h2>
              <p className="mt-2">
                We use secure, httpOnly session cookies to keep you signed in to your account and
                to the admin dashboard (for authorised staff). These cookies are essential to the
                operation of the Service and are not used for advertising or third-party tracking.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">7. Data Retention</h2>
              <p className="mt-2">
                We retain your account and onboarding information for as long as your account is
                active, and for a reasonable period afterward to comply with legal, accounting, or
                reporting obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">8. Your Rights</h2>
              <p className="mt-2">
                Depending on where you live, you may have the right to access, correct, export, or
                delete your personal information, and to object to or restrict certain processing.
                You can update your profile directly from your dashboard, or contact us through the
                Contact page to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">9. Data Security</h2>
              <p className="mt-2">
                We use industry-standard safeguards, including encryption in transit and hashed
                password storage, to protect your information. No system is completely secure, and
                we cannot guarantee absolute security, but we work to keep your data protected and
                to respond quickly to any issue.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">10. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. Material changes will be
                communicated by email or through the dashboard before they take effect.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">11. Contact</h2>
              <p className="mt-2">
                For any privacy-related questions or requests, please reach out through the
                Contact page.
              </p>
            </section>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
