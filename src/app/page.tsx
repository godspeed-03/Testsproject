import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, CheckSquare, Shield, Lock, Target, BookOpen, Layers, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getUserFromCookies } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "UPSC tracker — Executive Preparation & Syllabus Suite",
  description: "UPSC tracker is an executive-level study suite for UPSC Civil Services Examination (CSE) aspirants featuring automated syllabus tracking, spaced repetition revision engines, daily study timetables, and progress analytics.",
  verification: {
    google: "BBC_-UN0nPiBk5hGBTmMDhj7ryHNoMVGZ9viAgJQWAQ",
  },
};

export default async function Home() {
  const user = await getUserFromCookies();

  if (user) {
    redirect('/tracker/agenda');
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-20 relative overflow-hidden">
        {/* Ambient background lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 max-w-4xl animate-fade-in space-y-6">
          
          {/* App Name Badge matching Google OAuth Consent Screen Config */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-bold tracking-wide">
            <Target size={16} className="text-amber-600 dark:text-amber-400" />
            <span>Official Application: UPSC tracker</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            UPSC tracker
          </h1>

          <p className="text-lg sm:text-xl font-medium text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
            Executive Study Timetable, Spaced Repetition Revision & Syllabus Suite for UPSC CSE Aspirants
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-semibold">UPSC tracker</strong> empowers Civil Services Examination candidates to structure daily study routines, track General Studies (GS1–GS4) and Optional subject syllabus progress, automate 3-stage revision milestones (R1, R2, R3), and prevent backlogs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-extrabold text-base sm:text-lg px-8 py-6 rounded-xl w-full gap-2 shadow-lg shadow-amber-500/20 cursor-pointer">
                <span>Sign In to UPSC tracker</span>
                <ArrowRight size={20} />
              </Button>
            </Link>

            <Link href="/privacy-policy" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm sm:text-base px-6 py-6 rounded-xl w-full gap-2 cursor-pointer">
                <Shield size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Privacy Policy</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Purpose of Application Section */}
      <section className="py-16 bg-white dark:bg-slate-900/80 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
              Application Overview & Purpose
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              What is UPSC tracker?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100">UPSC tracker</strong> is a specialized, web-based study management system designed specifically for students and aspirants preparing for the Union Public Service Commission (UPSC) Civil Services Examination in India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Clock size={28} className="text-amber-600 dark:text-amber-400" />}
              title="Daily Agenda & Timetable"
              desc="Plan hourly study blocks for GS subjects, Optional papers, Current Affairs, and CSAT practice with real-time timers."
            />
            <FeatureCard
              icon={<BookOpen size={28} className="text-orange-600 dark:text-orange-400" />}
              title="Syllabus Progress Matrix"
              desc="Comprehensive topic breakdown across Prelims and Mains General Studies, highlighting completed vs pending topics."
            />
            <FeatureCard
              icon={<Layers size={28} className="text-amber-600 dark:text-amber-500" />}
              title="Spaced Repetition Engine"
              desc="Automated revision intervals (R1 at 3 days, R2 at 7 days, R3 at 30 days) to optimize long-term memory retention."
            />
          </div>
        </div>
      </section>

      {/* Transparency & User Data Usage Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Lock size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Transparency & Google Account Data Usage
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              When you sign in to <strong className="text-slate-900 dark:text-white font-semibold">UPSC tracker</strong> using <strong className="text-slate-800 dark:text-slate-200">Google Sign-In</strong>, our application requests access strictly to your basic profile information (email address, full name, and profile picture).
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Purpose of Collection:</strong> We use your email address and profile name exclusively to create your user account, verify your identity, and securely synchronize your study timetable and syllabus matrix across your devices.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Third-Party Sharing:</strong> We do NOT sell, rent, or transfer your personal data or Google user data to advertisers, data brokers, or third parties.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No AI Model Training:</strong> Google OAuth user data is never used to train generalized artificial intelligence or machine learning models.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Limited Use Compliance:</strong> UPSC tracker adheres strictly to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-700 dark:hover:text-emerald-300">Google API Services User Data Policy</a>.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                  Read Privacy Policy
                </Link>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Link href="/terms-of-service" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                  Read Terms of Service
                </Link>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Mail size={14} className="text-slate-400 dark:text-slate-500" />
                <span>Support: <a href="mailto:satyam2001anand@gmail.com" className="text-slate-800 dark:text-slate-200 underline">satyam2001anand@gmail.com</a></span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 shadow-xs">
      <CardHeader>
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-800">
          {icon}
        </div>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">{desc}</p>
      </CardContent>
    </Card>
  );
}
