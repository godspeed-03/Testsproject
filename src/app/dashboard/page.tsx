'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, BookOpen, Clock, BarChart3, Target, TrendingUp, CheckCircle, Brain } from 'lucide-react';

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);

  const [ongoingAttempts, setOngoingAttempts] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const fetchAttemptsHistory = async () => {
    try {
      const [histRes, analyticsRes] = await Promise.all([
        fetch('/api/attempts/history'),
        fetch('/api/analytics/overall')
      ]);
      
      if (histRes.ok) {
        const data = await histRes.json();
        setOngoingAttempts(data.attempts.filter((a: any) => a.status === 'in-progress'));
      }
      
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch attempts history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttemptsHistory();
  }, []);

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">Manage your ongoing tests and view your performance history.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {ongoingAttempts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Clock className="text-blue-400" /> Ongoing Tests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingAttempts.map(attempt => (
                  <div key={attempt._id} className="glass-panel p-6 flex flex-col border-blue-500/30 card-hover">
                    <div className="mb-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-4">
                        In Progress • {attempt.mode === 'practice' ? 'Practice' : 'Test'} Mode
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{attempt.testName}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Started: {new Date(attempt.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border">
                      <Link 
                        href={`/tests/${attempt.testId}/take?attemptId=${attempt._id}`}
                        className="w-full btn-primary text-center py-2 flex items-center justify-center gap-2"
                      >
                        <Play size={16} /> Resume Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analyticsData && analyticsData.overallStats && analyticsData.overallStats.totalTestsTaken > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="text-green-400" /> Global Performance Analytics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="glass-panel p-6 border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <BookOpen size={16} />
                    <span className="font-semibold text-xs uppercase tracking-wider">Unique Tests</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData.overallStats.totalTestsTaken}</div>
                </div>
                <div className="glass-panel p-6 border-violet-500/20">
                  <div className="flex items-center gap-2 text-violet-400 mb-2">
                    <Target size={16} />
                    <span className="font-semibold text-xs uppercase tracking-wider">Attempts</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData.overallStats.totalAttempts}</div>
                </div>
                <div className="glass-panel p-6 border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle size={16} />
                    <span className="font-semibold text-xs uppercase tracking-wider">Accuracy</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData.overallStats.globalAccuracy}%</div>
                </div>
                <div className="glass-panel p-6 border-yellow-500/20">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <TrendingUp size={16} />
                    <span className="font-semibold text-xs uppercase tracking-wider">Prac / Test</span>
                  </div>
                  <div className="text-xl font-bold text-foreground/80">
                    {analyticsData.tests.reduce((acc: number, t: any) => acc + t.practiceAttempts, 0)} <span className="text-muted-foreground font-normal text-sm">/</span> {analyticsData.tests.reduce((acc: number, t: any) => acc + t.testAttempts, 0)}
                  </div>
                </div>
                <div className="glass-panel p-6 border-orange-500/20">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Clock size={16} />
                    <span className="font-semibold text-xs uppercase tracking-wider">Time Spent</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.floor(analyticsData.overallStats.totalTimeSpent / 3600) > 0 
                      ? `${Math.floor(analyticsData.overallStats.totalTimeSpent / 3600)}h ${Math.floor((analyticsData.overallStats.totalTimeSpent % 3600) / 60)}m`
                      : `${Math.floor(analyticsData.overallStats.totalTimeSpent / 60)}m`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="text-blue-400" size={20} /> Test-Wise Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyticsData.tests.map((test: any) => (
                      <div key={test.testId} className="glass-panel p-5 flex flex-col card-hover">
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-foreground mb-2 line-clamp-1">{test.testName}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                            <div><span className="text-foreground font-bold">{test.totalAttempts}</span> Attempts</div>
                            <div><span className="text-foreground font-bold">{test.highestScore}%</span> Best</div>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-border">
                          <Link href={`/dashboard/test/${test.testId}`} className="w-full btn-secondary text-center py-2 flex items-center justify-center gap-2 text-sm">
                            View Detailed History
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="text-violet-400" size={20} /> Topic Consolidation
                  </h3>
                  <div className="glass-panel p-5 space-y-4">
                    {Object.entries(analyticsData.overallStats.globalTopics || {}).map(([topic, stats]: [string, any]) => {
                      const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                      return (
                        <div key={topic}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-foreground">{topic}</span>
                            <span className="text-muted-foreground">{acc}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${acc >= 80 ? 'bg-green-500' : acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${acc}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
