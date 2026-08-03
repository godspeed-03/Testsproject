"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Loader2, ListChecks, BookOpen } from "lucide-react";
import ShadcnSelect from "@/components/ui/ShadcnSelect";
import { ISyllabusRuleState } from "@/types";

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (payload: any) => Promise<void>;
  isLight?: boolean;
  cardBg?: string;
  inputBg?: string;
  textTitle?: string;
  textMuted?: string;
  categories?: string[];
}

export default function AddSubjectModal({
  isOpen,
  onClose,
  onAddSubject,
  isLight = false,
  cardBg = "bg-white dark:bg-slate-900",
  inputBg = "bg-slate-50 dark:bg-slate-950",
  textTitle = "text-slate-900 dark:text-slate-100",
  textMuted = "text-slate-700 dark:text-slate-300",
  categories = [],
}: AddSubjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [ruleTemplates, setRuleTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customRules, setCustomRules] = useState<ISyllabusRuleState[]>([]);
  const [newRuleName, setNewRuleName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  useEffect(() => {
    if (isOpen && mounted) {
      fetchTemplates();
    }
  }, [isOpen, mounted]);

  const getCategoryFamily = (value: string) => {
    const normalized = (value || "").toLowerCase();
    if (normalized.includes("gs")) return "gs";
    if (normalized.includes("math")) return "maths";
    if (normalized.includes("csat")) return "csat";
    return normalized;
  };

  const findMatchingTemplate = (categoryValue: string, templates: any[]) => {
    const family = getCategoryFamily(categoryValue);
    return templates.find((t: any) => getCategoryFamily(t.category || t.name || "") === family) || null;
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/tracker/syllabus/rulesets");
      if (res.ok) {
        const data = await res.json();
        const templates = data.ruleSets || [];
        setRuleTemplates(templates);

        if (templates.length > 0) {
          const match = findMatchingTemplate(category, templates);
          if (match) {
            setSelectedTemplateId(match.id);
            applyTemplate(match);
          } else {
            setSelectedTemplateId("");
            setCustomRules([]);
          }
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
          key: r.key || r.label.toLowerCase().replace(/\s+/g, "_"),
          label: r.label,
          short: r.short || r.label,
          completed: false,
        })),
      );
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const match = findMatchingTemplate(cat, ruleTemplates);
    if (match) {
      setSelectedTemplateId(match.id);
      applyTemplate(match);
    } else {
      setSelectedTemplateId("");
      setCustomRules([]);
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
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
    const short = label.length > 6 ? label.slice(0, 4) : label;
    setCustomRules([...customRules, { key, label, short, completed: false }]);
    setNewRuleName("");
  };

  const handleRemoveCustomRule = (idx: number) => {
    setCustomRules(customRules.filter((_, i) => i !== idx));
  };

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setLoading(true);
    try {
      await onAddSubject({
        subject: subject.trim(),
        category,
        rules: customRules,
      });
      setSubject("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const catOptions = categories.map((c) => ({
    value: c,
    label: c,
  }));

  const modalContent = (
    <div className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 py-6 text-center animate-fade-in flex items-center justify-center">
      <div className="inline-block w-full max-w-lg text-left align-middle transition-all transform bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto glass-panel">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="font-black font-display text-base sm:text-xl text-slate-900 dark:text-slate-100">
                Add Subject to Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Configure subject & milestone ruleset steps</p>
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

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Modern History, Ethics, Geography"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-3 outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300">Category / Paper *</label>
                <ShadcnSelect value={category} onChange={handleCategoryChange} options={catOptions} />
              </div>
              <div>
                <label className="block mb-1.5 font-black text-slate-700 dark:text-slate-300">Milestone Template</label>
                <ShadcnSelect
                  value={selectedTemplateId}
                  onChange={handleTemplateSelect}
                  options={ruleTemplates.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.rules?.length || 0} steps)`,
                  }))}
                />
              </div>
            </div>

            {/* Rules Preview & Customizer */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="block font-black text-xs flex items-center justify-between text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ListChecks size={15} className="text-amber-500" /> Milestone Steps ({customRules.length})
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Template Rules</span>
              </label>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                {customRules.length === 0 ? (
                  <span className="text-[11px] p-2 italic text-slate-400 font-bold">No milestone steps attached yet. Add custom steps below.</span>
                ) : (
                  customRules.map((r, idx) => (
                    <div
                      key={r.key + idx}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-black"
                    >
                      <span>{r.label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomRule(idx)}
                        className="p-0.5 hover:bg-amber-500/20 rounded text-amber-600 dark:text-amber-400 transition-colors ml-1 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Rule Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom milestone step..."
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomRule();
                    }
                  }}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl px-3.5 py-2 outline-none font-bold text-xs border border-slate-200 dark:border-slate-800 focus:border-accent-primary transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddCustomRule}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 shadow-sm"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>
            </div>

            {/* Modal Actions */}
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
                    <span>Adding Subject...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add Subject</span>
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
