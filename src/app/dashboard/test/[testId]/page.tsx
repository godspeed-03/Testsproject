'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Target, Calendar, CheckCircle, Brain } from 'lucide-react';
import Link from 'next/link';

export default function TestAnalyticsPage() {
  const { testId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTestAnalytics = async () => {
      try {
        const res = await fetch(`/api/analytics/test/${testId}`);
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch test analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    if (testId) fetchTestAnalytics();
  }, [testId, router]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.attempts || data.attempts.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">No History Found</h2>
          <p className="text-muted-foreground mb-6">You haven't completed any attempts for this test yet.</p>
          <Link href="/analytics" className="btn-primary py-2 px-6">Back to Global Analytics</Link>
        </div>
      </div>
    );
  }

  const { testName, attempts, testAccuracy, testTopics } = data;

  const practiceAttempts = attempts.filter((a: any) => a.mode === 'practice');
  const testAttempts = attempts.filter((a: any) => a.mode === 'test');

  const getBestScore = (attemptList: any[]) => {
    if (attemptList.length === 0) return 0;
    return Math.max(...attemptList.map(a => a.score || 0));
  };

  const getAverageScore = (attemptList: any[]) => {
    if (attemptList.length === 0) return 0;
    const total = attemptList.reduce((acc, a) => acc + (a.score || 0), 0);
    return Math.round(total / attemptList.length);
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <Link href="/analytics" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Global Analytics
      </Link>
      
      <div className="mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-4 uppercase tracking-wider">
          Test History
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{testName}</h1>
        <p className="text-muted-foreground">Detailed historical performance for all your attempts on this specific test.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Practice Stats */}
        <div className="glass-panel p-6 border-green-500/20">
          <h3 className="text-lg font-bold text-green-400 mb-6 flex items-center gap-2">
            <BookOpen size={20} /> Practice Mode Stats
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{practiceAttempts.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Attempts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getBestScore(practiceAttempts)}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Best Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getAverageScore(practiceAttempts)}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Test Stats */}
        <div className="glass-panel p-6 border-blue-500/20">
          <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
            <Target size={20} /> Test Mode Stats
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{testAttempts.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Attempts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getBestScore(testAttempts)}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Best Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getAverageScore(testAttempts)}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-panel p-6 border-green-500/20">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle size={20} /> Overall Test Accuracy
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="text-muted stroke-current" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" className={`${testAccuracy >= 80 ? 'text-green-500' : testAccuracy >= 50 ? 'text-yellow-500' : 'text-red-500'} stroke-current`} strokeWidth="8" fill="none" strokeDasharray={`${testAccuracy * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-foreground">{testAccuracy}%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Your average accuracy across all recorded attempts for this test.</p>
          </div>
        </div>

        <div className="glass-panel p-6 border-violet-500/20">
          <h3 className="text-lg font-bold text-violet-400 mb-4 flex items-center gap-2">
            <Brain size={20} /> Topic Consolidation
          </h3>
          <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
            {Object.entries(testTopics || {}).map(([topic, stats]: [string, any]) => {
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

      <h2 className="text-xl font-bold text-foreground mb-6">Attempt History</h2>
      
      <div className="glass-panel overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Date & Time</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Timing</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attempts.map((attempt: any) => (
                <tr key={attempt._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-muted-foreground" />
                    {new Date(attempt.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      attempt.mode === 'practice' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {attempt.mode === 'practice' ? 'Practice' : 'Test'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {attempt.timingMode === 'per-question' ? 'Per-Question' : 'Full Test'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                    {attempt.score !== undefined ? `${attempt.score}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/analytics/${attempt._id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
