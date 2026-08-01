'use client';

import React, { useEffect } from 'react';
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
  Edit3
} from 'lucide-react';
import { useTracker, getTargetGoalLabel, calculateHabitStreak } from './TrackerContext';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';
import ShadcnSelect from '@/components/ui/ShadcnSelect';
import ShadcnTimePicker from '@/components/ui/ShadcnTimePicker';

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
    getFilteredCategorySubjects
  } = useTracker();

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
    { href: '/tracker/checklist', label: 'Checklists', icon: ListTodo, badge: lists.length },
    { href: '/tracker/focus', label: 'Focus Timer', icon: TimerIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${textTitle}`}>
              Habit & Task Module
            </h1>
            <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
              Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateModal('task')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all shrink-0 active:scale-95"
          >
            <Plus size={18} /> New Habit or Task
          </button>
        </div>

        {/* Sidebar + Content Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
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
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
              // Calculate ONLY Study & Time-based task logged hours for todayItems on selectedDate
              const totalTodayLoggedHours = todayItems.reduce((acc: number, h: any) => {
                const isTimeOrStudy =
                  h.isStudyTask ||
                  h.subject ||
                  ['hours', 'hrs', 'hour', 'mins', 'minutes', 'min'].includes((h.target?.unit || '').toLowerCase());

                if (!isTimeOrStudy) return acc;

                const entry = (h.history || []).find((e: any) => e.date === selectedDate);
                if (!entry) return acc;

                const val = Number(entry.value || 0);

                // If status is not done and value is 0, do not count
                if (val <= 0 && entry.status !== 'done') return acc;

                const unit = (h.target?.unit || '').toLowerCase();
                const effectiveVal = val > 0 ? val : (entry.status === 'done' ? Number(h.target?.value || 0) : 0);

                // Convert mins to hours if unit is minutes
                if (unit === 'mins' || unit === 'minutes' || unit === 'min') {
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
                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
                        style={{
                          width: `${todayItems.length > 0 ? (doneCount / todayItems.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <span className={textMuted}>Hours Read Today</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">
                        {formatHoursAndMins(totalTodayLoggedHours)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className={`w-full max-w-xl p-6 rounded-3xl border ${cardBg} shadow-2xl space-y-5 my-8`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-black ${textTitle}`}>
                  {editingHabitId ? 'Edit Habit / Task' : 'Create New Tracker Item'}
                </h3>
                <p className={`text-xs ${textMuted}`}>Define schedule, target goals, and syllabus categories.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
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
                    }
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    createType === t.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {createType === 'list' ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Checklist Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mains Paper 1 Revision Topics"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Task / Habit Mode selection (Only for One-Time Tasks) */}
                  {createType === 'task' && formFrequencyMode === 'once' && (
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-700 dark:text-indigo-300">Link to UPSC Syllabus Matrix?</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsStudyTask}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormIsStudyTask(checked);
                              if (checked) {
                                setFormFrequencyMode('once');
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {formIsStudyTask && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                              <ShadcnSelect
                                value={formSubject}
                                onChange={(val: string) => {
                                  setFormSubject(val);
                                  const autoTitle = val && formTopic ? `${val}: ${formTopic}` : (val || formTopic);
                                  if (autoTitle) setFormTitle(autoTitle);
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
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          {/* Augmented Revision SRS Toggle */}
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                            <div>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-xs">
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

                  {/* Title & Category */}
                  <div className={createType === 'habit' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                    <div>
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Title</label>
                      <input
                        type="text"
                        placeholder={createType === 'habit' ? 'e.g., Daily Answer Writing / Running' : 'Task Title'}
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {createType === 'task' && (
                      <div>
                        <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Syllabus Category</label>
                        <ShadcnSelect
                          value={typeof formCategory === 'string' ? formCategory : formCategory?.label || 'Study'}
                          onChange={(val: string) => {
                            setFormCategory({ id: val.toLowerCase(), label: val, icon: '📚', color: '#6366F1' });
                            
                            // Find subjects belonging to this selected category
                            const matchedSubjects = (syllabusItems || [])
                              .filter((item: any) => {
                                const itemCat = String(item.category || '').trim();
                                return itemCat.toLowerCase() === val.toLowerCase() ||
                                       itemCat.toLowerCase().includes(val.toLowerCase()) ||
                                       val.toLowerCase().includes(itemCat.toLowerCase());
                              })
                              .map((item: any) => item.subject)
                              .filter(Boolean);

                            const newSubject = matchedSubjects.length > 0 ? Array.from(new Set(matchedSubjects))[0] : (syllabusSubjects[0] || '');
                            if (newSubject) {
                              setFormSubject(newSubject);
                              const autoTitle = formTopic ? `${newSubject}: ${formTopic}` : newSubject;
                              setFormTitle(autoTitle);
                            }
                          }}
                          options={categories.map((c: string) => ({ value: c, label: c }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Recurrence Frequency */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300">Recurrence Pattern</label>
                      {formIsStudyTask && (
                        <span className="text-2xs font-extrabold text-indigo-600 dark:text-indigo-400">
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
                          className={`py-1.5 rounded-lg font-bold border transition-all text-center ${
                            formFrequencyMode === m.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
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
                      <div className="flex items-center justify-between gap-3 pt-1.5 p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Target Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={formTargetVal}
                        onChange={(e) => setFormTargetVal(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold block text-slate-700 dark:text-slate-300 mb-1">Unit Selector</label>
                      <ShadcnSelect
                        value={formTargetUnit}
                        onChange={(val: string) => setFormTargetUnit(val)}
                        options={[
                          { value: 'yes_no', label: 'Mark Done (Yes / No)' },
                          { value: 'hours', label: 'Hours' },
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
                          className="w-full mt-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Start Date & Reminders */}
                  <div className="grid grid-cols-2 gap-3">
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
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
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

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
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
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0 ring-4 ring-indigo-500/10"
                  style={{ backgroundColor: `${progressModalHabit.color || '#6366f1'}18`, color: progressModalHabit.color || '#6366f1' }}
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
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>Logged Till Now Today</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-xs shadow-xs border border-indigo-500/20">
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
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10 font-black'
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
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10 font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 size={14} /> Overwrite Total
                </button>
              </div>
            )}

            {/* Hero Stepper & Preset Controls */}
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
                  <span className="text-2xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                    {progressModalHabit.target?.unit || 'hours'}
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
                {[0.5, 1.0, 1.5, 2.0, 3.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setProgressModalValue(preset)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      progressModalValue === preset
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 scale-105'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Projected Progress & Total Bar */}
              {(() => {
                const projectedTotal = progressModalMode === 'add' && existingModalVal > 0 
                  ? Number((existingModalVal + progressModalValue).toFixed(2))
                  : progressModalValue;
                const targetVal = progressModalHabit.target?.value || 1;
                const pct = Math.round((projectedTotal / targetVal) * 100);
                const isComplete = pct >= 100;

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-slate-500 dark:text-slate-400">Projected Total</span>
                      <span className={`font-black ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {projectedTotal} / {targetVal} {progressModalHabit.target?.unit || 'h'} ({pct}%)
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
                );
              })()}
            </div>

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
    </div>
  );
}
