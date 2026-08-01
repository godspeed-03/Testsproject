'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const calculateHabitStreak = (h: any) => {
  if (!h || !h.history) return { current: 0, best: 0 };

  const doneDatesArr: string[] = Array.from(
    new Set<string>(
      (h.history || [])
        .filter((hist: any) => hist.status === 'done')
        .map((hist: any) => String(hist.date))
    )
  ).sort();

  if (doneDatesArr.length === 0) {
    return { current: 0, best: 0 };
  }

  const doneDatesSet = new Set(doneDatesArr);

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isScheduledForIso = (dateIso: string): boolean => {
    if (h.startDate && h.startDate > dateIso) return false;
    if (h.endDate && h.endDate < dateIso) return false;

    const mode = h.frequency?.mode || h.recurrence || 'daily';
    if (mode === 'daily') return true;

    if (mode === 'once') {
      return h.startDate === dateIso;
    }

    if (mode === 'specific_days' || mode === 'weekly') {
      const dateObj = new Date(dateIso + 'T00:00:00');
      const dayShortNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayFullNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIdx = dateObj.getDay();

      const shortName = dayShortNames[dayIdx];
      const fullName = dayFullNames[dayIdx];

      const activeDays: string[] = (h.frequency?.days || h.selectedDays || []).map((d: any) =>
        String(d).toLowerCase().trim()
      );

      if (activeDays.length > 0) {
        return activeDays.some(
          (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d)
        );
      }
      return true;
    }

    if (mode === 'monthly') {
      const dateObj = new Date(dateIso + 'T00:00:00');
      const targetDay = h.frequency?.monthlyDay || h.monthlyDay || 1;
      return dateObj.getDate() === targetDay;
    }

    return true;
  };

  // 1. Calculate Best Streak across all completed dates in history
  let maxStreak = 0;
  const evaluatedDates = new Set<string>();

  for (let d = doneDatesArr.length - 1; d >= 0; d--) {
    const startIso = doneDatesArr[d];
    if (evaluatedDates.has(startIso)) continue;

    let chain = 0;
    const cursor = new Date(startIso + 'T00:00:00');

    for (let i = 0; i < 365; i++) {
      const currentIso = formatDateStr(cursor);
      const scheduled = isScheduledForIso(currentIso);

      if (scheduled) {
        if (doneDatesSet.has(currentIso)) {
          chain++;
          evaluatedDates.add(currentIso);
        } else {
          break;
        }
      }
      cursor.setDate(cursor.getDate() - 1);
    }

    if (chain > maxStreak) {
      maxStreak = chain;
    }
  }

  // 2. Calculate Current Streak from the most recent active/done period
  const now = new Date();
  const todayIso = formatDateStr(now);
  const latestDoneIso = doneDatesArr[doneDatesArr.length - 1];
  const startCheckIso = latestDoneIso > todayIso ? latestDoneIso : todayIso;

  let currentStreak = 0;
  const cursor = new Date(startCheckIso + 'T00:00:00');

  const isStartDone = doneDatesSet.has(startCheckIso);
  const isStartScheduled = isScheduledForIso(startCheckIso);

  if (!isStartDone && isStartScheduled) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const currentIso = formatDateStr(cursor);
    const scheduled = isScheduledForIso(currentIso);

    if (scheduled) {
      if (doneDatesSet.has(currentIso)) {
        currentStreak++;
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    current: currentStreak,
    best: Math.max(maxStreak, currentStreak)
  };
};

export const isHabitScheduledForDate = (h: any, dateIso: string): boolean => {
  if (h.startDate && h.startDate > dateIso) return false;
  if (h.endDate && h.endDate < dateIso) return false;

  const mode = h.frequency?.mode || 'daily';
  if (mode === 'daily') return true;

  if (mode === 'once') {
    return h.startDate === dateIso;
  }

  if (mode === 'specific_days' || mode === 'weekly') {
    const selDateObj = new Date(dateIso + 'T00:00:00');
    const dayShortNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayFullNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIdx = selDateObj.getDay();

    const shortName = dayShortNames[dayIdx];
    const fullName = dayFullNames[dayIdx];

    const activeDays: string[] = (h.frequency?.days || h.selectedDays || []).map((d: any) =>
      String(d).toLowerCase().trim()
    );

    if (activeDays.length > 0) {
      return activeDays.some(
        (d) => d === shortName || d === fullName || d.startsWith(shortName) || shortName.startsWith(d)
      );
    }
    return true;
  }

  if (mode === 'monthly') {
    const selDateObj = new Date(dateIso + 'T00:00:00');
    const targetDay = h.frequency?.monthlyDay || 1;
    return selDateObj.getDate() === targetDay;
  }

  return true;
};

export const getTargetGoalLabel = (h: any) => {
  if (h.type === 'task' || h.type === 'event') return 'One-time Task';
  const val = h.target?.value || 1;
  const unit = h.target?.unit || 'times';
  if (unit === 'yes_no' || unit === 'boolean') return 'Mark Done (Yes/No)';
  return `${val} ${unit}`;
};

const TrackerContext = createContext<any>(null);

export const TrackerProvider = ({ children }: { children: React.ReactNode }) => {
  const [habits, setHabits] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'habit' | 'task' | 'event'>('ALL');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'habit' | 'task' | 'event' | 'list'>('habit');

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

  const [categories, setCategories] = useState<string[]>([]);
  const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
  const [syllabusItems, setSyllabusItems] = useState<any[]>([]);
  const [formIsStudyTask, setFormIsStudyTask] = useState(true);
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalHabit, setProgressModalHabit] = useState<any | null>(null);
  const [progressModalDate, setProgressModalDate] = useState<string>('');
  const [progressModalValue, setProgressModalValue] = useState<number>(1);
  const [existingModalVal, setExistingModalVal] = useState<number>(0);
  const [progressModalMode, setProgressModalMode] = useState<'add' | 'replace'>('add');
  const [habitWeekOffsets, setHabitWeekOffsets] = useState<Record<string, number>>({});

  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<any | null>(null);
  const [habitDetailTab, setHabitDetailTab] = useState<'calendar' | 'graph'>('calendar');

  const [formListTitle, setFormListTitle] = useState('');
  const [formListDueDate, setFormListDueDate] = useState('');
  const [formListItemsText, setFormListItemsText] = useState('');
  const [newListInput, setNewListInput] = useState<{ [key: string]: string }>({});
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  // Timer & Background Persistent Stopwatch State
  const [timerHabitId, setTimerHabitId] = useState<string>('');
  const [timerMode, setTimerMode] = useState<'stopwatch'>('stopwatch');
  const [timerSeconds, setTimerSeconds] = useState(1200);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [baseAccumulatedSecs, setBaseAccumulatedSecs] = useState<number>(0);
  const [timerElapsed, setTimerElapsed] = useState<number>(0);
  const [laps, setLaps] = useState<any[]>([]);

  // 1. Load persistent timer state on initial mount from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('upsc_stopwatch_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.habitId) setTimerHabitId(parsed.habitId);
        if (parsed.laps) setLaps(parsed.laps || []);
        const base = parsed.accumulatedSecs || 0;
        setBaseAccumulatedSecs(base);

        if (parsed.running && parsed.startTime) {
          setTimerRunning(true);
          setTimerStartTime(parsed.startTime);
          const currentElapsed = base + Math.floor((Date.now() - parsed.startTime) / 1000);
          setTimerElapsed(currentElapsed);
        } else {
          setTimerRunning(false);
          setTimerStartTime(null);
          setTimerElapsed(base);
        }
      }
    } catch (e) {
      console.error('Failed to parse stopwatch state from localStorage', e);
    }
  }, []);

  // 2. Continuous interval loop calculating exact timestamp difference
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerStartTime) {
      interval = setInterval(() => {
        const currentElapsed = baseAccumulatedSecs + Math.floor((Date.now() - timerStartTime) / 1000);
        setTimerElapsed(currentElapsed);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerStartTime, baseAccumulatedSecs]);

  // Helper to sync state to localStorage
  const syncTimerToStorage = (
    running: boolean,
    startTime: number | null,
    accumulatedSecs: number,
    habitId: string,
    lapsArr: any[]
  ) => {
    try {
      localStorage.setItem(
        'upsc_stopwatch_state',
        JSON.stringify({
          habitId,
          running,
          startTime,
          accumulatedSecs,
          laps: lapsArr,
          lastUpdated: Date.now()
        })
      );
    } catch (e) {}
  };

  const startStopwatch = () => {
    const now = Date.now();
    setTimerRunning(true);
    setTimerStartTime(now);
    syncTimerToStorage(true, now, baseAccumulatedSecs, timerHabitId, laps);
  };

  const pauseStopwatch = () => {
    if (timerStartTime) {
      const extra = Math.floor((Date.now() - timerStartTime) / 1000);
      const newAccumulated = baseAccumulatedSecs + extra;
      setBaseAccumulatedSecs(newAccumulated);
      setTimerElapsed(newAccumulated);
      setTimerRunning(false);
      setTimerStartTime(null);
      syncTimerToStorage(false, null, newAccumulated, timerHabitId, laps);
    } else {
      setTimerRunning(false);
      syncTimerToStorage(false, null, baseAccumulatedSecs, timerHabitId, laps);
    }
  };

  const resetStopwatch = () => {
    setTimerRunning(false);
    setTimerStartTime(null);
    setBaseAccumulatedSecs(0);
    setTimerElapsed(0);
    setLaps([]);
    syncTimerToStorage(false, null, 0, timerHabitId, []);
  };

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
        if (data.categories) setCategories(data.categories);
        if (data.syllabusItems) setSyllabusItems(data.syllabusItems);
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
    const knownUnits = ['yes_no', 'hours', 'times', 'pages', 'answers', 'Liters', 'km'];
    const u = item.target?.unit || 'times';
    if (knownUnits.includes(u)) {
      setFormTargetUnit(u);
      setFormCustomUnit('');
    } else {
      setFormTargetUnit('custom');
      setFormCustomUnit(u);
    }
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
    setFormTargetVal(type === 'task' ? 3 : 1);
    setFormTargetUnit(type === 'task' ? 'hours' : 'times');
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

  const handleToggleLog = async (habitId: string, date: string, status: string = 'toggle', value?: number, increment: boolean = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      alert('Backdating is disabled: You cannot edit or log completion for past dates.');
      return;
    }
    setSaving(true);
    setTogglingId(`${habitId}_${date}`);
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_log', habitId, date, status, value, increment })
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits);
      }
    } catch (e) {
      console.error('Failed to toggle completion', e);
    } finally {
      setSaving(false);
      setTogglingId(null);
    }
  };

  const handleItemClick = (h: any, date: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      alert('Backdating is disabled: You cannot edit or log completion for past dates.');
      return;
    }
    if (!isHabitScheduledForDate(h, date)) {
      alert('This habit is not scheduled for this date.');
      return;
    }
    const isRevision = typeof h.title === 'string' && /^\[R[123]\s+Revision\]/i.test(h.title);
    const isYesNoUnit = h.target?.unit === 'yes_no' || h.target?.unit === 'boolean';
    
    if (isRevision || isYesNoUnit || h.type === 'event') {
      handleToggleLog(h._id, date, 'toggle');
    } else {
      const existing = (h.history || []).find((hist: any) => hist.date === date);
      const existingVal = existing ? (existing.value || 0) : 0;
      setExistingModalVal(existingVal);
      setProgressModalHabit(h);
      setProgressModalDate(date);
      setProgressModalMode(existingVal > 0 ? 'add' : 'replace');
      setProgressModalValue(1);
      setShowProgressModal(true);
    }
  };

  const handleSaveHabitProgress = async (valToSave?: number) => {
    if (!progressModalHabit) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (progressModalDate < todayStr) {
      alert('Backdating is disabled: You cannot edit or log completion for past dates.');
      setShowProgressModal(false);
      return;
    }
    const inputVal = valToSave !== undefined ? valToSave : progressModalValue;
    const existingVal = existingModalVal || 0;
    const finalVal = progressModalMode === 'add'
      ? Number((existingVal + inputVal).toFixed(2))
      : Number(inputVal.toFixed(2));

    const targetVal = progressModalHabit.target?.value || 1;
    const finalStatus = finalVal >= targetVal ? 'done' : (finalVal > 0 ? 'pending' : 'pending');
    await handleToggleLog(progressModalHabit._id, progressModalDate, finalStatus, finalVal);
    setShowProgressModal(false);
  };

  const handleDeleteHabit = async (id: string) => {
    setSaving(true);
    setDeletingId(id);
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
      setDeletingId(null);
    }
  };

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

        const finalTargetUnit = formTargetUnit === 'custom' ? (formCustomUnit.trim() || 'times') : formTargetUnit;

        const payload = {
          action: editingHabitId ? 'update' : 'create',
          id: editingHabitId,
          type: createType,
          title: computedTitle,
          description: formDescription,
          category: formCategory,
          priority: formPriority,
          frequency: {
            mode: formFrequencyMode,
            days: formFrequencyMode === 'specific_days' ? formFrequencyDays : [],
            monthlyDay: formFrequencyMode === 'monthly' ? formMonthlyDay : 1
          },
          target: {
            value: Number(formTargetVal) || 1,
            unit: finalTargetUnit
          },
          reminders: [
            {
              time: formReminderTime,
              enabled: formEnableReminder
            }
          ],
          startDate: formStartDate,
          endDate: formEndDate || undefined,
          isStudyTask: createType === 'task' ? formIsStudyTask : false,
          subject: createType === 'task' && formIsStudyTask ? formSubject : undefined,
          topic: createType === 'task' && formIsStudyTask ? formTopic : undefined,
          icon: formIcon,
          color: formColor
        };

        const res = await fetch('/api/tracker/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          setHabits(data.habits);
          setShowCreateModal(false);
          resetFormState();
        }
      }
    } catch (e) {
      console.error('Failed to create/update habit', e);
    } finally {
      setSaving(false);
    }
  };

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

  const handleAddListItem = async (listId: string) => {
    const text = newListInput[listId];
    if (!text || !text.trim()) return;
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_list_item', listId, text: text.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
        setNewListInput((prev) => ({ ...prev, [listId]: '' }));
      }
    } catch (e) {
      console.error('Failed to add list item', e);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this checklist?')) return;
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

  // Date Navigation Helpers
  const getWeekDaysForSelectedDate = (centerIsoDate: string) => {
    const d = new Date(centerIsoDate + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const sundayOffset = dayOfWeek;
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - sundayOffset);

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const curr = new Date(startOfWeek);
      curr.setDate(startOfWeek.getDate() + i);

      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const dayNumStr = String(curr.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${dayNumStr}`;

      days.push({
        iso,
        dayName: dayNames[curr.getDay()],
        dayNum: curr.getDate(),
        isToday: iso === todayStr
      });
    }
    return days;
  };

  const weekDays = getWeekDaysForSelectedDate(selectedDate);

  const handlePrevWeek = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNumStr = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${dayNumStr}`);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNumStr = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${dayNumStr}`);
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filter items for selectedDate
  const todayItemsUnsorted = habits.filter((h) => {
    if (!isHabitScheduledForDate(h, selectedDate)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title?.toLowerCase().includes(q);
      const matchSubject = h.subject?.toLowerCase().includes(q);
      const matchTopic = h.topic?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchTopic) return false;
    }

    if (typeFilter !== 'ALL' && h.type !== typeFilter) return false;

    return true;
  });

  // Sort agenda: One-time tasks → Other tasks → Habits
  // Within each group: items with no time first, then sorted morning→night
  // Same time → alphabetical by title
  const getItemTime = (h: any): string | null => {
    if (h.reminders && h.reminders[0] && h.reminders[0].enabled !== false && h.reminders[0].time) {
      return h.reminders[0].time; // "HH:MM" format
    }
    return null;
  };

  const getGroupPriority = (h: any): number => {
    const isOnce = h.frequency?.mode === 'once' || (h.type === 'task' && !h.frequency?.mode);
    const isHabitType = h.type === 'habit';
    if (isOnce) return 0;        // One-time tasks first
    if (!isHabitType) return 1;   // Other recurring tasks
    return 2;                     // Habits last
  };

  const todayItems = [...todayItemsUnsorted].sort((a, b) => {
    // 1. Group priority: one-time tasks → recurring tasks → habits
    const groupA = getGroupPriority(a);
    const groupB = getGroupPriority(b);
    if (groupA !== groupB) return groupA - groupB;

    // 2. Within group: items WITH time first (morning→night), no-time items last
    const timeA = getItemTime(a);
    const timeB = getItemTime(b);
    const hasTimeA = timeA !== null;
    const hasTimeB = timeB !== null;

    if (hasTimeA && !hasTimeB) return -1;
    if (!hasTimeA && hasTimeB) return 1;
    if (hasTimeA && hasTimeB && timeA !== timeB) {
      return timeA!.localeCompare(timeB!);
    }

    // 3. Same time or both no time → alphabetical by title
    return (a.title || '').localeCompare(b.title || '');
  });

  const value = {
    habits,
    setHabits,
    lists,
    setLists,
    loading,
    saving,
    deletingId,
    togglingId,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
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
    showProgressModal,
    setShowProgressModal,
    progressModalHabit,
    setProgressModalHabit,
    progressModalDate,
    setProgressModalDate,
    progressModalValue,
    setProgressModalValue,
    existingModalVal,
    progressModalMode,
    setProgressModalMode,
    habitWeekOffsets,
    setHabitWeekOffsets,
    selectedHabitForDetail,
    setSelectedHabitForDetail,
    habitDetailTab,
    setHabitDetailTab,
    formListTitle,
    setFormListTitle,
    formListDueDate,
    setFormListDueDate,
    formListItemsText,
    setFormListItemsText,
    newListInput,
    setNewListInput,
    editingHabitId,
    setEditingHabitId,
    timerHabitId,
    setTimerHabitId,
    timerMode,
    setTimerMode,
    timerSeconds,
    setTimerSeconds,
    timerRunning,
    setTimerRunning,
    timerElapsed,
    setTimerElapsed,
    timerStartTime,
    baseAccumulatedSecs,
    laps,
    setLaps,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    syncTimerToStorage,
    handleOpenEditModal,
    resetFormState,
    getFilteredCategorySubjects,
    handleOpenCreateModal,
    fetchTrackerData,
    handleToggleLog,
    handleItemClick,
    handleSaveHabitProgress,
    handleDeleteHabit,
    handleCreateSubmit,
    handleToggleListItem,
    handleAddListItem,
    handleDeleteList,
    todayItems,
    weekDays,
    handlePrevWeek,
    handleNextWeek,
    handleGoToToday,
    getTargetGoalLabel,
    calculateHabitStreak,
    isHabitScheduledForDate
  };

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
