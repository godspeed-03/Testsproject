'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Flame,
  BarChart3,
  ListTodo,
  Timer as TimerIcon,
  Plus,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Star,
  Clock,
  Loader2,
  Trash2,
  Edit3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Circle
} from 'lucide-react';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';
import ShadcnSelect, { SelectOption } from '@/components/ui/ShadcnSelect';

export default function TrackerPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'habits' | 'calendar' | 'stats' | 'lists' | 'timer'>('today');

  const [habits, setHabits] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected date for Today / Calendar view (default: today 'YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'habit' | 'task' | 'event'>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'habit' | 'task' | 'event' | 'list'>('habit');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState({ id: 'study', label: 'Study', icon: '📚', color: '#6366F1' });
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formFrequencyMode, setFormFrequencyMode] = useState<'daily' | 'specific_days' | 'monthly' | 'once'>('daily');
  const [formFrequencyDays, setFormFrequencyDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [formMonthlyDay, setFormMonthlyDay] = useState<number>(1);
  const [formTargetVal, setFormTargetVal] = useState(1);
  const [formTargetUnit, setFormTargetUnit] = useState('times');
  const [formCustomUnit, setFormCustomUnit] = useState('');
  const [formEnableReminder, setFormEnableReminder] = useState(false);
  const [formReminderTime, setFormReminderTime] = useState('08:00');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formIcon, setFormIcon] = useState('🏃');
  const [formColor, setFormColor] = useState('#6366F1');

  // Study Task Sync State (100% Database Driven)
  const [categories, setCategories] = useState<string[]>([]);
  const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
  const [syllabusItems, setSyllabusItems] = useState<any[]>([]);
  const [formIsStudyTask, setFormIsStudyTask] = useState(true);
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');

  // Habit Progress Modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalHabit, setProgressModalHabit] = useState<any | null>(null);
  const [progressModalDate, setProgressModalDate] = useState<string>('');
  const [progressModalValue, setProgressModalValue] = useState<number>(1);

  // Per-Habit Detail & Monthly Calendar Modal state
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<any | null>(null);
  const [habitDetailTab, setHabitDetailTab] = useState<'calendar' | 'graph'>('calendar');

  // List Form
  const [formListTitle, setFormListTitle] = useState('');
  const [formListDueDate, setFormListDueDate] = useState('');
  const [formListItemsText, setFormListItemsText] = useState('');
  const [newListInput, setNewListInput] = useState<{ [key: string]: string }>({});
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const handleOpenEditModal = (item: any) => {
    setEditingHabitId(item._id || item.id);
    setCreateType(item.type || 'habit');
    setFormTitle(item.title || '');
    setFormCategory(item.category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' });
    setFormDescription(item.description || '');
    setFormPriority(item.priority || 'medium');
    setFormFrequencyMode(item.frequency?.mode || 'daily');
    setFormFrequencyDays(item.frequency?.days || []);
    setFormMonthlyDay(item.frequency?.monthlyDay || 1);
    setFormTargetVal(item.target?.value || 1);
    setFormTargetUnit(item.target?.unit || 'times');
    const r = item.reminders?.[0];
    setFormEnableReminder(r ? r.enabled !== false : false);
    setFormReminderTime(r?.time || '08:00');
    setFormStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setFormEndDate(item.endDate || '');
    setFormIsStudyTask(!!item.isStudyTask);
    setFormSubject(item.subject || '');
    setFormTopic(item.topic || '');
    setFormColor(item.color || '#6366F1');
    setFormIcon(item.icon || '🏃');
    setShowCreateModal(true);
  };

  const resetFormState = (type: 'habit' | 'task' | 'event' | 'list' = 'task') => {
    setEditingHabitId(null);
    setFormTitle('');
    setFormDescription('');
    setFormTopic('');
    setFormSubject(syllabusSubjects.length > 0 ? syllabusSubjects[0] : '');
    setFormPriority('medium');
    setFormCategory({ id: 'study', label: categories[0] || 'GS1', icon: '📚', color: '#6366F1' });
    setFormFrequencyMode(type === 'task' ? 'once' : 'daily');
    setFormFrequencyDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setFormMonthlyDay(1);
    setFormTargetVal(1);
    setFormTargetUnit('times');
    setFormCustomUnit('');
    setFormEnableReminder(false);
    setFormReminderTime('09:00');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormIsStudyTask(type === 'task');
  };

  const getFilteredCategorySubjects = () => {
    const selectedCat = typeof formCategory === 'string' ? formCategory : (formCategory?.label || '');
    if (!selectedCat) return syllabusSubjects;

    // Filter DB items matching this category from Syllabus Matrix
    const matched = syllabusItems
      .filter((item: any) => {
        const itemCat = String(item.category || '').trim();
        return itemCat.toLowerCase() === selectedCat.toLowerCase() ||
               itemCat.toLowerCase().includes(selectedCat.toLowerCase()) ||
               selectedCat.toLowerCase().includes(itemCat.toLowerCase());
      })
      .map((item: any) => item.subject)
      .filter(Boolean);

    if (matched.length > 0) {
      return Array.from(new Set(matched));
    }

    return syllabusSubjects;
  };

  const handleOpenCreateModal = (type: 'habit' | 'task' | 'list' = 'task') => {
    setCreateType(type);
    resetFormState(type);
    setShowCreateModal(true);
  };

  // Timer State
  const [timerHabitId, setTimerHabitId] = useState<string>('');
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('countdown');
  const [timerSeconds, setTimerSeconds] = useState(1200); // 20 mins default
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);

  // Fetch Habit Tracker Data
  useEffect(() => {
    fetchTrackerData();
  }, []);

  const fetchTrackerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tracker/habits');
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits || []);
        setLists(data.lists || []);
        if (data.categories) {
          setCategories(data.categories);
        }
        if (data.syllabusItems) {
          setSyllabusItems(data.syllabusItems);
        }
        if (data.syllabusSubjects) {
          setSyllabusSubjects(data.syllabusSubjects);
          if (data.syllabusSubjects.length > 0 && !formSubject) {
            setFormSubject(data.syllabusSubjects[0]);
          }
        }
        if (data.habits && data.habits.length > 0 && !timerHabitId) {
          setTimerHabitId(data.habits[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to load tracker data', e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Habit completion or update value for a date
  const handleToggleLog = async (habitId: string, date: string, status: string = 'toggle', value?: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_log', habitId, date, status, value })
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits);
      }
    } catch (e) {
      console.error('Failed to toggle completion', e);
    } finally {
      setSaving(false);
    }
  };

  // Click handler for task/event vs habit
  const handleItemClick = (h: any, date: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      alert('Backdating is disabled: You cannot edit or log completion for past dates.');
      return;
    }
    if (h.type === 'task' || h.type === 'event') {
      // Direct completion toggle for tasks and events
      handleToggleLog(h._id, date, 'toggle');
    } else {
      // Habit: ask how much completed today!
      const existing = (h.history || []).find((hist: any) => hist.date === date);
      const currentVal = existing ? existing.value : (h.target?.value || 1);
      setProgressModalHabit(h);
      setProgressModalDate(date);
      setProgressModalValue(currentVal);
      setShowProgressModal(true);
    }
  };

  const handleSaveHabitProgress = async (newVal: number) => {
    if (!progressModalHabit) return;
    const targetVal = progressModalHabit.target?.value || 1;
    const finalStatus = newVal >= targetVal ? 'done' : (newVal > 0 ? 'pending' : 'pending');
    await handleToggleLog(progressModalHabit._id, progressModalDate, finalStatus, newVal);
    setShowProgressModal(false);
  };

  // Delete Habit
  const handleDeleteHabit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits);
        if (data.syllabusSubjects) {
          setSyllabusSubjects(data.syllabusSubjects);
        }
      }
    } catch (e) {
      console.error('Failed to delete item', e);
    } finally {
      setSaving(false);
    }
  };

  // Submit Create Item
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (createType === 'list') {
        const res = await fetch('/api/tracker/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_list', title: formListTitle, pinned: true })
        });
        if (res.ok) {
          const data = await res.json();
          setLists(data.lists);
          setShowCreateModal(false);
          setFormListTitle('');
        }
      } else {
        let computedTitle = formTitle.trim();
        if (!computedTitle) {
          if (createType === 'task' && formIsStudyTask) {
            computedTitle = formTopic ? `${formSubject}: ${formTopic}` : (formSubject || 'Study Task');
          } else if (createType === 'task') {
            computedTitle = formTopic || 'New Task';
          } else {
            computedTitle = 'New Habit';
          }
        }

        const payload: any = {
          action: editingHabitId ? 'update' : 'create',
          id: editingHabitId || undefined,
          type: createType,
          title: computedTitle,
          category: formCategory,
          description: formDescription,
          priority: formPriority,
          frequency: { mode: formFrequencyMode, days: formFrequencyDays, monthlyDay: formMonthlyDay },
          target: { value: formTargetVal, unit: formTargetUnit === 'custom' ? (formCustomUnit || 'units') : formTargetUnit },
          reminders: formEnableReminder && formReminderTime ? [{ time: formReminderTime, enabled: true }] : [],
          startDate: formStartDate || new Date().toISOString().split('T')[0],
          endDate: formEndDate || null,
          isStudyTask: createType === 'task' ? formIsStudyTask : false,
          subject: createType === 'task' ? formSubject : '',
          topic: createType === 'task' ? formTopic : '',
          color: formColor,
          icon: formIcon
        };

        const res = await fetch('/api/tracker/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setHabits(data.habits);
          if (data.syllabusSubjects) {
            setSyllabusSubjects(data.syllabusSubjects);
          }
          setShowCreateModal(false);
          resetFormState(createType);
        }
      }
    } catch (e) {
      console.error('Failed to create item', e);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Checklist item
  const handleToggleListItem = async (listId: string, itemId: string) => {
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_list_item', listId, itemId })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
      }
    } catch (e) {
      console.error('Failed to toggle list item', e);
    }
  };

  // Add Item to Checklist
  const handleAddListItem = async (listId: string) => {
    const text = newListInput[listId];
    if (!text) return;
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_list_item', listId, itemName: text })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
        setNewListInput((prev: any) => ({ ...prev, [listId]: '' }));
      }
    } catch (e) {
      console.error('Failed to add list item', e);
    }
  };

  // Delete Checklist
  const handleDeleteList = async (listId: string) => {
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_list', listId })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
      }
    } catch (e) {
      console.error('Failed to delete list', e);
    }
  };

  // Delete Item from Checklist
  const handleDeleteListItem = async (listId: string, itemId: string) => {
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_list_item', listId, itemId })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
      }
    } catch (e) {
      console.error('Failed to delete list item', e);
    }
  };

  // Update Checklist Due Date
  const handleUpdateListDueDate = async (listId: string, dueDate: string) => {
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_list_due_date', listId, dueDate })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
      }
    } catch (e) {
      console.error('Failed to update list due date', e);
    }
  };

  // Update Habit End Date (Extend End Date)
  const handleUpdateHabitEndDate = async (habitId: string, endDate: string) => {
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_habit_end_date', habitId, endDate })
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits);
      }
    } catch (e) {
      console.error('Failed to update habit end date', e);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'countdown') {
          setTimerSeconds((prev) => {
            if (prev <= 1) {
              setTimerRunning(false);
              // Auto log habit completion when timer finishes!
              if (timerHabitId) handleToggleLog(timerHabitId, selectedDate);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimerElapsed((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode, timerHabitId, selectedDate]);

  // Date strip calculation (7 days around selectedDate)
  const weekDays = useMemo(() => {
    const result = [];
    const base = new Date(selectedDate);
    const dayOfWeek = base.getDay(); // 0 is Sunday
    const start = new Date(base);
    start.setDate(base.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      result.push({ iso, dayName, dayNum, isToday: iso === new Date().toISOString().split('T')[0] });
    }
    return result;
  }, [selectedDate]);

  // Filtered Today Habits (Respecting startDate, endDate, recurrence, and selectedDate)
  const todayItems = useMemo(() => {
    return habits.filter((h) => {
      // 1. Search Query & Type Filters
      const matchSearch = !searchQuery || h.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'ALL' || (typeFilter === 'task' ? (h.type === 'task' || h.type === 'event') : h.type === typeFilter);
      if (!matchSearch || !matchType) return false;

      // 2. Start Date Constraint (Do not show items before their start date)
      if (h.startDate && h.startDate > selectedDate) return false;

      // 3. End Date Constraint (Do not show items past their end date)
      if (h.endDate && h.endDate < selectedDate) return false;

      // 4. Recurrence / Frequency Mode Check
      const mode = h.frequency?.mode || 'daily';
      const selDateObj = new Date(selectedDate + 'T00:00:00');

      if (mode === 'once') {
        return h.startDate === selectedDate;
      }

      if (mode === 'specific_days') {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDayName = dayNames[selDateObj.getDay()];
        const activeDays = h.frequency?.days || [];
        if (activeDays.length > 0 && !activeDays.includes(currentDayName)) {
          return false;
        }
      }

      if (mode === 'monthly') {
        const targetDay = h.frequency?.monthlyDay || 1;
        const currentDayNum = selDateObj.getDate();
        if (currentDayNum !== targetDay) return false;
      }

      return true;
    });
  }, [habits, searchQuery, typeFilter, selectedDate]);

  // Overall Habit Score (0-100)
  const overallHabitScore = useMemo(() => {
    if (habits.length === 0) return 100;
    let totalScore = 0;
    habits.forEach((h) => {
      const doneCount = (h.history || []).filter((hist: any) => hist.status === 'done').length;
      const rate = Math.min(100, Math.round((doneCount / Math.max(1, h.history.length || 7)) * 70 + Math.min(30, (h.streakCurrent || 0) * 3)));
      totalScore += rate;
    });
    return Math.round(totalScore / habits.length);
  }, [habits]);

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Module Header Bar */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${cardBg} backdrop-blur-md shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles size={14} /> Habit & Task Module
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                🔥 Consistency Score: {overallHabitScore}%
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${textTitle}`}>
              Habit & Task Tracker Ecosystem
            </h1>
            <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
              Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateType('habit');
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all shrink-0 active:scale-95"
          >
            <Plus size={18} /> New Habit or Task
          </button>
        </div>

        {/* Sidebar / Top Navigation Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className={`p-3 rounded-2xl border ${cardBg} space-y-1.5 shadow-xs`}>
              {[
                { id: 'today', label: 'Today Agenda', icon: CheckSquare, badge: todayItems.length },
                { id: 'habits', label: 'Habits & Streaks', icon: Flame, badge: habits.filter((h) => h.type === 'habit').length },
                { id: 'calendar', label: 'Month Calendar', icon: CalendarIcon },
                { id: 'stats', label: 'Analytics & Scores', icon: BarChart3 },
                { id: 'lists', label: 'Checklists', icon: ListTodo, badge: lists.length },
                { id: 'timer', label: 'Focus Timer', icon: TimerIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Mini Stats Card */}
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-3 shadow-xs`}>
              <h4 className={`text-xs font-black uppercase tracking-wider ${textMuted} flex items-center gap-1.5`}>
                <TrendingUp size={14} className="text-amber-500" /> Daily Target
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className={textMuted}>Today's Completion</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {todayItems.filter((h) => (h.history || []).some((hist: any) => hist.date === selectedDate && hist.status === 'done')).length} / {todayItems.length} Done
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
                    style={{
                      width: `${todayItems.length > 0 ? (todayItems.filter((h) => (h.history || []).some((hist: any) => hist.date === selectedDate && hist.status === 'done')).length / todayItems.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Work Area */}
          <section className="md:col-span-8 lg:col-span-9 space-y-6">
            {loading ? (
              <div className={`p-12 rounded-2xl border ${cardBg} text-center space-y-3`}>
                <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
                <p className={`text-sm font-bold ${textMuted}`}>Loading Habit & Task Ecosystem...</p>
              </div>
            ) : (
              <>
                {/* 1. TODAY VIEW */}
                {activeTab === 'today' && (
                  <div className="space-y-6">
                    {/* Header + Date Picker Strip */}
                    <div className={`p-5 rounded-2xl border ${cardBg} space-y-4 shadow-xs`}>
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <ShadcnDatePicker
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            disablePastDates={false}
                          />
                        </div>

                        {/* Search & Type Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search tasks..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none w-44 sm:w-56"
                            />
                          </div>

                          <div className="w-36">
                            <ShadcnSelect
                              value={typeFilter}
                              onChange={(val) => setTypeFilter(val as any)}
                              options={[
                                { value: 'ALL', label: 'All Items' },
                                { value: 'habit', label: 'Habits Only' },
                                { value: 'task', label: 'Tasks & Events' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 7-Day Date Picker Strip */}
                      <div className="grid grid-cols-7 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {weekDays.map((w) => {
                          const isSel = w.iso === selectedDate;
                          return (
                            <button
                              key={w.iso}
                              type="button"
                              onClick={() => setSelectedDate(w.iso)}
                              className={`p-2.5 rounded-xl text-center transition-all flex flex-col items-center gap-1 ${
                                isSel
                                  ? 'bg-indigo-600 text-white font-black shadow-md scale-105'
                                  : w.isToday
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold'
                              }`}
                            >
                              <span className="text-[10px] uppercase font-extrabold">{w.dayName}</span>
                              <span className="text-base sm:text-lg font-black">{w.dayNum}</span>
                            </button>
                          );
                        })}
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
                        todayItems.map((h) => {
                          const isDone = (h.history || []).some((hist: any) => hist.date === selectedDate && hist.status === 'done');
                          return (
                            <div
                              key={h._id}
                              className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between gap-4 transition-all hover:border-indigo-500/50 shadow-xs`}
                            >
                              <div className="flex items-center gap-3.5">
                                {/* Icon Badge */}
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                                  style={{ backgroundColor: `${h.color}20`, color: h.color, border: `1px solid ${h.color}40` }}
                                >
                                  {h.icon || h.category?.icon || '🏃'}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {h.type}
                                    </span>
                                    {h.title?.startsWith('[R1') ? (
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs flex items-center gap-1">
                                        ⚡ 1st Revision (R1)
                                      </span>
                                    ) : h.title?.startsWith('[R2') ? (
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white shadow-xs flex items-center gap-1">
                                        ⚡ 2nd Revision (R2)
                                      </span>
                                    ) : h.title?.startsWith('[R3') ? (
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                                        ⚡ 3rd Revision (R3)
                                      </span>
                                    ) : h.isStudyTask && h.frequency?.mode === 'once' ? (
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                        📖 1st Read
                                      </span>
                                    ) : null}
                                    <h4 className={`font-black text-sm sm:text-base ${isDone ? 'line-through opacity-60' : textTitle}`}>
                                      {h.title}
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold flex-wrap">
                                    <span>Goal: {h.target?.value || 1} {h.target?.unit || 'times'}</span>
                                    {h.reminders && h.reminders[0] && h.reminders[0].enabled !== false && h.reminders[0].time && (
                                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                        <Clock size={12} /> {h.reminders[0].time}
                                      </span>
                                    )}
                                    {h.streakCurrent > 0 && (
                                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                                        <Flame size={12} /> {h.streakCurrent}d streak
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Toggle Checkbox & Delete Buttons */}
                              <div className="flex items-center gap-1 sm:gap-2">
                                {h.type !== 'habit' && (
                                  <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => {
                                      if (confirm(`Delete task "${h.title}"? This will also remove associated syllabus & revision records.`)) {
                                        handleDeleteHabit(h._id);
                                      }
                                    }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                    title="Delete Task & Topic Data"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}

                                {selectedDate < new Date().toISOString().split('T')[0] && (
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic pr-1">
                                    Past date (read-only)
                                  </span>
                                )}
                                <button
                                  type="button"
                                  disabled={saving || selectedDate < new Date().toISOString().split('T')[0]}
                                  onClick={() => handleItemClick(h, selectedDate)}
                                  title={selectedDate < new Date().toISOString().split('T')[0] ? 'Backdate editing is disabled' : 'Log completion'}
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                                    selectedDate < new Date().toISOString().split('T')[0]
                                      ? 'opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
                                      : isDone
                                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'
                                  }`}
                                >
                                  {isDone ? <Check size={20} className="stroke-[3]" /> : <Circle size={20} />}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 2. HABITS LIST & STREAKS VIEW */}
                {activeTab === 'habits' && (
                  <div className="space-y-4">
                    <div className={`p-5 rounded-2xl border ${cardBg} flex justify-between items-center flex-wrap gap-3`}>
                      <div>
                        <h3 className={`font-black text-lg sm:text-xl ${textTitle}`}>Habits & 7-Day Consistency Matrix</h3>
                        <p className={`text-xs ${textMuted}`}>Click any day circle to retroactively log habit completion.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateType('habit');
                          setShowCreateModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <Plus size={15} /> Add Habit
                      </button>
                    </div>

                    <div className="space-y-4">
                      {habits.filter((h) => h.type === 'habit').map((h) => (
                        <div key={h._id} className={`p-5 rounded-2xl border ${cardBg} space-y-4 shadow-xs`}>
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner"
                                style={{ backgroundColor: `${h.color}20`, color: h.color }}
                              >
                                {h.icon || '🏃'}
                              </div>
                              <div>
                                <h4 className={`font-black text-base ${textTitle}`}>{h.title}</h4>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-bold mt-0.5">
                                  <span>{h.description ? `${h.description} • ` : ''}Start: {h.startDate || 'Today'} • End:</span>
                                  <div className="w-36">
                                    <ShadcnDatePicker
                                      selectedDate={h.endDate || ''}
                                      onSelectDate={(dateStr) => handleUpdateHabitEndDate(h._id, dateStr)}
                                      disablePastDates={false}
                                      placeholder="No End Date"
                                      isClearable
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/30 text-xs font-black flex items-center gap-1">
                                <Flame size={14} /> {h.streakCurrent || 0} Day Streak (Best: {h.streakBest || 0})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHabitForDetail(h);
                                  setHabitDetailTab('calendar');
                                }}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                              >
                                <BarChart3 size={14} /> Monthly Calendar & Graph
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(h)}
                                className="p-2 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all"
                                title="Edit Habit"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleDeleteHabit(h._id)}
                                className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"
                                title="Delete Habit"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* 7-Day Completion Grid */}
                          <div className="grid grid-cols-7 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            {weekDays.map((w) => {
                              const todayStr = new Date().toISOString().split('T')[0];
                              const isPast = w.iso < todayStr;
                              const isDone = (h.history || []).some((hist: any) => hist.date === w.iso && hist.status === 'done');
                              return (
                                <button
                                  key={w.iso}
                                  type="button"
                                  disabled={isPast || saving}
                                  onClick={() => handleItemClick(h, w.iso)}
                                  title={isPast ? 'Backdate editing is disabled' : `Log completion for ${w.iso}`}
                                  className={`p-2 sm:p-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${
                                    isPast
                                      ? isDone
                                        ? 'bg-emerald-500/60 text-white border-emerald-500/50 font-black cursor-not-allowed'
                                        : 'bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/40 cursor-not-allowed'
                                      : isDone
                                      ? 'bg-emerald-500 text-white border-emerald-400 font-black shadow-sm'
                                      : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                  }`}
                                >
                                  <span className="text-[10px] uppercase font-bold">{w.dayName}</span>
                                  {isDone ? <Check size={16} className="stroke-[3]" /> : <span className="text-xs font-black">{w.dayNum}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. MONTH CALENDAR VIEW */}
                {activeTab === 'calendar' && (
                  <div className={`p-6 rounded-2xl border ${cardBg} space-y-6 shadow-xs`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`font-black text-lg sm:text-xl ${textTitle}`}>Month Schedule Grid</h3>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Showing {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>

                    {/* Month Calendar Grid Days */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `2026-07-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                        const dayHabits = habits.filter((h) => (h.history || []).some((hist: any) => hist.date === dateStr && hist.status === 'done'));
                        const isSel = dateStr === selectedDate;

                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setActiveTab('today');
                            }}
                            className={`p-3 rounded-xl min-h-[70px] flex flex-col justify-between text-left transition-all border ${
                              isSel
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-black">{dayNum}</span>
                            {dayHabits.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {dayHabits.slice(0, 3).map((dh, idx) => (
                                  <span key={idx} className="w-2 h-2 rounded-full bg-emerald-500" title={dh.title} />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. STATISTICS & SCORES VIEW */}
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl border ${cardBg} space-y-6 shadow-xs`}>
                      <h3 className={`font-black text-lg sm:text-xl ${textTitle}`}>Habit & Consistency Analytics</h3>

                      {/* AGGR SCORE Gauge */}
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" fill="transparent" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="10"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * overallHabitScore) / 100}
                              className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000"
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{overallHabitScore}</span>
                            <span className="block text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Score</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                          <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">Consistency Performance</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md font-bold">
                            Weighted algorithm combining daily completions, active streaks, and milestone goals. Keep your score above 85% for optimal preparation pace!
                          </p>
                        </div>
                      </div>

                      {/* Daily Completion Chart */}
                      <div className="space-y-3">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${textMuted}`}>Daily Completed Habits Chart</h4>
                        <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                          {Array.from({ length: 14 }, (_, i) => {
                            const d = i + 15;
                            const dStr = `2026-07-${d}`;
                            const count = habits.filter((h) => (h.history || []).some((hist: any) => hist.date === dStr && hist.status === 'done')).length;
                            const heightPct = Math.min(100, (count / Math.max(1, habits.length)) * 100);

                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                                <div
                                  className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-t-lg transition-all duration-500"
                                  style={{ height: `${Math.max(15, heightPct)}%` }}
                                  title={`${count} items done on ${dStr}`}
                                />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{d}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CHECKLISTS VIEW */}
                {activeTab === 'lists' && (
                  <div className="space-y-6">
                    <div className={`p-5 rounded-2xl border ${cardBg} flex justify-between items-center`}>
                      <h3 className={`font-black text-lg sm:text-xl ${textTitle}`}>Interactive Checklists & Lists</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateType('list');
                          setShowCreateModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <Plus size={15} /> New List
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lists.map((list) => (
                        <div key={list._id} className={`p-5 rounded-2xl border ${cardBg} space-y-4 shadow-xs`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h4 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                              <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" /> {list.title}
                            </h4>

                            <div className="flex items-center gap-2">
                              <div className="w-36">
                                <ShadcnDatePicker
                                  selectedDate={list.dueDate || ''}
                                  onSelectDate={(dateStr) => handleUpdateListDueDate(list._id, dateStr)}
                                  disablePastDates={false}
                                  placeholder="No Due Date"
                                  isClearable
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteList(list._id)}
                                className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"
                                title="Delete Checklist"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {list.items?.map((item: any) => (
                              <div
                                key={item.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                  item.checked
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <div
                                  onClick={() => handleToggleListItem(list._id, item.id)}
                                  className="flex items-center gap-3 cursor-pointer flex-1"
                                >
                                  {item.checked ? <CheckCircle2 size={18} className="shrink-0" /> : <Circle size={18} className="text-slate-400 shrink-0" />}
                                  <span className={`text-xs font-bold ${item.checked ? 'line-through opacity-70' : ''}`}>{item.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteListItem(list._id, item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                  title="Delete Item"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Item Input */}
                          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <input
                              type="text"
                              placeholder="Add item..."
                              value={newListInput[list._id] || ''}
                              onChange={(e) => setNewListInput({ ...newListInput, [list._id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddListItem(list._id);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddListItem(list._id)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xs"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. FOCUS TIMER VIEW */}
                {activeTab === 'timer' && (
                  <div className={`p-8 rounded-2xl border ${cardBg} text-center space-y-6 shadow-xs max-w-lg mx-auto`}>
                    <div className="space-y-1">
                      <h3 className={`font-black text-xl ${textTitle}`}>Integrated Focus Timer</h3>
                      <p className={`text-xs ${textMuted}`}>Time your study habits & auto-log progress upon completion.</p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex justify-center gap-2">
                      {(['countdown', 'stopwatch'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setTimerMode(m);
                            setTimerRunning(false);
                            if (m === 'countdown') setTimerSeconds(1200);
                            else setTimerElapsed(0);
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold capitalize ${
                            timerMode === m
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {/* Circular Timer Display */}
                    <div className="w-56 h-56 rounded-full bg-slate-100 dark:bg-slate-950 border-4 border-indigo-500/40 flex items-center justify-center mx-auto shadow-xl relative">
                      <div className="text-center space-y-1">
                        <span className="text-4xl font-black tracking-widest text-slate-900 dark:text-slate-100 font-mono">
                          {timerMode === 'countdown'
                            ? `${Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:${(timerSeconds % 60).toString().padStart(2, '0')}`
                            : `${Math.floor(timerElapsed / 60).toString().padStart(2, '0')}:${(timerElapsed % 60).toString().padStart(2, '0')}`}
                        </span>
                        <span className="block text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                          {timerRunning ? 'Timer Active' : 'Paused / Ready'}
                        </span>
                      </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex justify-center items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setTimerRunning(!timerRunning)}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                      >
                        {timerRunning ? <Pause size={18} /> : <Play size={18} />} {timerRunning ? 'Pause' : 'Start Timer'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTimerRunning(false);
                          setTimerSeconds(1200);
                          setTimerElapsed(0);
                        }}
                        className="p-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Unified Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border space-y-4 sm:space-y-5`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className={`font-black text-lg ${textTitle}`}>Create New {createType.toUpperCase()}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetFormState('task');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {[
                { id: 'habit', label: 'Habit' },
                { id: 'task', label: 'Task / Event' },
                { id: 'list', label: 'Checklist' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const newType = t.id as any;
                    setCreateType(newType);
                    resetFormState(newType);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                    createType === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-bold">
              {createType === 'list' ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block mb-1.5 ${textMuted}`}>Checklist Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weekly NCERT Study Checklist"
                      value={formListTitle}
                      onChange={(e) => setFormListTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className={`block mb-1.5 ${textMuted}`}>Due / End Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <ShadcnDatePicker
                      selectedDate={formListDueDate}
                      onSelectDate={(dateStr) => setFormListDueDate(dateStr)}
                      disablePastDates={false}
                      placeholder="No End Date (Ongoing)"
                      isClearable
                    />
                  </div>

                  <div>
                    <label className={`block mb-1.5 ${textMuted}`}>Initial List Items <span className="text-slate-400 font-normal">(Optional, one per line)</span></label>
                    <textarea
                      rows={3}
                      placeholder="e.g.&#10;Read Chapter 1 & 2&#10;Solve PYQ Exercise&#10;Write Summary Notes"
                      value={formListItemsText}
                      onChange={(e) => setFormListItemsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none resize-none font-medium text-xs"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* 1. Frequency & Priority — always shown first for task/event */}
                  <div className={formFrequencyMode === 'once' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
                    <div>
                      <label className={`block mb-1.5 ${textMuted}`}>Frequency</label>
                      <ShadcnSelect
                        value={formFrequencyMode}
                        onChange={(val) => setFormFrequencyMode(val as any)}
                        options={
                          createType === 'task'
                            ? [
                                { value: 'once', label: '🎯 One-Time Task' },
                                { value: 'daily', label: '🔁 Every Day' },
                                { value: 'specific_days', label: '📅 Specific Days of Week' },
                                { value: 'monthly', label: '📆 Monthly (Date of Month)' }
                              ]
                            : [
                                { value: 'once', label: '🎯 One-Time Event' },
                                { value: 'daily', label: '🔁 Every Day' },
                                { value: 'specific_days', label: '📅 Specific Days of Week' },
                                { value: 'monthly', label: '📆 Monthly (Date of Month)' }
                              ]
                        }
                      />
                    </div>

                    {formFrequencyMode === 'once' && (
                      <div>
                        <label className={`block mb-1.5 ${textMuted}`}>Priority</label>
                        <ShadcnSelect
                          value={formPriority}
                          onChange={(val) => setFormPriority(val as any)}
                          options={[
                            { value: 'low', label: '🟢 Low' },
                            { value: 'medium', label: '🟡 Medium' },
                            { value: 'high', label: '🔴 High' }
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Syllabus Matrix — only for one-time tasks */}
                  {formFrequencyMode === 'once' && (
                    <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-indigo-950 dark:text-indigo-200 font-extrabold text-xs">
                          <input
                            type="checkbox"
                            checked={formIsStudyTask}
                            onChange={(e) => setFormIsStudyTask(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>📚 Link to Syllabus Matrix & Auto-Sync Daily Log</span>
                        </label>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                          Auto Progress Sync
                        </span>
                      </div>

                      {formIsStudyTask && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div>
                            <label className={`block mb-1 text-[11px] ${textMuted}`}>Category / Paper</label>
                            <ShadcnSelect
                              value={typeof formCategory === 'string' ? formCategory : (formCategory?.label || (categories[0] || 'GS1'))}
                              onChange={(val) => {
                                setFormCategory({ id: val.toLowerCase().replace(/\s+/g, '_'), label: val, icon: '📚', color: '#6366F1' });
                                const matched = syllabusItems
                                  .filter((item: any) => String(item.category || '').toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(String(item.category || '').toLowerCase()))
                                  .map((item: any) => item.subject)
                                  .filter(Boolean);
                                const firstSubj = matched[0] || syllabusSubjects[0] || '';
                                if (firstSubj) {
                                  setFormSubject(firstSubj);
                                  setFormTitle(formTopic ? `${firstSubj}: ${formTopic}` : firstSubj);
                                }
                              }}
                              options={(categories.length > 0 ? categories : ['GS1', 'GS2', 'GS3', 'GS4', 'Maths Optional', 'CSAT Aptitude']).map((c) => ({
                                value: c,
                                label: c
                              }))}
                            />
                          </div>

                          <div>
                            <label className={`block mb-1 text-[11px] ${textMuted}`}>Syllabus Subject</label>
                            {getFilteredCategorySubjects().length > 0 ? (
                              <ShadcnSelect
                                value={formSubject}
                                onChange={(val) => {
                                  setFormSubject(val);
                                  setFormTitle(formTopic ? `${val}: ${formTopic}` : val);
                                }}
                                options={getFilteredCategorySubjects().map((s) => ({ value: s, label: `📖 ${s}` }))}
                              />
                            ) : (
                              <input
                                type="text"
                                placeholder="e.g. Polity, Geography, Ethics..."
                                value={formSubject}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormSubject(val);
                                  setFormTitle(formTopic ? `${val}: ${formTopic}` : val);
                                }}
                                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none text-xs font-medium"
                              />
                            )}
                          </div>

                          <div>
                            <label className={`block mb-1 text-[11px] ${textMuted}`}>Topic / Sub-topic Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Fundamental Rights Article 14-18"
                              value={formTopic}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormTopic(val);
                                const currentSubj = formSubject || (syllabusSubjects[0] || 'Study Task');
                                setFormTitle(val ? `${currentSubj}: ${val}` : currentSubj);
                              }}
                              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none text-xs font-medium"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Icon & Title */}
                  <div>
                    <label className={`block mb-1.5 ${textMuted}`}>
                      Icon & Title <span className="text-slate-400 font-normal">{formFrequencyMode === 'once' ? '(Optional - Auto-filled from Subject/Topic)' : ''}</span>
                    </label>
                    <div className="flex gap-2 items-start">
                      {/* Emoji Picker Toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('emoji-picker-grid');
                            if (el) el.classList.toggle('hidden');
                          }}
                          className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl hover:scale-110 transition-transform shrink-0"
                          title="Pick an icon"
                        >
                          {formIcon}
                        </button>
                        <div
                          id="emoji-picker-grid"
                          className="hidden absolute top-12 left-0 z-50 w-[280px] p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl"
                        >
                          <p className={`text-[10px] font-bold ${textMuted} mb-1.5`}>Choose Icon</p>
                          <div className="grid grid-cols-10 gap-1">
                            {[
                              '📚','📖','✏️','📝','🎯','🔥','⭐','💡','🧠','📊',
                              '🏃','💪','🧘','🏋️','🚴','🏊','⚽','🎾','🥊','🧗',
                              '💧','🍎','🥗','💊','😴','☀️','🌙','⏰','🔔','📅',
                              '🎵','🎨','📸','🎬','🎮','🧩','♟️','🎲','🎤','🎸',
                              '💻','📱','🔬','🔭','🌍','✈️','🚗','🏠','💼','🎓'
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setFormIcon(emoji);
                                  document.getElementById('emoji-picker-grid')?.classList.add('hidden');
                                }}
                                className={`w-6 h-6 flex items-center justify-center text-base rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors ${formIcon === emoji ? 'bg-indigo-100 dark:bg-indigo-900/60 ring-1 ring-indigo-400' : ''}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder={formFrequencyMode === 'once' ? 'Auto-filled from Subject & Topic...' : 'e.g. Daily GS Revision, Run 3 Miles...'}
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>


                  {formFrequencyMode === 'specific_days' && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <label className={`block ${textMuted} text-[11px]`}>Repeat on Specific Days of Week</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isSel = formFrequencyDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (isSel) setFormFrequencyDays(formFrequencyDays.filter((d) => d !== day));
                                else setFormFrequencyDays([...formFrequencyDays, day]);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isSel
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formFrequencyMode === 'monthly' && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <label className={`block ${textMuted} text-xs shrink-0`}>Repeat on Day of Month (1-31):</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formMonthlyDay}
                        onChange={(e) => setFormMonthlyDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                        className="w-24 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none text-xs font-bold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1.5 ${textMuted}`}>Daily Goal Target</label>
                      <input
                        type="number"
                        min="1"
                        value={formTargetVal}
                        onChange={(e) => setFormTargetVal(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className={`block mb-1.5 ${textMuted}`}>Unit</label>
                      <ShadcnSelect
                        value={formTargetUnit}
                        onChange={(val) => setFormTargetUnit(val)}
                        options={[
                          { value: 'times', label: 'times (Occurrences)' },
                          { value: 'hours', label: 'hours (Duration)' },
                          { value: 'mins', label: 'mins (Duration)' },
                          { value: 'pages', label: 'pages (Reading)' },
                          { value: 'answers', label: 'answers (Writing)' },
                          { value: 'Liters', label: 'Liters (Hydration)' },
                          { value: 'km', label: 'km (Distance)' },
                          { value: 'custom', label: 'Custom...' }
                        ]}
                      />
                      {formTargetUnit === 'custom' && (
                        <input
                          type="text"
                          placeholder="e.g. chapters, sets..."
                          value={formCustomUnit}
                          onChange={(e) => setFormCustomUnit(e.target.value)}
                          className="w-full mt-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1.5 ${textMuted}`}>Start Date <span className="text-rose-500">*</span></label>
                      <ShadcnDatePicker
                        selectedDate={formStartDate}
                        onSelectDate={(dateStr) => setFormStartDate(dateStr)}
                        disablePastDates={false}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1.5 ${textMuted}`}>End Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <ShadcnDatePicker
                        selectedDate={formEndDate}
                        onSelectDate={(dateStr) => setFormEndDate(dateStr)}
                        disablePastDates={false}
                        placeholder="No End Date (Ongoing)"
                        isClearable
                      />
                    </div>
                  </div>

                  {/* Reminder Toggle & Time Selector */}
                  <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={formEnableReminder}
                          onChange={(e) => setFormEnableReminder(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>🔔 Enable Daily Reminder Time</span>
                      </label>
                    </div>

                    {formEnableReminder && (
                      <div className="flex items-center gap-3 pt-1">
                        <label className={`block ${textMuted} text-xs shrink-0 font-bold`}>Reminder Time:</label>
                        <input
                          type="time"
                          value={formReminderTime}
                          onChange={(e) => setFormReminderTime(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none text-xs font-bold"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetFormState('task');
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habit Progress Prompt Modal */}
      {showProgressModal && progressModalHabit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`${cardBg} rounded-2xl w-full max-w-sm p-6 shadow-2xl border space-y-5`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{progressModalHabit.icon || '🏃'}</span>
                <h3 className={`font-black text-base ${textTitle}`}>Log Habit Progress</h3>
              </div>
              <button type="button" onClick={() => setShowProgressModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                How much did you complete for <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{progressModalHabit.title}</span> on {progressModalDate}?
              </p>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Target Goal</span>
                <p className="text-base font-black text-slate-900 dark:text-slate-100">
                  {progressModalHabit.target?.value || 1} {progressModalHabit.target?.unit || 'times'}
                </p>
              </div>

              <div>
                <label className={`block mb-1 text-xs font-bold ${textMuted}`}>Quantity Completed Today</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={progressModalValue}
                    onChange={(e) => setProgressModalValue(Number(e.target.value))}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-black text-sm outline-none"
                  />
                  <span className="self-center text-xs font-black text-slate-500">
                    {progressModalHabit.target?.unit || 'times'}
                  </span>
                </div>
                <p className="text-[11px] font-bold mt-1 text-slate-500">
                  {progressModalValue >= (progressModalHabit.target?.value || 1) ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">✓ Goal met! Marks habit complete.</span>
                  ) : progressModalValue > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-black">Partial progress recorded.</span>
                  ) : (
                    <span>Habit will remain pending.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveHabitProgress(progressModalHabit.target?.value || 1)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />} Mark Full Goal Complete ({progressModalHabit.target?.value || 1} {progressModalHabit.target?.unit || 'times'})
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveHabitProgress(progressModalValue)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm"
                >
                  Save Logged Value ({progressModalValue})
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveHabitProgress(0)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Reset (0)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Habit Monthly Tracker & Streak Graph Modal */}
      {selectedHabitForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`${cardBg} rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 shadow-2xl border space-y-6`}>
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
                  {selectedHabitForDetail.icon || '🏃'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-lg sm:text-xl ${textTitle}`}>{selectedHabitForDetail.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {selectedHabitForDetail.category?.label || 'General'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    Target Goal: <span className="font-extrabold text-slate-900 dark:text-slate-100">{selectedHabitForDetail.target?.value || 1} {selectedHabitForDetail.target?.unit || 'times'}</span> per day
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHabitForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Habit Key Stats Summary Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-500 flex items-center justify-center gap-1">
                  <Flame size={12} /> Current Streak
                </span>
                <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                  {selectedHabitForDetail.streakCurrent || 0} Days
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                  <Sparkles size={12} /> Best Streak
                </span>
                <p className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
                  {selectedHabitForDetail.streakBest || 0} Days
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> Total Logged
                </span>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {(selectedHabitForDetail.history || []).filter((h: any) => h.status === 'done').length} Days
                </p>
              </div>
            </div>

            {/* Modal View Tab Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setHabitDetailTab('calendar')}
                className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  habitDetailTab === 'calendar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CalendarIcon size={14} /> Monthly Calendar Tracker
              </button>
              <button
                type="button"
                onClick={() => setHabitDetailTab('graph')}
                className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  habitDetailTab === 'graph'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp size={14} /> Streak & Progress Graph
              </button>
            </div>

            {/* TAB 1: Monthly Calendar Grid */}
            {habitDetailTab === 'calendar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    Monthly Completion Matrix (July 2026)
                  </h4>
                  <span className="text-[11px] font-extrabold text-slate-500">
                    Target: {selectedHabitForDetail.target?.value || 1} {selectedHabitForDetail.target?.unit || 'times'}/day
                  </span>
                </div>

                {/* 31-Day Month Matrix Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-extrabold text-slate-400 uppercase">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* Fill empty padding days for July 2026 (Starts on Wed = 3 empty slots) */}
                  <div className="aspect-square" />
                  <div className="aspect-square" />
                  <div className="aspect-square" />

                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1;
                    const iso = `2026-07-${String(dayNum).padStart(2, '0')}`;
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isToday = iso === todayStr;
                    const isPast = iso < todayStr;
                    const hist = (selectedHabitForDetail.history || []).find((h: any) => h.date === iso);
                    const isDone = hist?.status === 'done';
                    const value = hist?.value || 0;
                    const target = selectedHabitForDetail.target?.value || 1;

                    return (
                      <div
                        key={iso}
                        className={`aspect-square rounded-xl p-1.5 flex flex-col items-center justify-between text-xs font-black border transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                            : value > 0
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                            : isPast
                            ? 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800'
                            : isToday
                            ? 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
                            : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold opacity-80">{dayNum}</span>
                        {isDone ? (
                          <Check size={14} className="stroke-[3]" />
                        ) : value > 0 ? (
                          <span className="text-[9px] font-black">{value}/{target}</span>
                        ) : isPast ? (
                          <span className="text-[9px] font-bold text-slate-400 opacity-60">—</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-extrabold text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-emerald-500" /> Goal Met (Done)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-amber-500/30 border border-amber-500/50" /> Partial Progress
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-800" /> Missed / Pending
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Streak & Progress Bar Graph */}
            {habitDetailTab === 'graph' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    14-Day Progress & Streak Graph
                  </h4>
                  <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                    Target: {selectedHabitForDetail.target?.value || 1} {selectedHabitForDetail.target?.unit || 'times'}
                  </span>
                </div>

                {/* 14-Day Bar Graph */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="h-44 flex items-end justify-between gap-1.5 pt-6 pb-2 px-1 border-b border-slate-200 dark:border-slate-800">
                    {Array.from({ length: 14 }).map((_, idx) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (13 - idx));
                      const iso = d.toISOString().split('T')[0];
                      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                      const hist = (selectedHabitForDetail.history || []).find((h: any) => h.date === iso);
                      const target = selectedHabitForDetail.target?.value || 1;
                      const val = hist ? (hist.value ?? (hist.status === 'done' ? target : 0)) : 0;
                      const pct = Math.min(100, Math.max(10, Math.round((val / target) * 100)));
                      const isDone = hist?.status === 'done' || val >= target;

                      return (
                        <div key={iso} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-md whitespace-nowrap z-20 shadow-lg pointer-events-none">
                            {val} / {target} ({iso})
                          </div>

                          <div className="w-full flex-1 flex items-end justify-center">
                            <div
                              style={{ height: `${pct}%` }}
                              className={`w-full max-w-[20px] rounded-t-lg transition-all duration-300 ${
                                isDone
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-xs'
                                  : val > 0
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300 dark:bg-slate-800'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-500">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="text-amber-500" size={20} />
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-slate-100">Consistency Score</h5>
                      <p className="text-[11px] font-bold text-slate-500">Based on past 14 days activity</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {Math.round(
                      ((selectedHabitForDetail.history || []).filter((h: any) => h.status === 'done').length / 14) * 100
                    )}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
