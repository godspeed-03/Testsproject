'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function TakeTestPage() {
  const { testId } = useParams();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [attemptData, setAttemptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Answers State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, 'seen'|'answered'|'review'>>({});
  const [feedback, setFeedback] = useState<Record<string, any>>({});
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

  // Load Test Data
  useEffect(() => {
    if (!attemptId) {
      router.push('/dashboard');
      return;
    }

    const fetchTestAndAttempt = async () => {
      try {
        const attemptRes = await fetch(`/api/attempts/${attemptId}`);
        const attemptData = await attemptRes.json();
        
        if (!attemptRes.ok) throw new Error(attemptData.error);
        
        setTest(attemptData.test);
        setAttemptData(attemptData.attempt);

        if (attemptData.attempt.status === 'completed') {
          router.push(`/analytics/${attemptId}`);
          return;
        }

        // Rehydrate answers from previous session
        if (attemptData.attempt.responses && attemptData.attempt.responses.length > 0) {
          const restoredAnswers: Record<string, any> = {};
          const restoredTimes: Record<string, number> = {};
          const restoredStatuses: Record<string, 'seen'|'answered'|'review'> = {};
          attemptData.attempt.responses.forEach((r: any) => {
            if (r.selectedAnswer !== undefined && r.selectedAnswer !== null) {
              restoredAnswers[r.questionId] = r.selectedAnswer;
            }
            restoredTimes[r.questionId] = r.timeTaken || 0;
            restoredStatuses[r.questionId] = r.status || 'seen';
          });
          setAnswers(restoredAnswers);
          setQuestionTimes(restoredTimes);
          setQuestionStatuses(restoredStatuses);

          // Rehydrate feedback for practice mode
          if (attemptData.attempt.mode === 'practice') {
            const restoredFeedback: Record<string, any> = {};
            attemptData.test.testJSON.sections.forEach((sec: any) => {
              sec.questions.forEach((q: any) => {
                if (q.explanation || q.correctAnswer !== undefined || q.correctMatches !== undefined) {
                  const response = attemptData.attempt.responses.find((r: any) => r.questionId === q.questionId);
                  restoredFeedback[q.questionId] = {
                    isCorrect: response?.isCorrect,
                    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correctMatches,
                    explanation: q.explanation
                  };
                }
              });
            });
            setFeedback(restoredFeedback);
          }

          // Jump to the furthest unanswered question
          let found = false;
          for (let sIdx = 0; sIdx < attemptData.test.testJSON.sections.length; sIdx++) {
            const sec = attemptData.test.testJSON.sections[sIdx];
            for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
              const qId = sec.questions[qIdx].questionId;
              if (restoredStatuses[qId] !== 'answered') {
                setCurrentSectionIndex(sIdx);
                setCurrentQuestionIndex(qIdx);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        // Restore timer
        if (attemptData.attempt.timeLeft !== undefined) {
          setTimeLeft(attemptData.attempt.timeLeft);
        } else {
          setTimeLeft(attemptData.test.totalTime);
        }

      } catch (error) {
        console.error(error);
        alert('Failed to load test');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchTestAndAttempt();
  }, [testId, attemptId, router]);

  const handleSubmitTest = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit-test`, {
        method: 'POST'
      });
      if (res.ok) {
        router.push(`/analytics/${attemptId}`);
      } else {
        alert('Failed to submit test');
        setSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  }, [attemptId, submitting, router]);

  // Timer Logic
  useEffect(() => {
    if (loading || submitting || !test || timeLeft <= 0) return;
    
    // In practice mode we might not care about global timer as much, but we let it run
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
      setCurrentSessionSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, test, timeLeft, handleSubmitTest]);

  // Prevent Leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAnswerSelect = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const questionStartTimeRef = useRef<number>(0);

  // Reset question timer when question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setCurrentSessionSeconds(0);
  }, [currentQuestionIndex, currentSectionIndex]);

  const syncQuestionData = (qId: string, additionalTime: number, forceStatus?: 'seen'|'answered'|'review') => {
    setQuestionTimes(prev => {
      const newTotalTime = (prev[qId] || 0) + additionalTime;
      
      setQuestionStatuses(prevStatus => {
        let newStatus = forceStatus || prevStatus[qId] || 'seen';
        if (!forceStatus && answers[qId] !== undefined && newStatus !== 'review') {
          // In test mode, selecting an option implies it's answered when navigating away.
          // In practice mode, they must explicitly click "Save Answer" (which sends forceStatus).
          if (!isPracticeMode) {
            newStatus = 'answered';
          }
        }
        
        // Background sync
        fetch(`/api/attempts/${attemptId}/sync-progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: qId,
            selectedAnswer: answers[qId],
            timeTaken: newTotalTime,
            status: newStatus,
            timeLeft: timeLeft
          })
        }).then(res => res.json()).then(data => {
          if (data.explanation !== undefined) {
            setFeedback(prevF => ({ ...prevF, [qId]: data }));
          }
        }).catch(console.error);

        return { ...prevStatus, [qId]: newStatus };
      });
      
      return { ...prev, [qId]: newTotalTime };
    });
  };

  const handleNavigate = (nextSIdx: number, nextQIdx: number) => {
    // Hard block practice mode forward navigation without saving
    if (isPracticeMode && !canGoNext) {
      const isFuture = nextSIdx > currentSectionIndex || (nextSIdx === currentSectionIndex && nextQIdx > currentQuestionIndex);
      if (isFuture) return;
    }
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const currentQId = test.testJSON.sections[currentSectionIndex].questions[currentQuestionIndex].questionId;
    
    syncQuestionData(currentQId, timeSpent);
    
    setCurrentSectionIndex(nextSIdx);
    setCurrentQuestionIndex(nextQIdx);
  };
  
  const handleSaveAnswer = (questionId: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now(); // reset so we don't double count if they stay on page
    syncQuestionData(questionId, timeSpent, 'answered');
  };
  
  const handleReviewToggle = (questionId: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();
    const currentStatus = questionStatuses[questionId];
    const newStatus = currentStatus === 'review' ? (answers[questionId] ? 'answered' : 'seen') : 'review';
    syncQuestionData(questionId, timeSpent, newStatus);
  };

  const isPracticeMode = attemptData?.mode === 'practice';
  const isPerQuestionMode = attemptData?.timingMode === 'per-question';
  const timePerQuestion = test ? Math.floor(test.totalTime / test.totalQuestions) : 0;
  
  const currentSection = test?.testJSON?.sections?.[currentSectionIndex];
  const currentQuestion = currentSection?.questions?.[currentQuestionIndex];
  
  const qFeedback = currentQuestion ? feedback[currentQuestion.questionId] : undefined;
  const canGoNext = !isPracticeMode || !!qFeedback || (currentQuestion && questionStatuses[currentQuestion.questionId] === 'answered');

  const previouslySpent = currentQuestion ? (questionTimes[currentQuestion.questionId] || 0) : 0;
  const displayTimeLeft = isPerQuestionMode 
    ? Math.max(0, timePerQuestion - previouslySpent - currentSessionSeconds)
    : timeLeft;

  // Auto-navigate if per-question timer exhausts
  useEffect(() => {
    if (isPerQuestionMode && displayTimeLeft === 0 && !loading && !submitting && test && currentSection && currentQuestion) {
      if (isPracticeMode && !canGoNext) {
         // Force evaluation instead of skipping
         handleSaveAnswer(currentQuestion.questionId);
      } else {
        if (currentSectionIndex === test.testJSON.sections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1) {
          handleSubmitTest();
        } else {
          if (currentQuestionIndex < currentSection.questions.length - 1) {
            handleNavigate(currentSectionIndex, currentQuestionIndex + 1);
          } else {
            handleNavigate(currentSectionIndex + 1, 0);
          }
        }
      }
    }
  }, [displayTimeLeft, isPerQuestionMode, isPracticeMode, canGoNext, currentSectionIndex, currentQuestionIndex, loading, submitting, test, currentSection, currentQuestion, handleNavigate, handleSubmitTest]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center">Loading...</div>;
  }

  if (!test || !currentSection || !currentQuestion) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen bg-card overflow-hidden">
      {/* Header */}
      <header className="bg-muted border-b border-border p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold truncate max-w-md">{test.testName}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isPracticeMode ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`}>
            {isPracticeMode ? 'Practice Mode' : 'Test Mode'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono text-xl ${displayTimeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-foreground/90'}`}>
            <Clock size={20} />
            {formatTime(displayTimeLeft)}
          </div>
          <button onClick={handleSubmitTest} disabled={submitting || !canGoNext} className="btn-primary py-1.5 px-4 text-sm">
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center gap-4">
              <button 
                disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    handleNavigate(currentSectionIndex, currentQuestionIndex - 1);
                  } else if (currentSectionIndex > 0) {
                    handleNavigate(currentSectionIndex - 1, test.testJSON.sections[currentSectionIndex - 1].questions.length - 1);
                  }
                }}
                className="btn-secondary flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="flex-1 min-w-xl flex justify-between items-end mx-2">
                <div>
                  <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">{currentSection.sectionName}</p>
                  <h2 className="text-2xl font-bold">Question {currentQuestionIndex + 1} of {currentSection.questions.length}</h2>
                </div>
                <div className="text-muted-foreground text-sm mb-1">Topic: {currentQuestion.topic || 'General'}</div>
              </div>

              <button 
                disabled={currentSectionIndex === test.testJSON.sections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1 || !canGoNext}
                onClick={() => {
                  if (currentQuestionIndex < currentSection.questions.length - 1) {
                    handleNavigate(currentSectionIndex, currentQuestionIndex + 1);
                  } else if (currentSectionIndex < test.testJSON.sections.length - 1) {
                    handleNavigate(currentSectionIndex + 1, 0);
                  }
                }}
                className="btn-primary flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            <div className="glass-panel p-8 mb-6 text-lg">
              <p className="mb-8">{currentQuestion.question}</p>

              {/* MCQ Single Option */}
              {currentQuestion.type === 'mcq-single' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt: string, idx: number) => (
                    <label key={idx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                      ${answers[currentQuestion.questionId] === idx 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-medium' 
                        : 'bg-card border-border hover:bg-muted text-foreground/90'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={currentQuestion.questionId} 
                        className="hidden"
                        checked={answers[currentQuestion.questionId] === idx}
                        onChange={() => handleAnswerSelect(currentQuestion.questionId, idx)}
                      />
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                        ${answers[currentQuestion.questionId] === idx ? 'border-blue-500' : 'border-border'}
                      `}>
                        {answers[currentQuestion.questionId] === idx && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* MCQ Multiple Option */}
              {currentQuestion.type === 'mcq-multiple' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt: string, idx: number) => {
                    const isSelected = Array.isArray(answers[currentQuestion.questionId]) && answers[currentQuestion.questionId].includes(idx);
                    return (
                      <label key={idx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                        ${isSelected 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-medium' 
                          : 'bg-card border-border hover:bg-muted text-foreground/90'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={isSelected}
                          onChange={(e) => {
                            const prev = Array.isArray(answers[currentQuestion.questionId]) ? answers[currentQuestion.questionId] : [];
                            if (e.target.checked) {
                              handleAnswerSelect(currentQuestion.questionId, [...prev, idx]);
                            } else {
                              handleAnswerSelect(currentQuestion.questionId, prev.filter((i: number) => i !== idx));
                            }
                          }}
                        />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0
                          ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-border'}
                        `}>
                          {isSelected && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Matching Option */}
              {currentQuestion.type === 'matching' && (
                <div className="space-y-4">
                  {currentQuestion.pairs.map((pair: any, idx: number) => {
                    const rightOptions = [...currentQuestion.pairs].map(p => p.right).sort();
                    const currentValue = answers[currentQuestion.questionId]?.[pair.left] || '';
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-card border-border">
                        <div className="flex-1 font-medium">{pair.left}</div>
                        <select 
                          className="flex-1 p-2 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={currentValue}
                          onChange={(e) => {
                            const prev = answers[currentQuestion.questionId] || {};
                            handleAnswerSelect(currentQuestion.questionId, { ...prev, [pair.left]: e.target.value });
                          }}
                        >
                          <option value="" disabled>Select match...</option>
                          {rightOptions.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False Option */}
              {currentQuestion.type === 'true-false' && (
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => handleAnswerSelect(currentQuestion.questionId, val)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        answers[currentQuestion.questionId] === val
                          ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                          : 'bg-muted border-border hover:bg-muted text-foreground/90'
                      }`}
                    >
                      {val ? 'True' : 'False'}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions for current question */}
              <div className="mt-8 flex justify-between items-center">
                {!isPracticeMode ? (
                  <button 
                    onClick={() => handleReviewToggle(currentQuestion.questionId)}
                    className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${questionStatuses[currentQuestion.questionId] === 'review' ? 'text-violet-600 bg-violet-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <AlertCircle size={16} />
                    {questionStatuses[currentQuestion.questionId] === 'review' ? 'Marked for Review' : 'Mark for Review'}
                  </button>
                ) : (
                  <div /> // Placeholder to keep flex-between alignment
                )}
                {isPracticeMode && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleSaveAnswer(currentQuestion.questionId)}
                      className="btn-secondary text-sm"
                    >
                      Save Answer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Panel (Practice Mode) */}
            {qFeedback && (
              <div className={`p-6 rounded-xl border mb-6 animate-fade-in ${qFeedback.isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                <div className="flex items-start gap-3">
                  {qFeedback.isCorrect ? <CheckCircle className="text-green-400 shrink-0 mt-0.5" /> : <AlertCircle className="text-red-400 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className={`font-bold mb-2 ${qFeedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {qFeedback.isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    {!qFeedback.isCorrect && (
                      <div className="text-foreground/90 mb-2">
                        Correct answer: <span className="font-semibold text-foreground">
                          {(() => {
                            if (currentQuestion.type === 'mcq-single' || currentQuestion.type === 'mcq-multiple') {
                              const indices = Array.isArray(qFeedback.correctAnswer) ? qFeedback.correctAnswer : [qFeedback.correctAnswer];
                              return indices.map((idx: number) => currentQuestion.options[idx]).join(', ');
                            }
                            if (typeof qFeedback.correctAnswer === 'object') {
                              return JSON.stringify(qFeedback.correctAnswer).replace(/[{}"]/g, '').replace(/:/g, ' → ');
                            }
                            return String(qFeedback.correctAnswer);
                          })()}
                        </span>
                      </div>
                    )}
                    {qFeedback.explanation && (
                      <div className="bg-card p-3 rounded-lg text-sm text-foreground/90 border border-border mt-3">
                        <span className="font-semibold text-muted-foreground block mb-1">Explanation:</span>
                        {qFeedback.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-64 bg-muted border-l border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border font-semibold text-foreground/90">
            Question Navigator
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {test.testJSON.sections.map((section: any, sIdx: number) => (
              <div key={section.sectionId} className="mb-6 last:mb-0">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{section.sectionName}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {section.questions.map((q: any, qIdx: number) => {
                    const isCurrent = currentSectionIndex === sIdx && currentQuestionIndex === qIdx;
                    const isFuture = sIdx > currentSectionIndex || (sIdx === currentSectionIndex && qIdx > currentQuestionIndex);
                    const isDisabled = (test.settings?.strictSectionOrder && sIdx !== currentSectionIndex) || (isPracticeMode && !canGoNext && isFuture);
                    
                    return (
                      <button
                        key={q.questionId}
                        onClick={() => {
                          if (isDisabled) return;
                          handleNavigate(sIdx, qIdx);
                        }}
                        disabled={isDisabled}
                        className={`
                          w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-all
                          ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-card bg-blue-600 text-white shadow-md shadow-blue-500/20' : ''}
                          ${(() => {
                            if (isCurrent) return '';
                            const qStatus = questionStatuses[q.questionId];
                            const hasAnswer = answers[q.questionId] !== undefined;
                            
                            if (isPracticeMode) {
                              const qFeed = feedback[q.questionId];
                              if (qFeed) {
                                return qFeed.isCorrect 
                                  ? 'bg-green-500/20 text-green-600 border border-green-500/50' 
                                  : 'bg-red-500/20 text-red-600 border border-red-500/50';
                              }
                              return 'bg-card border border-border text-foreground hover:bg-muted';
                            } else {
                              if (qStatus === 'review') return 'bg-violet-500/20 text-violet-600 border border-violet-500/50';
                              if (qStatus === 'answered' || hasAnswer) return 'bg-green-500/20 text-green-600 border border-green-500/50';
                              if (qStatus === 'seen') return 'bg-red-500/10 text-red-500 border border-red-500/30';
                              return 'bg-card border border-border text-foreground hover:bg-muted';
                            }
                          })()}
                          ${isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-muted' : 'cursor-pointer'}
                        `}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
