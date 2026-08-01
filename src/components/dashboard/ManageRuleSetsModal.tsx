'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, Loader2, Settings, ShieldCheck } from 'lucide-react';
import ShadcnSelect from '@/components/ui/ShadcnSelect';

interface ManageRuleSetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  cardBg?: string;
  inputBg?: string;
  textTitle?: string;
  textMuted?: string;
}

export default function ManageRuleSetsModal({
  isOpen,
  onClose,
  isLight = false,
  cardBg = 'bg-white dark:bg-slate-900',
  inputBg = 'bg-slate-100 dark:bg-slate-950',
  textTitle = 'text-slate-900 dark:text-slate-100',
  textMuted = 'text-slate-500 dark:text-slate-400'
}: ManageRuleSetsModalProps) {
  const [ruleSets, setRuleSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit / Create state
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' or mongoId
  const [nameInput, setNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('GS');
  const [ruleItems, setRuleItems] = useState<{ key: string; label: string; short: string }[]>([]);
  const [newRuleLabel, setNewRuleLabel] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRuleSets();
    }
  }, [isOpen]);

  const fetchRuleSets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tracker/syllabus/rulesets');
      if (res.ok) {
        const data = await res.json();
        setRuleSets(data.ruleSets || []);
      }
    } catch (e) {
      console.error('Failed to fetch rule sets', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const startCreateNew = () => {
    setEditingId('new');
    setNameInput('');
    setCategoryInput('GS');
    setRuleItems([
      { key: 'firstRead', label: 'Reading 1', short: 'R1' },
      { key: 'rev1', label: 'Rev 1', short: 'Rv1' },
      { key: 'rev2', label: 'Rev 2', short: 'Rv2' }
    ]);
  };

  const startEdit = (rs: any) => {
    setEditingId(rs.id);
    setNameInput(rs.name);
    setCategoryInput(rs.category || 'GS');
    setRuleItems(rs.rules || []);
  };

  const handleAddRuleItem = () => {
    if (!newRuleLabel.trim()) return;
    const label = newRuleLabel.trim();
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const short = label.length > 6 ? label.slice(0, 4) : label;
    setRuleItems([...ruleItems, { key, label, short }]);
    setNewRuleLabel('');
  };

  const handleRemoveRuleItem = (index: number) => {
    setRuleItems(ruleItems.filter((_, i) => i !== index));
  };

  const handleSaveRuleSet = async () => {
    if (!nameInput.trim() || ruleItems.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        action: editingId === 'new' ? 'create' : 'update',
        id: editingId === 'new' ? undefined : editingId,
        name: nameInput.trim(),
        category: categoryInput,
        rules: ruleItems
      };
      const res = await fetch('/api/tracker/syllabus/rulesets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setRuleSets(data.ruleSets || []);
        setEditingId(null);
      }
    } catch (e) {
      console.error('Failed to save rule set', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRuleSet = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/syllabus/rulesets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        const data = await res.json();
        setRuleSets(data.ruleSets || []);
      }
    } catch (e) {
      console.error('Failed to delete rule set', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in`}>
      <div className={`${cardBg} rounded-2xl w-full max-w-3xl p-5 sm:p-6 shadow-2xl space-y-5 border border-slate-300 dark:border-slate-800 max-h-[90vh] overflow-y-auto`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <div className="flex items-center gap-2">
            <Settings className="text-amber-500" size={22} />
            <h3 className={`font-black text-lg sm:text-xl ${textTitle}`}>
              Manage Syllabus Milestone Rulesets
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

        {editingId !== null ? (
          /* Editor Form */
          <div className="space-y-4 bg-slate-100/50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-300 dark:border-slate-800">
            <h4 className={`font-black text-sm sm:text-base ${textTitle} flex items-center justify-between`}>
              <span>{editingId === 'new' ? 'Create New Ruleset Template' : 'Edit Ruleset Template'}</span>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-slate-400 hover:underline font-bold"
              >
                Back to List
              </button>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block ${textMuted} text-xs font-black mb-1`}>Ruleset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Standard GS Rules, Mains Intensive"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className={`w-full ${inputBg} rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold outline-none border border-slate-300 dark:border-slate-800 focus:border-amber-500`}
                />
              </div>
              <div>
                <label className={`block ${textMuted} text-xs font-black mb-1`}>Associated Category / Group</label>
                <ShadcnSelect
                  value={categoryInput}
                  onChange={(val) => setCategoryInput(val)}
                  options={[
                    { value: 'GS', label: 'General Studies (GS)' },
                    { value: 'Maths', label: 'Maths Optional' },
                    { value: 'CSAT', label: 'CSAT' },
                    { value: 'Custom', label: 'Custom / Other' }
                  ]}
                />
              </div>
            </div>

            {/* Rules Milestone List */}
            <div className="space-y-2 pt-2 border-t border-slate-300 dark:border-slate-800">
              <label className={`block ${textMuted} text-xs font-black`}>
                Milestone Steps in Order ({ruleItems.length} steps)
              </label>

              <div className="flex flex-wrap gap-2">
                {ruleItems.map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-2"
                  >
                    <span>{idx + 1}. {r.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRuleItem(idx)}
                      className="text-rose-500 hover:text-rose-700 ml-1"
                      title="Remove step"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Step Form */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add new rule step (e.g. PYQ Practice, Short Notes)..."
                  value={newRuleLabel}
                  onChange={(e) => setNewRuleLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRuleItem();
                    }
                  }}
                  className={`flex-1 ${inputBg} rounded-xl px-3.5 py-2 text-xs font-bold outline-none border border-slate-300 dark:border-slate-800 focus:border-indigo-500`}
                />
                <button
                  type="button"
                  onClick={handleAddRuleItem}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !nameInput.trim() || ruleItems.length === 0}
                onClick={handleSaveRuleSet}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Template to DB</span>
              </button>
            </div>
          </div>
        ) : (
          /* Ruleset Templates List */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className={`text-xs ${textMuted} font-bold`}>
                Templates stored in Database. Choose or edit rule steps for subjects.
              </p>
              <button
                type="button"
                onClick={startCreateNew}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow"
              >
                <Plus size={14} /> Create Ruleset Template
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <Loader2 size={28} className="animate-spin text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-slate-400 mt-2">Loading templates...</p>
              </div>
            ) : ruleSets.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold text-xs">
                No custom templates stored yet. Click above to create one!
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {ruleSets.map((rs) => (
                  <div
                    key={rs.id}
                    className="p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-950/40 space-y-2 hover:border-amber-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                          {rs.category}
                        </span>
                        <h4 className={`font-black text-sm ${textTitle}`}>{rs.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(rs)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                          title="Edit Template"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRuleSet(rs.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                          title="Delete Template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(rs.rules || []).map((r: any, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                        >
                          {i + 1}. {r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-300 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
