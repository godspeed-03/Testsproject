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
  inputBg = 'bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900',
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
    <div className={`fixed inset-0 z-[999999] overflow-y-auto ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/85'} backdrop-blur-md px-3 sm:px-4 py-6 text-center animate-fade-in`}>
      <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

      <div className={`inline-block w-full max-w-xl text-left align-middle transition-all transform ${cardBg} rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto`}>
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                Log Mock Test Score
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record marks, benchmark clearance & error analysis</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Live Score Preview Banner */}
          {score !== '' && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
              isTargetCleared 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                {isTargetCleared ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500" />}
                <span>
                  {numScore} / {numMax} Marks ({percent}%)
                  {benchmarkCutoff && ` • Target Cut-off: ${numCutoff}`}
                </span>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                isTargetCleared 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-amber-500 text-slate-950 shadow-xs'
              }`}>
                {isTargetCleared ? 'TARGET CLEARED' : 'BELOW TARGET'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Test Name & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">Test Series / Mock Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vision IAS Abhyaas Test 1"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Calendar size={13} className="text-purple-600 dark:text-purple-400" /> Test Date
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
              <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <BookOpen size={13} className="text-purple-600 dark:text-purple-400" /> Subject(s) / Covered Topics
              </label>
              <input
                type="text"
                placeholder="e.g. Polity + Modern History, Full Length GS1, CSAT Quant"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
              />
            </div>

            {/* Scores, Benchmark, Duration */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">Score Obtained *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 108.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3 py-2 outline-none font-bold text-xs border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">Total Marks *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3 py-2 outline-none font-bold text-xs border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Target size={13} className="text-purple-600 dark:text-purple-400" /> Cut-off Target
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 95"
                  value={benchmarkCutoff}
                  onChange={(e) => setBenchmarkCutoff(e.target.value)}
                  className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3 py-2 outline-none font-bold text-xs border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Clock size={13} className="text-purple-600 dark:text-purple-400" /> Duration (Mins)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3 py-2 outline-none font-bold text-xs border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>
            </div>

            {/* Toggleable Question & Mistake Breakdown */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  🎯 Detailed Question & Error Analysis (Optional)
                  {attempted > 0 && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold">
                      Accuracy: {accuracyPct}%
                    </span>
                  )}
                </span>
                {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showBreakdown && (
                <div className="p-3.5 space-y-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block mb-1 font-bold text-[11px] text-emerald-700 dark:text-emerald-400">
                        ✓ Correct Qs
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 58"
                        value={correctCount}
                        onChange={(e) => setCorrectCount(e.target.value)}
                        className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none font-bold border border-slate-300 dark:border-slate-800 focus:border-emerald-500`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-[11px] text-rose-700 dark:text-rose-400">
                        ✗ Incorrect Qs
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 18"
                        value={incorrectCount}
                        onChange={(e) => setIncorrectCount(e.target.value)}
                        className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none font-bold border border-slate-300 dark:border-slate-800 focus:border-rose-500`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        - Unattempted Qs
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={unattemptedCount}
                        onChange={(e) => setUnattemptedCount(e.target.value)}
                        className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none font-bold border border-slate-300 dark:border-slate-800 focus:border-slate-500`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="block mb-1 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      Mistake Category Breakdown (%)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Conceptual Errors %</span>
                        <input
                          type="number"
                          placeholder="e.g. 40"
                          value={concept}
                          onChange={(e) => setConcept(e.target.value)}
                          className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 outline-none font-bold border border-slate-300 dark:border-slate-800`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Silly Mistakes %</span>
                        <input
                          type="number"
                          placeholder="e.g. 35"
                          value={silly}
                          onChange={(e) => setSilly(e.target.value)}
                          className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 outline-none font-bold border border-slate-300 dark:border-slate-800`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400">Time Pressure %</span>
                        <input
                          type="number"
                          placeholder="e.g. 25"
                          value={timeP}
                          onChange={(e) => setTimeP(e.target.value)}
                          className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 rounded-xl px-2.5 py-1.5 outline-none font-bold border border-slate-300 dark:border-slate-800`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Weak Areas / Focus Tags */}
            <div>
              <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Tag size={13} className="text-purple-600 dark:text-purple-400" /> Weak Areas / Focus Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Art & Culture PYQs, Real Analysis Calculation Speed"
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
              />
            </div>

            {/* Key Takeaways & Notes */}
            <div>
              <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Lightbulb size={13} className="text-purple-600 dark:text-purple-400" /> Key Takeaways & Action Plan
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need to revise Constitutional Bodies articles; improve speed in CSAT Quant Ratio questions."
                value={takeaway}
                onChange={(e) => setTakeaway(e.target.value)}
                className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all`}
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
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
