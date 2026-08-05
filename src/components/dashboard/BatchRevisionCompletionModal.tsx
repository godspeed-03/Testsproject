"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, X, Sparkles, Check, Loader2, BookOpen } from "lucide-react";

interface TopicClusterItem {
  category?: string;
  subject: string;
  topic: string;
}

interface BatchRevisionCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: any;
  date: string;
  onSave: (completedTopicKeys: string[], isAllDone: boolean) => Promise<void>;
}

export default function BatchRevisionCompletionModal({
  isOpen,
  onClose,
  habit,
  date,
  onSave,
}: BatchRevisionCompletionModalProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Parse topics cluster
  const clusterItems: TopicClusterItem[] = React.useMemo(() => {
    if (!habit) return [];
    if (Array.isArray(habit.selectedMicroTopicsCluster) && habit.selectedMicroTopicsCluster.length > 0) {
      return habit.selectedMicroTopicsCluster;
    }
    if (habit.topic) {
      const parts = String(habit.topic).split(",").map((t) => t.trim()).filter(Boolean);
      return parts.map((t) => ({
        category: typeof habit.category === "string" ? habit.category : habit.category?.label || "GS",
        subject: habit.subject || "General",
        topic: t,
      }));
    }
    return [];
  }, [habit]);

  const getTopicKey = (item: TopicClusterItem) => {
    return `${item.category || ""}|${item.subject}|${item.topic}`;
  };

  useEffect(() => {
    if (isOpen && habit) {
      const hist = (habit.history || []).find((entry: any) => entry.date === date);
      const isDone = hist?.status === "done";
      const savedCompletedArr: string[] = Array.isArray(hist?.completedTopics) ? hist.completedTopics : [];

      const initialMap: Record<string, boolean> = {};
      clusterItems.forEach((item) => {
        const key = getTopicKey(item);
        if (isDone) {
          initialMap[key] = true;
        } else if (savedCompletedArr.length > 0) {
          initialMap[key] = savedCompletedArr.includes(key) || savedCompletedArr.includes(item.topic);
        } else {
          initialMap[key] = false;
        }
      });
      setCheckedMap(initialMap);
    }
  }, [isOpen, habit, date, clusterItems]);

  if (!isOpen || !habit) return null;

  const completedCount = clusterItems.filter((item) => checkedMap[getTopicKey(item)]).length;
  const totalCount = clusterItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  const toggleTopic = (key: string) => {
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    const nextMap: Record<string, boolean> = {};
    clusterItems.forEach((item) => {
      nextMap[getTopicKey(item)] = true;
    });
    setCheckedMap(nextMap);
  };

  const handleClearAll = () => {
    const nextMap: Record<string, boolean> = {};
    clusterItems.forEach((item) => {
      nextMap[getTopicKey(item)] = false;
    });
    setCheckedMap(nextMap);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const completedKeys = clusterItems
        .filter((item) => checkedMap[getTopicKey(item)])
        .map((item) => getTopicKey(item));

      await onSave(completedKeys, isAllDone);
      onClose();
    } catch (e) {
      console.error("Error saving batch revision completion:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-purple-500/30 dark:border-purple-500/40 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-purple-500/20 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs"
              style={{
                backgroundColor: habit.color ? `${habit.color}20` : "#8B5CF620",
                color: habit.color || "#8B5CF6",
                border: `1px solid ${habit.color || "#8B5CF6"}40`,
              }}
            >
              {habit.icon || "⚡"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  Batch Revision Task
                </span>
                <span className="text-[10px] font-bold text-slate-400">{date}</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate max-w-[220px]">
                {habit.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center justify-between text-xs font-black mb-1.5">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Revision Cluster Progress</span>
            </span>
            <span className={isAllDone ? "text-emerald-500" : "text-purple-600 dark:text-purple-400"}>
              {completedCount} / {totalCount} Topics ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isAllDone
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-purple-600 shadow-purple-500/30"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Topics Checklist Container */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Check completed topics below:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                ✓ Select All
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {clusterItems.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-bold">
              No specific topics found in this batch revision task.
            </div>
          ) : (
            clusterItems.map((item, idx) => {
              const key = getTopicKey(item);
              const isChecked = Boolean(checkedMap[key]);

              return (
                <div
                  key={idx}
                  onClick={() => toggleTopic(key)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? "bg-purple-500/10 border-purple-500/40 dark:bg-purple-950/30 shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 transition-all ${
                        isChecked
                          ? "bg-purple-600 shadow-xs scale-105"
                          : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      {isChecked && <Check size={12} className="stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.category && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            {item.category}
                          </span>
                        )}
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                          {item.subject}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-extrabold transition-all leading-snug mt-0.5 ${
                          isChecked
                            ? "text-purple-700 dark:text-purple-300 line-through opacity-85"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {item.topic}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                      isChecked
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isChecked ? "Done" : "Pending"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleConfirmSave}
            className={`px-5 py-2 rounded-xl text-xs font-black text-white transition-all flex items-center gap-2 shadow-md ${
              isAllDone
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
            }`}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isAllDone ? (
              <CheckCircle2 size={14} />
            ) : (
              <BookOpen size={14} />
            )}
            <span>{isAllDone ? "Complete Task (All Topics Revised)" : `Save Progress (${completedCount}/${totalCount})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
