'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, Play, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestStartPage() {
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<string>('test');
  
  useEffect(() => {
    // robust way to get mode avoiding nextjs suspense issues
    const urlParams = new URLSearchParams(window.location.search);
    const m = urlParams.get('mode') || searchParams.get('mode') || 'test';
    setMode(m);
  }, [searchParams]);
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [chosenTimingMode, setChosenTimingMode] = useState<'full'|'per-question'>('full');
  const router = useRouter();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        const data = await res.json();
        if (res.ok) {
          setTest(data.test);
          if (data.test.settings?.timingMode && data.test.settings.timingMode !== 'both') {
            setChosenTimingMode(data.test.settings.timingMode);
          }
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load test details');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleStartTest = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, mode, timingMode: chosenTimingMode })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/tests/${testId}/take?attemptId=${data.attemptId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl font-bold">!</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Test</h2>
          <p className="text-muted-foreground mb-6">{error || 'Test not found'}</p>
          <Link href="/dashboard" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 flex justify-center items-center">
      <div className="glass-panel p-8 max-w-2xl w-full">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold mb-4 uppercase tracking-wider">
            {mode} Mode
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{test.testName}</h1>
          <p className="text-muted-foreground">
            {mode === 'practice' 
              ? 'In practice mode, you will receive immediate feedback after answering each question. Take your time and learn.'
              : 'In test mode, answers are hidden until submission and you must complete the test within the time limit.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
              <BookOpen size={16} /> Total Questions
            </div>
            <div className="text-2xl font-bold text-foreground">{test.totalQuestions}</div>
          </div>
          <div className="bg-muted rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
              <Clock size={16} /> Time Limit
            </div>
            <div className="text-2xl font-bold text-foreground">
              {Math.floor(test.totalTime / 60)} mins
            </div>
          </div>
        </div>

        {test.settings?.timingMode === 'both' && (
          <div className="bg-muted border border-border rounded-xl p-6 mb-8 text-sm">
            <h3 className="font-bold text-foreground text-base mb-3">Choose Timing Mode:</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input 
                  type="radio" 
                  name="timingMode" 
                  value="full" 
                  checked={chosenTimingMode === 'full'} 
                  onChange={() => setChosenTimingMode('full')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                Full Test Timer
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-foreground">
                <input 
                  type="radio" 
                  name="timingMode" 
                  value="per-question" 
                  checked={chosenTimingMode === 'per-question'} 
                  onChange={() => setChosenTimingMode('per-question')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                Per-Question Timer
              </label>
            </div>
          </div>
        )}
        {test.settings?.timingMode !== 'both' && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
              <Clock size={14} />
              {test.settings?.timingMode === 'per-question' ? 'Per-Question Timer' : 'Full Test Timer'}
            </div>
          </div>
        )}

        <div className="bg-muted border border-border rounded-xl p-6 mb-8 text-sm text-foreground/90 space-y-2">
          <h3 className="font-bold text-foreground text-base mb-3">Instructions:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ensure you have a stable internet connection.</li>
            <li>Do not refresh the page or close the browser during the test.</li>
            {mode === 'test' && (
              <>
                <li>The timer will start as soon as you click "Begin Test".</li>
                <li>The test will auto-submit when the time is up.</li>
              </>
            )}
            <li>You can review your answers before final submission.</li>
          </ul>
        </div>

        <button 
          onClick={handleStartTest}
          disabled={starting}
          className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
        >
          {starting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Play size={20} />
              {mode === 'practice' ? 'Begin Practice' : 'Start Test Now'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
