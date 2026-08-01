'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Loader2, ListChecks, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import ShadcnSelect from '@/components/ui/ShadcnSelect';
import { ISyllabusRuleState } from '@/models/SyllabusItem';
import { DEFAULT_RULESETS } from '@/lib/syllabusRules';

interface EditSubjectRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectItem: any;
  onSaveRules: (subjectId: string, updatedRules: ISyllabusRuleState[]) => Promise<void>;
  isLight?: boolean;
  cardBg?: string;
  inputBg?: string;
  textTitle?: string;
  textMuted?: string;
}

export default function EditSubjectRulesModal({
  isOpen,
  onClose,
  subjectItem,
  onSaveRules,
  isLight = false,
  cardBg = 'bg-white dark:bg-slate-900',
  inputBg = 'bg-slate-100 dark:bg-slate-950',
  textTitle = 'text-slate-900 dark:text-slate-100',
  textMuted = 'text-slate-500 dark:text-slate-400'
}: EditSubjectRulesModalProps) {
  const [rules, setRules] = useState<ISyllabusRuleState[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [ruleTemplates, setRuleTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && subjectItem) {
      setRules(subjectItem.rules || []);
      fetchTemplates();
    }
  }, [isOpen, subjectItem]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/tracker/syllabus/rulesets');
      if (res.ok) {
        const data = await res.json();
        setRuleTemplates(data.ruleSets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !subjectItem) return null;

  const handleApplyPreset = (presetCategory: string) => {
    const found = DEFAULT_RULESETS.find((r) => r.category.toLowerCase() === presetCategory.toLowerCase());
    if (found) {
      setRules(
        found.rules.map((r) => ({
          key: r.key,
          label: r.label,
          short: r.short,
          completed: false
        }))
      );
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const t = ruleTemplates.find((rs) => rs.id === templateId);
    if (t && Array.isArray(t.rules)) {
      const appliedRules: ISyllabusRuleState[] = t.rules.map((r: any) => ({
        key: r.key || r.label.toLowerCase().replace(/\s+/g, '_'),
        label: r.label,
        short: r.short || r.label,
        completed: false
      }));
      setRules(appliedRules);
    }
  };

  const handleAddRule = () => {
    if (!newRuleName.trim()) return;
    const label = newRuleName.trim();
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const short = label.length > 7 ? label.slice(0, 5) : label;
    setRules([...rules, { key, label, short, completed: false }]);
    setNewRuleName('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleToggleRule = (index: number) => {
    const next = [...rules];
    next[index].completed = !next[index].completed;
    setRules(next);
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= rules.length) return;
    const next = [...rules];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setRules(next);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaveRules(subjectItem.id, rules);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in`}>
      <div className={`${cardBg} rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-5 border border-slate-300 dark:border-slate-800 max-h-[90vh] overflow-y-auto`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <div className="flex items-center gap-2">
            <ListChecks className="text-amber-500" size={22} />
            <h3 className={`font-black text-base sm:text-lg ${textTitle}`}>
              Edit Rules for <span className="text-indigo-600 dark:text-cyan-400">{subjectItem.subject}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1-Click Default Preset Buttons */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            Quick Presets — 1-Click Load Default Rules:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleApplyPreset('GS')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black transition-all"
            >
              GS Standard (11 steps)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Maths')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-black transition-all"
            >
              Maths Optional (8 steps)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('CSAT')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black transition-all"
            >
              CSAT (4 steps)
            </button>
          </div>
        </div>

        {/* Option to load template from DB */}
        {ruleTemplates.length > 0 && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
              Or Load DB Ruleset Template:
            </span>
            <div className="w-48 sm:w-56">
              <ShadcnSelect
                value={selectedTemplateId}
                onChange={(val) => {
                  setSelectedTemplateId(val);
                  handleApplyTemplate(val);
                }}
                options={[
                  { value: '', label: 'Choose Template...' },
                  ...ruleTemplates.map((t) => ({ value: t.id, label: `${t.name} (${t.rules.length} steps)` }))
                ]}
              />
            </div>
          </div>
        )}

        {/* Current Rules list */}
        <div className="space-y-3">
          <label className={`block ${textMuted} text-xs font-black`}>
            Subject Milestones ({rules.length} steps) — Click checkmark to toggle completed state
          </label>

          <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
            {rules.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold text-center py-4">
                No rules added yet. Add custom rules below or click a quick preset above!
              </p>
            ) : (
              rules.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    r.completed
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleRule(idx)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors shrink-0 ${
                        r.completed ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-500 hover:bg-slate-400'
                      }`}
                    >
                      {r.completed ? <Check size={14} className="stroke-[3]" /> : idx + 1}
                    </button>
                    <span className="font-extrabold text-xs sm:text-sm truncate">{r.label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveRule(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === rules.length - 1}
                      onClick={() => handleMoveRule(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="Delete step"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add custom rule input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add rule directly (e.g. Rev 3, Test 1, Formula Sheet)..."
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRule();
                }
              }}
              className={`flex-1 ${inputBg} rounded-xl px-3.5 py-2 text-xs font-bold outline-none border border-slate-300 dark:border-slate-800 focus:border-indigo-500`}
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0 shadow-md"
            >
              <Plus size={14} /> Add Rule Directly
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-300 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Save Rules to Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}
