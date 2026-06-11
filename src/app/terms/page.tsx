import Link from "next/link";

export const metadata = {
  title: "Terms of Service · PreplyFly",
  description:
    "Terms of Service governing use of the PreplyFly academic platform.",
};

export default function TermsPage() {
  const effective = "June 10, 2026";
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#f8f6f1", color: "#16181c" }}
    >
      <main className="mx-auto max-w-3xl px-6 py-16">
        <nav
          className="mb-8 text-[12px] font-bold uppercase tracking-[0.15em]"
          style={{ color: "#41484b", fontFamily: "Geist Mono, monospace" }}
        >
          <Link href="/" className="hover:underline">
            ← Home
          </Link>
        </nav>

        <h1
          className="mb-2 text-4xl font-black tracking-tighter"
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          Terms of Service
        </h1>
        <p
          className="mb-10 text-[13px] uppercase tracking-[0.15em]"
          style={{ color: "#6b7280", fontFamily: "Geist Mono, monospace" }}
        >
          Effective: {effective}
        </p>

        <section className="space-y-8 text-[15px] leading-[26px]">
          <div>
            <h2 className="mb-2 text-xl font-bold">1. Acceptance</h2>
            <p>
              By creating an account or using PreplyFly (&ldquo;the
              Service&rdquo;), you agree to these Terms. If you do not agree, do
              not use the Service.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">2. Eligibility</h2>
            <p>
              You must be a current student or authorized academic staff member
              and at least 16 years old. Accounts require administrator
              approval before access is granted.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">3. Academic Integrity</h2>
            <p>
              You agree not to share account credentials, submit work that is
              not your own, or use the Service to circumvent assessments. AI
              examiner sessions, coding submissions, and test attempts are
              logged and may be reviewed for integrity violations.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">4. Acceptable Use</h2>
            <p>
              You will not attempt to compromise platform security, scrape data
              at scale, run denial-of-service attacks, or upload malicious code
              through the sandboxed coding or self-upload features.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">5. Content Ownership</h2>
            <p>
              You retain ownership of materials you upload. You grant PreplyFly
              a limited license to process those materials to provide the
              Service (parsing, scoring, generating mock questions, storing
              attempt history).
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">6. Privacy</h2>
            <p>
              Handling of personal data is governed by our{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">7. Suspension</h2>
            <p>
              We may suspend or terminate accounts that violate these Terms,
              compromise other users, or place undue load on the Service.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">8. Disclaimer</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranty of
              any kind. Scores, feedback, and AI-generated content are study
              aids, not authoritative grades.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">9. Changes</h2>
            <p>
              We may update these Terms. Material changes will be announced via
              email or dashboard notice at least 14 days before they take
              effect.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-bold">10. Contact</h2>
            <p>
              Questions: contact your institutional administrator or write to
              the address listed in your onboarding email.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
