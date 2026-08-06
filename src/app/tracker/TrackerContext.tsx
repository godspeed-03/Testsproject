'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubjectTheme } from '@/lib/subjectThemeMap';
import BatchRevisionCompletionModal from '@/components/dashboard/BatchRevisionCompletionModal';
import WakeUpTimeModal from '@/components/dashboard/WakeUpTimeModal';
import { toast } from 'sonner';
import { Coffee } from 'lucide-react';

export const confirmDeleteWithSonner = (
  title: string,
  onConfirm: () => void,
  description?: string
) => {
  toast.custom((t) => (
    <div className="w-full max-w-sm p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-3 font-sans text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 glass-panel">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">{title}</h4>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {description || 'This action cannot be undone. Are you sure?'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => toast.dismiss(t)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t);
            onConfirm();
          }}
          className="px-4 py-1.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
        >
          Delete
        </button>
      </div>
    </div>
  ), {
    duration: 6000,
    position: 'top-center'
  });
};

export const confirmRestDayWithSonner = (
  onConfirm: () => void
) => {
  toast.custom((t) => (
    <div className="w-full max-w-sm p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl space-y-3 font-sans text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 glass-panel">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Coffee size={20} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">Mark Today as Rest Day?</h4>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Uncompleted tasks for today will shift to tomorrow, and active habits will be logged as Rest Day.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => toast.dismiss(t)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t);
            onConfirm();
          }}
          className="px-4 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
        >
          Mark Rest Day
        </button>
      </div>
    </div>
  ), {
    duration: 7000,
    position: 'top-center'
  });
};

export const getTodayIso = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getTomorrowIso = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getHabitProgressColor = (loggedVal: number, targetVal: number, unitStr: string, status?: string) => {
  if (status === 'done') return 'done';
  if ((status === 'failed' || status === 'false') && (!loggedVal || loggedVal <= 0)) return 'failed';
  if (!loggedVal || loggedVal <= 0) return 'none';

  let normLogged = loggedVal;
  let normTarget = targetVal || 1;

  const unit = (unitStr || '').toLowerCase().trim();
  if (['hours', 'hrs', 'hour'].includes(unit)) {
    if (normLogged <= 24 && normTarget <= 24) {
      normLogged = loggedVal * 60;
      normTarget = (targetVal || 1) * 60;
    }
  }

  const pct = Math.round((normLogged / normTarget) * 100);

  if (pct >= 100) return 'done';
  if (pct >= 67) return 'p75';
  if (pct >= 34) return 'p50';
  if (pct >= 1) return 'p25';
  return 'p0';
};

export const calculateHabitStreak = (h: any) => {
  if (!h || !h.history || h.type !== 'habit') return { current: 0, best: 0 };

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
  const skippedDatesSet = new Set<string>(
    (h.history || []).filter((e: any) => e.status === "skipped" || e.status === "rest").map((e: any) => String(e.date))
  );

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isScheduledForIso = (dateIso: string): boolean => {
    const startIso = h.startDate ? String(h.startDate).split("T")[0] : null;
    const endIso = h.endDate ? String(h.endDate).split("T")[0] : null;
    if (startIso && startIso > dateIso) return false;
    if (endIso && endIso < dateIso) return false;

    const mode = h.frequency?.mode || h.recurrence || 'daily';
    if (mode === 'daily') return true;

    if (mode === 'once') {
      return startIso === dateIso;
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
        } else if (skippedDatesSet.has(currentIso)) {
          // Rest Day: preserve streak
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
  const isStartSkipped = skippedDatesSet.has(startCheckIso);
  const isStartScheduled = isScheduledForIso(startCheckIso);

  if (!isStartDone && !isStartSkipped && isStartScheduled) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const currentIso = formatDateStr(cursor);
    const scheduled = isScheduledForIso(currentIso);

    if (scheduled) {
      if (doneDatesSet.has(currentIso)) {
        currentStreak++;
      } else if (skippedDatesSet.has(currentIso)) {
        // Rest Day: preserve streak
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
  const val = h.target?.value || 1;
  const unit = (h.target?.unit || 'times').toLowerCase().trim();
  if (unit === 'yes_no' || unit === 'boolean') return 'Mark Done';

  if (['mins', 'minutes', 'min', 'minute'].includes(unit)) {
    if (val < 60) return `${val} mins`;
    const hrs = Math.floor(val / 60);
    const mins = val % 60;
    if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} mins`;
    return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  }

  if (['hours', 'hrs', 'hour'].includes(unit)) {
    const totalMins = Math.round(val * 60);
    if (totalMins < 60) return `${totalMins} mins`;
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} mins`;
    return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  }

  if (unit !== 'times') {
    return `${val} ${h.target?.unit || unit}`;
  }
  if (h.type === 'task' || h.type === 'event') {
    if (val > 1) return `One-time Task (${val} ${unit})`;
    return 'One-time Task';
  }
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

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'habit' | 'task' | 'event'>('task');

  // Load typeFilter from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('upsc_tracker_type_filter');
      if (saved && ['ALL', 'habit', 'task', 'event'].includes(saved)) {
        setTypeFilter(saved as 'ALL' | 'habit' | 'task' | 'event');
      }
    } catch (e) {}
  }, []);

  const handleSetTypeFilter = (val: 'ALL' | 'habit' | 'task' | 'event') => {
    setTypeFilter(val);
    try {
      localStorage.setItem('upsc_tracker_type_filter', val);
    } catch (e) {}
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'habit' | 'task' | 'event' | 'list'>('habit');

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState({ id: 'study', label: 'Study', icon: '📚', color: '#6366F1' });
  const [formDescription, setFormDescription] = useState('');
  const [formFrequencyMode, setFormFrequencyMode] = useState<'daily' | 'specific_days' | 'monthly' | 'once'>('daily');
  const [formFrequencyDays, setFormFrequencyDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [formMonthlyDay, setFormMonthlyDay] = useState<number>(1);
  const [formTargetVal, setFormTargetVal] = useState(1);
  const [formTargetUnit, setFormTargetUnit] = useState('times');
  const [formCustomUnit, setFormCustomUnit] = useState('');
  const [formStartDate, setFormStartDate] = useState(getTomorrowIso());
  const [formEndDate, setFormEndDate] = useState('');
  const [formIcon, setFormIcon] = useState('🏃');
  const [formColor, setFormColor] = useState('#6366F1');

  const [categories, setCategories] = useState<string[]>([]);
  const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
  const [syllabusItems, setSyllabusItems] = useState<any[]>([]);
  const [topicRevisions, setTopicRevisions] = useState<any[]>([]);
  const [batchedRevisions, setBatchedRevisions] = useState<any[]>([]);
  const [formIsStudyTask, setFormIsStudyTask] = useState(true);
  const [formStudyTaskMode, setFormStudyTaskMode] = useState<'none' | 'single' | 'batch_revision'>('single');
  const [formIsBatchRevision, setFormIsBatchRevision] = useState(false);
  const [formRevisionClusterBadges, setFormRevisionClusterBadges] = useState<Array<{ category: string; subject: string; topic: string }>>([]);
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formSelectedMicroTopics, setFormSelectedMicroTopics] = useState<string[]>([]);
  const [formIsAugmentedRevision, setFormIsAugmentedRevision] = useState(true);

  // Auto-default Spaced Repetition SRS toggle: ON for GS1, GS2, GS3, GS4, OFF for CSAT/Maths/Reasoning
  useEffect(() => {
    if (formIsStudyTask && formStudyTaskMode === 'single') {
      const catStr = typeof formCategory === 'string' ? formCategory : formCategory?.label || formCategory?.id || '';
      const GS_REGEX = /gs\s*[1-4]|gs1|gs2|gs3|gs4|general\s*studies/i;
      const NON_AUGMENTED_REGEX = /csat|math|maths|mathematics|series|reasoning|aptitude|mental|comprehension|verbal/i;

      if (GS_REGEX.test(catStr) || GS_REGEX.test(formSubject)) {
        setFormIsAugmentedRevision(true);
      } else if (NON_AUGMENTED_REGEX.test(formSubject) || NON_AUGMENTED_REGEX.test(catStr)) {
        setFormIsAugmentedRevision(false);
      } else {
        setFormIsAugmentedRevision(true);
      }
    }
  }, [formSubject, formCategory, formIsStudyTask, formStudyTaskMode]);

  // Auto-fill Icon & Theme Color from selected Syllabus subject when formIsStudyTask is true
  useEffect(() => {
    if (formIsStudyTask && formSubject) {
      const matchedItem = (syllabusItems || []).find(
        (item: any) => item.subject?.toLowerCase() === formSubject.toLowerCase()
      );
      if (matchedItem) {
        if (matchedItem.color) setFormColor(matchedItem.color);
        if (matchedItem.icon) setFormIcon(matchedItem.icon);
      } else {
        const theme = getSubjectTheme(formSubject);
        if (theme) {
          if (theme.color) setFormColor(theme.color);
          if (theme.icon) setFormIcon(theme.icon);
        }
      }
    }
  }, [formSubject, syllabusItems, formIsStudyTask]);

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

  // Batch Revision Multi-Topic Completion Modal State
  const [showBatchRevModal, setShowBatchRevModal] = useState(false);
  const [batchRevModalHabit, setBatchRevModalHabit] = useState<any | null>(null);
  const [batchRevModalDate, setBatchRevModalDate] = useState<string>('');

  // Early Wake-Up Habit Modal State
  const [formWakeUpTargetTime, setFormWakeUpTargetTime] = useState<string>('04:00');
  const [showWakeUpModal, setShowWakeUpModal] = useState(false);
  const [wakeUpModalHabit, setWakeUpModalHabit] = useState<any | null>(null);
  const [wakeUpModalDate, setWakeUpModalDate] = useState<string>('');

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

  // Midnight 12:00 AM Date Rollover Interval
  // Automatically switches to the new date and refreshes agenda when midnight (00:00:00) strikes
  useEffect(() => {
    let lastDate = getTodayIso();
    const interval = setInterval(() => {
      const currentDate = getTodayIso();
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        setSelectedDate(currentDate);
        fetchTrackerData();
      }
    }, 5000);
    return () => clearInterval(interval);
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
          const CATEGORY_ORDER = ["gs1", "gs2", "gs3", "gs4", "maths", "csat"];
          const sortedCats = [...(data.categories as string[])].sort((a, b) => {
            const aLower = a.toLowerCase().trim();
            const bLower = b.toLowerCase().trim();
            const aIdx = CATEGORY_ORDER.findIndex((c) => aLower === c || aLower.startsWith(c));
            const bIdx = CATEGORY_ORDER.findIndex((c) => bLower === c || bLower.startsWith(c));
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return a.localeCompare(b);
          });
          setCategories(sortedCats);
        }
        if (data.syllabusItems) setSyllabusItems(data.syllabusItems);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.batchedRevisions) setBatchedRevisions(data.batchedRevisions);
        if (data.syllabusSubjects) {
          setSyllabusSubjects(data.syllabusSubjects);
          if (data.syllabusSubjects.length > 0 && !formSubject) {
            setFormSubject(data.syllabusSubjects[0]);
          }
        }
        if (data.habits && data.habits.length > 0 && !timerHabitId) {
          setTimerHabitId(data.habits[0].id || data.habits[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to load tracker data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (item: any) => {
    const itemType = item.type || 'habit';
    setEditingHabitId(item._id || item.id);
    setCreateType(itemType);
    setFormTitle(item.title || '');
    setFormCategory(item.category || { id: 'general', label: 'General', icon: '📌', color: '#6366F1' });
    setFormDescription(item.description || '');
    setFormFrequencyMode(item.frequency?.mode || 'daily');
    setFormFrequencyDays(item.frequency?.days || []);
    setFormMonthlyDay(item.frequency?.monthlyDay || 1);
    const rawVal = item.target?.value || 1;
    const rawUnit = (item.target?.unit || 'yes_no').toLowerCase().trim();

    let u = item.target?.unit || 'yes_no';
    let val = rawVal;
    if (['hours', 'hrs', 'hour'].includes(rawUnit)) {
      u = 'minutes';
      val = Math.round(rawVal * 60);
    }

    setFormTargetVal(val);
    const knownUnits = ['yes_no', 'minutes', 'mins', 'min', 'minute', 'lectures', 'times', 'pages', 'answers', 'Liters', 'km'];
    if (knownUnits.includes(u)) {
      setFormTargetUnit(u);
      setFormCustomUnit('');
    } else {
      setFormTargetUnit('custom');
      setFormCustomUnit(u);
    }
    setFormStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setFormEndDate(item.endDate || '');

    const isBatchRev = Boolean(item.isBatchRevision);

    if (isBatchRev) {
      setFormIsStudyTask(true);
      setFormStudyTaskMode('batch_revision');
      setFormIsBatchRevision(true);

      let clusterItems: Array<{ category: string; subject: string; topic: string }> = [];
      if (Array.isArray(item.selectedMicroTopicsCluster) && item.selectedMicroTopicsCluster.length > 0) {
        clusterItems = item.selectedMicroTopicsCluster;
      } else {
        const matchedBatch = (batchedRevisions || []).find(
          (b: any) => b.habitId === (item.id || item._id) || b.habitId === item.customId
        );
        if (matchedBatch && Array.isArray(matchedBatch.topicStatuses) && matchedBatch.topicStatuses.length > 0) {
          clusterItems = matchedBatch.topicStatuses.map((t: any) => ({
            category: t.category || "GS",
            subject: t.subject || item.subject || "General",
            topic: t.topic || t.topicId,
          }));
        } else if (item.topic) {
          const parts = String(item.topic).split(',').map(t => t.trim()).filter(Boolean);
          const cat = typeof item.category === 'string' ? item.category : item.category?.label || 'GS';
          clusterItems = parts.map(t => ({
            category: cat,
            subject: item.subject || 'General',
            topic: t,
          }));
        }
      }

      setFormRevisionClusterBadges(clusterItems);
      setFormSelectedMicroTopics(clusterItems.map((c) => c.topic));
    } else if (itemType === 'task' && (item.isStudyTask || item.subject || item.topic)) {
      setFormIsStudyTask(true);
      setFormStudyTaskMode('single');
      setFormIsBatchRevision(false);
      setFormRevisionClusterBadges([]);
      if (Array.isArray(item.selectedMicroTopics)) {
        setFormSelectedMicroTopics(item.selectedMicroTopics);
      } else if (item.topic) {
        setFormSelectedMicroTopics(String(item.topic).split(',').map(t => t.trim()).filter(Boolean));
      }
    } else {
      setFormIsStudyTask(itemType === 'habit' ? false : !!item.isStudyTask);
      setFormStudyTaskMode(itemType === 'task' && item.isStudyTask ? 'single' : 'none');
      setFormIsBatchRevision(false);
      setFormRevisionClusterBadges([]);
    }

    setFormIsAugmentedRevision(item.isAugmentedRevision !== undefined ? !!item.isAugmentedRevision : true);
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
    setFormSelectedMicroTopics([]);
    const initialCategoryLabel = categories.length > 0 ? categories[0] : '';
    setFormCategory({ id: initialCategoryLabel.toLowerCase(), label: initialCategoryLabel, icon: '📚', color: '#6366F1' });
    const matchedSubjects = initialCategoryLabel
      ? (syllabusItems || [])
          .filter((item: any) => {
            const itemCat = String(item.category || '').trim();
            return itemCat.toLowerCase() === initialCategoryLabel.toLowerCase();
          })
          .map((item: any) => item.subject)
          .filter(Boolean)
      : [];
    const initialSubject = matchedSubjects.length > 0 ? matchedSubjects[0] : '';
    setFormSubject(initialSubject);
    setFormFrequencyMode(type === 'task' ? 'once' : 'daily');
    setFormFrequencyDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setFormMonthlyDay(1);
    setFormTargetVal(1);
    setFormTargetUnit('yes_no');
    setFormCustomUnit('');
    setFormStartDate(getTomorrowIso());
    setFormEndDate('');
    setFormIsStudyTask(type === 'task');
    setFormStudyTaskMode(type === 'task' ? 'single' : 'none');
    setFormIsBatchRevision(false);
    setFormRevisionClusterBadges([]);
    setFormSelectedMicroTopics([]);
    setFormTopic('');
    setFormIsAugmentedRevision(true);
  };

  const getFilteredCategorySubjects = () => {
    const selectedCat = typeof formCategory === 'string' ? formCategory : (formCategory?.label || '');
    if (!selectedCat) return syllabusSubjects;

    const catLower = selectedCat.trim().toLowerCase();

    const fromSyl = (syllabusItems || [])
      .filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower)
      .map((item: any) => item.subject);

    const fromHab = (habits || [])
      .filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower)
      .map((item: any) => item.subject);

    const fromRev = (topicRevisions || [])
      .filter((item: any) => String(item.category || '').trim().toLowerCase() === catLower)
      .map((item: any) => item.subject);

    const allMatched = Array.from(new Set([...fromSyl, ...fromHab, ...fromRev].filter(Boolean)));
    return allMatched.length > 0 ? allMatched : syllabusSubjects;
  };

  const handleOpenCreateModal = (type: 'habit' | 'task' | 'list' = 'task') => {
    setCreateType(type);
    resetFormState(type);
    setShowCreateModal(true);
  };

  const handleToggleLog = async (
    habitId: string,
    date: string,
    status: string = 'toggle',
    value?: number,
    increment: boolean = false,
    completedTopics?: string[]
  ) => {
    const todayStr = getTodayIso();
    if (date < todayStr) {
      toast.error('Backdating disabled: Cannot edit past dates.');
      return;
    }
    setSaving(true);
    setTogglingId(`${habitId}_${date}`);
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_log', habitId, date, status, value, increment, completedTopics })
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits);
        toast.success('Status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch (e) {
      console.error('Failed to toggle completion', e);
      toast.error('Error updating status');
    } finally {
      setSaving(false);
      setTogglingId(null);
    }
  };

  const handleItemClick = (h: any, date: string) => {
    // 1. Always open Batch Revision modal when clicking a Batch Revision item
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

    if (isBatchRev) {
      console.log("isBatchRev", isBatchRev);
      setBatchRevModalHabit(h);
      setBatchRevModalDate(date);
      setShowBatchRevModal(true);
      return;
    }

    const todayStr = getTodayIso();
    if (date < todayStr) {
      alert('Backdating is disabled: You cannot edit or log completion for past dates.');
      return;
    }
    if (!isHabitScheduledForDate(h, date)) {
      alert('This habit is not scheduled for this date.');
      return;
    }

    const isWakeUpHabit = Boolean(
      h.target?.unit === 'time' ||
      h.target?.targetTime ||
      (typeof h.title === 'string' && /wake\s*up/i.test(h.title))
    );

    if (isWakeUpHabit) {
      setWakeUpModalHabit(h);
      setWakeUpModalDate(date);
      setShowWakeUpModal(true);
      return;
    }

    const isRevision = typeof h.title === 'string' && /^\[R[123]\s+Revision\]/i.test(h.title);
    const unitStr = (h.target?.unit || '').toLowerCase().trim();
    const isBooleanGoal = unitStr === 'yes_no' || unitStr === 'boolean' || h.type === 'event';
    
    if (isRevision || isBooleanGoal) {
      handleToggleLog(h.id || h._id, date, 'toggle');
    } else {
      const existing = (h.history || []).find((hist: any) => hist.date === date);
      const existingVal = existing ? (existing.value || 0) : 0;
      setExistingModalVal(existingVal);
      setProgressModalHabit(h);
      setProgressModalDate(date);
      setProgressModalMode(existingVal > 0 ? 'add' : 'replace');
      const isTimeGoal = ['mins', 'minutes', 'min', 'minute', 'hours', 'hrs', 'hour'].includes(unitStr);
      setProgressModalValue(isTimeGoal ? 0 : 1);
      setShowProgressModal(true);
    }
  };

  const handleSaveWakeUpLog = async (wakeTime: string, tier: number, pts: number, status: string) => {
    if (!wakeUpModalHabit) return;
    const habitId = wakeUpModalHabit.id || wakeUpModalHabit._id;
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_log',
          habitId,
          date: wakeUpModalDate,
          wakeTime,
          tier,
          pts,
          status,
          value: 1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits);
      }
    } catch (e) {
      console.error('Failed to log wake up time', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBatchRevProgress = async (completedTopicKeys: string[], isAllDone: boolean) => {
    if (!batchRevModalHabit) return;
    const habitId = batchRevModalHabit.id || batchRevModalHabit._id;
    const statusToSave = isAllDone ? 'done' : 'pending';
    const valueToSave = isAllDone ? 1 : 0;
    await handleToggleLog(habitId, batchRevModalDate, statusToSave, valueToSave, false, completedTopicKeys);
  };

  const handleSaveHabitProgress = async (valToSave?: number) => {
    if (!progressModalHabit) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (progressModalDate < todayStr) {
      alert('Backdating is disabled: You cannot edit or log completion for past dates.');
      setShowProgressModal(false);
      return;
    }
    const habitId = progressModalHabit.id || progressModalHabit._id;
    setTogglingId(`${habitId}_${progressModalDate}`);
    const inputVal = valToSave !== undefined ? valToSave : progressModalValue;
    const existingVal = existingModalVal || 0;
    const unitStr = (progressModalHabit.target?.unit || '').toLowerCase().trim();
    const isMinsUnit = ['mins', 'minutes', 'min', 'minute'].includes(unitStr);

    let finalVal: number;
    if (isMinsUnit) {
      const inputMins = Math.round(inputVal * 60);
      finalVal = progressModalMode === 'add' ? existingVal + inputMins : inputMins;
    } else {
      finalVal = progressModalMode === 'add'
        ? Number((existingVal + inputVal).toFixed(2))
        : Number(inputVal.toFixed(2));
    }

    const targetVal = progressModalHabit.target?.value || 1;
    const finalStatus = finalVal >= targetVal ? 'done' : (finalVal > 0 ? 'pending' : 'pending');
    await handleToggleLog(habitId, progressModalDate, finalStatus, finalVal);
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
        if (data.batchedRevisions) {
          setBatchedRevisions(data.batchedRevisions);
        }
        if (data.topicRevisions) {
          setTopicRevisions(data.topicRevisions);
        }
        toast.success('Deleted successfully');
      } else {
        toast.error('Failed to delete item');
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
        const isStudyTask = createType === 'task' ? (formStudyTaskMode !== 'none') : false;
        const isBatchRevision = createType === 'task' ? (formStudyTaskMode === 'batch_revision') : false;

        if (createType === 'task') {
          if (formStudyTaskMode === 'batch_revision') {
            if (!formRevisionClusterBadges || formRevisionClusterBadges.length === 0) {
              toast.error('Please select at least one micro-topic for your Batch Revision cluster.');
              setSaving(false);
              return;
            }
          } else if (formStudyTaskMode === 'single') {
            if (!formSubject.trim()) {
              toast.error('Please select a subject for your study task.');
              setSaving(false);
              return;
            }
            if (!formTopic.trim() && formSelectedMicroTopics.length === 0) {
              toast.error('Please enter or select at least one micro-topic.');
              setSaving(false);
              return;
            }
          }
        }

        let selectedClusterPayload: Array<{ category: string; subject: string; topic: string }> = [];

        if (isBatchRevision) {
          selectedClusterPayload = formRevisionClusterBadges;
        }

        let computedTitle = formTitle.trim();
        const activeTopics = isBatchRevision
          ? formRevisionClusterBadges.map((b) => b.topic).join(', ')
          : formSelectedMicroTopics.length > 0
          ? formSelectedMicroTopics.join(', ')
          : formTopic;

        if (!computedTitle) {
          if (createType === 'task' && isBatchRevision) {
            computedTitle = `Batch Revision (${formRevisionClusterBadges.length} Topics)`;
          } else if (createType === 'task' && isStudyTask) {
            computedTitle = activeTopics ? `${formSubject}: ${activeTopics}` : (formSubject || 'Study Task');
          } else if (createType === 'task') {
            computedTitle = 'New Task';
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
          frequency: {
            mode: formFrequencyMode,
            days: formFrequencyMode === 'specific_days' ? formFrequencyDays : [],
            monthlyDay: formFrequencyMode === 'monthly' ? formMonthlyDay : 1
          },
          target: {
            value: (finalTargetUnit === 'yes_no' || finalTargetUnit === 'boolean') ? null : (Number(formTargetVal) || 1),
            unit: finalTargetUnit,
            targetTime: finalTargetUnit === 'time' ? (formWakeUpTargetTime || '04:00') : undefined
          },
          penaltyTiers: finalTargetUnit === 'time' ? [
            { tier: 0, maxTime: "04:15", pts: 100, status: "done", label: "Perfect Wake-Up", streakAction: "increment" },
            { tier: 1, maxTime: "05:00", pts: 75, status: "done", label: "Grace Period", streakAction: "increment" },
            { tier: 2, maxTime: "06:00", pts: 40, status: "done", label: "Minor Delay", streakAction: "freeze" },
            { tier: 3, maxTime: "07:00", pts: 10, status: "failed", label: "Major Delay", streakAction: "reset" },
            { tier: 4, maxTime: "23:59", pts: -20, status: "failed", label: "Severe Miss", streakAction: "reset" }
          ] : undefined,
          startDate: formStartDate,
          endDate: formEndDate || undefined,
          isStudyTask,
          isBatchRevision,
          studyTaskMode: formStudyTaskMode,
          subject: isStudyTask ? (isBatchRevision ? (formRevisionClusterBadges[0]?.subject || formSubject) : formSubject) : undefined,
          topic: isStudyTask ? activeTopics : undefined,
          selectedMicroTopics: formSelectedMicroTopics,
          selectedMicroTopicsCluster: selectedClusterPayload,
          isAugmentedRevision: isStudyTask ? (isBatchRevision ? false : formIsAugmentedRevision) : undefined,
          icon: isBatchRevision ? '⚡' : formIcon,
          color: isBatchRevision ? '#8B5CF6' : formColor
        };

        const res = await fetch('/api/tracker/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          setHabits(data.habits);
          if (data.batchedRevisions) setBatchedRevisions(data.batchedRevisions);
          if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
          setShowCreateModal(false);
          resetFormState();
          toast.success(editingHabitId ? 'Updated successfully!' : 'Created successfully!');
        } else {
          toast.error('Failed to save habit');
        }
      }
    } catch (e) {
      console.error('Failed to create/update habit', e);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRestDay = async (dateStr?: string) => {
    const targetDate = dateStr || selectedDate || getTodayIso();
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_rest_day', date: targetDate }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.habits) setHabits(data.habits);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.batchedRevisions) setBatchedRevisions(data.batchedRevisions);
        if (data.syllabusItems) setSyllabusItems(data.syllabusItems);
        await fetchTrackerData();
        toast.success("Rest Day marked! Uncompleted tasks shifted to tomorrow.");
      } else {
        toast.error("Failed to mark Rest Day. Please try again.");
      }
    } catch (e) {
      console.error('Failed to mark rest day', e);
      toast.error("An error occurred while marking Rest Day.");
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
    try {
      const res = await fetch('/api/tracker/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_list', listId })
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
        toast.success('Checklist deleted');
      } else {
        toast.error('Failed to delete checklist');
      }
    } catch (e) {
      console.error('Failed to delete list', e);
    }
  };

  // Date Navigation Helpers
  const getWeekDaysForSelectedDate = (centerIsoDate: string) => {
    const d = new Date(centerIsoDate + 'T00:00:00');
    const dayOfWeek = d.getDay();
    // Monday = 0 offset, Sunday = 6 offset (week starts on Monday)
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - mondayOffset);

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

  // Sort agenda:
  // 1. Primary: Tasks (type !== 'habit') first, Habits (type === 'habit') second
  // 2. Secondary: Alphabetical order
  const todayItems = [...todayItemsUnsorted].sort((a, b) => {
    // 1. Group: Tasks first (0), Habits second (1)
    const isHabitA = a.type === 'habit' ? 1 : 0;
    const isHabitB = b.type === 'habit' ? 1 : 0;
    if (isHabitA !== isHabitB) return isHabitA - isHabitB;

    // 2. Alphabetical tie-breaker
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
    setTypeFilter: handleSetTypeFilter,
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
    setProgressModalHabit,
    progressModalDate,
    setProgressModalDate,
    progressModalValue,
    setProgressModalValue,
    existingModalVal,
    progressModalMode,
    setProgressModalMode,
    showBatchRevModal,
    setShowBatchRevModal,
    batchRevModalHabit,
    setBatchRevModalHabit,
    batchRevModalDate,
    setBatchRevModalDate,
    handleSaveBatchRevProgress,
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
    handleMarkRestDay,
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
    showWakeUpModal,
    setShowWakeUpModal,
    wakeUpModalHabit,
    setWakeUpModalHabit,
    wakeUpModalDate,
    setWakeUpModalDate,
    formWakeUpTargetTime,
    setFormWakeUpTargetTime,
    handleSaveWakeUpLog,
    getTargetGoalLabel,
    calculateHabitStreak,
    isHabitScheduledForDate
  };

  return (
    <TrackerContext.Provider value={value}>
      {children}
      {showWakeUpModal && wakeUpModalHabit && (
        <WakeUpTimeModal
          isOpen={showWakeUpModal}
          onClose={() => setShowWakeUpModal(false)}
          habit={wakeUpModalHabit}
          dateIso={wakeUpModalDate}
          onSave={handleSaveWakeUpLog}
        />
      )}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
