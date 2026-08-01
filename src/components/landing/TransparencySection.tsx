import Link from "next/link";
import { Lock, CheckCircle2, Mail, Shield } from "lucide-react";

export default function TransparencySection() {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Lock size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Transparency & Google Account Data Usage</h2>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            When you sign in to <strong className="text-slate-900 font-semibold">UPSC tracker</strong> using{" "}
            <strong className="text-slate-800">Google Sign-In</strong>, our application requests access strictly to your
            basic profile information (email address, full name, and profile picture).
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Purpose of Collection:</strong> We use your email address and profile name exclusively to create
                your user account, verify your identity, and securely synchronize your study timetable and syllabus
                matrix across your devices.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Third-Party Sharing:</strong> We do NOT sell, rent, or transfer your personal data or Google
                user data to advertisers, data brokers, or third parties.
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
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Limited Use Compliance:</strong> UPSC tracker adheres strictly to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline font-semibold hover:text-emerald-700"
                >
                  Google API Services User Data Policy
                </a>
                .
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="text-amber-600 font-bold hover:underline flex items-center gap-1">
                <Shield size={12} /> Read Privacy Policy
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms-of-service" className="text-amber-600 font-bold hover:underline">
                Read Terms of Service
              </Link>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail size={14} className="text-slate-400" />
              <span>
                Support:{" "}
                <a href="mailto:byt.satysm@gmail.com" className="text-slate-800 underline">
                  byt.satysm@gmail.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
