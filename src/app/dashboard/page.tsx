'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import MasterRoutineTable from '@/components/MasterRoutineTable';
import CountdownHeader from '@/components/dashboard/CountdownHeader';
import RedFlagAlerts from '@/components/dashboard/RedFlagAlerts';
import MasterStatsOverview from '@/components/dashboard/MasterStatsOverview';
import SyllabusModule from '@/components/dashboard/SyllabusModule';
import SpacedRevisionModule from '@/components/dashboard/SpacedRevisionModule';
import DailyModule from '@/components/dashboard/DailyModule';
import TestsModule from '@/components/dashboard/TestsModule';

// Modals
import SubjectTopicsModal from '@/components/dashboard/SubjectTopicsModal';
import AddSubjectModal from '@/components/dashboard/AddSubjectModal';
import AddTestModal from '@/components/dashboard/AddTestModal';
import SkipRevisionModal from '@/components/dashboard/SkipRevisionModal';
import EditTargetsModal from '@/components/dashboard/EditTargetsModal';
import QuickDailyLogModal from '@/components/dashboard/QuickDailyLogModal';
import ViewDailyLogModal from '@/components/dashboard/ViewDailyLogModal';

import { Loader2 } from 'lucide-react';

const DEFAULT_WEEKLY_TARGETS = [
  { id: 'gs', name: 'GS Total Study', target: 30, isDefault: true },
  { id: 'maths', name: 'Maths Optional', target: 20, isDefault: true },
  { id: 'ca', name: 'Current Affairs', target: 10, isDefault: true },
  { id: 'ans', name: 'Answer Writing Practice', target: 5, isDefault: true },
];

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getStartOfWeekStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  return start.toISOString().split('T')[0];
};

const getEndOfWeekStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  const end = new Date(d.setDate(diff));
  return end.toISOString().split('T')[0];
};

const addDaysStr = (dateStr: string, days: number) => {
  try {
    const parts = dateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + days);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
};

export default function DashboardPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active Tab Sync
  const [activeTab, setActiveTab] = useState<'syllabus' | 'revision' | 'daily' | 'tests' | 'timetable'>('syllabus');

  useEffect(() => {
    if (pathname.includes('/revision')) setActiveTab('revision');
    else if (pathname.includes('/daily')) setActiveTab('daily');
    else if (pathname.includes('/tests')) setActiveTab('tests');
    else if (pathname.includes('/timetable')) setActiveTab('timetable');
    else setActiveTab('syllabus');
  }, [pathname]);

  // Listener for Quick 3-Min Log from Navbar
  useEffect(() => {
    const handleOpenModal = () => {
      setEditLogId(null);
      setLogDate(getTodayStr());
      setShowDailyModal(true);
    };

    window.addEventListener('open-daily-log-modal', handleOpenModal);

    if (searchParams?.get('openLog') === 'true') {
      handleOpenModal();
    }

    return () => {
      window.removeEventListener('open-daily-log-modal', handleOpenModal);
    };
  }, [searchParams]);

  // Theme Mode
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('upsc_theme');
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('upsc_theme', nextTheme);
    if (nextTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Data States
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [testLogs, setTestLogs] = useState<any[]>([]);
  const [topicRevisions, setTopicRevisions] = useState<any[]>([]);
  const [weeklyTargetsList, setWeeklyTargetsList] = useState<any[]>(DEFAULT_WEEKLY_TARGETS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedRevisionDate, setSelectedRevisionDate] = useState<string>(getTodayStr());

  // Modal Visibility States
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showViewDailyModal, setShowViewDailyModal] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);

  // Selected Item States for Modals
  const [selectedSkipSubject, setSelectedSkipSubject] = useState<any>(null);
  const [selectedSubjectTopics, setSelectedSubjectTopics] = useState<any>(null);
  const [selectedViewLog, setSelectedViewLog] = useState<any>(null);
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const [logDate, setLogDate] = useState<string>(getTodayStr());

  // Fetch Initial Data
  const fetchTrackerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        if (data.syllabusList) setSyllabusList(data.syllabusList);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.testLogs) setTestLogs(data.testLogs);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.weeklyTargets) setWeeklyTargetsList(data.weeklyTargets);
      }
    } catch (e) {
      console.error('Failed to fetch tracker data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  // Sync Weekly Targets with LocalStorage & API
  const startOfWeek = getStartOfWeekStr();
  const endOfWeek = getEndOfWeekStr();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('upsc_target_week_key');
      if (savedKey !== startOfWeek) {
        localStorage.setItem('upsc_weekly_targets', JSON.stringify(DEFAULT_WEEKLY_TARGETS));
        localStorage.setItem('upsc_target_week_key', startOfWeek);
        setWeeklyTargetsList(DEFAULT_WEEKLY_TARGETS);
      } else {
        const savedTargets = localStorage.getItem('upsc_weekly_targets');
        if (savedTargets) {
          try {
            setWeeklyTargetsList(JSON.parse(savedTargets));
          } catch (e) {}
        }
      }
    }
  }, [startOfWeek]);

  // API Action Handlers
  const handleToggleMilestone = async (subjectItem: any, milestoneKey: string) => {
    const updatedValue = !subjectItem[milestoneKey];
    const updatedSubject = { ...subjectItem, [milestoneKey]: updatedValue };

    if (updatedSubject.rev2 || updatedSubject.preFinalRev) {
      updatedSubject.status = 'Mastered';
    } else if (updatedSubject.rev1) {
      updatedSubject.status = 'Revised Once';
    } else if (updatedSubject.firstRead) {
      updatedSubject.status = 'First Read Done';
    } else {
      updatedSubject.status = 'In Progress';
    }

    setSaving(true);
    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_milestone',
          id: subjectItem.id,
          ...updatedSubject,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to toggle milestone', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = async (name: string, category: string, source: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          subject: name.trim(),
          category,
          source: source.trim(),
          status: 'Not Started',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to add subject', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to delete subject', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceSpacedRepetition = async (id: string, daysOffset?: number) => {
    const today = getTodayStr();
    setSaving(true);

    const topicRev = topicRevisions.find((t: any) => t.id === id || t._id === id || t.customId === id);

    if (topicRev) {
      try {
        const res = await fetch('/api/tracker/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'batchLogCluster',
            subject: topicRev.subject,
            category: topicRev.category || 'GS1',
            clusterTitle: '',
            topicNames: [topicRev.topic],
            date: today,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
          if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        }
      } catch (e) {
        console.error('Failed to advance topic revision', e);
      } finally {
        setSaving(false);
      }
      return;
    }

    const item = syllabusList.find((s) => s.id === id || s.customId === id);
    if (!item) {
      setSaving(false);
      return;
    }

    let daysToAdd = daysOffset || 1;
    if (!daysOffset) {
      if (item.status === 'First Read Done') daysToAdd = 7;
      else if (item.status === 'Revised Once') daysToAdd = 21;
      else daysToAdd = 45;
    }

    const nextRev = addDaysStr(today, daysToAdd);

    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'advance',
          id: item.id || item.customId,
          ...item,
          date: today,
          nextRev,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);

        const existingTodayLog = dailyLogs.find((l) => l.date === today) || {};
        const currentCompleted = existingTodayLog.completedRevisions || [];
        const targetId = item.id || item.customId;
        if (!currentCompleted.includes(targetId)) {
          const updatedCompleted = [...currentCompleted, targetId];
          const dailyRes = await fetch('/api/tracker/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...existingTodayLog,
              date: today,
              completedRevisions: updatedCompleted,
            }),
          });
          if (dailyRes.ok) {
            const dData = await dailyRes.json();
            setDailyLogs(dData.dailyLogs);
          }
        }
      }
    } catch (e) {
      console.error('Failed to advance repetition', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSkipTopicRevision = async (subjectObj: any, remarkText: string) => {
    setSaving(true);
    try {
      const isTopicRev = topicRevisions.some(
        (tr) => tr.id === subjectObj.id || tr._id === subjectObj.id || tr.customId === subjectObj.id
      );

      let res;
      if (isTopicRev) {
        res = await fetch('/api/tracker/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'skipRevision',
            topicId: subjectObj.id || subjectObj.customId,
            remark: remarkText,
          }),
        });
      } else {
        res = await fetch('/api/tracker/syllabus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'skipRevision',
            id: subjectObj.id || subjectObj.customId,
            remark: remarkText,
          }),
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.syllabusList) setSyllabusList(data.syllabusList);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
      }
    } catch (e) {
      console.error('Failed to skip revision', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId?: string, subject?: string, topicName?: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteTopic',
          topicId,
          subject,
          topic: topicName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.syllabusList) setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to delete topic', e);
    } finally {
      setSaving(false);
    }
  };

  const handleBatchLogCluster = async (subject: string, category: string, clusterTitle: string, topicNames: string[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batchLogCluster',
          subject,
          category,
          clusterTitle,
          topicNames,
          date: getTodayStr(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.syllabusList) setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to save cluster topics', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDailyLog = async (logData: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      if (res.ok) {
        const data = await res.json();
        setDailyLogs(data.dailyLogs);
        if (data.syllabusList) setSyllabusList(data.syllabusList);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
      }
    } catch (e) {
      console.error('Failed to save daily log', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTestResult = async (testData: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs);
      }
    } catch (e) {
      console.error('Failed to save test result', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestLog = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tracker/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs);
      }
    } catch (e) {
      console.error('Failed to delete test log', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWeeklyTargets = async (targets: any[]) => {
    setWeeklyTargetsList(targets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('upsc_weekly_targets', JSON.stringify(targets));
      localStorage.setItem('upsc_target_week_key', startOfWeek);
    }

    setSaving(true);
    try {
      await fetch('/api/tracker/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startOfWeek,
          targets,
        }),
      });
    } catch (e) {
      console.error('Failed to save weekly targets', e);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const backup = { syllabusList, dailyLogs, testLogs, weeklyTargetsList, exportedAt: new Date().toISOString() };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `UPSC_2027_System_Backup_${getTodayStr()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setSaving(true);
      try {
        const imported = JSON.parse(evt.target?.result as string);
        const res = await fetch('/api/tracker/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imported),
        });
        if (res.ok) {
          const data = await res.json();
          setSyllabusList(data.syllabusList);
          setDailyLogs(data.dailyLogs);
          setTestLogs(data.testLogs);
          if (imported.weeklyTargetsList || imported.weeklyTargets) {
            setWeeklyTargetsList(imported.weeklyTargetsList || imported.weeklyTargets);
          }
          alert('System data successfully imported into database!');
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsText(file);
  };

  // Calculated Stats & Flags for Headers
  const todayStr = getTodayStr();
  const currentWeekLogs = dailyLogs.filter((l) => l.date >= startOfWeek && l.date <= endOfWeek);

  let weeklyHours = 0;
  let weeklyAnsCount = 0;

  currentWeekLogs.forEach((l) => {
    weeklyHours += l.total || 0;
    weeklyAnsCount += l.ansCount || 0;
  });

  let caStreak = 0;
  for (const l of dailyLogs) {
    if (l.caDone === 'YES') caStreak++;
    else break;
  }

  const redFlags: string[] = [];
  const overdueCount = syllabusList.filter((s) => s.nextRev && s.nextRev < todayStr).length;
  if (overdueCount >= 2) {
    redFlags.push(
      `<strong>Overdue Revision Debt:</strong> You have ${overdueCount} subjects overdue in your Spaced Repetition Engine. Clear them today!`
    );
  }

  const totalSubjects = syllabusList.length;
  const completedSubjects = syllabusList.filter((s) => s.rev1 || s.rev2 || s.status === 'Mastered').length;
  const syllabusPercent = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;

  // Due Revisions List for Daily Log Modal
  const topicRevItems = topicRevisions.map((t: any) => ({
    id: t.id || t._id || t.customId,
    customId: t.customId,
    subject: t.subject,
    topic: t.topic,
    source: t.topic,
    category: t.category || 'GS1',
    nextRev: t.nextScheduledDate,
    date: t.firstReadDate,
    rev1: !!t.r1CompletedDate && t.r1Status !== 'Skipped',
    rev2: !!t.r2CompletedDate && t.r2Status !== 'Skipped',
    status:
      t.r3CompletedDate && t.r3Status !== 'Skipped'
        ? 'Mastered'
        : t.r2CompletedDate && t.r2Status !== 'Skipped'
        ? 'Revised Once'
        : 'First Read Done',
  }));

  const rawActiveRevisionsSource = topicRevItems.length > 0 ? topicRevItems : syllabusList;
  const activeRevisionsSource = rawActiveRevisionsSource.filter((s: any) => {
    const cat = (s.category || '').toUpperCase();
    return cat === 'GS1' || cat === 'GS2' || cat === 'GS3' || cat === 'GS4' || cat.startsWith('GS');
  });

  const dueRevisions = activeRevisionsSource.filter((s: any) => {
    const nRev = s.nextRev;
    return nRev && nRev <= todayStr;
  });

  // UI Theme Utilities
  const isLight = theme === 'light';
  const cardBg = isLight ? 'bg-white shadow-sm border border-slate-200/90' : 'bg-slate-900 border border-slate-800 shadow-md';
  const cardInnerBg = isLight ? 'bg-slate-50/90 border border-slate-200' : 'bg-slate-950/60 border border-slate-800/80';
  const inputBg = isLight
    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500'
    : 'bg-slate-800/80 border border-slate-700 text-slate-100 focus:bg-slate-800';
  const tableHeaderBg = isLight ? 'bg-slate-100 text-slate-800 border-b border-slate-200' : 'bg-slate-800/80 text-slate-300 border-b border-slate-700';
  const textTitle = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-600' : 'text-slate-400';

  const getCategoryBadge = (cat: string) => {
    if (isLight) {
      switch (cat) {
        case 'GS1':
          return 'bg-blue-600 text-white font-extrabold border-blue-700';
        case 'GS2':
          return 'bg-purple-600 text-white font-extrabold border-purple-700';
        case 'GS3':
          return 'bg-emerald-600 text-white font-extrabold border-emerald-700';
        case 'GS4':
          return 'bg-rose-600 text-white font-extrabold border-rose-700';
        case 'MATHS':
          return 'bg-amber-600 text-white font-extrabold border-amber-700';
        case 'CSAT':
          return 'bg-cyan-600 text-white font-extrabold border-cyan-700';
        default:
          return 'bg-slate-700 text-white font-extrabold border-slate-800';
      }
    } else {
      switch (cat) {
        case 'GS1':
          return 'bg-blue-500/30 text-blue-200 border-blue-400 font-extrabold';
        case 'GS2':
          return 'bg-purple-500/30 text-purple-200 border-purple-400 font-extrabold';
        case 'GS3':
          return 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-extrabold';
        case 'GS4':
          return 'bg-rose-500/30 text-rose-200 border-rose-400 font-extrabold';
        case 'MATHS':
          return 'bg-amber-500/30 text-amber-200 border-amber-400 font-extrabold';
        case 'CSAT':
          return 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-extrabold';
        default:
          return 'bg-slate-800 text-slate-200 font-extrabold';
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-200'}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-amber-500" />
          <p className="font-extrabold text-sm tracking-wide">Loading UPSC Engine Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} p-3 sm:p-6 space-y-6 transition-colors duration-200 font-sans`}>
      {/* Main Page Content Views */}
      {activeTab === 'syllabus' && (
        <SyllabusModule
          syllabusList={syllabusList}
          topicRevisions={topicRevisions}
          onToggleMilestone={handleToggleMilestone}
          onDeleteSubject={handleDeleteSubject}
          onOpenSubjectTopicsModal={(subject) => {
            setSelectedSubjectTopics(subject);
            setShowTopicsModal(true);
          }}
          onOpenAddSubjectModal={() => setShowSubjectModal(true)}
          getCategoryBadge={getCategoryBadge}
          isLight={isLight}
          cardBg={cardBg}
          cardInnerBg={cardInnerBg}
          inputBg={inputBg}
          textTitle={textTitle}
          textMuted={textMuted}
        />
      )}

      {activeTab === 'revision' && (
        <SpacedRevisionModule
          topicRevisions={topicRevisions}
          syllabusList={syllabusList}
          dailyLogs={dailyLogs}
          selectedRevisionDate={selectedRevisionDate}
          setSelectedRevisionDate={setSelectedRevisionDate}
          onAdvanceSpacedRepetition={handleAdvanceSpacedRepetition}
          onOpenSkipModal={(subject) => {
            setSelectedSkipSubject(subject);
            setShowSkipModal(true);
          }}
          getCategoryBadge={getCategoryBadge}
          isLight={isLight}
          cardBg={cardBg}
          cardInnerBg={cardInnerBg}
          textTitle={textTitle}
          textMuted={textMuted}
        />
      )}

      {activeTab === 'daily' && (
        <DailyModule
          dailyLogs={dailyLogs}
          weeklyTargetsList={weeklyTargetsList}
          currentWeekLogs={currentWeekLogs}
          startOfWeek={startOfWeek}
          endOfWeek={endOfWeek}
          onOpenAddDailyLogModal={() => {
            setEditLogId(null);
            setLogDate(getTodayStr());
            setShowDailyModal(true);
          }}
          onOpenViewDailyLogModal={(log) => {
            setSelectedViewLog(log);
            setShowViewDailyModal(true);
          }}
          onOpenEditDailyLogModal={(log) => {
            setEditLogId(log.id || log._id);
            setLogDate(log.date);
            setShowDailyModal(true);
          }}
          onOpenEditTargetsModal={() => setShowTargetModal(true)}
          isLight={isLight}
          cardBg={cardBg}
          cardInnerBg={cardInnerBg}
          tableHeaderBg={tableHeaderBg}
          textTitle={textTitle}
          textMuted={textMuted}
        />
      )}

      {activeTab === 'tests' && (
        <TestsModule
          testLogs={testLogs}
          onOpenAddTestModal={() => setShowTestModal(true)}
          onDeleteTestLog={handleDeleteTestLog}
          isLight={isLight}
          cardBg={cardBg}
          tableHeaderBg={tableHeaderBg}
          textTitle={textTitle}
          textMuted={textMuted}
        />
      )}

      {activeTab === 'timetable' && (
        <div className="space-y-6">
          {/* Header Countdown & Sync Tools */}
          <CountdownHeader
            theme={theme}
            toggleTheme={toggleTheme}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />

          {/* Red Flags Alert Box */}
          <RedFlagAlerts redFlags={redFlags} />

          {/* Master Stats Metrics Overview */}
          <MasterStatsOverview
            syllabusPercent={syllabusPercent}
            completedSubjects={completedSubjects}
            totalSubjects={totalSubjects}
            weeklyHours={weeklyHours}
            weeklyAnsCount={weeklyAnsCount}
            caStreak={caStreak}
            cardBg={cardBg}
            cardInnerBg={cardInnerBg}
            textTitle={textTitle}
            textMuted={textMuted}
          />

          <MasterRoutineTable />
        </div>
      )}

      {/* MODALS */}
      <AddSubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onAddSubject={handleAddSubject}
        isLight={isLight}
        cardBg={cardBg}
        inputBg={inputBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />

      <AddTestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        onAddTest={handleSaveTestResult}
        isLight={isLight}
        cardBg={cardBg}
        inputBg={inputBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />

      <SkipRevisionModal
        isOpen={showSkipModal}
        topic={selectedSkipSubject}
        onClose={() => {
          setShowSkipModal(false);
          setSelectedSkipSubject(null);
        }}
        onConfirmSkip={handleSkipTopicRevision}
        isLight={isLight}
        cardBg={cardBg}
        inputBg={inputBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />

      <EditTargetsModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        weeklyTargetsList={weeklyTargetsList}
        onSaveTargets={handleSaveWeeklyTargets}
        isLight={isLight}
        cardBg={cardBg}
        cardInnerBg={cardInnerBg}
        inputBg={inputBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />

      <QuickDailyLogModal
        isOpen={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        editLogId={editLogId}
        logDate={logDate}
        setLogDate={setLogDate}
        syllabusList={syllabusList}
        dueRevisions={dueRevisions}
        onSaveDailyLog={handleSaveDailyLog}
        isLight={isLight}
        cardBg={cardBg}
        cardInnerBg={cardInnerBg}
        inputBg={inputBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />

      <ViewDailyLogModal
        isOpen={showViewDailyModal}
        onClose={() => {
          setShowViewDailyModal(false);
          setSelectedViewLog(null);
        }}
        selectedViewLog={selectedViewLog}
        isLight={isLight}
        cardBg={cardBg}
        cardInnerBg={cardInnerBg}
        inputBg={inputBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />

      <SubjectTopicsModal
        selectedSubjectTopics={selectedSubjectTopics}
        onClose={() => {
          setShowTopicsModal(false);
          setSelectedSubjectTopics(null);
        }}
        topicRevisions={topicRevisions}
        onDeleteTopic={handleDeleteTopic}
        onBatchLogCluster={handleBatchLogCluster}
        getCategoryBadge={getCategoryBadge}
        isLight={isLight}
        cardBg={cardBg}
        inputBg={inputBg}
        tableHeaderBg={tableHeaderBg}
        textTitle={textTitle}
        textMuted={textMuted}
      />
    </div>
  );
}
