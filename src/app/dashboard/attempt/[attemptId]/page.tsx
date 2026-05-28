'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Target, Clock, CheckCircle2, XCircle, MinusCircle, Award } from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AnalyticsPage() {
  const { attemptId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}/analytics`);
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          throw new Error(json.error);
        }
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [attemptId]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>;
  }

  if (!data) {
    return (
      <div className="flex-1 p-10 flex justify-center items-center">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-foreground mb-2">Analytics Not Found</h2>
          <Link href="/dashboard" className="btn-primary mt-4 inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { analytics, testName } = data;
  const {
    score, totalQuestions, accuracy, correctCount, incorrectCount, unansweredCount,
    totalTimeTaken, avgTimePerQuestion, questionAnalysis, topicPerformance
  } = analytics;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  // ApexCharts Configuration
  const pieOptions = {
    chart: { type: 'pie', background: 'transparent' },
    labels: ['Correct', 'Incorrect', 'Unanswered'],
    colors: ['#10b981', '#ef4444', '#94a3b8'],
    theme: { mode: 'light' },
    stroke: { show: false },
    legend: { position: 'bottom', labels: { colors: '#334155' } },
    dataLabels: { enabled: true, style: { fontSize: '14px' } }
  };
  const pieSeries = [correctCount, incorrectCount, unansweredCount];

  const topics = Object.keys(topicPerformance);
  const topicAccuracies = topics.map(key => Number(((topicPerformance[key].correct / topicPerformance[key].total) * 100).toFixed(1)));

  const barOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    theme: { mode: 'light' },
    plotOptions: {
      bar: { borderRadius: 4, horizontal: true, distributed: true }
    },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    dataLabels: { enabled: true, formatter: (val: number) => val + '%' },
    xaxis: { categories: topics, max: 100, labels: { style: { colors: '#475569' } } },
    yaxis: { labels: { style: { colors: '#334155', fontSize: '14px' } } },
    legend: { show: false },
    grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
  };
  const barSeries = [{ name: 'Accuracy', data: topicAccuracies }];

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-1">Performance Report</h1>
          <p className="text-muted-foreground">Test: <span className="font-semibold text-foreground/90">{testName}</span></p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary hidden sm:block">
          Download PDF
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Award size={32} className="text-yellow-400 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">Total Score</p>
          <p className="text-3xl font-bold text-foreground">{score} <span className="text-lg text-muted-foreground">/ {totalQuestions}</span></p>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Target size={32} className="text-green-400 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">Accuracy</p>
          <p className="text-3xl font-bold text-foreground">{accuracy.toFixed(1)}%</p>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
          <Clock size={32} className="text-blue-400 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">Total Time</p>
          <p className="text-3xl font-bold text-foreground">{formatTime(totalTimeTaken)}</p>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
          <Clock size={32} className="text-violet-400 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">Avg Time / Q</p>
          <p className="text-3xl font-bold text-foreground">{avgTimePerQuestion.toFixed(1)}s</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Overview Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-foreground mb-2">Response Overview</h3>
          <div className="h-72">
            <Chart 
              options={pieOptions as any} 
              series={pieSeries} 
              type="pie" 
              height="100%" 
            />
          </div>
        </div>

        {/* Topic Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-foreground mb-2">Topic Accuracy (%)</h3>
          <div className="h-72">
             <Chart 
              options={barOptions as any} 
              series={barSeries} 
              type="bar" 
              height="100%" 
            />
          </div>
        </div>
      </div>

      {/* Full Analysis Summary */}
      <div className="glass-panel p-6 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Performance Analysis</h3>
        <p className="text-foreground/90 leading-relaxed">
          You scored <strong className="text-foreground">{score}</strong> out of <strong className="text-foreground">{totalQuestions}</strong>, giving you an accuracy of <strong className="text-blue-400">{accuracy.toFixed(1)}%</strong>. 
          You spent an average of <strong className="text-foreground">{avgTimePerQuestion.toFixed(1)}s</strong> per question.
          {accuracy >= 80 ? ' Excellent work! You have a strong grasp of the material.' :
           accuracy >= 50 ? ' Good effort! Focus on reviewing your incorrect answers to improve.' :
           ' Keep practicing! Review the explanations for questions you missed to strengthen your foundations.'}
        </p>
        {topics.length > 0 && (
          <p className="text-foreground/90 mt-2">
            Your strongest topic was <strong className="text-green-400">{topics[topicAccuracies.indexOf(Math.max(...topicAccuracies))]}</strong>.
          </p>
        )}
      </div>

      {/* Question Analysis Table */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">Detailed Question Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Q. No</th>
                <th className="pb-3 font-medium">Topic</th>
                <th className="pb-3 font-medium">Difficulty</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Time Taken</th>
                <th className="pb-3 font-medium">Review</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {questionAnalysis.map((q: any, idx: number) => (
                <tr key={idx} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-4 font-medium text-foreground">Q{idx + 1}</td>
                  <td className="py-4 text-foreground/90">{q.topic}</td>
                  <td className="py-4 text-muted-foreground capitalize">{q.difficulty}</td>
                  <td className="py-4">
                    {q.status === 'correct' ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={12} /> Correct</span> :
                     q.status === 'incorrect' ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold"><XCircle size={12} /> Incorrect</span> :
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card0/10 text-muted-foreground text-xs font-semibold"><MinusCircle size={12} /> Unanswered</span>}
                  </td>
                  <td className="py-4 text-muted-foreground">{q.timeTaken}s</td>
                  <td className="py-4">
                    {q.explanation && (
                      <button 
                        onClick={() => alert(q.explanation)} 
                        className="text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2"
                      >
                        View Explanation
                      </button>
                    )}
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
