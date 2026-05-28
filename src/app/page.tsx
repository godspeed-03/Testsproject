import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { getUserFromCookies } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getUserFromCookies();
  
  if (user) {
    if (user.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/tests');
    }
  }
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="z-10 max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border mb-8 text-sm text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Welcome to the future of testing
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Advanced <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Test Hosting</span> Platform
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create, manage, and analyze tests with powerful JSON configurations. 
            Experience seamless test taking with rich analytics and immediate feedback.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-lg px-8 py-6 rounded-lg w-full sm:w-auto gap-2">
                Get Started Free 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-lg w-full sm:w-auto bg-muted hover:bg-muted border-border hover:text-foreground">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap size={32} className="text-yellow-400" />}
              title="Dynamic Test Creation"
              desc="Build complex tests instantly using standard JSON structures with support for multiple question types."
            />
            <FeatureCard 
              icon={<BarChart3 size={32} className="text-blue-400" />}
              title="Rich Analytics"
              desc="Gain deep insights into performance with visual dashboards, time analysis, and topic breakdown."
            />
            <FeatureCard 
              icon={<Shield size={32} className="text-green-400" />}
              title="Secure Engine"
              desc="Server-side validation ensures test integrity. Answers are never leaked to the client during tests."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="bg-muted backdrop-blur-md border-border text-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
      <CardHeader>
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4 border border-border">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
