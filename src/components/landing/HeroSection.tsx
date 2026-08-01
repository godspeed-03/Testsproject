"use client";

import Link from "next/link";
import { ArrowRight, Target, ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 lg:px-20 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">
      {/* Ambient glow */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 max-w-4xl space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 text-sm text-[#7C3AED] font-bold tracking-wide">
          <Target size={16} className="text-[#7C3AED]" />
          <span>UPSC tracker — Study Management Suite</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] text-slate-900">
          UPSC{" "}
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C084FC] bg-clip-text text-transparent">
            tracker
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl font-semibold text-violet-900/90 max-w-2xl mx-auto leading-relaxed">
          Executive Study Timetable, Spaced Repetition Engine & Syllabus Progress Suite for UPSC Civil Services
          Aspirants
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          <strong className="text-slate-800">UPSC tracker</strong> is a purpose-built web application that helps UPSC
          CSE aspirants structure daily study routines, track GS & Optional subject progress across 12-stage revision
          pipelines, log test performances, and maintain weekly timetables — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-violet-600/25 transition-all active:scale-95"
          >
            <span>Sign In to UPSC tracker</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-6 py-4 border border-slate-200 hover:border-violet-300 text-slate-700 hover:text-[#7C3AED] font-bold text-sm rounded-2xl transition-all cursor-pointer bg-white shadow-xs"
          >
            <span>Explore Features</span>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {[
            "Habit Tracking",
            "Syllabus Matrix",
            "Test Analytics",
            "Weekly Timetable",
            "Focus Timer",
            "Spaced Repetition",
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={24} className="text-slate-300" />
      </div>
    </section>
  );
}
