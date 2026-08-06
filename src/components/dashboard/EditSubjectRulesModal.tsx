"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Check, Loader2, ListChecks, Zap, GripVertical, Palette, FileCode } from "lucide-react";
import ShadcnSelect from "@/components/ui/ShadcnSelect";
import { ISyllabusRuleState } from "@/types";
import {
  SUBJECT_COLOR_OPTIONS,
  NON_SUBJECT_COLOR_OPTIONS,
  ALL_UPSC_ICONS,
  getSubjectTheme,
} from "@/lib/subjectThemeMap";
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
  onSaveRules: (subjectId: string, updatedRules: ISyllabusRuleState[], color?: string, icon?: string) => Promise<void>;
  isLight?: boolean;
  cardBg?: string;
  inputBg?: string;
  textTitle?: string;
  textMuted?: string;
  existingSubjects?: any[];
}

export default function EditSubjectRulesModal({
  isOpen,
  onClose,
  subjectItem,
  onSaveRules,
  isLight = true,
  cardBg = "bg-white dark:bg-slate-900",
  inputBg = "bg-slate-50 dark:bg-slate-950",
  textTitle = "text-slate-900 dark:text-slate-100",
  textMuted = "text-slate-500 dark:text-slate-400",
  existingSubjects = [],
}: EditSubjectRulesModalProps) {
  const [rules, setRules] = useState<ISyllabusRuleState[]>([]);
  const [color, setColor] = useState<string>("#6366F1");
  const [icon, setIcon] = useState<string>("📚");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<string>("all");
  const [newRuleName, setNewRuleName] = useState("");
  const [ruleTemplates, setRuleTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(false);

  // JSON Array Edit mode state
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const usedColors = useMemo(() => {
    const set = new Set<string>();
    (existingSubjects || []).forEach((s) => {
      if (s.id === subjectItem?.id) return;
      const c = s.color || getSubjectTheme(s.subject)?.color;
      if (c) set.add(c.toLowerCase());
    });
    return set;
  }, [existingSubjects, subjectItem]);

  const usedIcons = useMemo(() => {
    const set = new Set<string>();
    (existingSubjects || []).forEach((s) => {
      if (s.id === subjectItem?.id) return;
      const ic = s.icon || getSubjectTheme(s.subject)?.icon;
      if (ic) set.add(ic);
    });
    return set;
  }, [existingSubjects, subjectItem]);

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

  const syncJsonFromRules = (currentRules: ISyllabusRuleState[]) => {
    const exportData = currentRules.map((r) => ({
      label: r.label,
      completed: !!r.completed,
    }));
    setJsonText(JSON.stringify(exportData, null, 2));
    setJsonError(null);
  };

  const parseAndApplyJson = (text: string): boolean => {
    if (!text.trim()) {
      setRules([]);
      setJsonError(null);
      return true;
    }
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array of objects or string labels.");
        return false;
      }
      const newRules: ISyllabusRuleState[] = parsed.map((item: any, idx: number) => {
        if (typeof item === "string") {
          const label = item.trim();
          return {
            key: label.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + idx + "_" + Date.now(),
            label,
            short: label.length > 7 ? label.slice(0, 5) : label,
            completed: false,
          };
        } else if (typeof item === "object" && item !== null) {
          const label = String(item.label || item.name || item.title || `Step ${idx + 1}`).trim();
          return {
            key: item.key || label.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + idx + "_" + Date.now(),
            label,
            short: item.short || (label.length > 7 ? label.slice(0, 5) : label),
            completed: Boolean(item.completed),
          };
        }
        return {
          key: `step_${idx}_${Date.now()}`,
          label: `Step ${idx + 1}`,
          short: `Step ${idx + 1}`,
          completed: false,
        };
      });
      setRules(newRules);
      setJsonError(null);
      return true;
    } catch (err: any) {
      setJsonError(`Invalid JSON Syntax: ${err.message}`);
      return false;
    }
  };

  useEffect(() => {
    if (isOpen && subjectItem) {
      const initRules = subjectItem.rules || [];
      setRules(initRules);
      syncJsonFromRules(initRules);
      setViewMode("visual");
      const matchedTheme = getSubjectTheme(subjectItem.subject);
      setColor(subjectItem.color || matchedTheme?.color || "#6366F1");
      setIcon(subjectItem.icon || matchedTheme?.icon || "📚");
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
      await onSaveRules(subjectItem.id, rules, color, icon);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {/* Subject Icon + Color Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border shadow-inner transition-all hover:scale-105 cursor-pointer active:scale-95"
                style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
                title="Click to customize Subject Icon & Color"
              >
                {icon}
              </button>

              {/* Floating Popover: Icon & Theme Color Selector */}
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 w-80 sm:w-[400px] p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-amber-500/30 shadow-2xl space-y-3 animate-fade-in z-[999999]">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Palette size={15} className="text-amber-500" />
                      <span>Customize Subject Icon & Color</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Theme Color Picker Section */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Theme Color Palette (35 Colors)</div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex-wrap max-h-32 overflow-y-auto custom-scrollbar">
                      {SUBJECT_COLOR_OPTIONS.map((c) => {
                        const isTaken = usedColors.has(c.toLowerCase()) && color?.toLowerCase() !== c.toLowerCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            disabled={isTaken}
                            onClick={() => {
                              if (isTaken) return;
                              setColor(c);
                            }}
                            title={isTaken ? "Color already assigned to another subject" : c}
                            className={`w-6 h-6 rounded-full transition-all flex items-center justify-center relative ${
                              isTaken
                                ? 'opacity-25 cursor-not-allowed filter grayscale scale-90'
                                : color?.toLowerCase() === c.toLowerCase()
                                ? 'scale-125 ring-2 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md cursor-pointer'
                                : 'hover:scale-110 opacity-75 hover:opacity-100 cursor-pointer'
                            }`}
                            style={{ backgroundColor: c }}
                          >
                            {isTaken && (
                              <span className="text-[9px] text-white font-black drop-shadow-xs select-none">✕</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 150+ UPSC Subject & Syllabus Icons */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">UPSC Subject Icons (150+ Options)</span>
                    </div>

                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-44 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 scrollbar-thin">
                      {ALL_UPSC_ICONS.map((emoji, idx) => {
                        const isTaken = usedIcons.has(emoji) && icon !== emoji;
                        return (
                          <button
                            key={emoji + idx}
                            type="button"
                            disabled={isTaken}
                            onClick={() => {
                              if (isTaken) return;
                              setIcon(emoji);
                              setShowEmojiPicker(false);
                            }}
                            title={isTaken ? "Icon already assigned to another subject" : emoji}
                            className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all relative ${
                              isTaken
                                ? 'opacity-25 cursor-not-allowed bg-slate-200/60 dark:bg-slate-800/60 grayscale scale-90'
                                : icon === emoji
                                ? 'bg-amber-500 text-white font-black scale-110 shadow-md cursor-pointer'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                            }`}
                          >
                            {emoji}
                            {isTaken && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-rose-500 font-black select-none">🚫</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-black font-display text-base sm:text-xl text-slate-900 dark:text-slate-100">
                Edit Rules for <span style={{ color }}>{subjectItem.subject}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Customize milestone sequence steps & theme</p>
            </div>
          </div>

          {/* Preset loader in header */}
          {ruleTemplates.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <ShadcnSelect
                value={selectedTemplateId}
                onChange={(val) => {
                  setSelectedTemplateId(val);
                  // Auto-apply on selection
                  const t = ruleTemplates.find((rs: any) => rs.id === val);
                  if (t && Array.isArray(t.rules)) {
                    const appliedRules: ISyllabusRuleState[] = t.rules.map((r: any) => ({
                      key: r.key || r.label.toLowerCase().replace(/\s+/g, "_"),
                      label: r.label,
                      short: r.short || r.label,
                      completed: false,
                    }));
                    setRules(appliedRules);
                  }
                }}
                placeholder="Load preset..."
                className="min-w-[140px]"
                options={ruleTemplates.map((t) => ({
                  value: t.id,
                  label: t.name,
                  sublabel: `${t.rules?.length || 0} steps`,
                }))}
              />
            </div>
          )}
        </div>

        {/* Current Rules list / JSON Editor */}
        <div className="space-y-3 font-bold">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <label className="text-slate-700 dark:text-slate-300 text-xs font-black">
              Subject Milestones ({rules.length} steps)
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (viewMode === "json") {
                    if (parseAndApplyJson(jsonText)) setViewMode("visual");
                  } else {
                    setViewMode("visual");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-black text-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "visual"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ListChecks size={13} />
                <span>Drag & Drop UI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (viewMode === "visual") {
                    syncJsonFromRules(rules);
                    setViewMode("json");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-black text-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "json"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <FileCode size={13} />
                <span>Edit JSON Array</span>
              </button>
            </div>
          </div>

          {viewMode === "json" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs font-extrabold text-slate-400">
                <span>Paste or edit JSON array directly below:</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = [
                      { label: "Reading 1", completed: true },
                      { label: "NCERT 11 P1", completed: false },
                      { label: "NCERT 11 P2", completed: false },
                      { label: "NCERT 12 P1", completed: false },
                      { label: "NCERT 12 P2", completed: false },
                      { label: "Class Notes", completed: false },
                    ];
                    const text = JSON.stringify(sample, null, 2);
                    setJsonText(text);
                    parseAndApplyJson(text);
                  }}
                  className="text-amber-500 hover:underline font-black text-2xs cursor-pointer"
                >
                  Load Sample JSON
                </button>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  parseAndApplyJson(e.target.value);
                }}
                placeholder='[\n  { "label": "Reading 1", "completed": true },\n  { "label": "NCERT 11 P1", "completed": false }\n]'
                rows={10}
                className="w-full font-mono text-xs p-3.5 rounded-2xl bg-slate-950 text-emerald-400 border border-slate-800 outline-none focus:border-amber-500/80 leading-relaxed shadow-inner"
              />

              {jsonError ? (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-2xs font-black flex items-center justify-between">
                  <span>⚠️ {jsonError}</span>
                </div>
              ) : (
                <div className="text-2xs text-emerald-500 font-extrabold flex items-center gap-1">
                  <span>✓ Valid JSON Array ({rules.length} milestone steps parsed)</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={rules.map((rule, index) => `${rule.key || rule.label || index}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
                    {rules.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold text-center py-6">
                        No rules added yet. Add custom rules below, load a preset, or switch to JSON mode!
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
                          accentColor={color}
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
                  placeholder="Add step directly (e.g. Rev 3, Test 1, Formula Sheet)..."
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0 shadow-md cursor-pointer active:scale-95"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 font-black">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-6 py-2.5 bg-accent-gradient text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>Save Rules</span>
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
  accentColor = "#6366F1",
}: {
  id: string;
  index: number;
  rule: ISyllabusRuleState;
  onToggle: () => void;
  onRemove: () => void;
  isCompleted: boolean;
  accentColor?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`px-3 py-2.5 rounded-xl border flex items-center gap-2 transition-all font-black text-xs group ${
        isCompleted
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
          : "bg-slate-50/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      } ${isDragging ? "ring-2 ring-accent-primary opacity-70 shadow-lg" : "hover:border-slate-300 dark:hover:border-slate-700"}`}
    >
      <button
        type="button"
        className="p-1 rounded-md text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none opacity-0 group-hover:opacity-100 transition-opacity"
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
        className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] transition-all shrink-0 cursor-pointer active:scale-90"
        style={isCompleted ? { backgroundColor: '#10B981', color: '#fff' } : { backgroundColor: `${accentColor}20`, color: accentColor, borderWidth: 1, borderColor: `${accentColor}40` }}
      >
        {isCompleted ? <Check size={13} className="stroke-[3]" /> : index + 1}
      </button>
      <span className="font-bold text-xs flex-1 min-w-0 truncate">{rule.label}</span>

      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 rounded-md transition-colors shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
        title="Delete step"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
