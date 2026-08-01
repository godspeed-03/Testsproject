"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { ISyllabusRuleState } from "@/models/SyllabusItem";

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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [bulkMilestoneLabel, setBulkMilestoneLabel] = useState("");
  const [bulkMilestoneShort, setBulkMilestoneShort] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showBulkAddPanel, setShowBulkAddPanel] = useState(false);
  const [expandedRuleSubjectIds, setExpandedRuleSubjectIds] = useState<string[]>([]);

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
    if (c.includes("GS1")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    if (c.includes("GS2")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    if (c.includes("GS3")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    if (c.includes("GS4")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    if (c.includes("MATHS")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
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

  const toggleExpandedRules = (subjectId: string) => {
    setExpandedRuleSubjectIds((current) =>
      current.includes(subjectId) ? current.filter((id) => id !== subjectId) : [...current, subjectId],
    );
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
      <div className="max-w-370 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
              Syllabus Matrix
            </h1>
            <p className={`text-[10px] sm:text-xs ${textMuted} mt-0.5 sm:mt-1`}>
              Track subject-wise coverage across dynamic milestone rules stored in Database.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowRulesetsModal(true)}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
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
              className={`font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border shadow-sm transition-all ${
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all shrink-0 active:scale-95"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className={`p-3 sm:p-4 rounded-2xl border ${cardBg} shadow-xs`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
              <Filter size={14} className="text-slate-400 shrink-0 hidden sm:block" />
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all border whitespace-nowrap shrink-0 ${
                    categoryFilter === cat.value
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                      : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 text-xs px-3.5 py-2.5 pl-8 rounded-xl outline-none font-bold border border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {showBulkAddPanel && (
          <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  <CheckSquare size={12} /> {selectedSubjectIds.length} selected
                </span>
                <span className={`text-[10px] sm:text-xs ${textMuted} font-bold`}>
                  {selectedVisibleCount} visible in current filter
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllVisibleSubjects}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition-all"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSelectedSubjects();
                    setShowBulkAddPanel(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition-all inline-flex items-center gap-1"
                >
                  <X size={12} /> Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr_auto_auto] gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
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
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                disabled={bulkSaving || !bulkMilestoneLabel.trim()}
                onClick={handleBulkAddMilestone}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black transition-all inline-flex items-center justify-center gap-1.5"
              >
                {bulkSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add to selected
              </button>
            </div>
          </div>
        )}

        {/* Subject Cards */}
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
            <p className={`text-xs ${textMuted} max-w-sm mx-auto`}>
              No syllabus items match your current filter. Add a subject or adjust search.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus size={15} /> Add Subject Now
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredSubjects.map((s) => {
              const rulesList: ISyllabusRuleState[] = s.rules || [];
              const subTopicsCount = topicRevisions.filter(
                (tr: any) => tr.subject?.toLowerCase() === s.subject?.toLowerCase(),
              ).length;
              const completedCount = rulesList.filter((r) => r.completed).length;

              return (
                <div
                  key={s.id}
                  className={`p-4 sm:p-5 rounded-2xl border ${cardBg} space-y-3 sm:space-y-4 shadow-xs transition-all ${
                    selectedSubjectIds.includes(s.id)
                      ? "ring-2 ring-indigo-500/30 border-indigo-300 dark:border-indigo-800"
                      : ""
                  }`}
                >
                  {/* Subject Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      {showBulkAddPanel && (
                        <button
                          type="button"
                          onClick={() => toggleSubjectSelection(s.id)}
                          className="shrink-0 w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-indigo-500 transition-all flex items-center justify-center text-slate-400 hover:text-indigo-600"
                          title={selectedSubjectIds.includes(s.id) ? "Deselect subject" : "Select subject"}
                        >
                          {selectedSubjectIds.includes(s.id) ? (
                            <CheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      )}
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border uppercase tracking-wider shrink-0 ${getCategoryBadge(s.category)}`}
                      >
                        {s.category}
                      </span>
                      <div className="min-w-0">
                        <h3
                          onClick={() => setSelectedSubjectModal(s)}
                          className={`font-black text-sm sm:text-base lg:text-lg ${textTitle} cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate`}
                          title="Click to view revision topics"
                        >
                          {s.subject}
                        </h3>
                        {s.source && (
                          <p className={`text-[9px] sm:text-[10px] ${textMuted} font-bold mt-0.5 truncate`}>
                            Source: <span className="text-slate-700 dark:text-slate-300">{s.source}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto">
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border ${
                          rulesList.length > 0 && completedCount === rulesList.length
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : completedCount > 0
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : "bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {completedCount}/{rulesList.length}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedSubjectModal(s)}
                        className="px-2.5 sm:px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] sm:text-xs rounded-xl font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all"
                      >
                        <Table size={12} /> <span className="hidden sm:inline">Topics</span> ({subTopicsCount})
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === s.id}
                        onClick={() => handleDeleteSubject(s.id)}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        title="Delete Subject"
                      >
                        {deletingId === s.id ? (
                          <Loader2 size={14} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Milestone Pills — rendered dynamically from DB */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    {rulesList.slice(0, expandedRuleSubjectIds.includes(s.id) ? rulesList.length : 5).map((m) => {
                      const isDone = !!m.completed;
                      const isToggling = togglingKey === `${s.id}_${m.key}`;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleRule(s, m.key)}
                          className={`px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs transition-all flex items-center justify-center gap-0.5 sm:gap-1 border font-extrabold disabled:opacity-60 ${
                            isDone
                              ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                              : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : isDone ? (
                            <Check size={11} className="text-white shrink-0 stroke-3" />
                          ) : null}
                          <span className="truncate sm:hidden">{m.short || m.label}</span>
                          <span className="truncate hidden sm:inline">{m.label}</span>
                        </button>
                      );
                    })}

                    {rulesList.length > 5 && !expandedRuleSubjectIds.includes(s.id) && (
                      <button
                        type="button"
                        onClick={() => toggleExpandedRules(s.id)}
                        className="px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-black transition-all flex items-center justify-center gap-1 shrink-0"
                      >
                        +{rulesList.length - 5} more
                      </button>
                    )}

                    {rulesList.length > 5 && expandedRuleSubjectIds.includes(s.id) && (
                      <button
                        type="button"
                        onClick={() => toggleExpandedRules(s.id)}
                        className="px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-black transition-all flex items-center justify-center gap-1 shrink-0"
                      >
                        Show less
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingSubjectRules(s)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-black transition-all flex items-center justify-center gap-1 shrink-0"
                      title="Add or Customize Rules for this Subject"
                    >
                      <Plus size={12} /> Add Rule
                    </button>
                  </div>
                </div>
              );
            })}
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
