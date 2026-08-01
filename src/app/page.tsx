import type { Metadata } from "next";
import Link from "next/link";
import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Target, ArrowRight, Mail, Shield } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import AgendaShowcase from "@/components/landing/AgendaShowcase";
import HabitShowcase from "@/components/landing/HabitShowcase";
import CalendarShowcase from "@/components/landing/CalendarShowcase";
import AnalyticsShowcase from "@/components/landing/AnalyticsShowcase";
import ChecklistShowcase from "@/components/landing/ChecklistShowcase";
import FocusTimerShowcase from "@/components/landing/FocusTimerShowcase";
import SyllabusShowcase from "@/components/landing/SyllabusShowcase";
import TestLogShowcase from "@/components/landing/TestLogShowcase";
import TimetableShowcase from "@/components/landing/TimetableShowcase";
import TransparencySection from "@/components/landing/TransparencySection";

export const metadata: Metadata = {
  title: "UPSC tracker — Executive Preparation & Syllabus Suite",
  description:
    "UPSC tracker is an executive-level study suite for UPSC Civil Services Examination (CSE) aspirants featuring automated syllabus tracking, spaced repetition revision engines, daily study timetables, and progress analytics.",
  verification: {
    google: "BBC_-UN0nPiBk5hGBTmMDhj7ryHNoMVGZ9viAgJQWAQ",
  },
};

export default async function Home() {
  const user = await getUserFromCookies();

  if (user) {
    redirect("/tracker/agenda");
  }

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 transition-colors">
      <HeroSection />

      {/* 1. Today Agenda Screen Showcase */}
      <AgendaShowcase />

      {/* 2. Habits Screen Showcase */}
      <HabitShowcase />

      {/* 3. Month / Calendar Screen Showcase */}
      <CalendarShowcase />

      {/* 4. Analytics Section Showcase */}
      <AnalyticsShowcase />

      {/* 5. Checklist Section Showcase */}
      <ChecklistShowcase />

      {/* 6. Focus Timer Section Showcase */}
      <FocusTimerShowcase />

      {/* 7. Syllabus Matrix Showcase */}
      <SyllabusShowcase />

      {/* 8. Test Log Showcase */}
      <TestLogShowcase />

      {/* 9. Timetable Showcase */}
      <TimetableShowcase />

      {/* Transparency & OAuth Verification Info */}
      <TransparencySection />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-indigo-50/40 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-700 font-bold">
            <Target size={14} />
            Ready to start?
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Start Tracking Your UPSC Journey
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
            Sign in with Google and import your study data in seconds. Free to use for all UPSC CSE aspirants.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-600/25 transition-all active:scale-95"
          >
            <span>Get Started — Sign In</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
