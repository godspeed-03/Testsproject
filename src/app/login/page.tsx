'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Shield, Lock } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500"></div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner text-amber-400">
            <GraduationCap size={32} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              UPSC tracker
            </h1>
            <p className="text-xs font-semibold text-amber-400 mt-0.5">
              Official Civil Services Preparation Suite
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            Sign in with your Google account to access your personal study timetable, syllabus tracker, and spaced repetition engine.
          </p>
        </div>

        {/* Primary Google Sign-In Method */}
        <div className="py-2 space-y-4">
          <GoogleSignInButton text="signin_with" />

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <Lock size={13} className="text-emerald-400 shrink-0" />
            <span>Secure 256-bit SSL encrypted Google Authentication</span>
          </div>
        </div>

        {/* Compliance & Policy Links */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <Link href="/privacy-policy" className="hover:text-amber-400 underline font-medium flex items-center gap-1">
            <Shield size={12} className="text-emerald-400" />
            <span>Privacy Policy</span>
          </Link>
          <span className="text-slate-700">•</span>
          <Link href="/terms-of-service" className="hover:text-amber-400 underline font-medium">
            Terms of Service
          </Link>
          <span className="text-slate-700">•</span>
          <a href="mailto:satyam2001anand@gmail.com" className="hover:text-amber-400 underline">
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
