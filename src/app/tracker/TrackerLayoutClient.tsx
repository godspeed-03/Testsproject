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
  ChevronUp,
  ChevronDown,
  Clock,
  Check,
  Edit3,
  FileCode
} from 'lucide-react';
import { useTracker, getTargetGoalLabel, calculateHabitStreak } from './TrackerContext';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';
import ShadcnSelect from '@/components/ui/ShadcnSelect';
import ShadcnMultiSelect from '@/components/ui/ShadcnMultiSelect';
import ShadcnTimePicker from '@/components/ui/ShadcnTimePicker';
import TimetableCodeEditorModal from '@/components/TimetableCodeEditorModal';
import BatchRevisionCompletionModal from '@/components/dashboard/BatchRevisionCompletionModal';
import {
  SUBJECT_COLOR_OPTIONS,
  NON_SUBJECT_COLOR_OPTIONS,
  getSubjectTheme
} from '@/lib/subjectThemeMap';
function DailyTargetCard({
  todayItems,
  selectedDate,
  cardBg,
  textMuted
}: {
  todayItems: any[];
  selectedDate: string;
  cardBg: string;
  textMuted: string;
}) {
  const isTimeBasedUnit = (h: any) => {
    const unit = (h.target?.unit || '').toLowerCase().trim();
    return ['hours', 'hrs', 'hour', 'mins', 'minutes', 'min', 'minute'].includes(unit);
  };

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
          <span className="text-emerald-600 dark:text-emerald-400 font-black font-display">
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
          <span className="text-accent-quaternary font-black font-display">
            {formatHoursAndMins(totalTodayLoggedHours)} {totalTodayTargetHours > 0 ? `/ ${formatHoursAndMins(totalTodayTargetHours)}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

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
    topicRevisions,
    batchedRevisions,
    formIsStudyTask,
    setFormIsStudyTask,
    formStudyTaskMode,
    setFormStudyTaskMode,
    formIsBatchRevision,
    setFormIsBatchRevision,
    formRevisionClusterBadges,
    setFormRevisionClusterBadges,
    formSubject,
    setFormSubject,
    formTopic,
    setFormTopic,
    formSelectedMicroTopics,
    setFormSelectedMicroTopics,
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
    showBatchRevModal,
    setShowBatchRevModal,
    batchRevModalHabit,
    batchRevModalDate,
    handleSaveBatchRevProgress,
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



  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  const navTabs = [
    { href: '/tracker/agenda', label: 'Today Agenda', icon: CheckSquare, badge: todayItems.length },
    { href: '/tracker/habits', label: 'Habits & Streaks', icon: Flame, badge: habits.filter((h: any) => h.type === 'habit').length },
    { href: '/tracker/calendar', label: 'Month Calendar', icon: CalendarIcon },
    { href: '/tracker/analytics', label: 'Analytics & Scores', icon: BarChart3 },
    { href: '/tracker/focus', label: 'Focus Timer', icon: TimerIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1480px] mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-lg sm:text-2xl font-black font-display tracking-tight ${textTitle}`}>
              Habit & Task Module
            </h1>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {saving && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold animate-pulse shadow-xs shrink-0">
                <Loader2 size={13} className="animate-spin text-indigo-500 shrink-0" />
                <span>Syncing DB...</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => handleOpenCreateModal('task')}
              className="w-full sm:w-auto bg-accent-gradient hover:opacity-90 text-white font-extrabold text-xs sm:text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus size={15} /> New Habit or Task
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Pill Navigation Bar (<768px) with Touch Snap & Sticky Header */}
        <div className="md:hidden sticky top-14 z-40 backdrop-blur-md bg-slate-50/90 dark:bg-slate-950/90 overflow-x-auto flex items-center gap-1.5 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-3.5 px-3.5 border-b border-slate-200/80 dark:border-slate-800/80 snap-x snap-mandatory shadow-xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || (pathname === '/tracker' && tab.href === '/tracker/agenda');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  active
                    ? 'bg-accent-gradient text-white shadow-neon-glow'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black font-display ${
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

        {/* Mobile Daily Target Stats Card (<768px) */}
        <div className="md:hidden mt-2">
          <DailyTargetCard todayItems={todayItems} selectedDate={selectedDate} cardBg={cardBg} textMuted={textMuted} />
        </div>

        {/* Sidebar + Content Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 mt-3 md:mt-0">
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-3 sticky top-20 self-start">
            {/* Sidebar Route Tabs Navigation */}
            <div className={`p-2.5 rounded-2xl border ${cardBg} space-y-1 shadow-xs`}>
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const active = pathname === tab.href || (pathname === '/tracker' && tab.href === '/tracker/agenda');
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`w-full flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-accent-gradient text-white shadow-neon-glow'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black font-display ${
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

            {/* Desktop Quick Mini Stats Card */}
            <DailyTargetCard todayItems={todayItems} selectedDate={selectedDate} cardBg={cardBg} textMuted={textMuted} />
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className={`w-full max-w-xl max-h-[92vh] flex flex-col p-5 sm:p-6 rounded-3xl border ${cardBg} shadow-2xl space-y-4 bg-white/95 dark:bg-slate-900/95 overflow-x-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
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

            {/* Type Selector Segmented Tabs (One Word Each) */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner">
              {[
                { id: 'habit', label: 'Habit', icon: '🔥' },
                { id: 'task', label: 'Task', icon: '📝' }
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
                    }
                  }}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    createType === t.id
                      ? 'bg-accent-secondary text-white shadow-md shadow-accent-secondary/20'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="text-sm">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-4 text-xs scrollbar-thin">
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
                  {/* 3-Option Task / Event Linkage Selector (Only for One-Time Tasks) */}
                  {createType === 'task' && formFrequencyMode === 'once' && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">
                          Task Mode & Syllabus Linkage
                        </span>
                      </div>

                      {/* 3-Tab Segment Selector */}
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            setFormStudyTaskMode('none');
                            setFormIsStudyTask(false);
                            setFormIsBatchRevision(false);
                            if (formTitle === formSubject || (formSubject && formTitle.startsWith(formSubject))) {
                              setFormTitle('');
                            }
                          }}
                          className={`py-2 px-1 text-[10px] sm:text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            formStudyTaskMode === 'none'
                              ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <span>📝</span>
                          <span className="whitespace-nowrap">No Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormStudyTaskMode('single');
                            setFormIsStudyTask(true);
                            setFormIsBatchRevision(false);
                          }}
                          className={`py-2 px-1 text-[10px] sm:text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            formStudyTaskMode === 'single'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <span>🎓</span>
                          <span className="whitespace-nowrap">UPSC Single</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormStudyTaskMode('batch_revision');
                            setFormIsStudyTask(true);
                            setFormIsBatchRevision(true);
                            setFormIsAugmentedRevision(false);
                            setFormIcon('⚡');
                            setFormColor('#8B5CF6');
                            setShowEmojiPicker(false);
                          }}
                          className={`py-2 px-1 text-[10px] sm:text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            formStudyTaskMode === 'batch_revision'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <span>⚡</span>
                          <span className="whitespace-nowrap">Batch Revision</span>
                        </button>
                      </div>

                      {/* OPTION 2: Single Syllabus Topic (Restored Simple Layout) */}
                      {formStudyTaskMode === 'single' && (
                        <div className="space-y-3.5 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Category</label>
                              <ShadcnSelect
                                value={typeof formCategory === 'string' ? formCategory : (formCategory?.label || '')}
                                onChange={(val: string) => {
                                  const newCatObj = { id: val.toLowerCase(), label: val, icon: '📚', color: '#6366F1' };
                                  setFormCategory(newCatObj);
                                  const catLower = val.trim().toLowerCase();
                                  const fromSyl = (syllabusItems || []).filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower).map((i: any) => i.subject);
                                  const fromHab = (habits || []).filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower).map((i: any) => i.subject);
                                  const fromRev = (topicRevisions || []).filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower).map((i: any) => i.subject);
                                  const matchedSubjects = Array.from(new Set([...fromSyl, ...fromHab, ...fromRev].filter(Boolean)));
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
                                placeholder="e.g., Ocean Currents, Plate Tectonics"
                                value={formTopic}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormTopic(val);
                                  if (formSubject) {
                                    setFormTitle(val ? `${formSubject}: ${val}` : formSubject);
                                  } else if (val) {
                                    setFormTitle(val);
                                  }
                                }}
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 text-xs"
                              />
                            </div>
                          </div>

                          {/* Augmented Revision SRS Toggle */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 dark:bg-slate-950/80 border border-indigo-500/20 dark:border-indigo-500/40 shadow-xs">
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
                              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all shadow-xs"></div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* OPTION 3: Batch Revision Topics across Multiple Subjects */}
                      {formStudyTaskMode === 'batch_revision' && (
                        <div className="space-y-3.5 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                            <div className="sm:col-span-3">
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1 text-xs sm:text-sm">Select Category</label>
                              <ShadcnSelect
                                value={typeof formCategory === 'string' ? formCategory : (formCategory?.label || '')}
                                onChange={(val: string) => {
                                  const newCatObj = { id: val.toLowerCase(), label: val, icon: '📚', color: '#6366F1' };
                                  setFormCategory(newCatObj);
                                  const catLower = val.trim().toLowerCase();
                                  const fromSyl = (syllabusItems || []).filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower).map((i: any) => i.subject);
                                  const fromHab = (habits || []).filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower).map((i: any) => i.subject);
                                  const fromRev = (topicRevisions || []).filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower).map((i: any) => i.subject);
                                  const matchedSubjects = Array.from(new Set([...fromSyl, ...fromHab, ...fromRev].filter(Boolean)));
                                  const nextSubject = matchedSubjects.length > 0 ? matchedSubjects[0] : '';
                                  setFormSubject(nextSubject);
                                }}
                                options={categories.map((c: string) => ({ value: c, label: c }))}
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1 text-xs sm:text-sm">Select Subject</label>
                              <ShadcnSelect
                                value={formSubject}
                                onChange={(val: string) => {
                                  setFormSubject(val);
                                }}
                                options={
                                  getFilteredCategorySubjects().length > 0
                                    ? getFilteredCategorySubjects().map((s: string) => ({ value: s, label: s }))
                                    : syllabusSubjects.map((s: string) => ({ value: s, label: s }))
                                }
                              />
                            </div>

                            {/* Topic Multi-Select Dropdown for active subject */}
                            {(() => {
                              const normalizedSubj = String(formSubject || '').trim().toLowerCase();

                              const standardCatRegex = /^(GS[1-4]|CSAT|REV|General|N\/A)$/i;

                              const fromRevisions = (topicRevisions || [])
                                .filter((r: any) => String(r.subject || '').trim().toLowerCase() === normalizedSubj && r.topic)
                                .flatMap((r: any) => String(r.topic).split(',').map((t: string) => t.trim()))
                                .filter((t: string) =>
                                  t &&
                                  !standardCatRegex.test(t) &&
                                  !t.toLowerCase().includes("week ") &&
                                  !t.toLowerCase().startsWith("[r") &&
                                  !t.toLowerCase().includes("batch revision")
                                );

                              const fromSyllabus = (syllabusItems || [])
                                .filter((s: any) => String(s.subject || '').trim().toLowerCase() === normalizedSubj)
                                .flatMap((s: any) => {
                                  const list: string[] = [];
                                  if (s.category && !standardCatRegex.test(s.category.trim())) {
                                    list.push(String(s.category).trim());
                                  }
                                  if (s.topic && !standardCatRegex.test(s.topic.trim())) {
                                    list.push(String(s.topic).trim());
                                  }
                                  if (s.topics) {
                                    const arr = Array.isArray(s.topics) ? s.topics : String(s.topics).split(',');
                                    arr.forEach((t: any) => {
                                      const str = String(t).trim();
                                      if (str && !standardCatRegex.test(str)) list.push(str);
                                    });
                                  }
                                  return list;
                                });

                              const existingTopics: string[] = Array.from(
                                new Set([...fromRevisions, ...fromSyllabus].filter(Boolean))
                              );

                              const catLabel = typeof formCategory === 'string' ? formCategory : (formCategory?.label || 'GS1');

                              const selectedForThisSubj = formRevisionClusterBadges
                                .filter((b: any) => String(b.subject || '').trim().toLowerCase() === normalizedSubj)
                                .map((b: any) => b.topic);

                              const options = existingTopics.map((top: string) => ({
                                value: top,
                                label: top,
                              }));

                              const handleSelectionChange = (newSelectedTopics: string[]) => {
                                const otherSubjBadges = formRevisionClusterBadges.filter(
                                  (b: any) => String(b.subject || '').trim().toLowerCase() !== normalizedSubj
                                );

                                const newSubjBadges = newSelectedTopics.map((top: string) => ({
                                  category: catLabel,
                                  subject: formSubject,
                                  topic: top,
                                }));

                                const updatedBadges = [...otherSubjBadges, ...newSubjBadges];
                                setFormRevisionClusterBadges(updatedBadges);
                              };

                              return (
                                <div className="sm:col-span-5">
                                  <ShadcnMultiSelect
                                    label="Select Topics"
                                    placeholder={loading ? "Loading topics..." : `Select ${formSubject || 'subject'} topics...`}
                                    options={options}
                                    selectedValues={selectedForThisSubj}
                                    onChange={handleSelectionChange}
                                    isLoading={loading}
                                  />
                                </div>
                              );
                            })()}
                          </div>

                          {/* Selected Revision Cluster Badges (Clean 2-Column Grid Alignment) */}
                          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-glow" />
                                <span className="font-extrabold text-xs text-purple-100 tracking-wide">
                                  Selected Revision Cluster
                                </span>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/35 text-purple-300">
                                  {formRevisionClusterBadges.length} Topics
                                </span>
                              </div>
                              {formRevisionClusterBadges.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setFormRevisionClusterBadges([])}
                                  className="text-[11px] font-extrabold text-rose-400 hover:text-rose-300 hover:underline transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <span>Clear All</span>
                                </button>
                              )}
                            </div>

                            {formRevisionClusterBadges.length === 0 ? (
                              <p className="text-[11px] text-purple-300/60 font-medium italic">
                                No topics added yet. Select a category & subject above, then pick topics to build your multi-subject revision cluster!
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {(() => {
                                  // Group badges by subject
                                  const groupMap: Record<string, { category: string; subject: string; items: { topic: string; globalIdx: number }[] }> = {};
                                  formRevisionClusterBadges.forEach((b: any, globalIdx: number) => {
                                    const subjKey = b.subject || "General";
                                    if (!groupMap[subjKey]) {
                                      groupMap[subjKey] = {
                                        category: b.category || "GS",
                                        subject: subjKey,
                                        items: [],
                                      };
                                    }
                                    groupMap[subjKey].items.push({ topic: b.topic, globalIdx });
                                  });

                                  return Object.values(groupMap).map((grp, gIdx) => (
                                    <div key={gIdx} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-3 py-1.5 border-b border-purple-500/10 last:border-b-0">
                                      {/* Column 1: Subject Badge (Fixed Width 180px for PERFECT vertical alignment across all rows) */}
                                      <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-500/40 shrink-0">
                                          {grp.category}
                                        </span>
                                        <span className="font-black text-xs text-purple-100 uppercase tracking-wide truncate" title={grp.subject}>
                                          {grp.subject}
                                        </span>
                                      </div>

                                      {/* Column 2: Topic Pills (Aligns perfectly starting at exact same horizontal position) */}
                                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                        {grp.items.map((item) => (
                                          <span
                                            key={item.globalIdx}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/35 text-purple-100 font-extrabold text-xs shadow-xs hover:border-purple-400 transition-all group"
                                          >
                                            <span>{item.topic}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setFormRevisionClusterBadges(
                                                  formRevisionClusterBadges.filter((_: any, i: number) => i !== item.globalIdx)
                                                );
                                              }}
                                              className="text-purple-400 hover:text-rose-400 hover:bg-rose-500/20 p-0.5 rounded transition-colors font-black text-xs leading-none"
                                              title="Remove topic"
                                            >
                                              ✕
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            )}
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
                          {/* Icon button on left of title (Omitted for batch_revision as icon & color are hardcoded) */}
                          {formStudyTaskMode !== 'batch_revision' && (
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              title="Click to select icon & color"
                              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1 hover:border-indigo-500 transition-all shrink-0 active:scale-95 shadow-2xs cursor-pointer"
                              style={{ borderColor: formColor || undefined, backgroundColor: formColor ? `${formColor}15` : undefined }}
                            >
                              <span>{formIcon || '📚'}</span>
                            </button>
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

                        {/* Floating Popover: Icon & Theme Color Selector (Omitted for Batch Revision) */}
                        {showEmojiPicker && formStudyTaskMode !== 'batch_revision' && (createType === 'habit' || !formIsStudyTask) && (
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

                  {/* Target Goal & Unit (Hidden for Batch Revision Tasks) */}
                  {formStudyTaskMode !== 'batch_revision' && !formIsBatchRevision && (
                    <>
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
                              { value: 'minutes', label: 'Minutes' },
                              { value: 'lectures', label: 'Lectures' },
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
                                { value: 'minutes', label: 'Minutes' },
                                { value: 'lectures', label: 'Lectures' },
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
                    </>
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
                          <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-checked:bg-accent-primary dark:peer-checked:bg-indigo-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all shadow-xs"></div>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setShowProgressModal(false)}
        >
          <div
            className={`w-full max-w-md rounded-3xl border ${cardBg} shadow-2xl overflow-hidden p-6 space-y-6 bg-white/95 dark:bg-slate-900/95`}
            onClick={(e) => e.stopPropagation()}
          >
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
              <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-accent-primary font-black font-display text-xs shadow-xs border border-accent-primary/20">
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
                  <Plus size={14} /> Add to <span className="font-display">{existingModalVal} {progressModalHabit.target?.unit || 'h'}</span>
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
              const unitStr = (progressModalHabit.target?.unit || '').toLowerCase().trim();
              const isHoursOnly = ['hours', 'hrs', 'hour'].includes(unitStr);
              const isMinsOnly = ['mins', 'minutes', 'min'].includes(unitStr);
              const nonTimeUnits = ['pages', 'page', 'times', 'time', 'questions', 'question', 'chapters', 'chapter', 'items', 'item', 'modules', 'module', 'words', 'word', 'count', 'number', 'boolean', 'yes_no'];
              const isExplicitlyNonTime = nonTimeUnits.includes(unitStr);

              const isTimeBased =
                (isHoursOnly || isMinsOnly) ||
                (!isExplicitlyNonTime &&
                  (unitStr === '' || unitStr === 'time' || unitStr === 'duration') &&
                  (progressModalHabit.isStudyTask || progressModalHabit.subject));

              const formatDuration = (hrsDecimal: number) => {
                const totalMins = Math.round((hrsDecimal || 0) * 60);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                if (h > 0 && m > 0) return `${h} hr ${m} mins`;
                if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
                return `${m} mins`;
              };

              const totalMinsVal = Math.round((progressModalValue || 0) * 60);
              const hoursVal = Math.floor(totalMinsVal / 60);
              const minsVal = totalMinsVal % 60;

              const rawTargetVal = progressModalHabit.target?.value || 1;
              const targetValInHours = isMinsOnly ? rawTargetVal / 60 : rawTargetVal;
              const isTargetUnder60Mins = targetValInHours < 1;

              const setHours = (h: number) => {
                if (isTargetUnder60Mins) return;
                const newTotalMins = h * 60 + minsVal;
                setProgressModalValue(Number((newTotalMins / 60).toFixed(4)));
              };

              const setMinutes = (m: number) => {
                const effectiveHours = isTargetUnder60Mins ? 0 : hoursVal;
                const newTotalMins = effectiveHours * 60 + m;
                setProgressModalValue(Number((newTotalMins / 60).toFixed(4)));
              };

              const existingValInHours = isMinsOnly ? (existingModalVal || 0) / 60 : (existingModalVal || 0);

              const projectedTotalInHours =
                progressModalMode === 'add' && existingValInHours > 0
                  ? Number((existingValInHours + progressModalValue).toFixed(4))
                  : progressModalValue;
              const pct = Math.round((projectedTotalInHours / (targetValInHours || 1)) * 100);
              const isComplete = pct >= 100;

              if (isTimeBased) {
                return (
                  <div className="space-y-5 text-center">
                    {/* Selected Duration Hero Display */}
                    <div className="text-center pt-1 pb-2">
                      <div className="text-3xl sm:text-4xl font-black font-display text-amber-600 dark:text-amber-400 tracking-tight">
                        {formatDuration(progressModalValue)}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest font-display text-slate-400 dark:text-slate-500 mt-1">
                        Selected Duration
                      </div>
                    </div>

                    {/* Dual Column Timer Wheel Picker */}
                    <div className="py-4 px-2 rounded-3xl bg-slate-100/70 dark:bg-slate-900/70 space-y-4">
                      <div className="flex items-center justify-center gap-6 sm:gap-10">
                        <TimerWheelColumn
                          columnTitle="Hours"
                          unitLabel="H"
                          options={Array.from({ length: 13 }, (_, i) => i)}
                          value={isTargetUnder60Mins ? 0 : hoursVal}
                          onChange={(h) => setHours(h)}
                          disabled={isTargetUnder60Mins}
                        />

                        <div className="text-2xl font-black font-display text-slate-300 dark:text-slate-700 self-center pt-5">:</div>

                        <TimerWheelColumn
                          columnTitle="Minutes"
                          unitLabel="M"
                          options={Array.from({ length: 60 }, (_, i) => i)}
                          value={minsVal}
                          onChange={(m) => setMinutes(m)}
                        />
                      </div>
                    </div>

                    {/* Projected Progress & Total Bar */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-500 dark:text-slate-400 font-bold">Projected Total</span>
                        <span className={`font-black font-display ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {formatDuration(projectedTotalInHours)} / {formatDuration(targetValInHours)} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
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
                        className="w-32 text-center text-4xl font-black font-display bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:scale-105 transition-transform"
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

                  {/* Projected Progress & Total Bar */}
                  {(() => {
                    const nonTimeProjectedTotal =
                      progressModalMode === 'add' && existingModalVal > 0
                        ? Number((existingModalVal + progressModalValue).toFixed(2))
                        : progressModalValue;
                    const nonTimePct = Math.round((nonTimeProjectedTotal / (rawTargetVal || 1)) * 100);
                    const isNonTimeComplete = nonTimePct >= 100;

                    return (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">Projected Total</span>
                          <span className={`font-black font-display ${isNonTimeComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {nonTimeProjectedTotal} / {rawTargetVal} {progressModalHabit.target?.unit || 'times'} ({nonTimePct}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isNonTimeComplete
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                            style={{ width: `${Math.min(100, nonTimePct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
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

      {/* BATCH REVISION MULTI-TOPIC CHECKLIST MODAL */}
      <BatchRevisionCompletionModal
        isOpen={showBatchRevModal}
        onClose={() => setShowBatchRevModal(false)}
        habit={batchRevModalHabit}
        date={batchRevModalDate}
        onSave={handleSaveBatchRevProgress}
        batchedRevisions={batchedRevisions}
      />

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

function TimerWheelColumn({
  options,
  value,
  onChange,
  unitLabel,
  columnTitle,
  disabled = false,
}: {
  options: number[];
  value: number;
  onChange: (val: number) => void;
  unitLabel: string;
  columnTitle: string;
  disabled?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isUserScrollingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<any>(null);

  const itemHeight = 44; // 44px height per item

  const selectedIdx = React.useMemo(() => {
    let closestIdx = 0;
    let minDiff = Infinity;
    options.forEach((opt, idx) => {
      const diff = Math.abs(opt - value);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [options, value]);

  // Sync scroll position instantly when value changes programmatically
  React.useEffect(() => {
    if (containerRef.current && !isUserScrollingRef.current) {
      containerRef.current.scrollTo({
        top: selectedIdx * itemHeight,
        behavior: 'auto',
      });
    }
  }, [selectedIdx]);

  const handleScroll = () => {
    if (disabled || !containerRef.current) return;
    isUserScrollingRef.current = true;

    // Real-time calculation during scroll for instant feedback
    const scrollTop = containerRef.current.scrollTop;
    const rawIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, rawIndex));
    const activeValue = options[clampedIndex];

    if (activeValue !== value) {
      onChange(activeValue);
    }

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    // Fast 40ms snap after scroll pauses
    scrollTimeoutRef.current = setTimeout(() => {
      if (containerRef.current && isUserScrollingRef.current) {
        containerRef.current.scrollTo({
          top: clampedIndex * itemHeight,
          behavior: 'smooth',
        });
      }
      isUserScrollingRef.current = false;
    }, 40);
  };

  const handleItemClick = (opt: number, idx: number) => {
    if (disabled) return;
    isUserScrollingRef.current = false;
    onChange(opt);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * itemHeight,
        behavior: 'auto',
      });
    }
  };

  return (
    <div className={`flex flex-col items-center transition-opacity ${disabled ? 'opacity-30 pointer-events-none select-none' : ''}`}>
      <span className="text-[10px] font-black uppercase tracking-widest font-display text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
        {columnTitle} {disabled && <span className="text-[9px] text-slate-400 font-normal">(Off)</span>}
      </span>
      <div className="relative w-24 sm:w-28 h-48 overflow-hidden">
        {/* Selection Overlay Bar */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[44px] rounded-2xl bg-amber-500/15 border border-amber-500/30 pointer-events-none z-0 shadow-2xs" />

        {/* Scrollable Container (Invisible Scrollbar) */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col items-center relative z-10"
        >
          {/* Top Spacer Element for exact 74px vertical centering */}
          <div className="h-[74px] shrink-0 w-full pointer-events-none" />

          {options.map((opt, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={opt}
                type="button"
                disabled={disabled}
                onClick={() => handleItemClick(opt, idx)}
                className={`shrink-0 h-[44px] w-full flex items-center justify-center gap-1 transition-all duration-100 cursor-pointer ${
                  isSelected
                    ? 'text-2xl font-black font-display text-amber-600 dark:text-amber-400 scale-105'
                    : 'text-sm font-bold font-display text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 opacity-60'
                }`}
              >
                <span className="font-display tracking-wider">{String(opt).padStart(2, '0')}</span>
                {isSelected && (
                  <span className="text-xs font-black uppercase tracking-wider font-display text-amber-600 dark:text-amber-400">
                    {unitLabel}
                  </span>
                )}
              </button>
            );
          })}

          {/* Bottom Spacer Element for exact 74px vertical centering */}
          <div className="h-[74px] shrink-0 w-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
