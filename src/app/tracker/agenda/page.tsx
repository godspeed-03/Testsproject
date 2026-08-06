"use client";

import React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Clock,
  Flame,
  Trash2,
  Edit2,
  Loader2,
  Check,
  Circle,
  X,
  LayoutGrid,
  List,
  Coffee,
  Eye,
} from "lucide-react";
import { useTracker, getTargetGoalLabel, calculateHabitStreak, getTodayIso, getHabitProgressColor } from "../TrackerContext";
import ShadcnDatePicker from "@/components/ui/ShadcnDatePicker";
import ShadcnSelect from "@/components/ui/ShadcnSelect";
import ActionTooltip from "@/components/ActionTooltip";

export default function AgendaPage() {
  const [layoutMode, setLayoutMode] = React.useState<"cards" | "rows">("cards");
  const [showRestDayItems, setShowRestDayItems] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedMode = localStorage.getItem("upsc_tracker_layout_mode");
      if (savedMode === "cards" || savedMode === "rows") {
        setLayoutMode(savedMode);
      }
    } catch (e) {}
  }, []);

  const handleSetLayoutMode = (mode: "cards" | "rows") => {
    setLayoutMode(mode);
    try {
      localStorage.setItem("upsc_tracker_layout_mode", mode);
    } catch (e) {}
  };
  const {
    saving,
    deletingId,
    togglingId,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    todayItems,
    weekDays,
    handlePrevWeek,
    handleNextWeek,
    handleGoToToday,
    handleDeleteHabit,
    handleOpenEditModal,
    handleItemClick,
    handleMarkRestDay,
    batchedRevisions,
  } = useTracker();

  const { isRestDayActive, completedCount, restCount } = React.useMemo(() => {
    if (!todayItems || todayItems.length === 0) return { isRestDayActive: false, completedCount: 0, restCount: 0 };
    
    let comp = 0;
    let rest = 0;
    const total = todayItems.length;

    todayItems.forEach((h: any) => {
      const hist = (h.history || []).find((entry: any) => entry.date === selectedDate);
      if (hist?.status === "done") {
        comp++;
      } else if (hist?.status === "skipped" || hist?.status === "rest") {
        rest++;
      }
    });

    const isRest = rest > 0 && (comp + rest === total);
    return { isRestDayActive: isRest, completedCount: comp, restCount: rest };
  }, [todayItems, selectedDate]);

  const cardBg = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80";
  const textTitle = "text-slate-900 dark:text-slate-100";
  const textMuted = "text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      {/* Header + Date Picker Strip */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border ${cardBg} space-y-3 shadow-xs`}>
        {/* Top Row: Date Picker on Left | View Switcher & Rest Day Action on Right */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <ShadcnDatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} disablePastDates={false} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Cards vs Row-wise View Switcher Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => handleSetLayoutMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layoutMode === "cards"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title="Card View"
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetLayoutMode("rows")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  layoutMode === "rows"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title="Row-wise View"
              >
                <List size={15} />
                <span className="hidden sm:inline">Rows</span>
              </button>
            </div>

            {/* Single Dynamic Action Button: Rest Day / Today */}
            {selectedDate === getTodayIso() ? (
              <ActionTooltip label="Mark today as Rest Day: shift uncompleted tasks to tomorrow & log habits as rest">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleMarkRestDay(selectedDate)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                >
                  <Coffee size={14} />
                  <span>Rest Day</span>
                </button>
              </ActionTooltip>
            ) : (
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 active:scale-95"
              >
                <CheckSquare size={14} />
                <span>Today</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Search tasks & Type Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-1">
          <div className="relative w-full sm:flex-1 h-[36px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 h-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none w-full"
            />
          </div>

          <div className="w-full sm:w-44 shrink-0 h-[36px]">
            <ShadcnSelect
              value={typeFilter}
              onChange={(val: string) => setTypeFilter(val as any)}
              options={[
                { value: "ALL", label: "All Items" },
                { value: "habit", label: "Habits Only" },
                { value: "task", label: "Tasks & Events" },
              ]}
            />
          </div>
        </div>

        {/* 7-Day Date Picker Strip with In-Line Prev / Next Arrows */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center shrink-0 self-stretch"
              title="Previous Week (-7 Days)"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1 min-w-0">
              {weekDays.map((w: any) => {
                const isSel = w.iso === selectedDate;
                const isSunday = w.dayName === "Sun";

                let cardBgClass = "";
                if (isSel) {
                  cardBgClass = w.isToday
                    ? "bg-accent-gradient text-white font-black shadow-md ring-2 ring-amber-400 scale-102"
                    : "bg-accent-gradient text-white font-black shadow-md scale-102";
                } else if (w.isToday) {
                  cardBgClass =
                    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-2 border-amber-500 font-extrabold shadow-xs hover:bg-amber-500/25";
                } else if (isSunday) {
                  cardBgClass =
                    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold hover:bg-rose-500/20";
                } else {
                  cardBgClass =
                    "bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 font-bold";
                }

                return (
                  <button
                    key={w.iso}
                    type="button"
                    onClick={() => setSelectedDate(w.iso)}
                    className={`py-1 px-1 sm:px-1.5 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-0.5 min-w-0 ${cardBgClass}`}
                  >
                    <span className="text-[9px] uppercase font-extrabold tracking-tight truncate w-full">{w.dayName}</span>
                    <span className="text-xs sm:text-sm font-black font-display leading-none">{w.dayNum}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center shrink-0 self-stretch"
              title="Next Week (+7 Days)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Rest Day Active Hero Banner */}
      {isRestDayActive && (
        <div className="p-8 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900 text-center space-y-4 shadow-xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Coffee size={28} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-black text-lg sm:text-xl text-amber-400 font-display">
              {completedCount > 0 ? "Partial Rest Day ☕" : `${selectedDate === getTodayIso() ? "Today" : selectedDate} is a Rest Day ☕`}
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {completedCount > 0
                ? `${completedCount} habit(s) completed on ${selectedDate}. Remaining pending items are logged as Rest so your streak stays protected!`
                : `Agenda cleared for ${selectedDate}. All pending tasks have been moved to tomorrow and recurring habits are logged as Rest so your streak stays protected!`}
            </p>
          </div>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowRestDayItems(!showRestDayItems)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer shadow-xs"
            >
              {showRestDayItems ? "Hide Rest Day Habits" : "Show Rest Day Habits"}
            </button>
          </div>
        </div>
      )}

      {/* Today Items List */}
      {(() => {
        const displayItems = isRestDayActive && !showRestDayItems
          ? todayItems.filter((h: any) => {
              const hist = (h.history || []).find((entry: any) => entry.date === selectedDate);
              return hist?.status === "done";
            })
          : todayItems;

        return (
          <div className={layoutMode === "cards" && displayItems.length > 0 ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" : "space-y-2"}>
            {displayItems.length === 0 ? (
              !isRestDayActive && (
                <div className={`p-10 rounded-2xl border ${cardBg} text-center space-y-3`}>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                    <CheckSquare size={24} />
                  </div>
                  <h4 className={`font-black text-base ${textTitle}`}>No Items Scheduled for This Day</h4>
                  <p className={`text-xs ${textMuted} max-w-sm mx-auto`}>
                    Create your first recurring habit, to-do task, or event for {selectedDate}.
                  </p>
                </div>
              )
            ) : (
              displayItems.map((h: any) => {
            const hist = (h.history || []).find((entry: any) => entry.date === selectedDate);
            const isPastDate = selectedDate < getTodayIso();
            const isDone = hist?.status === "done";
            const isSkipped = hist?.status === "skipped" || hist?.status === "rest";
            const loggedVal = hist ? hist.value || 0 : 0;
            const isFailed = !isSkipped && (hist?.status === "failed" || hist?.status === "false" || (isPastDate && !isDone && loggedVal === 0)) && loggedVal === 0;
            const isNumeric =
              h.target?.unit &&
              h.target?.unit !== "yes_no" &&
              h.target?.unit !== "boolean" &&
              h.target?.unit !== "times";

            const pTier = getHabitProgressColor(loggedVal, h.target?.value || 1, h.target?.unit, hist?.status);

            const itemCardBg = isSkipped
              ? "bg-amber-500/10 border-amber-500/40 dark:bg-amber-950/30 dark:border-amber-500/40"
              : isDone || pTier === "done"
                ? "bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-950/30 dark:border-emerald-500/40"
                : pTier === "p75"
                  ? "bg-lime-500/15 border-lime-500/50 dark:bg-lime-950/30 dark:border-lime-500/40"
                  : pTier === "p50"
                    ? "bg-amber-500/15 border-amber-500/50 dark:bg-amber-950/30 dark:border-amber-500/40"
                    : pTier === "p25"
                      ? "bg-orange-500/15 border-orange-500/50 dark:bg-orange-950/30 dark:border-orange-500/40"
                      : isFailed
                        ? "bg-rose-500/10 border-rose-500/40 dark:bg-rose-950/30 dark:border-rose-500/40"
                        : cardBg;

            const titleColorClass = isSkipped
              ? "text-amber-600 dark:text-amber-400 font-black"
              : isDone || pTier === "done"
                ? "line-through text-emerald-700 dark:text-emerald-400"
                : pTier === "p75"
                  ? "text-lime-700 dark:text-lime-400 font-black"
                  : pTier === "p50"
                    ? "text-amber-700 dark:text-amber-400 font-black"
                    : pTier === "p25"
                      ? "text-orange-700 dark:text-orange-400 font-black"
                      : isFailed
                        ? "line-through text-rose-700 dark:text-rose-400"
                        : textTitle;

            const badgeColorClass = isSkipped
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : isDone || pTier === "done"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : pTier === "p75"
                  ? "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/30"
                  : pTier === "p50"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : pTier === "p25"
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
                      : isFailed
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";

            const buttonStyleClass = isSkipped
              ? "bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-sm"
              : isDone || pTier === "done"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : pTier === "p75"
                  ? "bg-lime-500 text-slate-950 font-black shadow-md shadow-lime-500/30"
                  : pTier === "p50"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                    : pTier === "p25"
                      ? "bg-orange-500 text-white font-black shadow-md shadow-orange-500/30"
                      : isFailed
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 border border-rose-600"
                        : "bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500";

            const hasProgress = isSkipped || isDone || isFailed || pTier !== "none";
            const habitColor = h.color || null;
            const topAccentColor = isSkipped
              ? "border-t-amber-500"
              : isDone || pTier === "done"
                ? "border-t-emerald-500"
                : pTier === "p75"
                  ? "border-t-lime-500"
                  : pTier === "p50"
                    ? "border-t-amber-500"
                    : pTier === "p25"
                      ? "border-t-orange-500"
                      : isFailed
                        ? "border-t-rose-500"
                        : habitColor
                          ? ""
                          : "border-t-indigo-500";
            const topBorderStyle = !hasProgress && habitColor ? { borderTopColor: habitColor } : undefined;

            const progressBarFill = isSkipped
              ? "bg-amber-500"
              : isDone || pTier === "done"
                ? "bg-emerald-500"
                : pTier === "p75"
                  ? "bg-lime-500"
                  : pTier === "p50"
                    ? "bg-amber-500"
                    : pTier === "p25"
                      ? "bg-orange-500"
                      : isFailed
                        ? "bg-rose-500"
                        : "bg-indigo-500";

            const u = (h.target?.unit || 'times').toLowerCase().trim();
            const isTime = ['mins', 'minutes', 'min', 'minute', 'hours', 'hrs', 'hour'].includes(u);
            const loggedMins = ['hours', 'hrs', 'hour'].includes(u) ? Math.round(loggedVal * 60) : loggedVal;
            const targetMins = ['hours', 'hrs', 'hour'].includes(u) ? Math.round((h.target?.value || 1) * 60) : (h.target?.value || 1);
            const isBatchRev = Boolean(
              h.isBatchRevision ||
              h.isBatchedRevision ||
              (Array.isArray(h.selectedMicroTopicsCluster) && h.selectedMicroTopicsCluster.length > 0) ||
              (typeof h.title === 'string' && (
                /batch\s*revision/i.test(h.title) ||
                /^WEEK\s+\d+/i.test(h.title.trim()) ||
                /^\[R[123]\s+Revision\]/i.test(h.title.trim())
              ))
            );

            let batchPct = 0;
            if (isBatchRev) {
              const matchedBatch = (batchedRevisions || []).find(
                (b: any) => b.habitId === (h.id || h._id) || b.habitId === h.customId
              );
              const batchStatuses: any[] = matchedBatch && Array.isArray(matchedBatch.topicStatuses) ? matchedBatch.topicStatuses : [];
              const savedCompletedArr: string[] = Array.isArray(hist?.completedTopics) ? hist.completedTopics : [];

              const cluster = batchStatuses.length > 0
                ? batchStatuses
                : (Array.isArray(h.selectedMicroTopicsCluster) && h.selectedMicroTopicsCluster.length > 0
                    ? h.selectedMicroTopicsCluster
                    : []);

              const totalCount = cluster.length;
              if (totalCount > 0) {
                const doneCount = cluster.filter((item: any) => {
                  const topName = String(item.topic || item.topicId || "").trim().toLowerCase();
                  if (batchStatuses.length > 0) {
                    const found = batchStatuses.find((bt: any) => String(bt.topic || bt.topicId).trim().toLowerCase() === topName);
                    if (found && typeof found.isDone === "boolean") return found.isDone;
                  }
                  return savedCompletedArr.some((sk: string) => String(sk).toLowerCase().endsWith(topName));
                }).length;
                batchPct = Math.round((doneCount / totalCount) * 100);
              }
            }

            const calcPct = isTime
              ? Math.round((loggedMins / Math.max(targetMins, 1)) * 100)
              : Math.round((loggedVal / Math.max(h.target?.value || 1, 1)) * 100);
            const cardPct = isBatchRev ? (isDone ? 100 : batchPct) : (isDone ? 100 : Math.min(calcPct, 100));

            if (layoutMode === "rows") {
              return (
                <div
                  key={h.id || h._id}
                  className={`py-2 px-3.5 rounded-xl border ${itemCardBg} flex items-center justify-between gap-3 transition-all hover:border-accent-primary shadow-xs`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-inner"
                      style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}
                    >
                      {h.icon || h.category?.icon || "🏃"}
                    </div>

                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                        {h.type}
                      </span>
                      {(() => {
                        const isAugmentedTask = h.isAugmentedRevision;
                        if (isBatchRev) {
                          return (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 shrink-0 flex items-center gap-0.5">
                              ⚡ Batch Revision
                            </span>
                          );
                        } else if (h.title?.startsWith("[R1")) {
                          return (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-xs shrink-0">
                              ⚡ R1
                            </span>
                          );
                        } else if (h.title?.startsWith("[R2")) {
                          return (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white shadow-xs shrink-0">
                              ⚡ R2
                            </span>
                          );
                        } else if (h.title?.startsWith("[R3")) {
                          return (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-xs shrink-0">
                              ⚡ R3
                            </span>
                          );
                        } else if (h.isStudyTask && isAugmentedTask && h.frequency?.mode === "once") {
                          return (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                              📖 1st Read
                            </span>
                          );
                        }
                        return null;
                      })()}
                      <h4
                        onClick={() => handleItemClick(h, selectedDate)}
                        className={`font-bold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none cursor-pointer hover:text-indigo-500 transition-colors ${titleColorClass}`}
                      >
                        {h.title}
                      </h4>

                      {isNumeric ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border shrink-0 ${badgeColorClass}`}>
                          {(() => {
                            if (isTime) {
                              const formatMin = (m: number) => {
                                if (m <= 0) return '0m';
                                if (m < 60) return `${m}m`;
                                const hrs = Math.floor(m / 60);
                                const rem = m % 60;
                                if (hrs > 0 && rem > 0) return `${hrs}h ${rem}m`;
                                return `${hrs}h`;
                              };
                              return `${formatMin(loggedMins)} / ${formatMin(targetMins)}`;
                            }
                            return `${loggedVal} / ${h.target?.value || 1} ${h.target?.unit || 'times'}`;
                          })()}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black shrink-0">
                          {getTargetGoalLabel(h)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Checkbox, Edit & Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={saving || selectedDate < getTodayIso()}
                      onClick={() => handleOpenEditModal(h)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedDate < getTodayIso()
                          ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      }`}
                      title={selectedDate < getTodayIso() ? "Backdate editing disabled" : "Edit Task"}
                    >
                      <Edit2 size={14} />
                    </button>

                    {h.type !== "habit" && selectedDate >= getTodayIso() && (
                      <button
                        type="button"
                        disabled={saving || deletingId === (h.id || h._id)}
                        onClick={() => handleDeleteHabit(h.id || h._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        title="Delete Task"
                      >
                        {deletingId === (h.id || h._id) ? (
                          <Loader2 size={14} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleItemClick(h, selectedDate)}
                      title={
                        isBatchRev
                          ? "Click to Open Batch Revision Topics Modal"
                          : selectedDate < getTodayIso()
                            ? "Backdate editing is disabled"
                            : isDone
                              ? "Click to Mark as False / Missed"
                              : isFailed
                                ? "Click to Reset to None"
                                : "Click to Mark as True / Done"
                      }
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isBatchRev
                          ? "bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-300 border border-purple-500/30 shadow-xs cursor-pointer"
                          : buttonStyleClass
                      } ${selectedDate < getTodayIso() && !isBatchRev ? "cursor-not-allowed" : ""}`}
                    >
                      {togglingId === `${h.id || h._id}_${selectedDate}` ? (
                        <Loader2 size={14} className={`animate-spin ${isDone ? "text-white" : isFailed ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                      ) : isSkipped ? (
                        <Coffee size={14} className="stroke-[2.5]" />
                      ) : isDone || pTier === "done" ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : isFailed ? (
                        <X size={14} className="stroke-[3]" />
                      ) : isBatchRev ? (
                        <Eye size={15} className="stroke-[2.5] text-purple-400" />
                      ) : pTier === "p75" || pTier === "p50" || pTier === "p25" ? (
                        <Check size={14} className="stroke-[2.5]" />
                      ) : (
                        <Circle size={14} />
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            /* Syllabus Matrix Grid Card Layout (Compact 3-4 per row) */
            return (
              <div
                key={h.id || h._id}
                style={topBorderStyle}
                onClick={() => handleItemClick(h, selectedDate)}
                className={`p-2.5 sm:p-3 rounded-xl border border-t-4 ${topAccentColor} ${itemCardBg} flex flex-col justify-between gap-2 transition-all hover:border-accent-primary hover:shadow-neon-glow shadow-xs relative cursor-pointer group`}
              >
                {/* Header: Centered Type Badge & Top-Right Circular Progress Ring */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 tracking-wider">
                      {h.type}
                    </span>
                    {(() => {
                      const isAugmentedTask = h.isAugmentedRevision;
                      if (isBatchRev) {
                        return (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(h, selectedDate);
                            }}
                            className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 tracking-wider flex items-center gap-0.5 cursor-pointer hover:bg-purple-500/25 transition-colors"
                            title="Click to Manage Batch Revision Topics"
                          >
                            ⚡ Batch Revision
                          </span>
                        );
                      } else if (h.title?.startsWith("[R1")) {
                        return <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs tracking-wider">⚡ R1</span>;
                      } else if (h.title?.startsWith("[R2")) {
                        return <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs tracking-wider">⚡ R2</span>;
                      } else if (h.title?.startsWith("[R3")) {
                        return <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs tracking-wider">⚡ R3</span>;
                      } else if (h.isStudyTask && isAugmentedTask && h.frequency?.mode === "once") {
                        return <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 tracking-wider">📖 1st Read</span>;
                      }
                      return null;
                    })()}
                  </div>

                  {/* Circular Progress Ring in Top Right Corner */}
                  <div className="relative w-7 h-7 shrink-0 flex items-center justify-center" title={`${cardPct}% Progress`}>
                    <svg className="w-7 h-7 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`transition-all duration-500 ease-out ${
                          isSkipped
                            ? "text-amber-500"
                            : isDone || pTier === "done"
                              ? "text-emerald-500"
                              : pTier === "p75"
                                ? "text-lime-500"
                                : pTier === "p50"
                                  ? "text-amber-500"
                                  : pTier === "p25"
                                    ? "text-orange-500"
                                    : isFailed
                                      ? "text-rose-500"
                                      : "text-indigo-500"
                        }`}
                        strokeDasharray={`${cardPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-black font-mono text-slate-700 dark:text-slate-200">
                      {cardPct}%
                    </span>
                  </div>
                </div>

                {/* Header: Icon & Wrapped Title */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-inner mt-0.5"
                      style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}
                    >
                      {h.icon || h.category?.icon || "🏃"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => handleItemClick(h, selectedDate)}
                        className={`font-black font-display text-xs sm:text-sm leading-tight break-words cursor-pointer hover:text-indigo-500 transition-colors ${titleColorClass}`}
                      >
                        {h.title}
                      </h4>
                    </div>
                  </div>

                  {/* Goal display */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      {isNumeric ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${badgeColorClass}`}>
                          Logged: {(() => {
                            if (isTime) {
                              const formatMin = (m: number) => {
                                if (m <= 0) return '0m';
                                if (m < 60) return `${m}m`;
                                const hrs = Math.floor(m / 60);
                                const rem = m % 60;
                                if (hrs > 0 && rem > 0) return `${hrs}h ${rem}m`;
                                return `${hrs}h`;
                              };
                              return `${formatMin(loggedMins)} / ${formatMin(targetMins)}`;
                            }
                            return `${loggedVal} / ${h.target?.value || 1} ${h.target?.unit || 'times'}`;
                          })()}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black">
                          Goal: {getTargetGoalLabel(h)}
                        </span>
                      )}

                      {h.reminders && h.reminders[0] && h.reminders[0].enabled !== false && h.reminders[0].time && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          <Clock size={11} /> {h.reminders[0].time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={saving || selectedDate < getTodayIso()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(h);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        selectedDate < getTodayIso()
                          ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      }`}
                      title={selectedDate < getTodayIso() ? "Backdate editing disabled" : "Edit Task"}
                    >
                      <Edit2 size={14} />
                    </button>

                    {h.type !== "habit" && selectedDate >= getTodayIso() && (
                      <button
                        type="button"
                        disabled={saving || deletingId === (h.id || h._id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHabit(h.id || h._id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        title="Delete Task"
                      >
                        {deletingId === (h.id || h._id) ? (
                          <Loader2 size={14} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(h, selectedDate);
                    }}
                    title={
                      isBatchRev
                        ? "Click to Open Batch Revision Topics Modal"
                        : selectedDate < getTodayIso()
                          ? "Backdate editing is disabled"
                          : isDone
                            ? "Click to Mark as False / Missed"
                            : isFailed
                              ? "Click to Reset to None"
                              : "Click to Mark as True / Done"
                    }
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isBatchRev
                        ? "bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-300 border border-purple-500/30 shadow-xs cursor-pointer"
                        : buttonStyleClass
                    } ${selectedDate < getTodayIso() && !isBatchRev ? "cursor-not-allowed" : ""}`}
                  >
                    {togglingId === `${h.id || h._id}_${selectedDate}` ? (
                      <Loader2 size={14} className={`animate-spin ${isDone ? "text-white" : isFailed ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                    ) : isSkipped ? (
                      <Coffee size={15} className="stroke-[2.5]" />
                    ) : isDone || pTier === "done" ? (
                      <Check size={16} className="stroke-[3]" />
                    ) : isFailed ? (
                      <X size={16} className="stroke-[3]" />
                    ) : isBatchRev ? (
                      <Eye size={16} className="stroke-[2.5] text-purple-400" />
                    ) : pTier === "p75" || pTier === "p50" || pTier === "p25" ? (
                      <Check size={16} className="stroke-[2.5]" />
                    ) : (
                      <Circle size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  })()}
    </div>
  );
}
