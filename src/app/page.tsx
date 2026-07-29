import Link from 'next/link';
import { ArrowRight, Clock, Calendar, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getUserFromCookies } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getUserFromCookies();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="z-10 max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 text-sm text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            UPSC CSE Preparation Hub
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            UPSC Daily <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">Timetable & Tracker</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stay structured, track your daily study routine, manage revision milestones, and monitor backlogs to achieve your UPSC goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-base sm:text-lg px-8 py-6 rounded-lg w-full gap-2 shadow-lg shadow-amber-500/20 font-semibold">
                Access Student Tracker
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16">Features Built for Serious Aspirants</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock size={32} className="text-amber-400" />}
              title="Daily Schedule & Timetable"
              desc="Structured study blocks optimized for high focus sessions, GS, Optional subjects, and revision."
            />
            <FeatureCard
              icon={<Calendar size={32} className="text-orange-400" />}
              title="Milestone & Revision Tracker"
              desc="Track subject progress across multiple revision cycles and keep count of completed targets."
            />
            <FeatureCard
              icon={<CheckSquare size={32} className="text-amber-500" />}
              title="Backlog & Goal Management"
              desc="Log specific pending topics and prevent backlogs from slipping through the cracks."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="bg-muted backdrop-blur-md border-border text-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
      <CardHeader>
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{desc}</p>
      </CardContent>
    </Card>
  );
}
