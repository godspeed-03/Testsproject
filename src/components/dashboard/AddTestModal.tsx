'use client';

import { useState } from 'react';
import { Award, X, Loader2, Plus } from 'lucide-react';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (testData: any) => Promise<void>;
  isLight: boolean;
  cardBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function AddTestModal({
  isOpen,
  onClose,
  onAddTest,
  isLight,
  cardBg,
  inputBg,
  textTitle,
  textMuted,
}: AddTestModalProps) {
  const [testName, setTestName] = useState('');
  const [type, setType] = useState('PRELIMS');
  const [category, setCategory] = useState('GS1');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('200');
  const [weakAreas, setWeakAreas] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !score) return;
    setLoading(true);
    try {
      const numScore = parseFloat(score);
      const numMax = parseFloat(maxScore) || (type === 'MAINS' ? 250 : 200);
      const pct = Math.round((numScore / numMax) * 100);

      await onAddTest({
        testName: testName.trim(),
        type,
        category,
        score: numScore,
        maxScore: numMax,
        percent: pct,
        weakAreas: weakAreas.trim() ? weakAreas.trim().split(',').map((s) => s.trim()) : [],
        date: new Date().toISOString().split('T')[0],
      });

      setTestName('');
      setScore('');
      setWeakAreas('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`${cardBg} rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 border border-slate-300 dark:border-slate-800`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle} flex items-center gap-2`}>
            <Award size={20} className="text-purple-500" /> Log Mock Test Score
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Test Series / Mock Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vision IAS Abhyaas Test 1"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block ${textMuted} mb-1 font-extrabold`}>Test Stage *</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setType(newType);
                  if (newType === 'MAINS') setMaxScore('250');
                  else setMaxScore('200');
                }}
                className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
              >
                <option value="PRELIMS">Prelims (Objective GS/CSAT)</option>
                <option value="MAINS">Mains (Subjective Essay/GS/Maths)</option>
              </select>
            </div>

            <div>
              <label className={`block ${textMuted} mb-1 font-extrabold`}>Subject / Paper</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
              >
                <option value="GS1">GS Paper 1</option>
                <option value="GS2">GS Paper 2</option>
                <option value="GS3">GS Paper 3</option>
                <option value="GS4">GS Paper 4</option>
                <option value="MATHS">Maths Optional</option>
                <option value="CSAT">CSAT</option>
                <option value="ESSAY">Essay Paper</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block ${textMuted} mb-1 font-extrabold`}>Score Obtained *</label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="e.g. 108.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
              />
            </div>

            <div>
              <label className={`block ${textMuted} mb-1 font-extrabold`}>Total Marks *</label>
              <input
                type="number"
                required
                placeholder="e.g. 200 or 250"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
              />
            </div>
          </div>

          <div>
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Weak Areas / Focus Tags (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. Art & Culture PYQs, Real Analysis Calculation Speed"
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-lg transition-all flex items-center gap-2"
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
  );
}
