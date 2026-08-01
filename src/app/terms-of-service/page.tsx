import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft, Mail, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | UPSC Tracker",
  description:
    "Terms of Service for UPSC Tracker app, governing user access, account registration, authentication, service availability, and usage guidelines.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "August 1, 2026";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-orange-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/tracker/agenda"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full"
          >
            <ArrowLeft size={14} />
            <span>Back to UPSC Tracker</span>
          </Link>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 mb-10 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Terms of Service
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">UPSC Tracker • Official Legal Terms</p>
              </div>
            </div>

            <span className="text-xs font-medium px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Last Updated: {lastUpdated}
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
            Welcome to <strong className="text-amber-600 dark:text-amber-400 font-semibold">UPSC Tracker</strong>{" "}
            (accessible via{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 text-xs">
              nxtdev.in
            </code>{" "}
            and{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 text-xs">
              test.nxtdev.in
            </code>
            ). These Terms of Service govern your access to and use of our web application, tools, study management
            features, and services. Please read these terms carefully before using the application.
          </p>
        </div>

        {/* Terms Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Acceptance of Terms</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
              By accessing or creating an account on{" "}
              <strong className="text-slate-800 dark:text-slate-200">UPSC Tracker</strong>, you confirm that you have
              read, understood, and agreed to be bound by these Terms of Service, as well as our{" "}
              <Link
                href="/privacy-policy"
                className="text-amber-600 dark:text-amber-400 underline hover:text-amber-700 dark:hover:text-amber-300"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              If you do not agree to these terms, you must discontinue using the app immediately.
            </p>
          </section>

          {/* Section 2: Service Overview */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Description of Service</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              <strong className="text-slate-800 dark:text-slate-200">UPSC Tracker</strong> provides an executive-level
              digital preparation dashboard for Union Public Service Commission Civil Services Examination (UPSC CSE)
              candidates. Services include:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Automated daily study timetables and milestone trackers (Home page:{" "}
                  <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-amber-700 dark:text-amber-300">
                    https://test.nxtdev.in/tracker/agenda
                  </code>
                  ).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Syllabus completion matrices across Prelims and Mains General Studies & Optional subjects.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Spaced repetition revision engines, focus timers, and study performance analytics.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Accounts and Authentication */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">User Accounts & Google Sign-In</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
              To access personalized study schedules, you may log in using standard authentication or third-party
              sign-in providers such as <strong className="text-slate-800 dark:text-slate-200">Google Sign-In</strong>.
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p className="font-semibold text-amber-700 dark:text-amber-400">Account Security Responsibilities:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
                <li>You are responsible for safeguarding your login credentials and Google Account access.</li>
                <li>You must provide accurate account information when registering or interacting with the service.</li>
                <li>
                  Notify us immediately at{" "}
                  <a href="mailto:byt.satysm@gmail.com" className="text-amber-600 dark:text-amber-400 underline">
                    byt.satysm@gmail.com
                  </a>{" "}
                  if you suspect unauthorized access to your account.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                4
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Acceptable Use Policy</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
              You agree to use <strong className="text-slate-800 dark:text-slate-200">UPSC Tracker</strong> solely for
              personal, non-commercial educational purposes. You agree NOT to:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Engage in automated scraping, data extraction, or stress-testing of system infrastructure.</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Attempt to bypass authentication mechanisms or compromise user account security.</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Use the service to distribute malicious software or unauthorized advertisements.</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Violate any local, national, or international laws or regulations.</span>
              </div>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                5
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Intellectual Property Rights</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              All branding, application logos, software source code, user interface designs, custom syllabus tools, and
              visual layouts on <strong className="text-slate-800 dark:text-slate-200">nxtdev.in</strong> are the
              intellectual property of UPSC Tracker and its creator. You may not copy, modify, distribute, or
              reverse-engineer any component of the application without prior written approval.
            </p>
          </section>

          {/* Section 6: Disclaimers & Limitation of Liability */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                6
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Disclaimers & Limitation of Liability
              </h2>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">Independent Preparation Platform:</strong> UPSC
                tracker is an independent digital study tool created for UPSC Civil Services Examination aspirants. It
                is not affiliated with, endorsed by, or sponsored by the Union Public Service Commission (UPSC) or any
                government entity.
              </p>
              <p className="leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">As-Is Service:</strong> The platform is provided
                on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether
                express or implied. We do not guarantee uninterrupted access, error-free operations, or specific exam
                results.
              </p>
            </div>
          </section>

          {/* Section 7: Modifications & Termination */}
          <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                7
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Modifications & Account Termination
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
              We reserve the right to modify, update, or discontinue any feature of UPSC Tracker at any time. We also
              reserve the right to suspend or terminate user accounts that violate these Terms of Service.
            </p>
          </section>

          {/* Section 8: Support Contact Information */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Mail size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Contact & Support</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              If you have any questions, inquiries, or feedback regarding these Terms of Service or your account, please
              reach out to our user support team:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">User Support Email:</p>
                <a
                  href="mailto:byt.satysm@gmail.com"
                  className="text-amber-600 dark:text-amber-400 font-bold text-sm hover:underline"
                >
                  byt.satysm@gmail.com
                </a>
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
