'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import ShadcnSelect from '@/components/ui/ShadcnSelect';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (subject: any, category?: string, source?: string) => Promise<void>;
  isLight: boolean;
  cardBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
  categories?: string[];
}

export default function AddSubjectModal({
  isOpen,
  onClose,
  onAddSubject,
  isLight,
  cardBg,
  inputBg,
  textTitle,
  textMuted,
  categories = [],
}: AddSubjectModalProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(categories[0] || 'GS1');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setLoading(true);
    try {
      await onAddSubject({ subject: subject.trim(), category, source: source.trim() });
      setSubject('');
      setSource('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const defaultCategories = ['GS1', 'GS2', 'GS3', 'GS4', 'Maths', 'CSAT'];
  const catOptions = (categories.length > 0 ? categories : defaultCategories).map((c) => ({
    value: c,
    label: c
  }));

  return (
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in`}>
      <div className={`${cardBg} rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 border border-slate-300 dark:border-slate-800`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle} flex items-center gap-2`}>
            <Plus size={20} className="text-amber-500" /> Add Custom Subject
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
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern History, Ethics, Polity"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold`}
            />
          </div>

          <div>
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Category / Paper *</label>
            <ShadcnSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={catOptions}
            />
          </div>

          <div>
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Standard Book / Reference Source</label>
            <input
              type="text"
              placeholder="e.g. Spectrum, Laxmikanth, NCERT Class 11"
              value={source}
              onChange={(e) => setSource(e.target.value)}
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
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-lg transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Adding Subject...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Save Subject</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
