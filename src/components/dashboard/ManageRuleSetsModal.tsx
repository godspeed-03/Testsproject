"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Check, Loader2, Settings, ShieldCheck, GripVertical } from "lucide-react";
import ShadcnSelect from "@/components/ui/ShadcnSelect";
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
  isLight = true,
  cardBg = "bg-white dark:bg-slate-900",
  inputBg = "bg-slate-50 dark:bg-slate-950",
  textTitle = "text-slate-900 dark:text-slate-100",
  textMuted = "text-slate-500 dark:text-slate-400",
}: ManageRuleSetsModalProps) {
  const [ruleSets, setRuleSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit / Create state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("GS");
  const [ruleItems, setRuleItems] = useState<{ key: string; label: string; short: string }[]>([]);
  const [newRuleLabel, setNewRuleLabel] = useState("");

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
    if (isOpen) {
      fetchRuleSets();
    }
  }, [isOpen]);

  const fetchRuleSets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tracker/syllabus/rulesets");
      if (res.ok) {
        const data = await res.json();
        setRuleSets(data.ruleSets || []);
      }
    } catch (e) {
      console.error("Failed to fetch rule sets", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const startCreateNew = () => {
    setEditingId("new");
    setNameInput("");
    setCategoryInput("GS");
    setRuleItems([
      { key: "firstRead", label: "Reading 1", short: "R1" },
      { key: "rev1", label: "Rev 1", short: "Rv1" },
      { key: "rev2", label: "Rev 2", short: "Rv2" },
    ]);
  };

  const startEdit = (rs: any) => {
    setEditingId(rs.id);
    setNameInput(rs.name);
    setCategoryInput(rs.category || "GS");
    setRuleItems(rs.rules || []);
  };

  const handleAddRuleItem = () => {
    if (!newRuleLabel.trim()) return;
    const label = newRuleLabel.trim();
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const short = label.length > 6 ? label.slice(0, 4) : label;
    setRuleItems([...ruleItems, { key, label, short }]);
    setNewRuleLabel("");
  };

  const handleRemoveRuleItem = (index: number) => {
    setRuleItems(ruleItems.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ruleItems.findIndex((item, index) => getRuleItemId(item, index) === String(active.id));
    const newIndex = ruleItems.findIndex((item, index) => getRuleItemId(item, index) === String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;
    setRuleItems((current) => arrayMove(current, oldIndex, newIndex));
  };

  const handleSaveRuleSet = async () => {
    if (!nameInput.trim() || ruleItems.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        action: editingId === "new" ? "create" : "update",
        id: editingId === "new" ? undefined : editingId,
        name: nameInput.trim(),
        category: categoryInput,
        rules: ruleItems,
      };
      const res = await fetch("/api/tracker/syllabus/rulesets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setRuleSets(data.ruleSets || []);
        setEditingId(null);
      }
    } catch (e) {
      console.error("Failed to save rule set", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRuleSet = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/tracker/syllabus/rulesets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        const data = await res.json();
        setRuleSets(data.ruleSets || []);
      }
    } catch (e) {
      console.error("Failed to delete rule set", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl p-5 sm:p-7 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-black font-display text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                Manage Syllabus Rulesets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Configure reusable milestone templates in database</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {editingId !== null ? (
          /* Editor Form */
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center justify-between font-display">
              <span>{editingId === "new" ? "Create New Ruleset Template" : "Edit Ruleset Template"}</span>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xs text-slate-400 hover:text-amber-500 font-black cursor-pointer"
              >
                Back to List
              </button>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-black mb-1.5">Ruleset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Standard GS Rules, Mains Intensive"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-black mb-1.5">Associated Category</label>
                <ShadcnSelect
                  value={categoryInput}
                  onChange={(val) => setCategoryInput(val)}
                  options={[
                    { value: "GS", label: "General Studies (GS)" },
                    { value: "Maths", label: "Maths Optional" },
                    { value: "CSAT", label: "CSAT" },
                    { value: "Custom", label: "Custom / Other" },
                  ]}
                />
              </div>
            </div>

            {/* Rules Milestone List */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-bold">
              <label className="block text-slate-700 dark:text-slate-300 text-xs font-black">
                Milestone Steps in Order ({ruleItems.length} steps)
              </label>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={ruleItems.map((r, idx) => getRuleItemId(r, idx))}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {ruleItems.map((r, idx) => (
                      <SortableRuleItem
                        key={getRuleItemId(r, idx)}
                        id={getRuleItemId(r, idx)}
                        index={idx}
                        item={r}
                        onRemove={() => handleRemoveRuleItem(idx)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add New Step Form */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add new rule step (e.g. PYQ Practice, Short Notes)..."
                  value={newRuleLabel}
                  onChange={(e) => setNewRuleLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRuleItem();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none border border-slate-200 dark:border-slate-800 focus:border-accent-primary"
                />
                <button
                  type="button"
                  onClick={handleAddRuleItem}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 font-black">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !nameInput.trim() || ruleItems.length === 0}
                onClick={handleSaveRuleSet}
                className="px-5 py-2.5 bg-accent-gradient text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Save Template</span>
              </button>
            </div>
          </div>
        ) : (
          /* Ruleset Templates List */
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Database milestone rulesets used for automated subject tracking.
              </p>
              <button
                type="button"
                onClick={startCreateNew}
                className="px-4 py-2 bg-accent-gradient text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Plus size={15} /> Create Ruleset Template
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 size={28} className="animate-spin text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-slate-400 mt-2">Loading ruleset templates...</p>
              </div>
            ) : ruleSets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-bold text-xs">
                No custom ruleset templates stored in DB yet. Click above to create one!
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {ruleSets.map((rs) => (
                  <div
                    key={rs.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                          {rs.category}
                        </span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">{rs.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(rs)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Template"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRuleSet(rs.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(rs.rules || []).map((r: any, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
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

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

function getRuleItemId(item: { key: string; label: string; short: string }, index: number) {
  return `${item.key || "rule"}-${item.label || "item"}-${index}`;
}

function SortableRuleItem({
  id,
  index,
  item,
  onRemove,
}: {
  id: string;
  index: number;
  item: { key: string; label: string; short: string };
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 ${
        isDragging ? "ring-2 ring-accent-primary opacity-70" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-amber-500 shrink-0 touch-none"
        title="Drag to reorder"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} />
      </button>
      <span className="flex-1 min-w-0 truncate font-black">
        {index + 1}. {item.label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="text-slate-400 hover:text-rose-500 ml-1 shrink-0 transition-colors cursor-pointer"
        title="Remove step"
      >
        <X size={14} />
      </button>
    </div>
  );
}
