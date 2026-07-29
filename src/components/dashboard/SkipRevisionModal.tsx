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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-300 dark:border-slate-800`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <h3 className="font-extrabold text-lg sm:text-xl text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <SkipForward size={20} /> Skip Due Revision
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

        <div className="space-y-3 text-xs sm:text-sm font-bold">
          <p className={`${textMuted}`}>
            You are skipping revision for: <strong className={`${textTitle}`}>{topic.topic || topic.subject}</strong> {topic.subject ? `(${topic.subject})` : ''}.
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            ⚠️ This will push the revision target forward without registering study hours.
          </p>

          <div>
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Reason / Skip Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Skipped for Mock Test focus"
              value={skipNote}
              onChange={(e) => setSkipNote(e.target.value)}
              className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
            />
          </div>
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
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all flex items-center gap-2"
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
