import type { Metadata } from "next";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Biohacking.",
};

export default function TermsPage() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-content">
        <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-fog-500">Last updated: 7 September 2026</p>

        <GlassPanel className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col gap-8 text-sm leading-relaxed text-fog-300">
            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">1. Agreement to Terms</h2>
              <p className="mt-2">
                These Terms of Service ("Terms") govern your access to and use of the Biohacking
                website, onboarding questionnaire, customer dashboard, and related
                services (together, the "Service"), operated by Biohacking ("we", "us", or
                "our"). By creating an account or purchasing a coaching package, you agree to be
                bound by these Terms. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">2. The Service</h2>
              <p className="mt-2">
                Biohacking provides online personal training and nutrition coaching for men,
                delivered in two parts: (a) this website, used for purchasing a coaching package,
                completing an onboarding assessment, and managing your account and billing; and
                (b) Everfit, a third-party coaching application used to deliver your training
                programme, track progress, and communicate with your coach. Your access to Everfit
                is provisioned automatically after you complete onboarding and is subject to
                Everfit's own terms of use.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">3. Eligibility and Accounts</h2>
              <p className="mt-2">
                You must be at least 18 years old to purchase a coaching package. You are
                responsible for maintaining the confidentiality of your account credentials and
                for all activity that occurs under your account. You agree to provide accurate
                information during registration and onboarding, including information relevant to
                your health and training history.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">4. Subscriptions and Billing</h2>
              <p className="mt-2">
                Coaching packages are billed on a recurring basis (monthly, 3-month, 6-month, or
                12-month, depending on the package you select) through our payment processor,
                Stripe. By purchasing a package, you authorise us to charge your chosen payment
                method automatically at the start of each billing period until you cancel.
              </p>
              <p className="mt-2">
                Prices are shown in the currency displayed at checkout and may include applicable
                taxes. We reserve the right to change package pricing for future billing periods;
                where required by law, we will provide advance notice of any price change that
                affects an active subscription.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">5. Cancellation and Refunds</h2>
              <p className="mt-2">
                You may cancel your subscription at any time from the Billing section of your
                dashboard, which will direct you to our billing portal. Cancellation stops future
                renewals but does not, by itself, refund the current billing period. Refunds are
                considered on a case-by-case basis at our discretion, or as required by applicable
                law; contact us through the Contact page to request one.
              </p>
              <p className="mt-2">
                We reserve the right to suspend or terminate your access to the Service, including
                your Everfit account, if payment fails and is not resolved within a reasonable
                period, or if you violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">6. Onboarding, Programme Assignment, and Health Information</h2>
              <p className="mt-2">
                As part of onboarding, you will be asked to provide information about your goals,
                training history, lifestyle, nutrition, and certain pre-exercise health-screening
                questions. This information is used to assign you to a coaching programme and to
                inform your coach's guidance. Answering "yes" to a health-screening question does
                not prevent you from using the Service; it is used to flag relevant context for
                your coach.
              </p>
              <p className="mt-2">
                The Service, including any Advanced Performance Support package, is a fitness and
                lifestyle coaching service. It does not provide medical advice, diagnosis, or
                treatment, and never includes medication prescriptions or dosing guidance for any
                substance, including steroids, TRT, or peptides. Always consult an appropriately
                qualified, independent medical professional before beginning any exercise
                programme, particularly if you have an existing health condition, or before making
                any medical decision.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">7. Assumption of Risk</h2>
              <p className="mt-2">
                Physical exercise carries inherent risk of injury. You participate in any training
                programme provided through the Service at your own risk. You confirm that you are
                physically capable of participating in an exercise programme, or that you have
                consulted a medical professional and been cleared to do so where relevant health
                conditions apply.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">8. Third-Party Services</h2>
              <p className="mt-2">
                The Service relies on third-party providers, including Stripe for payment
                processing and Everfit for programme delivery. Your use of those platforms is also
                governed by their respective terms and privacy policies. We are not responsible
                for outages, changes, or issues arising from third-party services outside our
                control.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">9. Intellectual Property</h2>
              <p className="mt-2">
                All content on this website and within the Service, including programme
                templates, written guidance, and branding, is owned by or licensed to Biohacking
                and may not be copied, resold, or redistributed without our written
                permission.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">10. Limitation of Liability</h2>
              <p className="mt-2">
                To the maximum extent permitted by law, Biohacking will not be liable for any
                indirect, incidental, or consequential damages arising from your use of the
                Service. Our total liability for any claim relating to the Service will not exceed
                the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">11. Changes to These Terms</h2>
              <p className="mt-2">
                We may update these Terms from time to time. If we make material changes, we will
                notify you by email or through the dashboard. Continued use of the Service after
                changes take effect constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-fog-100">12. Contact</h2>
              <p className="mt-2">
                Questions about these Terms can be sent to us through the Contact page.
              </p>
            </section>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
