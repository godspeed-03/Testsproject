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
} from "lucide-react";
import { ISyllabusRuleState } from "@/models/SyllabusItem";

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
      }
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveSubjectRules = async (subjectId: string, updatedRules: ISyllabusRuleState[]) => {
    try {
      const res = await fetch("/api/tracker/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_rules",
          id: subjectId,
          rules: updatedRules,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
      }
    } catch (e) {
      console.error("Failed to save subject rules", e);
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
      }
    } catch (e) {
      console.error("Failed to delete subject", e);
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
      }
    } catch (e) {
      console.error("Failed to add custom subject", e);
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
    } catch (e) {
      console.error("Failed to bulk add milestone", e);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${textTitle}`}>
              Syllabus Matrix
            </h1>
            <p className={`text-xs sm:text-sm ${textMuted} mt-1 font-medium`}>
              Track subject-wise coverage across dynamic milestone rules stored in Database.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowRulesetsModal(true)}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
            >
              <Settings size={16} className="text-amber-500" />
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
              className={`font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 border shadow-sm transition-all cursor-pointer ${
                showBulkAddPanel
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-cyan-600/20"
              }`}
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>Bulk Add</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus size={18} /> Add Subject
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className={`p-4 rounded-2xl border ${cardBg} shadow-xs`}>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
              <Filter size={15} className="text-slate-400 shrink-0 hidden sm:block mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all border whitespace-nowrap shrink-0 cursor-pointer ${
                    categoryFilter === cat.value
                      ? "bg-accent-gradient text-white border-transparent shadow-md"
                      : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject by title or source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 text-xs sm:text-sm px-4 py-2.5 pl-10 rounded-xl outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-colors"
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
        ) : (
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
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {rulesList.map((m) => {
                              const isDone = !!m.completed;
                              const isToggling = togglingKey === `${s.id}_${m.key}`;
                              const displayCode = m.short || m.label || "R";

                              return (
                                <div key={m.key} className="relative group inline-block">
                                  <button
                                    type="button"
                                    disabled={isToggling}
                                    onClick={() => handleToggleRule(s, m.key)}
                                    className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                                      isDone
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-xs"
                                        : "bg-slate-50 text-slate-500 border-slate-200/90 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 hover:border-indigo-400"
                                    }`}
                                  >
                                    {isToggling ? (
                                      <Loader2 size={12} className="animate-spin text-indigo-500 shrink-0" />
                                    ) : isDone ? (
                                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    ) : (
                                      <Circle size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                    )}
                                    <span>{displayCode}</span>
                                  </button>

                                  {/* Custom Tooltip on Hover */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none whitespace-nowrap">
                                    <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 dark:border-slate-300 flex items-center gap-1.5">
                                      <span>{m.label}</span>
                                      {isDone && <span className="text-emerald-400 dark:text-emerald-600 font-black">(Completed)</span>}
                                    </div>
                                    <div className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45 mx-auto -mt-1" />
                                  </div>
                                </div>
                              );
                            })}

                            <span className="text-slate-400 dark:text-slate-500 text-xs font-black ml-1.5 whitespace-nowrap">
                              {completedCount}/{rulesList.length}
                            </span>
                          </div>
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
                              onClick={() => handleDeleteSubject(s.id)}
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
          onSaveRules={handleSaveSubjectRules}
          isLight={true}
        />
      )}

      {selectedSubjectModal && (
        <SubjectTopicsModal
          selectedSubjectTopics={selectedSubjectModal}
          onClose={() => setSelectedSubjectModal(null)}
          topicRevisions={topicRevisions}
          onBatchLogCluster={async () => {}}
          onDeleteTopic={async () => {}}
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
