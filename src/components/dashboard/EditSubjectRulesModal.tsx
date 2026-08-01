"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Loader2, ListChecks, Zap, GripVertical } from "lucide-react";
import ShadcnSelect from "@/components/ui/ShadcnSelect";
import { ISyllabusRuleState } from "@/models/SyllabusItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  isLight = true,
  cardBg = "bg-white dark:bg-slate-900",
  inputBg = "bg-slate-100 dark:bg-slate-950",
  textTitle = "text-slate-900 dark:text-slate-100",
  textMuted = "text-slate-500 dark:text-slate-400",
}: EditSubjectRulesModalProps) {
  const [rules, setRules] = useState<ISyllabusRuleState[]>([]);
  const [newRuleName, setNewRuleName] = useState("");
  const [ruleTemplates, setRuleTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (isOpen && subjectItem) {
      setRules(subjectItem.rules || []);
      fetchTemplates();
    }
  }, [isOpen, subjectItem]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/tracker/syllabus/rulesets");
      if (res.ok) {
        const data = await res.json();
        const templates = data.ruleSets || [];
        setRuleTemplates(templates);
        setSelectedTemplateId((current) => current || templates[0]?.id || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !subjectItem) return null;

  const handleApplyTemplate = (templateId: string) => {
    const t = ruleTemplates.find((rs) => rs.id === templateId);
    if (t && Array.isArray(t.rules)) {
      const appliedRules: ISyllabusRuleState[] = t.rules.map((r: any) => ({
        key: r.key || r.label.toLowerCase().replace(/\s+/g, "_"),
        label: r.label,
        short: r.short || r.label,
        completed: false,
      }));
      setRules(appliedRules);
    }
  };

  const handleLoadSelectedTemplate = () => {
    if (selectedTemplateId) {
      handleApplyTemplate(selectedTemplateId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rules.findIndex((rule, index) => `${rule.key || rule.label || index}` === String(active.id));
    const newIndex = rules.findIndex((rule, index) => `${rule.key || rule.label || index}` === String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;
    setRules((current) => arrayMove(current, oldIndex, newIndex));
  };

  const handleAddRule = () => {
    if (!newRuleName.trim()) return;
    const label = newRuleName.trim();
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
    const short = label.length > 7 ? label.slice(0, 5) : label;
    setRules([...rules, { key, label, short, completed: false }]);
    setNewRuleName("");
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleToggleRule = (index: number) => {
    const next = [...rules];
    next[index].completed = !next[index].completed;
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
    <div
      className={`fixed inset-0 z-50 ${isLight ? "bg-slate-900/40" : "bg-slate-950/75"} backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in`}
    >
      <div
        className={`${cardBg} rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-5 border border-slate-300 dark:border-slate-800 max-h-[90vh] overflow-y-auto`}
      >
        <div
          className={`flex justify-between items-center border-b ${isLight ? "border-slate-300" : "border-slate-800"} pb-3`}
        >
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

        {/* Dynamic DB Rule Set Presets */}
        {ruleTemplates.length > 0 ? (
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              Load DB Rule Set Preset:
            </div>
            <div className="flex items-center gap-2">
              <ShadcnSelect
                isLight={true}
                value={selectedTemplateId}
                onChange={setSelectedTemplateId}
                placeholder="Choose a DB preset"
                className="flex-1 min-w-0"
                options={ruleTemplates.map((t) => ({
                  value: t.id,
                  label: t.name,
                  sublabel: `${t.rules?.length || 0} steps`,
                }))}
              />
              <button
                type="button"
                onClick={handleLoadSelectedTemplate}
                disabled={!selectedTemplateId}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black transition-all shrink-0"
              >
                Load
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
            No DB Rule Sets saved yet. Add custom rules below or create rule sets in DB.
          </div>
        )}

        {/* Current Rules list */}
        <div className="space-y-3">
          <label className={`block ${textMuted} text-xs font-black`}>
            Subject Milestones ({rules.length} steps) — Drag the handle to reorder, click checkmark to toggle completed
            state
          </label>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={rules.map((rule, index) => `${rule.key || rule.label || index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
                {rules.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-4">
                    No rules added yet. Add custom rules below or click a quick preset above!
                  </p>
                ) : (
                  rules.map((r, idx) => (
                    <SortableRuleRow
                      key={`${r.key || r.label || idx}`}
                      id={`${r.key || r.label || idx}`}
                      index={idx}
                      rule={r}
                      onToggle={() => handleToggleRule(idx)}
                      onRemove={() => handleRemoveRule(idx)}
                      isCompleted={r.completed}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add custom rule input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add rule directly (e.g. Rev 3, Test 1, Formula Sheet)..."
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
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
            className="px-5 py-2 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Save Rules to Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableRuleRow({
  id,
  index,
  rule,
  onToggle,
  onRemove,
  isCompleted,
}: {
  id: string;
  index: number;
  rule: ISyllabusRuleState;
  onToggle: () => void;
  onRemove: () => void;
  isCompleted: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
        isCompleted
          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
          : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
      } ${isDragging ? "ring-2 ring-indigo-500/50 opacity-70" : ""}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors shrink-0 ${
            isCompleted
              ? "bg-emerald-600 text-white"
              : "bg-slate-300 dark:bg-slate-800 text-slate-500 hover:bg-slate-400"
          }`}
        >
          {isCompleted ? <Check size={14} className="stroke-3" /> : index + 1}
        </button>
        <span className="font-extrabold text-xs sm:text-sm truncate">{rule.label}</span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-slate-400 hover:text-rose-500 shrink-0"
        title="Delete step"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
