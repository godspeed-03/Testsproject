'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, X, Loader2, Plus, Calendar, Clock, Target, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Tag, Lightbulb, BookOpen } from 'lucide-react';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (testData: any) => Promise<void>;
  isLight?: boolean;
  cardBg?: string;
  inputBg?: string;
  textTitle?: string;
  textMuted?: string;
}

export default function AddTestModal({
  isOpen,
  onClose,
  onAddTest,
  isLight,
  cardBg = 'bg-white dark:bg-slate-900',
  inputBg = 'bg-slate-50 dark:bg-slate-950',
  textTitle = 'text-slate-900 dark:text-slate-100',
  textMuted = 'text-slate-700 dark:text-slate-300',
}: AddTestModalProps) {
  const [mounted, setMounted] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const [testName, setTestName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [testDate, setTestDate] = useState(todayStr);
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('200');
  const [benchmarkCutoff, setBenchmarkCutoff] = useState('95');
  const [durationMins, setDurationMins] = useState('120');

  // Question & Error Analysis Breakdown
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [correctCount, setCorrectCount] = useState('');
  const [incorrectCount, setIncorrectCount] = useState('');
  const [unattemptedCount, setUnattemptedCount] = useState('');
  const [concept, setConcept] = useState('0');
  const [silly, setSilly] = useState('0');
  const [timeP, setTimeP] = useState('0');

  // Insights & Tags
  const [weakAreas, setWeakAreas] = useState('');
  const [takeaway, setTakeaway] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Real-time Calculations
  const numScore = parseFloat(score) || 0;
  const numMax = parseFloat(maxScore) || 200;
  const numCutoff = parseFloat(benchmarkCutoff) || 95;
  const percent = numMax > 0 ? Math.round((numScore / numMax) * 100) : 0;

  const numCorrect = parseInt(correctCount) || 0;
  const numIncorrect = parseInt(incorrectCount) || 0;
  const attempted = numCorrect + numIncorrect;
  const accuracyPct = attempted > 0 ? Math.round((numCorrect / attempted) * 100) : 0;
  const isTargetCleared = numScore >= numCutoff;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !score) return;
    setLoading(true);

    try {
      await onAddTest({
        testName: testName.trim(),
        code: testName.trim(),
        type: 'PRELIMS',
        category: 'GS1',
        subject: subjectName.trim() || 'General Studies',
        date: testDate || todayStr,
        score: numScore,
        maxScore: numMax,
        percent,
        benchmarkCutoff: numCutoff,
        durationMins: parseInt(durationMins) || 120,
        accuracy: accuracyPct > 0 ? `${accuracyPct}%` : `${percent}%`,
        correctCount: numCorrect,
        incorrectCount: numIncorrect,
        unattemptedCount: parseInt(unattemptedCount) || 0,
        concept: parseFloat(concept) || 0,
        silly: parseFloat(silly) || 0,
        timeP: parseFloat(timeP) || 0,
        weakAreas: weakAreas.trim() ? weakAreas.split(',').map((s) => s.trim()) : [],
        takeaway: takeaway.trim()
      });

      // Reset form
      setTestName('');
      setSubjectName('');
      setScore('');
      setWeakAreas('');
      setTakeaway('');
      setShowBreakdown(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 py-6 text-center animate-fade-in flex items-center justify-center">
      <div className="inline-block w-full max-w-xl text-left align-middle transition-all transform bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto glass-panel">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-inner">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-black font-display text-base sm:text-xl text-slate-900 dark:text-slate-100">
                Log Mock Test Score
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Record marks, benchmark clearance & error analysis</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Live Score Preview Banner */}
          {score !== '' && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-black shadow-sm ${
              isTargetCleared 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                {isTargetCleared ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-amber-500" />}
                <span>
                  {numScore} / {numMax} Marks ({percent}%)
                  {benchmarkCutoff && ` • Cut-off Target: ${numCutoff}`}
                </span>
              </div>

              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                isTargetCleared 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'bg-amber-500 text-slate-950 shadow-xs'
              }`}>
                {isTargetCleared ? 'TARGET CLEARED' : 'BELOW TARGET'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-bold">
            {/* Test Name & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300">Test Series / Mock Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vision IAS Abhyaas Test 1"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar size={13} className="text-accent-primary" /> Test Date
                </label>
                <ShadcnDatePicker
                  selectedDate={testDate}
                  onSelectDate={(d) => setTestDate(d || todayStr)}
                  alignRight={true}
                />
              </div>
            </div>

            {/* Free-text Subject / Topic Combination */}
            <div>
              <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <BookOpen size={13} className="text-accent-primary" /> Subject(s) / Covered Topics
              </label>
              <input
                type="text"
                placeholder="e.g. Polity + Modern History, Full Length GS1, CSAT Quant"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-inner"
              />
            </div>

            {/* Scores, Benchmark, Duration */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300">Score *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 108.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-3 py-2.5 outline-none font-bold text-xs border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300">Total Marks *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-3 py-2.5 outline-none font-bold text-xs border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Target size={13} className="text-accent-primary" /> Cut-off Target
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 95"
                  value={benchmarkCutoff}
                  onChange={(e) => setBenchmarkCutoff(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-3 py-2.5 outline-none font-bold text-xs border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock size={13} className="text-accent-primary" /> Mins
                </label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-3 py-2.5 outline-none font-bold text-xs border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
              </div>
            </div>

            {/* Toggleable Question & Mistake Breakdown */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  🎯 Detailed Question & Error Analysis (Optional)
                  {attempted > 0 && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-black">
                      Accuracy: {accuracyPct}%
                    </span>
                  )}
                </span>
                {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showBreakdown && (
                <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block mb-1 font-black text-[11px] text-emerald-600 dark:text-emerald-400">
                        ✓ Correct Qs
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 58"
                        value={correctCount}
                        onChange={(e) => setCorrectCount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-black text-[11px] text-rose-600 dark:text-rose-400">
                        ✗ Incorrect Qs
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 18"
                        value={incorrectCount}
                        onChange={(e) => setIncorrectCount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-black text-[11px] text-slate-600 dark:text-slate-400">
                        - Unattempted
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={unattemptedCount}
                        onChange={(e) => setUnattemptedCount(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-slate-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="block mb-1 font-black text-[11px] text-slate-700 dark:text-slate-300">
                      Mistake Category Breakdown (%)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">Conceptual Errors %</span>
                        <input
                          type="number"
                          placeholder="e.g. 40"
                          value={concept}
                          onChange={(e) => setConcept(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 outline-none font-bold border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">Silly Mistakes %</span>
                        <input
                          type="number"
                          placeholder="e.g. 35"
                          value={silly}
                          onChange={(e) => setSilly(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 outline-none font-bold border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-sky-600 dark:text-sky-400">Time Pressure %</span>
                        <input
                          type="number"
                          placeholder="e.g. 25"
                          value={timeP}
                          onChange={(e) => setTimeP(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 outline-none font-bold border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weak Areas / Focus Tags */}
            <div>
              <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Tag size={13} className="text-accent-primary" /> Weak Areas / Focus Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Art & Culture PYQs, Real Analysis Calculation Speed"
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-accent-primary transition-all shadow-inner"
              />
            </div>

            {/* Key Takeaways & Notes */}
            <div>
              <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Lightbulb size={13} className="text-accent-primary" /> Key Takeaways & Action Plan
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need to revise Constitutional Bodies articles; improve speed in CSAT Quant questions."
                value={takeaway}
                onChange={(e) => setTakeaway(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-accent-primary transition-all shadow-inner resize-none"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-xs cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-accent-gradient text-white disabled:opacity-50 rounded-xl font-black shadow-lg transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Logging Test Score...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Save Test Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
