'use client';

import { useState } from 'react';
import { SkipForward, X, Loader2 } from 'lucide-react';

interface SkipRevisionModalProps {
  isOpen: boolean;
  topic: any | null;
  onClose: () => void;
  onConfirmSkip: (topicObj: any, note: string) => Promise<void>;
  isLight: boolean;
  cardBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function SkipRevisionModal({
  isOpen,
  topic,
  onClose,
  onConfirmSkip,
  isLight,
  cardBg,
  inputBg,
  textTitle,
  textMuted,
}: SkipRevisionModalProps) {
  const [skipNote, setSkipNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !topic) return null;

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onConfirmSkip(topic, skipNote.trim());
      setSkipNote('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 glass-panel">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-black font-display text-lg sm:text-xl text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <SkipForward size={20} /> Skip Due Revision
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm font-bold">
          <p className="text-slate-700 dark:text-slate-300">
            You are skipping revision for: <strong className="text-slate-900 dark:text-slate-100 font-black">{topic.topic || topic.subject}</strong> {topic.subject ? `(${topic.subject})` : ''}.
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-black text-xs bg-rose-500/15 p-3 rounded-2xl border border-rose-500/30">
            ⚠️ This will push the revision target forward without registering study hours.
          </p>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-black">Reason / Skip Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Skipped for Mock Test focus"
              value={skipNote}
              onChange={(e) => setSkipNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-rose-500 shadow-inner"
            />
          </div>
        </div>

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
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Skipping...</span>
              </>
            ) : (
              <>
                <SkipForward size={16} />
                <span>Confirm Skip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
