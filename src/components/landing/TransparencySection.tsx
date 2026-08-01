import Link from "next/link";
import { Lock, CheckCircle2, Mail, Shield } from "lucide-react";

export default function TransparencySection() {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4]" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-[#7C3AED]">
              <Lock size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Application Purpose & Google Account Transparency
            </h2>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            <strong className="text-slate-900 font-semibold">UPSC Tracker</strong> is an executive study management
            suite built for UPSC Civil Services Examination (CSE) aspirants to structure daily routines, track syllabus
            completion, run spaced repetition revision schedules, and analyze test performance. When you sign in using{" "}
            <strong className="text-slate-800">Google Authentication</strong>, our application requests access strictly
            to your basic profile information (email address, full name, and avatar).
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Purpose of Collection:</strong> We use your Google email address and profile name exclusively to
                create your personal user account, authenticate your session, and securely sync your study timetable and
                syllabus matrix across your devices.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Third-Party Data Sharing:</strong> We do NOT sell, rent, or transfer your personal data or
                Google user data to advertisers, data brokers, or third parties.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No AI Model Training:</strong> Google OAuth user data is never used to train generalized
                artificial intelligence or machine learning models.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Limited Use Compliance:</strong> UPSC Tracker adheres strictly to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7C3AED] underline font-semibold hover:text-[#6D28D9]"
                >
                  Google API Services User Data Policy
                </a>
                .
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="text-[#7C3AED] font-bold hover:underline flex items-center gap-1">
                <Shield size={12} /> Read Privacy Policy
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms-of-service" className="text-[#7C3AED] font-bold hover:underline">
                Read Terms of Service
              </Link>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail size={14} className="text-slate-400" />
              <span>
                User Support Email:{" "}
                <a href="mailto:satyam2001anand@gmail.com" className="text-slate-800 font-bold underline">
                  satyam2001anand@gmail.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
