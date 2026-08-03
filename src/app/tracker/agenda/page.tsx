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
} from "lucide-react";
import { useTracker, getTargetGoalLabel, calculateHabitStreak } from "../TrackerContext";
import ShadcnDatePicker from "@/components/ui/ShadcnDatePicker";
import ShadcnSelect from "@/components/ui/ShadcnSelect";

export default function AgendaPage() {
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
  } = useTracker();

  const cardBg = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80";
  const textTitle = "text-slate-900 dark:text-slate-100";
  const textMuted = "text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      {/* Header + Date Picker Strip */}
      <div className={`p-5 rounded-2xl border ${cardBg} space-y-4 shadow-xs`}>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <ShadcnDatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} disablePastDates={false} />
          </div>

          {/* Search & Type Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none w-full"
              />
            </div>

            <div className="w-full sm:w-36">
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
        </div>

        {/* 7-Day Date Picker Strip with In-Line Prev / Next Arrows */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {selectedDate !== new Date().toISOString().split("T")[0] && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-2.5 py-1 rounded-lg bg-accent-light text-accent-primary border border-accent-primary/30 text-xs font-black hover:opacity-90 transition-all"
              >
                Jump to Today
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-2 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center shrink-0 self-stretch"
              title="Previous Week (-7 Days)"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1">
              {weekDays.map((w: any) => {
                const isSel = w.iso === selectedDate;
                const isSunday = w.dayName === "Sun";

                let cardBgClass = "";
                if (isSel) {
                  cardBgClass = w.isToday
                    ? "bg-accent-gradient text-white font-black shadow-lg ring-2 ring-amber-400 scale-105"
                    : "bg-accent-gradient text-white font-black shadow-lg scale-105";
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
                    className={`py-1.5 px-2 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${cardBgClass}`}
                  >
                    <span className="text-[10px] uppercase font-extrabold">{w.dayName}</span>
                    <span className="text-sm sm:text-base font-black font-display">{w.dayNum}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNextWeek}
              className="p-2 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center shrink-0 self-stretch"
              title="Next Week (+7 Days)"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Today Items List */}
      <div className="space-y-3">
        {todayItems.length === 0 ? (
          <div className={`p-10 rounded-2xl border ${cardBg} text-center space-y-3`}>
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <CheckSquare size={24} />
            </div>
            <h4 className={`font-black text-base ${textTitle}`}>No Items Scheduled for This Day</h4>
            <p className={`text-xs ${textMuted} max-w-sm mx-auto`}>
              Create your first recurring habit, to-do task, or event for {selectedDate}.
            </p>
          </div>
        ) : (
          todayItems.map((h: any) => {
            const hist = (h.history || []).find((entry: any) => entry.date === selectedDate);
            const isDone = hist?.status === "done";
            const loggedVal = hist ? hist.value || 0 : 0;
            const isNumeric =
              h.target?.unit &&
              h.target?.unit !== "yes_no" &&
              h.target?.unit !== "boolean" &&
              h.target?.unit !== "times";

            return (
              <div
                key={h.id || h._id}
                className={`p-4 rounded-2xl border ${cardBg} flex items-center justify-between gap-4 transition-all hover:border-accent-primary hover:shadow-neon-glow shadow-xs`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Icon Badge */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                    style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}
                  >
                    {h.icon || h.category?.icon || "🏃"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {h.type}
                      </span>
                      {(() => {
                        const isAugmentedTask = h.isAugmentedRevision;

                        if (h.title?.startsWith("[R1")) {
                          return (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs flex items-center gap-1">
                              ⚡ 1st Revision (R1)
                            </span>
                          );
                        } else if (h.title?.startsWith("[R2")) {
                          return (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white shadow-xs flex items-center gap-1">
                              ⚡ 2nd Revision (R2)
                            </span>
                          );
                        } else if (h.title?.startsWith("[R3")) {
                          return (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                              ⚡ 3rd Revision (R3)
                            </span>
                          );
                        } else if (h.isStudyTask && isAugmentedTask && h.frequency?.mode === "once") {
                          return (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              📖 1st Read
                            </span>
                          );
                        } else {
                          return null;
                        }
                        return null;
                      })()}
                      <h4
                        className={`font-black font-display text-sm sm:text-base truncate max-w-[180px] sm:max-w-none ${isDone ? "line-through opacity-60" : textTitle}`}
                      >
                        {h.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold flex-wrap">
                      {isNumeric ? (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${
                            loggedVal > 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                          }`}
                        >
                          Logged: {loggedVal} / {h.target?.value || 1} {h.target?.unit || "times"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-black">
                          Goal: {getTargetGoalLabel(h)}
                        </span>
                      )}

                      {h.reminders && h.reminders[0] && h.reminders[0].enabled !== false && h.reminders[0].time && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                          <Clock size={12} /> {h.reminders[0].time}
                        </span>
                      )}
                      {calculateHabitStreak(h).current > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                          <Flame size={12} /> {calculateHabitStreak(h).current}d streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Checkbox, Edit & Delete Buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    disabled={saving || selectedDate < new Date().toISOString().split("T")[0]}
                    onClick={() => handleOpenEditModal(h)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedDate < new Date().toISOString().split("T")[0]
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"
                        : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    }`}
                    title={
                      selectedDate < new Date().toISOString().split("T")[0]
                        ? "Backdate editing is disabled"
                        : "Edit Task"
                    }
                  >
                    <Edit2 size={16} />
                  </button>

                  {h.type !== "habit" && (
                    <button
                      type="button"
                      disabled={saving || deletingId === (h.id || h._id)}
                      onClick={() => {
                        handleDeleteHabit(h.id || h._id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                      title="Delete Task & Topic Data"
                    >
                      {deletingId === (h.id || h._id) ? (
                        <Loader2 size={16} className="animate-spin text-rose-500" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}

                  {selectedDate < new Date().toISOString().split("T")[0] && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic pr-1">
                      Past date (read-only)
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={saving || selectedDate < new Date().toISOString().split("T")[0]}
                    onClick={() => handleItemClick(h, selectedDate)}
                    title={
                      selectedDate < new Date().toISOString().split("T")[0]
                        ? "Backdate editing is disabled"
                        : "Log completion"
                    }
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                      selectedDate < new Date().toISOString().split("T")[0]
                        ? "opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400"
                        : isDone
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                    }`}
                  >
                    {togglingId === `${h.id || h._id}_${selectedDate}` ? (
                      <Loader2 size={18} className={`animate-spin ${isDone ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                    ) : isDone ? (
                      <Check size={20} className="stroke-[3]" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
