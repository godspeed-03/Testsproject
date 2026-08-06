"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import AddSubjectModal from "@/components/dashboard/AddSubjectModal";
import SubjectTopicsModal from "@/components/dashboard/SubjectTopicsModal";
import ManageRuleSetsModal from "@/components/dashboard/ManageRuleSetsModal";
import EditSubjectRulesModal from "@/components/dashboard/EditSubjectRulesModal";
import {
  Loader2,
  Plus,
  Table,
  Trash2,
  Check,
  Search,
  BookOpen,
  Filter,
  Settings,
  Square,
  CheckSquare,
  Sparkles,
  X,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from "lucide-react";
import { ISyllabusRuleState } from "@/types";
import ActionTooltip from "@/components/ActionTooltip";
import { toast } from "sonner";
import { confirmDeleteWithSonner } from "@/app/tracker/TrackerContext";

interface StatusStage {
  value: string;
  label: string;
  color: string;
  dotColor: string;
}

const STATUS_STAGES: StatusStage[] = [
  { value: "Not Started", label: "Not Started", color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700", dotColor: "bg-slate-400" },
  { value: "In Progress", label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800", dotColor: "bg-amber-500" },
  { value: "Revision Phase", label: "Revision Phase", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800", dotColor: "bg-indigo-500" },
  { value: "Backlog", label: "Backlog", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800", dotColor: "bg-purple-500" },
  { value: "Completed", label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800", dotColor: "bg-emerald-500" },
  { value: "On Hold", label: "On Hold", color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800", dotColor: "bg-rose-500" },
];

function ShadcnStatusDropdown({
  currentStatus,
  onSelectStatus,
  isUpdating,
}: {
  currentStatus: string;
  onSelectStatus: (status: string) => void;
  isUpdating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeStage =
    STATUS_STAGES.find((st) => st.value.toLowerCase() === (currentStatus || "").toLowerCase()) ||
    STATUS_STAGES[0];

  if (isUpdating) {
    return (
      <div className="px-3 py-1.5 rounded-xl text-xs font-black border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 flex items-center gap-1.5 whitespace-nowrap">
        <Loader2 size={12} className="animate-spin text-indigo-500 shrink-0" />
        <span>Updating...</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${activeStage.color}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${activeStage.dotColor}`} />
        <span className="whitespace-nowrap">{activeStage.label}</span>
        <ChevronDown size={13} className={`ml-0.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 font-bold space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100">
          {STATUS_STAGES.map((st) => {
            const isSelected = st.value.toLowerCase() === (currentStatus || "").toLowerCase();
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => {
                  onSelectStatus(st.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-black"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${st.dotColor}`} />
                  <span>{st.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 stroke-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SyllabusPage() {
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [topicRevisions, setTopicRevisions] = useState<any[]>([]);
  const [batchedRevisions, setBatchedRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRulesetsModal, setShowRulesetsModal] = useState(false);
  const [editingSubjectRules, setEditingSubjectRules] = useState<any | null>(null);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [bulkMilestoneLabel, setBulkMilestoneLabel] = useState("");
  const [bulkMilestoneShort, setBulkMilestoneShort] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showBulkAddPanel, setShowBulkAddPanel] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<string[]>([]);

  const toggleExpandSubject = (subjectId: string) => {
    setExpandedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const cardBg = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80";
  const textTitle = "text-slate-900 dark:text-slate-100";
  const textMuted = "text-slate-500 dark:text-slate-400";

  useEffect(() => {
    fetchSyllabusData();
  }, []);

  const fetchSyllabusData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tracker");
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
        setTopicRevisions(data.topicRevisions || []);
        setBatchedRevisions(data.batchedRevisions || []);
      }
    } catch (e) {
      console.error("Failed to load syllabus data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (subjectItem: any, ruleKey: string) => {
    const toggleId = `${subjectItem.id}_${ruleKey}`;
    setTogglingKey(toggleId);
    try {
      const res = await fetch("/api/tracker/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_rule",
          id: subjectItem.id,
          ruleKey,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
      }
    } catch (e) {
      console.error("Failed to toggle rule", e);
    } finally {
      setTogglingKey(null);
    }
  };

  const handleUpdateStatus = async (subjectItem: any, newStatus: string) => {
    setUpdatingStatusId(subjectItem.id);
    try {
      const res = await fetch("/api/tracker/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          id: subjectItem.id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
        toast.success(`Status updated to "${newStatus}"`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      console.error("Failed to update status", e);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveSubjectRules = async (
    subjectId: string,
    updatedRules: ISyllabusRuleState[],
    color?: string,
    icon?: string
  ) => {
    try {
      const res = await fetch("/api/tracker/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_rules",
          id: subjectId,
          rules: updatedRules,
          color,
          icon,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
        toast.success("Subject rules updated successfully");
      } else {
        toast.error("Failed to update subject rules");
      }
    } catch (e) {
      console.error("Failed to save subject rules", e);
      toast.error("Failed to save subject rules");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/tracker/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
        toast.success("Subject deleted successfully");
      } else {
        toast.error("Failed to delete subject");
      }
    } catch (e) {
      console.error("Failed to delete subject", e);
      toast.error("Failed to delete subject");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSubjectSubmit = async (payload: any) => {
    try {
      const res = await fetch("/api/tracker/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
        setShowAddModal(false);
        toast.success("Subject created successfully!");
      } else {
        toast.error("Failed to add subject");
      }
    } catch (e) {
      console.error("Failed to add custom subject", e);
      toast.error("Failed to add subject");
    }
  };

  const getCategoryBadge = (category: string) => {
    const c = category?.toUpperCase() || "";
    if (c.includes("GS1")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    if (c.includes("GS2")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    if (c.includes("GS3")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    if (c.includes("GS4")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    if (c.includes("MATHS")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
  };

  const getCategoryColor = (category: string) => {
    const c = category?.toUpperCase() || "";
    if (c.includes("GS1")) return "#3b82f6";
    if (c.includes("GS2")) return "#10b981";
    if (c.includes("GS3")) return "#f59e0b";
    if (c.includes("GS4")) return "#a855f7";
    if (c.includes("MATHS")) return "#f43f5e";
    return "#06b6d4";
  };

  const categories = [
    { value: "ALL", label: "All Categories" },
    { value: "GS1", label: "GS Paper 1" },
    { value: "GS2", label: "GS Paper 2" },
    { value: "GS3", label: "GS Paper 3" },
    { value: "GS4", label: "GS Paper 4" },
    { value: "MATHS", label: "Maths Optional" },
    { value: "CSAT", label: "CSAT" },
  ];

  const filteredSubjects = syllabusList.filter((s) => {
    const itemCat = String(s.category || "").toLowerCase();
    const filterCat = categoryFilter.toLowerCase();
    const matchCat =
      categoryFilter === "ALL" || itemCat === filterCat || itemCat.includes(filterCat) || filterCat.includes(itemCat);
    const matchSearch =
      !searchTerm ||
      s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.source?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const visibleSubjectIds = useMemo(() => filteredSubjects.map((subject) => subject.id), [filteredSubjects]);
  const selectedVisibleCount = selectedSubjectIds.filter((id) => visibleSubjectIds.includes(id)).length;
  const selectedSubjects = useMemo(
    () => syllabusList.filter((subject) => selectedSubjectIds.includes(subject.id)),
    [syllabusList, selectedSubjectIds],
  );

  const syncSelectedSubjects = (nextIds: string[]) => {
    const uniqueIds = Array.from(new Set(nextIds));
    setSelectedSubjectIds(uniqueIds);
  };

  const toggleSubjectSelection = (subjectId: string) => {
    syncSelectedSubjects(
      selectedSubjectIds.includes(subjectId)
        ? selectedSubjectIds.filter((id) => id !== subjectId)
        : [...selectedSubjectIds, subjectId],
    );
  };

  const selectAllVisibleSubjects = () => {
    syncSelectedSubjects(Array.from(new Set([...selectedSubjectIds, ...visibleSubjectIds])));
  };

  const clearSelectedSubjects = () => {
    setSelectedSubjectIds([]);
    setBulkMilestoneLabel("");
    setBulkMilestoneShort("");
  };

  const normalizeBulkMilestoneLabel = (label: string) => label.trim().replace(/\s+/g, " ");

  const createBulkRule = (label: string, short?: string) => {
    const cleanLabel = normalizeBulkMilestoneLabel(label);
    return {
      key: cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now(),
      label: cleanLabel,
      short: (short || cleanLabel.slice(0, 5)).trim(),
      completed: false,
    };
  };

  const handleBulkAddMilestone = async () => {
    const cleanLabel = normalizeBulkMilestoneLabel(bulkMilestoneLabel);
    if (!cleanLabel || selectedSubjectIds.length === 0) return;

    setBulkSaving(true);
    try {
      const rule = createBulkRule(cleanLabel, bulkMilestoneShort);
      const targets = selectedSubjects;

      await Promise.all(
        targets.map(async (subject) => {
          const existingRules: ISyllabusRuleState[] = Array.isArray(subject.rules) ? subject.rules : [];
          const duplicate = existingRules.some((existing) => {
            const existingLabel = String(existing.label || "")
              .trim()
              .toLowerCase();
            const existingKey = String(existing.key || "")
              .trim()
              .toLowerCase();
            const ruleLabel = cleanLabel.toLowerCase();
            const ruleKey = rule.key.toLowerCase();
            return existingLabel === ruleLabel || existingKey === ruleKey;
          });

          const nextRules = duplicate ? existingRules : [...existingRules, rule];

          await fetch("/api/tracker/syllabus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update_rules",
              id: subject.id,
              rules: nextRules,
            }),
          });
        }),
      );

      await fetchSyllabusData();
      setBulkMilestoneLabel("");
      setBulkMilestoneShort("");
      setSelectedSubjectIds([]);
      setShowBulkAddPanel(false);
      toast.success("Bulk milestone added to selected subjects!");
    } catch (e) {
      console.error("Failed to bulk add milestone", e);
      toast.error("Failed to bulk add milestone");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1540px] mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
              Syllabus Matrix
            </h1>
            <p className={`text-xs ${textMuted} mt-0.5 font-medium`}>
              Track subject-wise coverage across dynamic milestone rules stored in Database.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowRulesetsModal(true)}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <Settings size={15} className="text-amber-500" />
              <span>Ruleset Templates</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (showBulkAddPanel) {
                  clearSelectedSubjects();
                }
                setShowBulkAddPanel((current) => !current);
              }}
              className={`font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer ${
                showBulkAddPanel
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-cyan-600/20"
              }`}
            >
              <Sparkles size={15} className="text-amber-300" />
              <span>Bulk Add</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
        </div>

        {/* Filter Bar & View Control */}
        <div className={`p-3 rounded-2xl border ${cardBg} shadow-xs space-y-2.5`}>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                <Filter size={14} className="text-slate-400 shrink-0 hidden sm:block mr-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all border whitespace-nowrap shrink-0 cursor-pointer ${
                      categoryFilter === cat.value
                        ? "bg-accent-gradient text-white border-transparent shadow-sm"
                        : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* View Switcher Toggle (Grid Cards vs Table) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                  title="Grid Card View"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                  title="Table View"
                >
                  <Table size={14} />
                  <span>Table</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject by title or source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 text-xs px-3.5 py-2 pl-9 rounded-xl outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {showBulkAddPanel && (
          <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black">
                  <CheckSquare size={13} /> {selectedSubjectIds.length} selected
                </span>
                <span className={`text-xs ${textMuted} font-bold`}>
                  {selectedVisibleCount} visible in current filter
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllVisibleSubjects}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition-all cursor-pointer"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSelectedSubjects();
                    setShowBulkAddPanel(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <X size={13} /> Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr_auto_auto] gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5">
                <Sparkles size={15} className="text-amber-500 shrink-0" />
                <input
                  type="text"
                  value={bulkMilestoneLabel}
                  onChange={(e) => setBulkMilestoneLabel(e.target.value)}
                  placeholder="Bulk add milestone to all selected subjects"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
              <input
                type="text"
                value={bulkMilestoneShort}
                onChange={(e) => setBulkMilestoneShort(e.target.value)}
                placeholder="Short label"
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                disabled={bulkSaving || !bulkMilestoneLabel.trim()}
                onClick={handleBulkAddMilestone}
                className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {bulkSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add to selected
              </button>
            </div>
          </div>
        )}

        {/* Matrix Table View */}
        {loading ? (
          <div className={`p-16 sm:p-20 rounded-2xl border ${cardBg} text-center space-y-4 shadow-xs`}>
            <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
            <p className={`text-sm font-bold ${textMuted}`}>Loading Syllabus Matrix...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className={`p-10 sm:p-12 rounded-2xl border ${cardBg} text-center space-y-3 shadow-xs`}>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <h4 className={`font-black text-base sm:text-lg ${textTitle}`}>No Subjects Found</h4>
            <p className={`text-xs sm:text-sm ${textMuted} max-w-sm mx-auto`}>
              No syllabus items match your current filter. Add a subject or adjust search.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Add Subject Now
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID PATTERN CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredSubjects.map((s) => {
              const rulesList: ISyllabusRuleState[] = s.rules || [];
              const subTopicsCount = topicRevisions.filter(
                (tr: any) => tr.subject?.toLowerCase() === s.subject?.toLowerCase(),
              ).length;
              const completedCount = rulesList.filter((r) => r.completed).length;
              const progressPercent = rulesList.length > 0 ? Math.round((completedCount / rulesList.length) * 100) : 0;

              const currentStatus =
                s.status ||
                (completedCount === 0
                  ? "Not Started"
                  : completedCount === rulesList.length
                    ? "Completed"
                    : "In Progress");

              const isStatusUpdating = updatingStatusId === s.id;
              const isSelected = selectedSubjectIds.includes(s.id);
              const themeColor = s.color || getCategoryColor(s.category);

              const DEFAULT_VISIBLE_RULES = 5;
              const isExpanded = expandedSubjectIds.includes(s.id);
              const visibleRules = isExpanded ? rulesList : rulesList.slice(0, DEFAULT_VISIBLE_RULES);
              const hiddenCount = rulesList.length - visibleRules.length;

              return (
                <div
                  key={s.id}
                  className={`relative rounded-2xl border ${cardBg} p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group overflow-hidden ${
                    isSelected ? "ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                  }`}
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all"
                    style={{ backgroundColor: themeColor }}
                  />

                  {/* Card Header & Title */}
                  <div className="space-y-2.5 pt-0.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {showBulkAddPanel && (
                          <button
                            type="button"
                            onClick={() => toggleSubjectSelection(s.id)}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer mt-0.5"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-indigo-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        )}

                        {(s.icon || s.color) ? (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-xs border border-black/10 dark:border-white/10"
                            style={{
                              backgroundColor: s.color ? `${s.color}22` : 'transparent',
                              borderColor: s.color ? `${s.color}44` : undefined,
                            }}
                          >
                            {s.icon ? <span>{s.icon}</span> : null}
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 text-white shadow-xs"
                            style={{ backgroundColor: themeColor }}
                          >
                            {s.subject ? s.subject.substring(0, 2).toUpperCase() : "SB"}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={() => setSelectedSubjectModal(s)}
                            className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug truncate"
                            title={s.subject}
                          >
                            {s.subject}
                          </h3>
                          {s.source && (
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              Source: {s.source}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black border inline-block whitespace-nowrap shrink-0 ${getCategoryBadge(s.category)}`}
                      >
                        {s.category}
                      </span>
                    </div>

                    {/* Status Dropdown Row */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Stage</span>
                      <ShadcnStatusDropdown
                        currentStatus={currentStatus}
                        onSelectStatus={(nextStatus) => handleUpdateStatus(s, nextStatus)}
                        isUpdating={isStatusUpdating}
                      />
                    </div>
                  </div>

                  {/* Progress Pipeline & Rules Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        Progress Pipeline
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-black">
                        {completedCount}/{rulesList.length} ({progressPercent}%)
                      </span>
                    </div>

                    {/* Dynamic Gradient Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Milestone Rules Buttons Grid */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {visibleRules.map((m) => {
                        const isDone = !!m.completed;
                        const isToggling = togglingKey === `${s.id}_${m.key}`;
                        const displayLabel = m.label || m.short || "Rule";

                        return (
                          <button
                            key={m.key}
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleRule(s, m.key)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                              isDone
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs"
                                : "bg-slate-50 text-slate-600 border-slate-200/90 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 hover:border-indigo-400"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 size={11} className="animate-spin text-indigo-500 shrink-0" />
                            ) : isDone ? (
                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                            ) : (
                              <Circle size={11} className="text-slate-300 dark:text-slate-600 shrink-0" />
                            )}
                            <span>{displayLabel}</span>
                          </button>
                        );
                      })}

                      {rulesList.length > DEFAULT_VISIBLE_RULES && (
                        <button
                          type="button"
                          onClick={() => toggleExpandSubject(s.id)}
                          className="px-2 py-0.5 rounded-lg text-[11px] font-black border transition-all flex items-center gap-1 cursor-pointer bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 whitespace-nowrap"
                        >
                          {isExpanded ? (
                            <>
                              <span>Show Less</span>
                              <ChevronUp size={12} className="shrink-0" />
                            </>
                          ) : (
                            <>
                              <span>+{hiddenCount} More</span>
                              <ChevronDown size={12} className="shrink-0" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <ActionTooltip label="View Topics">
                        <button
                          type="button"
                          onClick={() => setSelectedSubjectModal(s)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] rounded-lg font-extrabold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Table size={12} />
                          <span>({subTopicsCount})</span>
                        </button>
                      </ActionTooltip>

                      <ActionTooltip label="Customize rules for this subject">
                        <button
                          type="button"
                          onClick={() => setEditingSubjectRules(s)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Plus size={11} className="inline mr-0.5" /> Rules
                        </button>
                      </ActionTooltip>
                    </div>

                    <ActionTooltip label="Delete Subject">
                      <button
                        type="button"
                        disabled={deletingId === s.id}
                        onClick={() => confirmDeleteWithSonner(`Delete subject "${s.subject}"?`, () => handleDeleteSubject(s.id))}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {deletingId === s.id ? (
                          <Loader2 size={13} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </ActionTooltip>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MATRIX TABLE VIEW */
          <div className={`border rounded-2xl overflow-hidden shadow-xs ${cardBg}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-xs font-black text-slate-400 uppercase tracking-wider">
                    {showBulkAddPanel && <th className="py-4 px-4 w-10 text-center">Select</th>}
                    <th className="py-4 px-5 min-w-[180px]">SUBJECT</th>
                    <th className="py-4 px-4 min-w-[110px]">CATEGORY</th>
                    <th className="py-4 px-4 min-w-[160px]">STATUS STAGE</th>
                    <th className="py-4 px-5 min-w-[480px]">PROGRESS PIPELINE</th>
                    <th className="py-4 px-5 text-right min-w-[180px]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm font-medium">
                  {filteredSubjects.map((s) => {
                    const rulesList: ISyllabusRuleState[] = s.rules || [];
                    const subTopicsCount = topicRevisions.filter(
                      (tr: any) => tr.subject?.toLowerCase() === s.subject?.toLowerCase(),
                    ).length;
                    const completedCount = rulesList.filter((r) => r.completed).length;

                    // Derive active status string
                    const currentStatus =
                      s.status ||
                      (completedCount === 0
                        ? "Not Started"
                        : completedCount === rulesList.length
                          ? "Completed"
                          : "In Progress");

                    const isStatusUpdating = updatingStatusId === s.id;

                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                          selectedSubjectIds.includes(s.id) ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                        }`}
                      >
                        {showBulkAddPanel && (
                          <td className="py-4.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSubjectSelection(s.id)}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                            >
                              {selectedSubjectIds.includes(s.id) ? (
                                <CheckSquare size={17} className="text-indigo-600" />
                              ) : (
                                <Square size={17} />
                              )}
                            </button>
                          </td>
                        )}

                        {/* Subject */}
                        <td className="py-4.5 px-5 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2.5">
                            {/* Render icon & color preview ONLY if icon or color exists */}
                            {(s.icon || s.color) ? (
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 shadow-xs border border-black/10 dark:border-white/10"
                                style={{
                                  backgroundColor: s.color ? `${s.color}22` : 'transparent',
                                  borderColor: s.color ? `${s.color}44` : undefined,
                                }}
                              >
                                {s.icon ? <span>{s.icon}</span> : null}
                              </div>
                            ) : null}
                            <div className="flex flex-col">
                              <span
                                onClick={() => setSelectedSubjectModal(s)}
                                className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-black text-sm sm:text-base whitespace-nowrap"
                              >
                                {s.subject}
                              </span>
                              {s.source && (
                                <span className="text-xs text-slate-400 font-medium mt-0.5">Source: {s.source}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-black border inline-block whitespace-nowrap ${getCategoryBadge(s.category)}`}
                          >
                            {s.category}
                          </span>
                        </td>

                        {/* Status Stage Dropdown (Shadcn Popover) */}
                        <td className="py-4.5 px-4">
                          <ShadcnStatusDropdown
                            currentStatus={currentStatus}
                            onSelectStatus={(nextStatus) => handleUpdateStatus(s, nextStatus)}
                            isUpdating={isStatusUpdating}
                          />
                        </td>

                        {/* Progress Pipeline */}
                        <td className="py-4.5 px-5">
                          {(() => {
                            const DEFAULT_VISIBLE_RULES = 5;
                            const isExpanded = expandedSubjectIds.includes(s.id);
                            const visibleRules = isExpanded ? rulesList : rulesList.slice(0, DEFAULT_VISIBLE_RULES);
                            const hiddenCount = rulesList.length - visibleRules.length;

                            return (
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                {visibleRules.map((m) => {
                                  const isDone = !!m.completed;
                                  const isToggling = togglingKey === `${s.id}_${m.key}`;
                                  const displayLabel = m.label || m.short || "Rule";

                                  return (
                                    <button
                                      key={m.key}
                                      type="button"
                                      disabled={isToggling}
                                      onClick={() => handleToggleRule(s, m.key)}
                                      className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                        isDone
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-xs"
                                          : "bg-slate-50 text-slate-600 border-slate-200/90 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 hover:border-indigo-400"
                                      }`}
                                    >
                                      {isToggling ? (
                                        <Loader2 size={12} className="animate-spin text-indigo-500 shrink-0" />
                                      ) : isDone ? (
                                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                      ) : (
                                        <Circle size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                      )}
                                      <span>{displayLabel}</span>
                                    </button>
                                  );
                                })}

                                {rulesList.length > DEFAULT_VISIBLE_RULES && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandSubject(s.id)}
                                    className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black border transition-all flex items-center gap-1 cursor-pointer bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 whitespace-nowrap"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Show Less</span>
                                        <ChevronUp size={14} className="shrink-0" />
                                      </>
                                    ) : (
                                      <>
                                        <span>+{hiddenCount} More</span>
                                        <ChevronDown size={14} className="shrink-0" />
                                      </>
                                    )}
                                  </button>
                                )}

                                <span className="text-slate-400 dark:text-slate-500 text-xs font-black ml-1.5 whitespace-nowrap">
                                  {completedCount}/{rulesList.length}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedSubjectModal(s)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs rounded-xl font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                              title="View Topics"
                            >
                              <Table size={13} /> ({subTopicsCount})
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingSubjectRules(s)}
                              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                              title="Customize rules for this subject"
                            >
                              <Plus size={12} className="inline mr-0.5" /> Rules
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === s.id}
                              onClick={() => confirmDeleteWithSonner(`Delete subject "${s.subject}"?`, () => handleDeleteSubject(s.id))}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete Subject"
                            >
                              {deletingId === s.id ? (
                                <Loader2 size={14} className="animate-spin text-rose-500" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSubjectModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddSubject={handleAddSubjectSubmit}
          categories={["GS1", "GS2", "GS3", "GS4", "MATHS", "CSAT", "ESSAY", "OPTIONAL"]}
          existingSubjects={syllabusList}
          isLight={false}
          cardBg="bg-white dark:bg-slate-900"
          inputBg="bg-slate-100 dark:bg-slate-950"
          textTitle="text-slate-900 dark:text-slate-100"
          textMuted="text-slate-500 dark:text-slate-400"
        />
      )}

      {showRulesetsModal && (
        <ManageRuleSetsModal isOpen={showRulesetsModal} onClose={() => setShowRulesetsModal(false)} isLight={true} />
      )}

      {editingSubjectRules && (
        <EditSubjectRulesModal
          isOpen={!!editingSubjectRules}
          onClose={() => setEditingSubjectRules(null)}
          subjectItem={editingSubjectRules}
          existingSubjects={syllabusList}
          onSaveRules={handleSaveSubjectRules}
          isLight={true}
        />
      )}

      {selectedSubjectModal && (
        <SubjectTopicsModal
          selectedSubjectTopics={selectedSubjectModal}
          onClose={() => setSelectedSubjectModal(null)}
          topicRevisions={topicRevisions}
          batchedRevisions={batchedRevisions}
          getCategoryBadge={getCategoryBadge}
          isLight={false}
          cardBg="bg-white dark:bg-slate-900"
          tableHeaderBg="bg-slate-100 dark:bg-slate-950"
          inputBg="bg-slate-100 dark:bg-slate-950"
          textTitle="text-slate-900 dark:text-slate-100"
          textMuted="text-slate-500 dark:text-slate-400"
        />
      )}
    </div>
  );
}
