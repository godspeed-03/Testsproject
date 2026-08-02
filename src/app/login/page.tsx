"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText, Mail, Sparkles } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import BrandLogoIcon from "@/components/BrandLogoIcon";

export default function LoginPage() {
  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 sm:px-6 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Dynamic Ambient Background Light Orbs */}
      <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-violet-600/15 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-violet-500/10 dark:shadow-slate-950/90 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden space-y-6">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4]" />

        {/* Brand Logo & Heading Area */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-violet-50 dark:bg-slate-800/80 border border-violet-200/60 dark:border-slate-700/80 shadow-lg shadow-violet-500/15">
              <BrandLogoIcon size="lg" />
            </div>
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              UPSC{" "}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#C084FC] bg-clip-text text-transparent">
                Tracker
              </span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800/80 text-[10px] sm:text-xs font-black font-display text-[#7C3AED] dark:text-violet-300 uppercase tracking-wider">
              <Sparkles size={12} className="text-violet-500" />
              <span>Official Civil Services Preparation Suite</span>
            </div>
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Sign in with your Google account to access your personal study timetable, syllabus tracker, and spaced
            repetition engine.
          </p>
        </div>

        {/* Google Sign-In Action Area */}
        <div className="py-2 space-y-4">
          <GoogleSignInButton text="signin_with" />

          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 justify-center font-bold bg-slate-50 dark:bg-slate-800/70 py-2.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <Lock size={13} className="text-emerald-500 shrink-0" />
            <span>Secure 256-bit SSL encrypted Google Authentication</span>
          </div>
        </div>

        {/* Legal & Compliance Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <Link
            href="/privacy-policy"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            <Shield size={12} className="text-emerald-500" />
            <span>Privacy Policy</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/terms-of-service"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            <FileText size={12} />
            <span>Terms of Service</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="mailto:byt.satysm@gmail.com"
            className="hover:text-[#7C3AED] dark:hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            <Mail size={12} />
            <span>Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
