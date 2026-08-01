"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Loader2, ListChecks, BookOpen } from "lucide-react";
import ShadcnSelect from "@/components/ui/ShadcnSelect";
import { ISyllabusRuleState } from "@/models/SyllabusItem";

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
  inputBg = "bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900",
  textTitle = "text-slate-900 dark:text-slate-100",
  textMuted = "text-slate-700 dark:text-slate-300",
  categories = [],
}: AddSubjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(categories[0] || "GS1");
  const [ruleTemplates, setRuleTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customRules, setCustomRules] = useState<ISyllabusRuleState[]>([]);
  const [newRuleName, setNewRuleName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        // Auto select template matching category if available
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

  const defaultCategories = ["GS1", "GS2", "GS3", "GS4", "Maths", "CSAT"];
  const catOptions = (categories.length > 0 ? categories : defaultCategories).map((c) => ({
    value: c,
    label: c,
  }));

  const modalContent = (
    <div className={`fixed inset-0 z-[999999] overflow-y-auto ${isLight ? "bg-slate-900/40" : "bg-slate-950/85"} backdrop-blur-md px-3 sm:px-4 py-6 text-center animate-fade-in`}>
      <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

      <div className={`inline-block w-full max-w-lg text-left align-middle transition-all transform ${cardBg} rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto`}>
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                Add Subject to Syllabus Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure subject & milestone ruleset steps</p>
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

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Modern History, Ethics, Geography"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">Category / Paper *</label>
                <ShadcnSelect value={category} onChange={handleCategoryChange} options={catOptions} />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">Milestone Ruleset Template</label>
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
              <label className="block font-bold text-xs flex items-center justify-between text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ListChecks size={15} className="text-amber-500" /> Subject Milestone Steps ({customRules.length})
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">DB Template Rules</span>
              </label>

              <div className={`flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-300 dark:border-slate-800 rounded-xl ${inputBg}`}>
                {customRules.length === 0 ? (
                  <span className="text-[11px] p-2 italic text-slate-500 dark:text-slate-400">No rules attached yet. Add custom steps below.</span>
                ) : (
                  customRules.map((r, idx) => (
                    <div
                      key={r.key + idx}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold"
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
                  placeholder="Add custom milestone step (e.g., Pyq Practice)"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomRule();
                    }
                  }}
                  className={`flex-1 ${inputBg} text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3 py-2 outline-none font-semibold text-xs border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomRule}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
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
                className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-xl font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 text-xs cursor-pointer active:scale-95"
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
