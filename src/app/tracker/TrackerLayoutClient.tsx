'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckSquare,
  Flame,
  Calendar as CalendarIcon,
  BarChart3,
  ListTodo,
  Timer as TimerIcon,
  Plus,
  TrendingUp,
  Loader2,
  X,
  PlusCircle,
  Save,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Edit3,
  FileCode
} from 'lucide-react';
import { useTracker, getTargetGoalLabel, calculateHabitStreak } from './TrackerContext';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';
import ShadcnSelect from '@/components/ui/ShadcnSelect';
import ShadcnTimePicker from '@/components/ui/ShadcnTimePicker';
import TimetableCodeEditorModal from '@/components/TimetableCodeEditorModal';
import {
  SUBJECT_COLOR_OPTIONS,
  NON_SUBJECT_COLOR_OPTIONS,
  getSubjectTheme
} from '@/lib/subjectThemeMap';

export default function TrackerLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    habits,
    lists,
    loading,
    saving,
    todayItems,
    selectedDate,
    showCreateModal,
    setShowCreateModal,
    createType,
    setCreateType,
    formTitle,
    setFormTitle,
    formCategory,
    setFormCategory,
    formDescription,
    setFormDescription,
    formPriority,
    setFormPriority,
    formFrequencyMode,
    setFormFrequencyMode,
    formFrequencyDays,
    setFormFrequencyDays,
    formMonthlyDay,
    setFormMonthlyDay,
    formTargetVal,
    setFormTargetVal,
    formTargetUnit,
    setFormTargetUnit,
    formCustomUnit,
    setFormCustomUnit,
    formEnableReminder,
    setFormEnableReminder,
    formReminderTime,
    setFormReminderTime,
    formStartDate,
    setFormStartDate,
    formEndDate,
    setFormEndDate,
    formIcon,
    setFormIcon,
    formColor,
    setFormColor,
    categories,
    syllabusSubjects,
    syllabusItems,
    formIsStudyTask,
    setFormIsStudyTask,
    formSubject,
    setFormSubject,
    formTopic,
    setFormTopic,
    formIsAugmentedRevision,
    setFormIsAugmentedRevision,
    showProgressModal,
    setShowProgressModal,
    progressModalHabit,
    progressModalDate,
    progressModalValue,
    setProgressModalValue,
    existingModalVal,
    progressModalMode,
    setProgressModalMode,
    selectedHabitForDetail,
    setSelectedHabitForDetail,
    habitDetailTab,
    setHabitDetailTab,
    editingHabitId,
    handleCreateSubmit,
    handleSaveHabitProgress,
    handleDeleteHabit,
    handleOpenCreateModal,
    getFilteredCategorySubjects,
    fetchTrackerData
  } = useTracker();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('all');
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      handleOpenCreateModal();
    };
    window.addEventListener('open-create-modal', handleOpen);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('create') === 'true') {
        handleOpenCreateModal();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    return () => window.removeEventListener('open-create-modal', handleOpen);
  }, [handleOpenCreateModal]);

  useEffect(() => {
    if (formIsStudyTask) {
      setShowEmojiPicker(false);
    }
  }, [formIsStudyTask]);

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  const navTabs = [
    { href: '/tracker/agenda', label: 'Today Agenda', icon: CheckSquare, badge: todayItems.length },
    { href: '/tracker/habits', label: 'Habits & Streaks', icon: Flame, badge: habits.filter((h: any) => h.type === 'habit').length },
    { href: '/tracker/calendar', label: 'Month Calendar', icon: CalendarIcon },
    { href: '/tracker/analytics', label: 'Analytics & Scores', icon: BarChart3 },
    { href: '/tracker/checklist', label: 'Checklists', icon: ListTodo, badge: lists.length },
    { href: '/tracker/focus', label: 'Focus Timer', icon: TimerIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <h1 className={`text-xl sm:text-3xl font-black font-display tracking-tight ${textTitle}`}>
              Habit & Task Module
            </h1>
            <p className={`text-xs sm:text-sm ${textMuted} mt-0.5`}>
              Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {saving && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold animate-pulse shadow-xs shrink-0">
                <Loader2 size={14} className="animate-spin text-indigo-500 shrink-0" />
                <span>Syncing to DB...</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleOpenCreateModal('task')}
              className="w-full sm:w-auto bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> New Habit or Task
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Pill Navigation Bar (<768px) with Touch Snap & Smooth Scroll */}
        <div className="md:hidden overflow-x-auto flex items-center gap-2 pb-1 pt-0.5 scrollbar-none -mx-4 px-4 snap-x snap-mandatory">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || (pathname === '/tracker' && tab.href === '/tracker/agenda');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 snap-start flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  active
                    ? 'bg-accent-gradient text-white shadow-neon-glow'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar + Content Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
            {/* Sidebar Route Tabs Navigation */}
            <div className={`p-3 rounded-2xl border ${cardBg} space-y-1.5 shadow-xs`}>
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.href || (pathname === '/tracker' && tab.href === '/tracker/agenda');
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                      active
                        ? 'bg-accent-gradient text-white shadow-neon-glow'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Mini Stats Card */}
            {(() => {
              const isTimeBasedUnit = (h: any) => {
                const unit = (h.target?.unit || '').toLowerCase().trim();
                return ['hours', 'hrs', 'hour', 'mins', 'minutes', 'min', 'minute'].includes(unit);
              };

              // Calculate ONLY time-based task logged hours for todayItems on selectedDate
              const totalTodayLoggedHours = todayItems.reduce((acc: number, h: any) => {
                if (!isTimeBasedUnit(h)) return acc;

                const entry = (h.history || []).find((e: any) => e.date === selectedDate);
                if (!entry) return acc;

                const val = Number(entry.value || 0);
                if (val <= 0 && entry.status !== 'done') return acc;

                const unit = (h.target?.unit || '').toLowerCase().trim();
                const effectiveVal = val > 0 ? val : (entry.status === 'done' ? Number(h.target?.value || 0) : 0);

                if (['mins', 'minutes', 'min', 'minute'].includes(unit)) {
                  return acc + effectiveVal / 60;
                }
                return acc + effectiveVal;
              }, 0);

              const formatHoursAndMins = (hrsDecimal: number) => {
                if (hrsDecimal <= 0) return '0 mins';
                const totalMins = Math.round(hrsDecimal * 60);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                if (h > 0 && m > 0) return `${h} hr ${m} mins`;
                if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
                return `${m} mins`;
              };

              // Calculate total target hours for todayItems on selectedDate
              const totalTodayTargetHours = todayItems.reduce((acc: number, h: any) => {
                if (!isTimeBasedUnit(h)) return acc;

                const unit = (h.target?.unit || '').toLowerCase().trim();
                const tgt = Number(h.target?.value || 0);

                if (['mins', 'minutes', 'min', 'minute'].includes(unit)) {
                  return acc + tgt / 60;
                }
                return acc + tgt;
              }, 0);

              const doneCount = todayItems.filter((h: any) =>
                (h.history || []).some((hist: any) => hist.date === selectedDate && hist.status === 'done')
              ).length;

              return (
                <div className={`p-4 rounded-2xl border ${cardBg} space-y-3 shadow-xs`}>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${textMuted} flex items-center gap-1.5`}>
                    <TrendingUp size={14} className="text-amber-500" /> Daily Target
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={textMuted}>Today's Completion</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        {doneCount} / {todayItems.length} Done
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-quaternary transition-all duration-500"
                        style={{
                          width: `${todayItems.length > 0 ? (doneCount / todayItems.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <span className={textMuted}>Hours Read Today</span>
                      <span className="text-accent-quaternary font-black">
                        {formatHoursAndMins(totalTodayLoggedHours)} {totalTodayTargetHours > 0 ? `/ ${formatHoursAndMins(totalTodayTargetHours)}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </aside>

          {/* Main Content Area */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {loading ? (
              <div className={`p-12 rounded-2xl border ${cardBg} text-center space-y-3`}>
                <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
                <p className={`text-sm font-bold ${textMuted}`}>Loading Habit & Task Ecosystem...</p>
              </div>
            ) : (
              children
            )}
          </section>
        </div>
      </div>

      {/* CREATE / EDIT ITEM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-xl max-h-[92vh] flex flex-col p-5 sm:p-6 rounded-3xl border ${cardBg} shadow-2xl space-y-4 bg-white/95 dark:bg-slate-900/95`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between shrink-0 pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className={`text-lg sm:text-xl font-black tracking-tight ${textTitle}`}>
                  {editingHabitId ? 'Edit Habit / Task' : 'Create New Tracker Item'}
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>Define schedule, target goals, and syllabus categories.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Type Selector Segmented Tabs */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shrink-0">
              {[
                { id: 'habit', label: 'Recurring Habit', icon: '🔥' },
                { id: 'task', label: 'One-time Task', icon: '📝' },
                { id: 'list', label: 'Checklist List', icon: '📋' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setCreateType(t.id as any);
                    if (t.id === 'task') {
                      setFormFrequencyMode('once');
                      setFormIsStudyTask(true);
                    } else if (t.id === 'habit') {
                      setFormFrequencyMode('daily');
                      setFormIsStudyTask(false);
                      if (formTitle === formSubject || (formSubject && formTitle.startsWith(formSubject))) {
                        setFormTitle('');
                      }
                    } else if (t.id === 'list') {
                      setFormIsStudyTask(false);
                      if (formTitle === formSubject || (formSubject && formTitle.startsWith(formSubject))) {
                        setFormTitle('');
                      }
                    }
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    createType === t.id
                      ? 'bg-accent-secondary text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs scrollbar-thin">
              {createType === 'list' ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Checklist Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mains Paper 1 Revision Topics"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Task / Habit Mode selection (Only for One-Time Tasks) */}
                  {createType === 'task' && formFrequencyMode === 'once' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/5 border border-indigo-500/20 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎓</span>
                          <span className="font-black text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm">Link to UPSC Syllabus Matrix?</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsStudyTask}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormIsStudyTask(checked);
                              if (checked) {
                                setFormFrequencyMode('once');
                              } else {
                                if (formTitle === formSubject || (formSubject && formTitle.startsWith(formSubject))) {
                                  setFormTitle('');
                                }
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {formIsStudyTask && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                              <ShadcnSelect
                                value={typeof formCategory === 'string' ? formCategory : (formCategory?.label || '')}
                                onChange={(val: string) => {
                                  const newCatObj = { id: val.toLowerCase(), label: val, icon: '📚', color: '#6366F1' };
                                  setFormCategory(newCatObj);
                                  const matchedSubjects = (syllabusItems || [])
                                    .filter((item: any) => {
                                      const itemCat = String(item.category || '').trim();
                                      return itemCat.toLowerCase() === val.trim().toLowerCase();
                                    })
                                    .map((item: any) => item.subject)
                                    .filter(Boolean);

                                  const nextSubject = matchedSubjects.length > 0 ? matchedSubjects[0] : '';
                                  setFormSubject(nextSubject);

                                  const autoTitle = nextSubject && formTopic ? `${nextSubject}: ${formTopic}` : (nextSubject || formTopic);
                                  if (autoTitle) setFormTitle(autoTitle);
                                }}
                                options={categories.map((c: string) => ({ value: c, label: c }))}
                              />
                            </div>

                            <div>
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                              <ShadcnSelect
                                value={formSubject}
                                onChange={(val: string) => {
                                  setFormSubject(val);
                                  const autoTitle = val && formTopic ? `${val}: ${formTopic}` : (val || formTopic);
                                  if (autoTitle) setFormTitle(autoTitle);
                                  const theme = getSubjectTheme(val);
                                  if (theme) {
                                    setFormColor(theme.color);
                                    setFormIcon(theme.icon);
                                  }
                                  const matchedItem = (syllabusItems || []).find((item: any) => item.subject?.toLowerCase() === val.toLowerCase());
                                  if (matchedItem?.category) {
                                    setFormCategory({ id: matchedItem.category.toLowerCase(), label: matchedItem.category, icon: '📚', color: '#6366F1' });
                                  }
                                }}
                                options={
                                  getFilteredCategorySubjects().length > 0
                                    ? getFilteredCategorySubjects().map((s: string) => ({ value: s, label: s }))
                                    : syllabusSubjects.map((s: string) => ({ value: s, label: s }))
                                }
                              />
                            </div>

                            <div>
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Topic Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Ocean Currents & Tides"
                                value={formTopic}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormTopic(val);
                                  const autoTitle = formSubject && val ? `${formSubject}: ${val}` : (val || formSubject);
                                  if (autoTitle) setFormTitle(autoTitle);
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* Augmented Revision SRS Toggle */}
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-indigo-500/20">
                            <div>
                              <span className="font-black text-slate-800 dark:text-slate-200 block text-xs">
                                Spaced Repetition SRS (R1, R2, R3)?
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                              <input
                                type="checkbox"
                                checked={formIsAugmentedRevision}
                                onChange={(e) => setFormIsAugmentedRevision(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Title & Icon Input */}
                  <div className={createType === 'habit' || !formIsStudyTask ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 items-start' : 'grid grid-cols-1 gap-3'}>
                    <div className="min-w-0">
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Title</label>

                      <div className="relative min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Icon button on left of title */}
                          {createType === 'habit' || !formIsStudyTask ? (
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              title="Click to select icon & color"
                              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1 hover:border-indigo-500 transition-all shrink-0 active:scale-95 shadow-2xs cursor-pointer"
                              style={{ borderColor: formColor || undefined }}
                            >
                              <span>{formIcon || '🏃'}</span>
                              <span className="text-[9px] text-slate-400">▾</span>
                            </button>
                          ) : (
                            <div
                              title="Fixed Icon & Theme Color from Syllabus Matrix"
                              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1 shrink-0 cursor-not-allowed opacity-90 shadow-2xs"
                              style={{ borderColor: formColor || '#6366F1', backgroundColor: formColor ? `${formColor}15` : undefined }}
                            >
                              <span>{formIcon || '📚'}</span>
                            </div>
                          )}

                          {/* Title Input */}
                          <input
                            type="text"
                            placeholder={createType === 'habit' ? 'e.g., Daily Answer Writing' : 'Task Title'}
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all"
                          />
                        </div>

                        {/* Floating Popover: Icon & Theme Color Selector */}
                        {showEmojiPicker && (createType === 'habit' || !formIsStudyTask) && (
                          <div className="absolute top-full left-0 mt-1.5 w-80 sm:w-[420px] max-w-[calc(100vw-2.5rem)] p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-3 animate-fade-in z-[99999]">
                            {/* Popover Header */}
                            <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span>Customize Icon & Color</span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                  {formIsStudyTask ? 'Subject Palette (35)' : 'Custom Palette (10)'}
                                </span>
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
                            {(() => {
                              const takenColors = (habits || [])
                                .filter((h: any) => (editingHabitId ? (h._id || h.id) !== editingHabitId : true) && h.color)
                                .map((h: any) => String(h.color).toLowerCase().trim());

                              const colorsToDisplay = formIsStudyTask ? SUBJECT_COLOR_OPTIONS : NON_SUBJECT_COLOR_OPTIONS;

                              return (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <span>Theme Color Palette</span>
                                    <span>{formIsStudyTask ? 'UPSC Colors' : 'Non-UPSC Colors'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                    {colorsToDisplay.map((c) => {
                                      const isTaken = takenColors.includes(c.toLowerCase().trim()) && formColor?.toLowerCase().trim() !== c.toLowerCase().trim();
                                      const isSelected = formColor?.toLowerCase().trim() === c.toLowerCase().trim();

                                      return (
                                        <button
                                          key={c}
                                          type="button"
                                          disabled={isTaken}
                                          onClick={() => {
                                            if (!isTaken) setFormColor(c);
                                          }}
                                          title={isTaken ? 'Color assigned to another subject/item (Taken)' : c}
                                          className={`relative w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                                            isTaken
                                              ? 'opacity-30 cursor-not-allowed border border-rose-500/50'
                                              : isSelected
                                              ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md cursor-pointer'
                                              : 'hover:scale-110 opacity-75 hover:opacity-100 cursor-pointer'
                                          }`}
                                          style={{ backgroundColor: c }}
                                        >
                                          {isTaken && <span className="text-[8px] leading-none text-white font-black">🚫</span>}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Category Filter Tabs */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Icon</span>
                                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                                  {[
                                    { id: 'all', label: 'All', icon: '✨' },
                                    { id: 'study', label: 'Study', icon: '📚' },
                                    { id: 'sports', label: 'Sports', icon: '🏃' },
                                    { id: 'health', label: 'Health', icon: '🥗' },
                                    { id: 'tools', label: 'Tools', icon: '🎯' }
                                  ].map((tab) => (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      onClick={() => setActiveEmojiTab(tab.id)}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                                        activeEmojiTab === tab.id
                                          ? 'bg-accent-gradient shadow-neon-glow'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      <span>{tab.icon}</span>
                                      <span>{tab.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Categorized Emoji Grid with Taken Masks */}
                              <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5 max-h-44 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 scrollbar-thin">
                                {(() => {
                                  const takenIcons = (habits || [])
                                    .filter((h: any) => (editingHabitId ? (h._id || h.id) !== editingHabitId : true) && h.icon)
                                    .map((h: any) => String(h.icon).trim());

                                  const sets: Record<string, string[]> = {
                                    study: [
                                      '📚', '✍️', '📖', '📝', '💡', '🎓', '🧠', '🔬', '🧪', '📐', '💻', '📊',
                                      '📑', '🗞️', '🖋️', '🏛️', '🌍', '⚖️', '🎒', '📜', '🧾', '📂', '📋', '📌'
                                    ],
                                    sports: [
                                      '🏃', '🏃‍♀️', '🏋️', '🧘', '🚴', '⚽', '🏊', '🚶', '🎾', '🏀', '🏐', '🥊',
                                      '🥋', '🧗', '🏸', '⛳', '🛹', '🚵', '🥇', '🏆', '🎯', '💪', '👟', '🎽'
                                    ],
                                    health: [
                                      '💧', '🍏', '🥗', '😴', '💊', '🍎', '☀️', '🌙', '☕', '🍵', '🥑', '🥦',
                                      '🍳', '🧘‍♀️', '🧼', '🛀', '🩺', '❤️', '🌿', '🌱', '🍇', '🍌', '🥛', '🧘‍♂️'
                                    ],
                                    tools: [
                                      '🔥', '🎯', '⏰', '📅', '✨', '🚀', '⏱️', '⚡', '🔔', '⭐', '💡', '📈',
                                      '⚙️', '🔑', '🎨', '🎵', '🎧', '💰', '🛒', '🚗', '✈️', '🌴', '🏠', '📱'
                                    ]
                                  };

                                  const iconsToDisplay = activeEmojiTab === 'all'
                                    ? Object.values(sets).flat()
                                    : (sets[activeEmojiTab] || []);

                                  return iconsToDisplay.map((emoji, i) => {
                                    const isTaken = takenIcons.includes(emoji.trim()) && formIcon?.trim() !== emoji.trim();
                                    const isSelected = formIcon?.trim() === emoji.trim();

                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        disabled={isTaken}
                                        onClick={() => {
                                          if (!isTaken) {
                                            setFormIcon(emoji);
                                            setShowEmojiPicker(false);
                                          }
                                        }}
                                        title={isTaken ? 'Icon assigned to another subject/item (Taken)' : emoji}
                                        className={`relative w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all ${
                                          isTaken
                                            ? 'opacity-30 cursor-not-allowed bg-rose-500/10 border border-rose-500/30'
                                            : isSelected
                                            ? 'bg-accent-gradient text-white font-black scale-110 shadow-md cursor-pointer'
                                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                        {isTaken && (
                                          <span className="absolute inset-0 flex items-center justify-center text-[8px] bg-slate-950/70 rounded-lg">🚫</span>
                                        )}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!formIsStudyTask && (
                      <div className="space-y-2">
                        <label className="font-extrabold block text-slate-700 dark:text-slate-300">Category</label>
                        <ShadcnSelect
                          value={typeof formCategory === 'string' ? formCategory : (formCategory?.label || 'General')}
                          onChange={(val: string) => {
                            setFormCategory({ id: val.toLowerCase(), label: val, icon: '📌', color: '#6366F1' });
                          }}
                          options={['General', 'Study', 'Health', 'Personal', 'Work'].map((c: string) => ({ value: c, label: c }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Recurrence Frequency */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300">Recurrence Pattern</label>
                      {formIsStudyTask && (
                        <span className="text-2xs font-extrabold text-accent-primary">
                          ⚡ One-Time required for Syllabus Link
                        </span>
                      )}
                    </div>
                    <div className={createType === 'habit' ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-4 gap-2'}>
                      {[
                        { id: 'daily', label: 'Everyday' },
                        { id: 'specific_days', label: 'Specific Days' },
                        { id: 'monthly', label: 'Monthly' },
                        ...(createType === 'habit' ? [] : [{ id: 'once', label: 'One Time' }])
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setFormFrequencyMode(m.id as any);
                            if (m.id !== 'once') {
                              setFormIsStudyTask(false);
                            }
                          }}
                          className={`py-2 rounded-xl font-black text-xs border transition-all text-center ${
                            formFrequencyMode === m.id
                              ? 'bg-accent-gradient text-white border-accent-primary shadow-md shadow-accent/20'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {formFrequencyMode === 'specific_days' && (
                      <div className="flex gap-1.5 pt-1 justify-between">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const active = formFrequencyDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setFormFrequencyDays(
                                  active ? formFrequencyDays.filter((d: string) => d !== day) : [...formFrequencyDays, day]
                                );
                              }}
                              className={`flex-1 py-1.5 rounded-lg font-black transition-all ${
                                active
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {formFrequencyMode === 'monthly' && (
                      <div className="flex items-center justify-between gap-3 pt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <label className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">Repeat on Day of Month:</label>
                        <div className="w-40">
                          <ShadcnSelect
                            value={String(formMonthlyDay || 1)}
                            onChange={(val: string) => setFormMonthlyDay(Number(val))}
                            options={Array.from({ length: 31 }, (_, i) => ({
                              value: String(i + 1),
                              label: `Day ${i + 1} of month`
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Goal & Unit */}
                  {formTargetUnit === 'yes_no' || formTargetUnit === 'boolean' ? (
                    <div>
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Unit Selector</label>
                      <ShadcnSelect
                        value={formTargetUnit}
                        onChange={(val: string) => {
                          setFormTargetUnit(val);
                          if (val === 'yes_no' || val === 'boolean') {
                            setFormTargetVal(1);
                          }
                        }}
                        options={[
                          { value: 'yes_no', label: 'Mark Done' },
                          { value: 'hours', label: 'Hours' },
                          { value: 'minutes', label: 'Minutes' },
                          { value: 'times', label: 'Times' },
                          { value: 'pages', label: 'Pages' },
                          { value: 'answers', label: 'Answers' },
                          { value: 'custom', label: 'Custom Unit...' }
                        ]}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Target Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={formTargetVal}
                          onChange={(e) => setFormTargetVal(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-accent-primary"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Unit Selector</label>
                        <ShadcnSelect
                          value={formTargetUnit}
                          onChange={(val: string) => {
                            setFormTargetUnit(val);
                            if (val === 'yes_no' || val === 'boolean') {
                              setFormTargetVal(1);
                            }
                          }}
                          options={[
                            { value: 'yes_no', label: 'Mark Done' },
                            { value: 'hours', label: 'Hours' },
                            { value: 'minutes', label: 'Minutes' },
                            { value: 'times', label: 'Times' },
                            { value: 'pages', label: 'Pages' },
                            { value: 'answers', label: 'Answers' },
                            { value: 'custom', label: 'Custom Unit...' }
                          ]}
                        />
                        {formTargetUnit === 'custom' && (
                          <input
                            type="text"
                            placeholder="e.g. Quizzes, MCQs"
                            value={formCustomUnit}
                            onChange={(e) => setFormCustomUnit(e.target.value)}
                            className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold outline-none"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Start Date & Reminders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Scheduled Date</label>
                      <ShadcnDatePicker
                        selectedDate={formStartDate}
                        onSelectDate={(d: string) => setFormStartDate(d)}
                        disablePastDates={false}
                      />
                    </div>

                    <div>
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Time Reminder</label>
                      <div className="flex items-center gap-2.5">
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formEnableReminder}
                            onChange={(e) => setFormEnableReminder(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-primary"></div>
                        </label>
                        <div className="flex-1">
                          <ShadcnTimePicker
                            value={formReminderTime || '08:00'}
                            onChange={(t) => setFormReminderTime(t)}
                            disabled={!formEnableReminder}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Footer CTAs */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-black text-white bg-accent-gradient shadow-lg shadow-accent/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{editingHabitId ? 'Save Changes' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HABIT NUMERIC PROGRESS LOG MODAL */}
      {showProgressModal && progressModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl border ${cardBg} shadow-2xl overflow-hidden p-6 space-y-6 bg-white/95 dark:bg-slate-900/95`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0 ring-4 ring-accent-primary/10"
                  style={{ backgroundColor: `${progressModalHabit.color || 'var(--accent)'}18`, color: progressModalHabit.color || 'var(--accent)' }}
                >
                  {progressModalHabit.icon || '🏃'}
                </div>
                <div className="space-y-1">
                  <h3 className={`font-black text-lg leading-tight tracking-tight ${textTitle}`}>
                    {progressModalHabit.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>Goal: <strong className="text-slate-800 dark:text-slate-100 font-extrabold">{getTargetGoalLabel(progressModalHabit)}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Logged Till Now Status Card */}
            <div className="p-3.5 rounded-2xl bg-accent-light border border-accent-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-accent-primary">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                <span>Logged Till Now Today</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-accent-primary font-black text-xs shadow-xs border border-accent-primary/20">
                {existingModalVal} {progressModalHabit.target?.unit || 'hours'}
              </span>
            </div>

            {/* Log Method Segmented Switcher (If existing value > 0) */}
            {existingModalVal > 0 && (
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => setProgressModalMode('add')}
                  className={`py-2 px-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                    progressModalMode === 'add'
                      ? 'bg-accent-gradient text-white shadow-md shadow-accent/10 font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Plus size={14} /> Add to {existingModalVal} {progressModalHabit.target?.unit || 'h'}
                </button>

                <button
                  type="button"
                  onClick={() => setProgressModalMode('replace')}
                  className={`py-2 px-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                    progressModalMode === 'replace'
                      ? 'bg-accent-gradient text-white shadow-md shadow-accent/10 font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 size={14} /> Overwrite Total
                </button>
              </div>
            )}

            {/* Hero Stepper / Hours & Minutes Slider Controls */}
            {(() => {
              const unitStr = (progressModalHabit.target?.unit || '').toLowerCase();
              const isTimeBased =
                ['hours', 'hrs', 'hour', 'mins', 'minutes', 'min'].includes(unitStr) ||
                progressModalHabit.isStudyTask ||
                progressModalHabit.subject;

              const formatDuration = (hrsDecimal: number) => {
                const totalMins = Math.round(hrsDecimal * 60);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                if (h > 0 && m > 0) return `${h} hr ${m} mins`;
                if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
                return `${m} mins`;
              };

              const hoursVal = Math.floor(progressModalValue || 0);
              const minsVal = Math.round(((progressModalValue || 0) % 1) * 60);

              const setHours = (h: number) => {
                const newTotal = h + minsVal / 60;
                setProgressModalValue(Number(newTotal.toFixed(2)));
              };

              const setMinutes = (m: number) => {
                const newTotal = hoursVal + m / 60;
                setProgressModalValue(Number(newTotal.toFixed(2)));
              };

              const projectedTotal =
                progressModalMode === 'add' && existingModalVal > 0
                  ? Number((existingModalVal + progressModalValue).toFixed(2))
                  : progressModalValue;
              const targetVal = progressModalHabit.target?.value || 1;
              const pct = Math.round((projectedTotal / targetVal) * 100);
              const isComplete = pct >= 100;

              if (isTimeBased) {
                return (
                  <div className="space-y-5 text-center">
                    {/* Time Display Badge */}
                    <div className="py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 inline-block shadow-inner">
                      <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                        {formatDuration(progressModalValue)}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                        Selected Duration
                      </div>
                    </div>

                    {/* Dual Sliders: Hours & Minutes */}
                    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 text-left">
                      {/* Hours Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-slate-600 dark:text-slate-300">Hours</span>
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold">{hoursVal} hr{hoursVal !== 1 ? 's' : ''}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="12"
                          step="1"
                          value={hoursVal}
                          onChange={(e) => setHours(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg outline-none"
                        />
                      </div>

                      {/* Minutes Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-slate-600 dark:text-slate-300">Minutes</span>
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold">{minsVal} mins</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="55"
                          step="5"
                          value={minsVal}
                          onChange={(e) => setMinutes(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg outline-none"
                        />
                      </div>

                      {/* Quick Minute Step Pills */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        {[0, 15, 30, 45].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMinutes(m)}
                            className={`flex-1 py-1 rounded-xl text-xs font-black border transition-all ${
                              minsVal === m
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            :{m === 0 ? '00' : m}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Add Presets */}
                    <div className="flex items-center justify-center gap-2">
                      {[
                        { label: '+15m', val: 0.25 },
                        { label: '+30m', val: 0.5 },
                        { label: '+45m', val: 0.75 },
                        { label: '+1h', val: 1.0 },
                        { label: '+2h', val: 2.0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setProgressModalValue(preset.val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                            progressModalValue === preset.val
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm scale-105'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Projected Progress & Total Bar */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-500 dark:text-slate-400">Projected Total</span>
                        <span className={`font-black ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {formatDuration(projectedTotal)} / {formatDuration(targetVal)} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // Non-time habit stepper
              return (
                <div className="space-y-5 text-center">
                  {/* Main Stepper Control */}
                  <div className="flex items-center justify-center gap-5 py-2">
                    <button
                      type="button"
                      onClick={() => setProgressModalValue(Math.max(0, Number((progressModalValue - 0.5).toFixed(2))))}
                      className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-90 shadow-sm flex items-center justify-center shrink-0"
                    >
                      -
                    </button>

                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={progressModalValue}
                        onChange={(e) => setProgressModalValue(Math.max(0, Number(e.target.value)))}
                        className="w-32 text-center text-4xl font-black bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:scale-105 transition-transform"
                      />
                      <span className="text-2xs font-black text-accent-primary uppercase tracking-widest mt-0.5">
                        {progressModalHabit.target?.unit || 'times'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProgressModalValue(Number((progressModalValue + 0.5).toFixed(2)))}
                      className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-2xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-90 shadow-sm flex items-center justify-center shrink-0"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Add Presets */}
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 5].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProgressModalValue(preset)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                          progressModalValue === preset
                            ? 'bg-accent-gradient text-white border-accent-primary shadow-md shadow-accent/30 scale-105'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>

                  {/* Projected Progress & Total Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-slate-500 dark:text-slate-400">Projected Total</span>
                      <span className={`font-black ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {projectedTotal} / {targetVal} {progressModalHabit.target?.unit || 'times'} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer CTAs */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveHabitProgress(progressModalValue)}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>{saving ? 'Saving...' : 'Save Progress'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Code Editor & Live UI Preview Modal */}
      <TimetableCodeEditorModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSaveSuccess={() => {
          if (fetchTrackerData) fetchTrackerData();
        }}
      />
    </div>
  );
}
