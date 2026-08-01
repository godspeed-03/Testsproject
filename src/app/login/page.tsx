"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import BrandLogoIcon from "@/components/BrandLogoIcon";

export default function LoginPage() {
  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-white to-violet-50/20 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/60 dark:shadow-slate-950/80 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden space-y-6">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4]" />

        {/* Brand Icon Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <BrandLogoIcon size="lg" className="shadow-lg shadow-violet-500/25" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              UPSC{" "}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] bg-clip-text text-transparent">
                Tracker
              </span>
            </h1>
            <p className="text-xs font-extrabold text-[#7C3AED] dark:text-violet-400 mt-1 uppercase tracking-wider">
              Official Civil Services Preparation Suite
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Sign in with your Google account to access your personal study timetable, syllabus tracker, and spaced
            repetition engine.
          </p>
        </div>

        {/* Google Sign-In Action Area */}
        <div className="py-3 space-y-4">
          <GoogleSignInButton text="signin_with" />

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 justify-center font-bold bg-slate-50 dark:bg-slate-800/60 py-2 px-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <Lock size={13} className="text-emerald-500 shrink-0" />
            <span>Secure 256-bit SSL encrypted Google Authentication</span>
          </div>
        </div>

        {/* Legal & Compliance Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <Link
            href="/privacy-policy"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 underline transition-colors flex items-center gap-1"
          >
            <Shield size={12} className="text-emerald-500" />
            <span>Privacy Policy</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/terms-of-service"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 underline transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="mailto:satyam2001anand@gmail.com"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 underline transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
