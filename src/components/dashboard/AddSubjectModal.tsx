'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Loader2, ListChecks } from 'lucide-react';
import ShadcnSelect from '@/components/ui/ShadcnSelect';
import { ISyllabusRuleState } from '@/models/SyllabusItem';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (payload: any) => Promise<void>;
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
  const [ruleTemplates, setRuleTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customRules, setCustomRules] = useState<ISyllabusRuleState[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/tracker/syllabus/rulesets');
      if (res.ok) {
        const data = await res.json();
        const templates = data.ruleSets || [];
        setRuleTemplates(templates);

        // Auto select template matching category if available
        if (templates.length > 0) {
          const match = templates.find((t: any) => t.category?.toLowerCase() === category.toLowerCase()) || templates[0];
          setSelectedTemplateId(match.id);
          applyTemplate(match);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyTemplate = (t: any) => {
    if (t && Array.isArray(t.rules)) {
      setCustomRules(
        t.rules.map((r: any) => ({
          key: r.key || r.label.toLowerCase().replace(/\s+/g, '_'),
          label: r.label,
          short: r.short || r.label,
          completed: false
        }))
      );
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const match = ruleTemplates.find((t: any) => t.category?.toLowerCase() === cat.toLowerCase()) || ruleTemplates[0];
    if (match) {
      setSelectedTemplateId(match.id);
      applyTemplate(match);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = ruleTemplates.find((rs) => rs.id === templateId);
    if (t) applyTemplate(t);
  };

  const handleAddCustomRule = () => {
    if (!newRuleName.trim()) return;
    const label = newRuleName.trim();
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const short = label.length > 6 ? label.slice(0, 4) : label;
    setCustomRules([...customRules, { key, label, short, completed: false }]);
    setNewRuleName('');
  };

  const handleRemoveCustomRule = (idx: number) => {
    setCustomRules(customRules.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setLoading(true);
    try {
      await onAddSubject({
        subject: subject.trim(),
        category,
        source: source.trim(),
        rules: customRules
      });
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
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in`}>
      <div className={`${cardBg} rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 border border-slate-300 dark:border-slate-800 max-h-[90vh] overflow-y-auto`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <h3 className={`font-black text-lg sm:text-xl ${textTitle} flex items-center gap-2`}>
            <Plus size={20} className="text-amber-500" /> Add Subject to Syllabus Matrix
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
              placeholder="e.g. Modern History, Ethics, Geography"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold border border-slate-300 dark:border-slate-800 focus:border-amber-500`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block ${textMuted} mb-1 font-extrabold`}>Category / Paper *</label>
              <ShadcnSelect
                value={category}
                onChange={handleCategoryChange}
                options={catOptions}
              />
            </div>
            <div>
              <label className={`block ${textMuted} mb-1 font-extrabold`}>Milestone Ruleset Template</label>
              <ShadcnSelect
                value={selectedTemplateId}
                onChange={handleTemplateSelect}
                options={ruleTemplates.map((t) => ({ value: t.id, label: `${t.name} (${t.rules?.length || 0} steps)` }))}
              />
            </div>
          </div>

          <div>
            <label className={`block ${textMuted} mb-1 font-extrabold`}>Standard Reference Source</label>
            <input
              type="text"
              placeholder="e.g. Spectrum, Laxmikanth, NCERT Class 11"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={`w-full ${inputBg} rounded-xl px-3.5 py-2.5 outline-none font-bold border border-slate-300 dark:border-slate-800 focus:border-amber-500`}
            />
          </div>

          {/* Rules Preview & Customizer */}
          <div className="space-y-2 pt-2 border-t border-slate-300 dark:border-slate-800">
            <label className={`block ${textMuted} font-extrabold flex items-center justify-between`}>
              <span className="flex items-center gap-1.5"><ListChecks size={15} className="text-amber-500" /> Subject Milestone Steps ({customRules.length})</span>
              <span className="text-[10px] text-slate-400">Fetched from DB</span>
            </label>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {customRules.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{r.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomRule(idx)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add extra step for this subject..."
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRule();
                  }
                }}
                className={`flex-1 ${inputBg} rounded-xl px-3 py-1.5 text-xs outline-none font-bold border border-slate-300 dark:border-slate-800`}
              />
              <button
                type="button"
                onClick={handleAddCustomRule}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-lg transition-all flex items-center gap-2 text-xs"
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
