'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, BookOpen, Clock } from 'lucide-react';

export default function UserDashboard() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests/available');
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Failed to fetch tests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Available Tests</h1>
        <p className="text-muted-foreground">Discover and start new assessments.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Available Tests</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-panel p-10 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4" size={48} />
          <h3 className="text-xl font-medium text-foreground mb-2">No tests available</h3>
          <p className="text-muted-foreground">Check back later for new tests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <div key={test._id} className="glass-panel p-6 flex flex-col h-full card-hover">
              <div className="mb-4 flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-4">
                  Assessment
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{test.testName}</h3>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>{test.totalQuestions} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{Math.floor(test.totalTime / 60)} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-muted border border-border text-xs rounded-md text-foreground">
                      {test.settings?.timingMode === 'per-question' 
                        ? 'Per-Question Timer' 
                        : test.settings?.timingMode === 'both' 
                          ? 'Flexible Timer (Choose)' 
                          : 'Full Test Timer'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex gap-3 mt-auto">
                {(!test.settings || test.settings.allowPracticeMode !== false) && (
                  <Link 
                    href={`/tests/${test.testId}?mode=practice`}
                    className="flex-1 btn-secondary text-center text-sm py-2"
                  >
                    Practice Mode
                  </Link>
                )}
                {(!test.settings || test.settings.allowTestMode !== false) && (
                  <Link 
                    href={`/tests/${test.testId}?mode=test`}
                    className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center gap-1"
                  >
                    <Play size={14} /> Start Test
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
