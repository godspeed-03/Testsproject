import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Mail, Lock, CheckCircle2, UserCheck, Trash2, Database, EyeOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | UPSC tracker",
  description:
    "Privacy Policy for UPSC tracker app detailing user data collection, Google API Service User Data Policy compliance, data protection, and user rights.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 1, 2026";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/tracker/agenda"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft size={14} />
            <span>Back to UPSC tracker</span>
          </Link>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 mb-10 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Privacy Policy
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  UPSC tracker • User Data & Google OAuth Compliance Statement
                </p>
              </div>
            </div>

            <span className="text-xs font-medium px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Last Updated: {lastUpdated}
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
            At <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">UPSC tracker</strong>{" "}
            (accessible via{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 text-xs">
              nxtdev.in
            </code>{" "}
            and{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 text-xs">
              test.nxtdev.in
            </code>
            ), we take user privacy and data security with the utmost seriousness. This Privacy Policy discloses our
            data handling practices for our web application, including our integration with{" "}
            <strong className="text-slate-800 dark:text-slate-200">Google OAuth Sign-In</strong>.
          </p>
        </div>

        {/* Highlight Box for Google Verification Reviewers */}
        <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-5 sm:p-6 mb-8 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={18} />
            <span>Google API Services User Data Policy Disclosure</span>
          </div>
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">UPSC tracker&apos;s</strong> use and transfer to any
            other app of information received from Google APIs will strictly adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200"
            >
              Google API Services User Data Policy
            </a>
            , including the <strong>Limited Use</strong> requirements.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Application Information */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">App Information & Scope</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Application Name:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">UPSC tracker</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Developer & Support Contact:</span>
                <a
                  href="mailto:byt.satysm@gmail.com"
                  className="text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:underline"
                >
                  byt.satysm@gmail.com
                </a>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Authorized Domain:</span>
                <span className="text-slate-900 dark:text-slate-200 font-mono">nxtdev.in</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Application Home Page:</span>
                <a
                  href="https://test.nxtdev.in/tracker/agenda"
                  className="text-slate-900 dark:text-slate-200 font-mono underline hover:text-emerald-600 dark:hover:text-emerald-300"
                >
                  https://test.nxtdev.in/tracker/agenda
                </a>
              </div>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Information We Collect</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              We collect minimal data necessary to provide and personalize our UPSC Civil Services study management
              application:
            </p>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  <UserCheck size={16} />
                  <span>Account & Profile Data (Google Sign-In)</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  When you sign in using your Google Account, we request access only to your basic account profile:
                  email address, primary display name, and unique user identifier. We do NOT request access to your
                  Google Contacts, Google Drive, Gmail, or private Google files.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  <Database size={16} />
                  <span>App Usage & Study Logs</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Data generated by you while using the app, such as your daily timetable blocks, GS/Optional syllabus
                  status, spaced repetition revision schedules, habit streaks, and mock test scores.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How We Use Data */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">How We Use Your Information</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
              Your data is exclusively utilized to deliver and improve your experience on UPSC tracker:
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>User Authentication:</strong> Authenticate your identity and securely maintain your active
                  session.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Syllabus & Routine Synchronization:</strong> Store and save your individual study progress,
                  master routine, and backlog items across devices.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Support & Communication:</strong> Respond to your technical inquiries or account assistance
                  sent to{" "}
                  <a href="mailto:byt.satysm@gmail.com" className="text-emerald-600 dark:text-emerald-400 underline">
                    byt.satysm@gmail.com
                  </a>
                  .
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4: Data Protection, Sharing & Non-Disclosure */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                4
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Data Protection & Zero Third-Party Sharing
              </h2>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-start gap-3">
                <EyeOff size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">
                    No Selling or Renting of Data
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    We <strong>NEVER sell, rent, trade, or monetize</strong> your personal data or Google account
                    information to third-party data brokers, marketers, or advertisers under any circumstances.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-start gap-3">
                <Lock size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">
                    No AI / Machine Learning Model Training
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Google user data obtained through OAuth is{" "}
                    <strong>
                      NEVER used to train generalized artificial intelligence (AI) or machine learning (ML) models
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Data Security */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                5
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Data Security Standards</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We employ industry-standard administrative, technical, and physical safeguards to prevent unauthorized
              access, loss, or disclosure of user data. All traffic to{" "}
              <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-emerald-700 dark:text-emerald-300">
                nxtdev.in
              </code>{" "}
              is encrypted using Transport Layer Security (TLS / HTTPS).
            </p>
          </section>

          {/* Section 6: Data Retention & User Deletion Rights */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                6
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Data Retention & Account Deletion Rights
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              You maintain total control over your personal information.
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-start gap-3 text-xs">
              <Trash2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-200">Request Data Deletion:</p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  To request complete deletion of your account and associated study data, email our support team at{" "}
                  <a
                    href="mailto:byt.satysm@gmail.com"
                    className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
                  >
                    byt.satysm@gmail.com
                  </a>{" "}
                  with the subject line <strong>&quot;Data Deletion Request&quot;</strong>. Upon verification, your
                  account record and stored progress data will be permanently wiped from our database within 7 working
                  days.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Updates to Policy */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                7
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Updates to This Privacy Policy</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We may periodically update this policy to reflect enhancements in service functionality or changes in
              Google OAuth policy compliance requirements. Any revisions will be published directly on this page with an
              updated &quot;Last Updated&quot; timestamp.
            </p>
          </section>

          {/* Contact Box */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Mail size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Privacy Support Contact</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              For any questions regarding this Privacy Policy, your Google account permissions, or data rights:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Support Email:</p>
                <a
                  href="mailto:byt.satysm@gmail.com"
                  className="text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:underline"
                >
                  byt.satysm@gmail.com
                </a>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">App Name:</p>
                <p className="text-slate-900 dark:text-slate-200 font-semibold">UPSC tracker</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Authorized Domain:</p>
                <p className="text-slate-900 dark:text-slate-200 font-mono">nxtdev.in / test.nxtdev.in</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
