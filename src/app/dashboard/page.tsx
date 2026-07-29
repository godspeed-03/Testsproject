'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Download,
  Upload,
  Clock,
  BookOpen,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  X,
  RotateCcw,
  Check,
  HelpCircle,
  Info,
  Edit2,
  Tag,
  CalendarDays,
  Sun,
  Moon,
  Eye,
  Database,
  Table,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'daily' | 'revision' | 'syllabus' | 'tests' | 'timetable'>('daily');

  // Core Data Arrays (synced with MongoDB)
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [testLogs, setTestLogs] = useState<any[]>([]);

  // Filter States for Subjects
  const [syllabusCategoryFilter, setSyllabusCategoryFilter] = useState('ALL');
  const [syllabusSearch, setSyllabusSearch] = useState('');

  // Countdowns & Banner state
  const [cdPrelims, setCdPrelims] = useState('-- Days');
  const [cdMains, setCdMains] = useState('-- Days');

  // Default Weekly Baseline 4 Targets (Resets every Sunday Midnight)
  const DEFAULT_WEEKLY_TARGETS = [
    { id: 'gs', name: 'General Studies (GS1-4)', target: 35, isDefault: true },
    { id: 'maths', name: 'Maths Optional (P1 & P2)', target: 20, isDefault: true },
    { id: 'ca', name: 'Current Affairs Reading', target: 7, isDefault: true },
    { id: 'ans', name: 'Answer Writing Practice', target: 5, isDefault: true }
  ];

  const [weeklyTargetsList, setWeeklyTargetsList] = useState<
    { id: string; name: string; target: number; isDefault: boolean }[]
  >(DEFAULT_WEEKLY_TARGETS);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTargetsList, setTempTargetsList] = useState(weeklyTargetsList);
  const [customTargetName, setCustomTargetName] = useState('');
  const [customTargetHours, setCustomTargetHours] = useState('');

  // Modals state
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showViewDailyModal, setShowViewDailyModal] = useState(false);
  const [selectedViewLog, setSelectedViewLog] = useState<any>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Form States - Daily Log
  const [editLogId, setEditLogId] = useState('');
  const [logDate, setLogDate] = useState(getTodayStr());
  const [logOffDay, setLogOffDay] = useState(false);
  const [logGsHours, setLogGsHours] = useState('');
  const [logMathsHours, setLogMathsHours] = useState('');
  const [logCaHours, setLogCaHours] = useState('');
  const [logAnsHours, setLogAnsHours] = useState('');
  const [logNewHours, setLogNewHours] = useState('');
  const [logRevHours, setLogRevHours] = useState('');
  const [logCaDone, setLogCaDone] = useState('YES');
  const [logAnsCount, setLogAnsCount] = useState('');
  const [logFocusQuality, setLogFocusQuality] = useState('4');
  const [logWeakestTopic, setLogWeakestTopic] = useState('');

  // Multi-Subject Tags State (Every topic is a revision topic by default)
  const [logSubjectTags, setLogSubjectTags] = useState<
    { subject: string; category: string; topic: string; isRevision: boolean }[]
  >([]);
  const [tagSubject, setTagSubject] = useState('');
  const [tagCategory, setTagCategory] = useState('GS1');
  const [tagTopic, setTagTopic] = useState('');
  const [tagIsRev, setTagIsRev] = useState(false);
  const [isCustomSubjectInput, setIsCustomSubjectInput] = useState(false);

  // Spaced Revision Checklist Selection inside Daily Log
  const [checkedRevisions, setCheckedRevisions] = useState<string[]>([]);

  // Form States - Subject Add Modal
  const [selectedSubjectTopics, setSelectedSubjectTopics] = useState<any>(null);
  const [modalTopicSearch, setModalTopicSearch] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [newModalTopicName, setNewModalTopicName] = useState('');
  const [selectedTopicNames, setSelectedTopicNames] = useState<string[]>([]);
  const [clusterTitleInput, setClusterTitleInput] = useState('');
  
  // Skip Revision Modal state
  const [skipModalTopic, setSkipModalTopic] = useState<any>(null);
  const [skipNoteInput, setSkipNoteInput] = useState<string>('');

  const openSkipModal = (topic: any) => {
    setSkipModalTopic(topic);
    setSkipNoteInput('');
  };

  const handleSkipTopicRevision = async (topicId: string, note?: string) => {
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skipRevision',
          topicId,
          note: note || ''
        })
      });
      const data = await res.json();
      if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
      if (data.dailyLogs) setDailyLogs(data.dailyLogs);
      setSkipModalTopic(null);
    } catch (e) {
      console.error('Failed to skip topic revision:', e);
    }
  };
  
  const openSubjectTopicsModal = (s: any) => {
    setModalTopicSearch('');
    setExpandedTopicId(null);
    setNewModalTopicName('');
    setSelectedTopicNames([]);
    setClusterTitleInput('');
    setSelectedSubjectTopics(s);
  };

  const toggleSelectTopicName = (topicName: string) => {
    setSelectedTopicNames((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleBatchLogCluster = async () => {
    if (!selectedSubjectTopics || selectedTopicNames.length === 0) return;
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batchLogCluster',
          subject: selectedSubjectTopics.subject,
          category: selectedSubjectTopics.category || 'GS1',
          clusterTitle: clusterTitleInput.trim(),
          topicNames: selectedTopicNames,
          date: getTodayStr()
        })
      });
      const data = await res.json();
      if (data.topicRevisions) {
        setTopicRevisions(data.topicRevisions);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        setSelectedTopicNames([]);
        setClusterTitleInput('');
      }
    } catch (e) {
      console.error('Failed to batch log cluster:', e);
    }
  };

  const handleAddTopicToSubject = async () => {
    if (!selectedSubjectTopics || !newModalTopicName.trim()) return;
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTopicRevision',
          subject: selectedSubjectTopics.subject,
          category: selectedSubjectTopics.category || 'GS1',
          topic: newModalTopicName.trim(),
          firstReadDate: getTodayStr()
        })
      });
      const data = await res.json();
      if (data.topicRevisions) {
        setTopicRevisions(data.topicRevisions);
        setNewModalTopicName('');
      }
    } catch (e) {
      console.error('Failed to add topic revision:', e);
    }
  };


  
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCategory, setNewSubjCategory] = useState('GS1');
  const [newSubjSource, setNewSubjSource] = useState('');

  // Form States - Test Modal
  const [testCode, setTestCode] = useState('');
  const [testDate, setTestDate] = useState(getTodayStr());
  const [testSubject, setTestSubject] = useState('');
  const [testScore, setTestScore] = useState('');
  const [testAccuracy, setTestAccuracy] = useState('');
  const [testConceptGap, setTestConceptGap] = useState('40');
  const [testSillyError, setTestSillyError] = useState('40');
  const [testTimePressure, setTestTimePressure] = useState('20');
  const [testTakeaway, setTestTakeaway] = useState('');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dailyDateInputRef = useRef<HTMLInputElement>(null);
  const testDateInputRef = useRef<HTMLInputElement>(null);

  // Helper date functions
  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function addDaysStr(dateStr: string, days: number) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // Get Monday date of current week (resets every Sunday 12:00 AM)
  function getStartOfWeekStr() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  function getEndOfWeekStr() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(d.setDate(diff));
    return sunday.toISOString().split('T')[0];
  }

  // Fetch initial data from MongoDB
  const fetchTrackerData = async () => {
    try {
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList || []);
        setDailyLogs(data.dailyLogs || []);
        setTestLogs(data.testLogs || []);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        const currentWeek = getStartOfWeekStr();
        if (data.weeklyTargetsList && Array.isArray(data.weeklyTargetsList) && data.weeklyTargetsList.length > 0) {
          if (data.savedTargetWeek === currentWeek) {
            setWeeklyTargetsList(data.weeklyTargetsList);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load tracker data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();

    const savedTheme = (localStorage.getItem('upsc_theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auto-reset weekly targets every Sunday Midnight
    const startW = getStartOfWeekStr();
    const savedWeek = localStorage.getItem('upsc_target_week_key');
    if (savedWeek !== startW) {
      setWeeklyTargetsList(DEFAULT_WEEKLY_TARGETS);
      localStorage.setItem('upsc_target_week_key', startW);
      localStorage.setItem('upsc_weekly_targets', JSON.stringify(DEFAULT_WEEKLY_TARGETS));
    } else {
      const savedT = localStorage.getItem('upsc_weekly_targets');
      if (savedT) {
        try {
          const parsed = JSON.parse(savedT);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWeeklyTargetsList(parsed);
          }
        } catch (e) {}
      }
    }

    // Countdowns
    const prelimsDate = new Date('2027-05-30T00:00:00');
    const mainsDate = new Date('2027-09-17T00:00:00');
    const today = new Date();

    const diffP = Math.ceil((prelimsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const diffM = Math.ceil((mainsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setCdPrelims(`${diffP > 0 ? diffP : 0} Days`);
    setCdMains(`${diffM > 0 ? diffM : 0} Days`);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('upsc_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };



  // Toggle Subject Milestone Flag
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

    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_milestone',
          id: subjectItem.id,
          ...updatedSubject
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to toggle milestone', e);
    }
  };

  const [topicRevisions, setTopicRevisions] = useState<any[]>([]);
  const [revisionSubTab, setRevisionSubTab] = useState<'today' | 'overdue' | 'matrix'>('today');
  const [selectedRevisionDate, setSelectedRevisionDate] = useState<string>(getTodayStr());

  // API Mutation Handlers
  const handleAdvanceSpacedRepetition = async (id: string, daysOffset?: number) => {
    const today = getTodayStr();

    // 1. First check if it's a TopicRevision
    const topicRev = topicRevisions.find(
      (t: any) => t.id === id || t._id === id || t.customId === id
    );

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
            date: today
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
          if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        }
      } catch (e) {
        console.error('Failed to advance topic revision', e);
      }
      return;
    }

    // 2. Fallback to syllabusList for legacy items
    const item = syllabusList.find((s) => s.id === id || s.customId === id);
    if (!item) return;

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
          nextRev
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);

        // Record in daily log so it stays visible under Completed Today!
        const existingTodayLog = dailyLogs.find((l) => l.date === today) || {};
        const currentCompleted = existingTodayLog.completedRevisions || [];
        const targetId = item.id || item.customId;
        if (!currentCompleted.includes(targetId)) {
          const updatedCompleted = [...currentCompleted, targetId];
          const logPayload = {
            ...existingTodayLog,
            date: today,
            completedRevisions: updatedCompleted
          };
          const dailyRes = await fetch('/api/tracker/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logPayload)
          });
          if (dailyRes.ok) {
            const dData = await dailyRes.json();
            setDailyLogs(dData.dailyLogs);
          }
        }
      }
    } catch (e) {
      console.error('Failed to advance repetition', e);
    }
  };

  const handleResetTopicOverdue = async (topicId: string) => {
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetOverdue',
          topicId
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
      }
    } catch (e) {
      console.error('Failed to reset topic overdue status', e);
    }
  };

  const handleDeleteTopic = async (topicId?: string, subject?: string, topicName?: string) => {
    if (!confirm(`Are you sure you want to delete topic "${subject || ''} ${topicName ? '— ' + topicName : ''}" permanently?`)) {
      return;
    }
    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteTopic',
          topicId,
          subject,
          topic: topicName
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.syllabusList) setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to delete topic', e);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjName.trim()) {
      alert('Please enter a subject name.');
      return;
    }

    const payload = {
      action: 'create',
      subject: newSubjName.trim(),
      category: newSubjCategory,
      source: newSubjSource.trim(),
      status: 'Not Started'
    };

    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);
        setShowSubjectModal(false);
        setNewSubjName('');
        setNewSubjSource('');
      }
    } catch (e) {
      console.error('Failed to add subject', e);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      const res = await fetch('/api/tracker/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data.syllabusList);
      }
    } catch (e) {
      console.error('Failed to delete subject', e);
    }
  };

  // Tag helper functions
  const handleAddSubjectTag = () => {
    if (!tagTopic.trim()) {
      alert('Please enter a topic name.');
      return;
    }
    const categorySubjects = syllabusList.filter((s) => s.category === tagCategory);
    const matchedSubject = categorySubjects.find((s) => s.subject.toLowerCase() === tagSubject.trim().toLowerCase());
    
    let finalSubject = tagSubject.trim();
    if (!finalSubject) {
      if (categorySubjects.length > 0) {
        finalSubject = categorySubjects[0].subject;
      } else {
        finalSubject = tagCategory;
      }
    }
    const finalCategory = tagCategory || (matchedSubject ? matchedSubject.category : 'GS1');

    const newTag = {
      subject: finalSubject,
      category: finalCategory,
      topic: tagTopic.trim(),
      isRevision: false
    };

    setLogSubjectTags((prev) => [...prev, newTag]);
    setTagTopic('');
    setTagIsRev(false);
  };

  const handleRemoveSubjectTag = (index: number) => {
    const updated = [...logSubjectTags];
    updated.splice(index, 1);
    setLogSubjectTags(updated);
  };

  // View modal opener
  const openViewDailyLogModal = (log: any) => {
    setSelectedViewLog(log);
    setShowViewDailyModal(true);
  };

  // Open modal for editing existing daily log
  const openEditDailyLogModal = (log: any) => {
    const logDateStr = log.date || getTodayStr();
    setEditLogId(log.id || log._id);
    setLogDate(logDateStr);
    setLogOffDay(!!log.isOff);
    setLogGsHours(log.gs !== undefined ? String(log.gs) : '');
    setLogMathsHours(log.maths !== undefined ? String(log.maths) : '');
    setLogCaHours(log.ca !== undefined ? String(log.ca) : '');
    setLogAnsHours(log.ans !== undefined ? String(log.ans) : '');
    setLogNewHours(log.newH !== undefined ? String(log.newH) : '');
    setLogRevHours(log.revH !== undefined ? String(log.revH) : '');
    setLogCaDone(log.caDone || 'YES');
    setLogAnsCount(log.ansCount !== undefined ? String(log.ansCount) : '');
    setLogFocusQuality(log.focus !== undefined ? String(log.focus) : '4');
    setLogWeakestTopic(log.weakest || '');

    // Populate existing tags + any engine topics for this date
    const existingTags = log.subjectTags || [];
    const topicsFromEngine = topicRevisions.filter(
      (tr: any) =>
        tr.firstReadDate === logDateStr ||
        tr.r1CompletedDate === logDateStr ||
        tr.r2CompletedDate === logDateStr ||
        tr.r3CompletedDate === logDateStr ||
        tr.lastRevisedDate === logDateStr
    );

    const combinedMap = new Map();
    existingTags.forEach((t: any) => {
      if (!t.subject || !t.topic) return;
      const key = `${t.subject}-${t.topic}`.toLowerCase();
      combinedMap.set(key, {
        category: t.category || 'GS1',
        subject: t.subject,
        topic: t.topic,
        isRevision: !!t.isRevision
      });
    });

    topicsFromEngine.forEach((tr: any) => {
      const key = `${tr.subject}-${tr.topic}`.toLowerCase();
      if (!combinedMap.has(key)) {
        const isRev =
          tr.r1CompletedDate === logDateStr ||
          tr.r2CompletedDate === logDateStr ||
          tr.r3CompletedDate === logDateStr;
        combinedMap.set(key, {
          category: tr.category || 'GS1',
          subject: tr.subject,
          topic: tr.topic,
          isRevision: isRev
        });
      }
    });

    setLogSubjectTags(Array.from(combinedMap.values()));
    setCheckedRevisions(log.completedRevisions || []);

    const initialCat = 'GS1';
    const subList = syllabusList.filter((s) => s.category === initialCat);
    const initialSubj = subList.length > 0 ? subList[0].subject : 'Geo';
    setTagCategory(initialCat);
    setTagSubject(initialSubj);
    setTagTopic('');
    setTagIsRev(false);
    setShowDailyModal(true);
  };

  // Open modal for adding new daily log
  const openAddDailyLogModal = () => {
    const todayStr = getTodayStr();
    const existingTodayLog = dailyLogs.find((l) => l.date === todayStr);

    if (existingTodayLog) {
      openEditDailyLogModal(existingTodayLog);
      return;
    }

    setEditLogId('');
    setLogDate(todayStr);
    setLogOffDay(false);
    setLogGsHours('');
    setLogMathsHours('');
    setLogCaHours('');
    setLogAnsHours('');
    setLogNewHours('');
    setLogRevHours('');
    setLogCaDone('YES');
    setLogAnsCount('');
    setLogFocusQuality('4');
    setLogWeakestTopic('');
    setLogSubjectTags([]);
    setCheckedRevisions([]);
    const initialSubj = syllabusList.length > 0 ? syllabusList[0].subject : 'General Studies';
    const initialCat = syllabusList.length > 0 ? syllabusList[0].category || 'GS1' : 'GS1';
    setTagSubject(initialSubj);
    setTagCategory(initialCat);
    setTagTopic('');
    setTagIsRev(false);
    setShowDailyModal(true);
  };

  const handleSaveDailyLog = async () => {
    let entry: any = { date: logDate, isOff: logOffDay };

    if (logOffDay) {
      entry = {
        date: logDate,
        isOff: true,
        total: 0,
        gs: 0,
        maths: 0,
        ca: 0,
        ans: 0,
        newH: 0,
        revH: 0,
        caDone: 'NO',
        ansCount: 0,
        focus: 1,
        weakest: 'Honesty Rule Off Day (Rest)',
        topicsRead: '',
        selectedSubject: '',
        subjectTags: [],
        completedRevisions: []
      };
    } else {
      const gs = parseFloat(logGsHours) || 0;
      const maths = parseFloat(logMathsHours) || 0;
      const ca = parseFloat(logCaHours) || 0;
      const ans = parseFloat(logAnsHours) || 0;
      const newH = parseFloat(logNewHours) || 0;
      const revH = parseFloat(logRevHours) || 0;

      // Automatically convert checked SRS subjects into topic tags if not present
      const mergedTags = [...logSubjectTags];
      checkedRevisions.forEach((sId) => {
        const matchedSubj = syllabusList.find((s) => s.id === sId);
        if (matchedSubj) {
          const exists = mergedTags.some(
            (t) => t.subject === matchedSubj.subject && t.isRevision
          );
          if (!exists) {
            mergedTags.push({
              subject: matchedSubj.subject,
              category: matchedSubj.category || 'GS1',
              topic: matchedSubj.source ? `Spaced Rev: ${matchedSubj.source}` : 'Spaced Revision Milestone',
              isRevision: true
            });
          }
        }
      });

      entry = {
        date: logDate,
        isOff: false,
        gs,
        maths,
        ca,
        ans,
        total: gs + maths + ca + ans,
        newH,
        revH,
        caDone: logCaDone,
        ansCount: parseInt(logAnsCount) || 0,
        focus: parseInt(logFocusQuality) || 3,
        weakest: logWeakestTopic.trim(),
        subjectTags: mergedTags,
        completedRevisions: checkedRevisions
      };
    }

    try {
      const res = await fetch('/api/tracker/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (res.ok) {
        const data = await res.json();
        setDailyLogs(data.dailyLogs);
        if (data.syllabusList) setSyllabusList(data.syllabusList);
        if (data.topicRevisions) setTopicRevisions(data.topicRevisions);
        setShowDailyModal(false);
      }
    } catch (e) {
      console.error('Failed to save daily log', e);
    }
  };



  const handleSaveTestResult = async () => {
    if (!testCode.trim()) {
      alert('Please enter a test code or title.');
      return;
    }

    const payload = {
      action: 'create',
      code: testCode.trim(),
      date: testDate,
      subject: testSubject.trim(),
      score: testScore.trim(),
      accuracy: testAccuracy.trim(),
      concept: parseInt(testConceptGap) || 0,
      silly: parseInt(testSillyError) || 0,
      timeP: parseInt(testTimePressure) || 0,
      takeaway: testTakeaway.trim()
    };

    try {
      const res = await fetch('/api/tracker/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs);
        setShowTestModal(false);
      }
    } catch (e) {
      console.error('Failed to save test result', e);
    }
  };

  const handleDeleteTestResult = async (id: string) => {
    if (!confirm('Delete this test log?')) return;
    try {
      const res = await fetch('/api/tracker/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        const data = await res.json();
        setTestLogs(data.testLogs);
      }
    } catch (e) {
      console.error('Failed to delete test log', e);
    }
  };

  const handleSaveWeeklyTargets = async () => {
    setWeeklyTargetsList(tempTargetsList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('upsc_weekly_targets', JSON.stringify(tempTargetsList));
      localStorage.setItem('upsc_target_week_key', startOfWeek);
    }
    setShowTargetModal(false);

    try {
      await fetch('/api/tracker/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startOfWeek,
          targets: tempTargetsList
        })
      });
    } catch (e) {
      console.error('Failed to save weekly targets to database', e);
    }
  };

  const handleAddCustomTarget = () => {
    if (!customTargetName.trim()) {
      alert('Please enter a target topic name.');
      return;
    }
    const hrs = parseFloat(customTargetHours) || 0;
    const newItem = {
      id: `custom_tgt_${Date.now()}`,
      name: customTargetName.trim(),
      target: hrs,
      isDefault: false
    };
    setTempTargetsList([...tempTargetsList, newItem]);
    setCustomTargetName('');
    setCustomTargetHours('');
  };

  const handleRemoveCustomTarget = (id: string) => {
    setTempTargetsList(tempTargetsList.filter((t) => t.id !== id));
  };

  const handleResetToDefaultTargets = () => {
    setTempTargetsList(DEFAULT_WEEKLY_TARGETS);
  };

  // Export JSON backup
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

  // Import JSON backup into DB
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        const res = await fetch('/api/tracker/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imported)
        });
        if (res.ok) {
          const data = await res.json();
          setSyllabusList(data.syllabusList);
          setDailyLogs(data.dailyLogs);
          setTestLogs(data.testLogs);
          if (imported.weeklyTargetsList || imported.weeklyTargets) setWeeklyTargetsList(imported.weeklyTargetsList || imported.weeklyTargets);
          alert('System data successfully imported into database!');
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Stats Calculations
  const today = getTodayStr();
  const startOfWeek = getStartOfWeekStr();
  const endOfWeek = getEndOfWeekStr();

  // Topics completed today
  const todayLog = dailyLogs.find((l) => l.date === today);
  const completedTodayIds = todayLog?.completedRevisions || [];

  const getNextRevDate = (s: any) => {
    if (s.nextRev) return s.nextRev;
    if (s.date) {
      const days = s.rev2 || s.status === 'Mastered' ? 45 : (s.rev1 || s.status === 'Revised Once' ? 21 : 7);
      return addDaysStr(s.date, days);
    }
    return '';
  };

  // Build unified revision items list prioritizing topicRevisions (exact micro-topics saved by user)
  const topicRevItems = topicRevisions.map((t: any) => ({
    id: t.id || t._id || t.customId,
    customId: t.customId,
    subject: t.subject,
    topic: t.topic,
    source: t.topic, // Exact topic saved by user!
    category: t.category || 'GS1',
    nextRev: t.nextScheduledDate,
    date: t.firstReadDate,
    r1Status: t.r1Status,
    r2Status: t.r2Status,
    r3Status: t.r3Status,
    r1ScheduledDate: t.r1ScheduledDate,
    r2ScheduledDate: t.r2ScheduledDate,
    r3ScheduledDate: t.r3ScheduledDate,
    r1CompletedDate: t.r1CompletedDate,
    r2CompletedDate: t.r2CompletedDate,
    r3CompletedDate: t.r3CompletedDate,
    lastRevisedDate: t.lastRevisedDate,
    isOverdue: t.isOverdue,
    overdueDays: t.overdueDays || 0,
    isCluster: t.isCluster,
    subTopics: t.subTopics || [],
    rev1: !!t.r1CompletedDate && t.r1Status !== 'Skipped',
    rev2: !!t.r2CompletedDate && t.r2Status !== 'Skipped',
    status: t.r3CompletedDate && t.r3Status !== 'Skipped' ? 'Mastered' : (t.r2CompletedDate && t.r2Status !== 'Skipped' ? 'Revised Once' : 'First Read Done'),
    extraRevisions: t.extraRevisions || [],
    revisionLogs: t.revisionLogs || []
  }));

  const activeRevisionsSource = topicRevItems.length > 0 ? topicRevItems : syllabusList;

  // Overdue topics from previous days not completed today
  const overdueRevisions = activeRevisionsSource
    .filter((s: any) => {
      if (s.isOverdue) return true;
      const nRev = s.nextRev || getNextRevDate(s);
      return nRev && nRev < today && s.lastRevisedDate !== today && !completedTodayIds.includes(s.id) && !completedTodayIds.includes(s.customId);
    })
    .sort((a: any, b: any) => ((a.nextRev || getNextRevDate(a)) || '').localeCompare((b.nextRev || getNextRevDate(b)) || ''));

  const targetRevDate = selectedRevisionDate || today;

  // Selected Date's scheduled topics NOT done yet
  const todayNotDone = activeRevisionsSource
    .filter((s: any) => {
      const nRev = s.nextRev || getNextRevDate(s);
      const isDoneOnDate =
        s.lastRevisedDate === targetRevDate ||
        s.r1CompletedDate === targetRevDate ||
        s.r2CompletedDate === targetRevDate ||
        s.r3CompletedDate === targetRevDate ||
        (targetRevDate === today && (completedTodayIds.includes(s.id) || completedTodayIds.includes(s.customId)));
      return nRev && nRev === targetRevDate && !isDoneOnDate && !s.isOverdue;
    })
    .sort((a: any, b: any) => (a.subject || '').localeCompare(b.subject || ''));

  // Selected Date's topics completed on targetRevDate (Strictly excludes skipped topics)
  const todayDone = activeRevisionsSource.filter((s: any) => {
    // If status is Skipped or latest revision log is a skip, filter it out!
    if (s.r1Status === 'Skipped' || s.r2Status === 'Skipped' || s.r3Status === 'Skipped') return false;
    if (s.revisionLogs && s.revisionLogs.length > 0) {
      const lastLog = s.revisionLogs[s.revisionLogs.length - 1];
      if (lastLog && lastLog.stage && lastLog.stage.toLowerCase().includes('skipped')) return false;
    }
    const hasCompletedOnDate =
      s.r1CompletedDate === targetRevDate ||
      s.r2CompletedDate === targetRevDate ||
      s.r3CompletedDate === targetRevDate ||
      (s.extraRevisions && s.extraRevisions.some((er: any) => er.date === targetRevDate)) ||
      (targetRevDate === today && (completedTodayIds.includes(s.id) || completedTodayIds.includes(s.customId)));
    return hasCompletedOnDate;
  });

  const dueRevisions = [...overdueRevisions, ...todayNotDone];
  const completedTodayList = todayDone;

  const totalSubjects = syllabusList.length;
  const completedSubjects = syllabusList.filter((s) => s.rev1 || s.rev2 || s.status === 'Mastered').length;
  const syllabusPercent = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;

  // Filter logs for the CURRENT WEEK (Mon - Sun, auto resets every Sunday 12 AM)
  const currentWeekLogs = dailyLogs.filter((l) => l.date >= startOfWeek && l.date <= endOfWeek);

  let weeklyHours = 0;
  let weeklyNewH = 0;
  let weeklyRevH = 0;
  let weeklyAnsCount = 0;

  currentWeekLogs.forEach((l) => {
    weeklyHours += l.total || 0;
    weeklyNewH += l.newH || 0;
    weeklyRevH += l.revH || 0;
    weeklyAnsCount += l.ansCount || 0;
  });

  const totalNewRevH = weeklyNewH + weeklyRevH;
  const revPct = totalNewRevH > 0 ? Math.round((weeklyRevH / totalNewRevH) * 100) : 30;
  const newPct = 100 - revPct;

  // CA Streak
  let caStreak = 0;
  for (const l of dailyLogs) {
    if (l.caDone === 'YES') caStreak++;
    else break;
  }

  // Red Flags
  const redFlags: string[] = [];
  if (weeklyHours > 0 && revPct < 30) {
    redFlags.push(
      `⚠️ <strong>Revision Deficit:</strong> Revision ratio is currently ${revPct}% (Threshold >= 30%). Allocate more time to spaced repetition!`
    );
  }
  const overdueCount = syllabusList.filter((s) => s.nextRev && s.nextRev < today).length;
  if (overdueCount >= 2) {
    redFlags.push(
      `📌 <strong>Overdue Revision Debt:</strong> You have ${overdueCount} subjects overdue in your Spaced Repetition Engine. Clear them today!`
    );
  }

  // Filtered subjects
  const filteredSubjects = syllabusList.filter((s) => {
    const mCat = syllabusCategoryFilter === 'ALL' || s.category === syllabusCategoryFilter;
    const mQ =
      s.subject.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
      (s.source && s.source.toLowerCase().includes(syllabusSearch.toLowerCase()));
    return mCat && mQ;
  });

  const getCategoryBadge = (cat: string) => {
    if (theme === 'light') {
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

  const getSpacedStageBadge = (s: any) => {
    if (s.status === 'Revised Once' || s.rev1) {
      return {
        label: '🔄 +21 Days (Stage 2)',
        color: 'bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-400 font-extrabold'
      };
    } else if (s.status === 'Mastered' || s.rev2) {
      return {
        label: '⚡ +45 Days (Stage 3)',
        color: 'bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border-cyan-400 font-extrabold'
      };
    } else {
      return {
        label: '📖 +7 Days (Stage 1)',
        color: 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-400 font-extrabold'
      };
    }
  };

  const totalWeeklyTarget = weeklyTargetsList.reduce((acc, t) => acc + (t.target || 0), 0);

  // Theme Dynamic CSS Classes (High Contrast & Ultra High Readability)
  const isLight = theme === 'light';
  const pageBg = isLight ? 'bg-slate-100 text-slate-950' : 'bg-slate-950 text-slate-100';
  const cardBg = isLight ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900 border-slate-800 shadow-lg';
  const cardInnerBg = isLight ? 'bg-slate-50/90 border-slate-300' : 'bg-slate-950 border-slate-800';
  const inputBg = isLight
    ? 'bg-white border-2 border-slate-400 text-slate-950 focus:border-amber-600 font-bold placeholder:text-slate-500 shadow-sm'
    : 'bg-slate-900 border-2 border-slate-700 text-white focus:border-amber-500 font-bold placeholder:text-slate-400 shadow-sm';
  const textMuted = isLight ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium';
  const textTitle = isLight ? 'text-slate-950 font-bold' : 'text-white font-bold';
  const tableHeaderBg = isLight ? 'bg-slate-200 text-slate-900 font-extrabold' : 'bg-slate-950 text-slate-200 font-extrabold';

  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center py-20 ${pageBg}`}>
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-3 sm:p-6 lg:p-8 max-w-[1480px] mx-auto w-full font-sans transition-colors duration-200 ${pageBg}`}>
      {/* Top Countdown & Theme Toggle Bar */}
      <div className={`${cardBg} rounded-xl p-3 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm`}>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-1 rounded-full font-extrabold shadow-sm">
            ⏳ Prelims 2027: <strong>{cdPrelims}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-3.5 py-1 rounded-full font-extrabold shadow-sm">
            🎯 Mains 2027: <strong>{cdMains}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full font-extrabold shadow-sm">
            🔥 CA Streak: <strong>{caStreak} Days</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1 rounded-full font-extrabold shadow-sm">
            🚨 Overdue Debt: <strong>{overdueCount} Subjects</strong>
          </span>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="ml-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow transition-all"
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} />}
            <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner - High-contrast Deep Navy Slate & Orange CTA */}
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-700/80 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">
            🏛️
          </div>
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
              UPSC CSE 2027 MASTER TRACKER
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">
              Multi-Subject Tagging • Spaced Revision Checklist • Sunday 12 AM Auto-Reset • Database Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            onClick={openAddDailyLogModal}
            className="flex-1 md:flex-initial justify-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all"
          >
            <Zap size={16} /> Quick 3-Min Daily Log
          </button>

          <button
            onClick={handleExportData}
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Download size={16} /> Export JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Upload size={16} /> Import JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportData}
            style={{ display: 'none' }}
            accept=".json"
          />
        </div>
      </header>

      {/* Red Flag Alerts Banner */}
      {redFlags.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/50 border-l-4 border-l-rose-600 rounded-xl p-4 mb-6 shadow-sm">
          <div className="font-extrabold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-1.5">
            <AlertTriangle size={18} className="text-rose-600 animate-pulse" />
            <span>RED FLAG WARNINGS DETECTED</span>
          </div>
          <div className="space-y-1">
            {redFlags.map((flag, idx) => (
              <div
                key={idx}
                className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-semibold leading-relaxed"
                dangerouslySetInnerHTML={{ __html: flag }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Master Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all`}>
          <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 font-bold shadow">
            📚
          </div>
          <div>
            <h4 className={`text-xs uppercase tracking-wider ${textMuted} font-extrabold`}>Subject Coverage</h4>
            <div className={`text-2xl font-extrabold ${textTitle}`}>{syllabusPercent}%</div>
            <div className={`text-xs ${textMuted}`}>
              {completedSubjects} / {totalSubjects} Subjects Revised
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all`}>
          <div className="w-12 h-12 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xl shrink-0 font-bold shadow">
            ⚡
          </div>
          <div>
            <h4 className={`text-xs uppercase tracking-wider ${textMuted} font-extrabold`}>Weekly Output</h4>
            <div className={`text-2xl font-extrabold ${textTitle}`}>{weeklyHours.toFixed(1)} Hrs</div>
            <div className={`text-xs ${textMuted}`}>Target: ~{totalWeeklyTarget} Hrs / Week</div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all`}>
          <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 font-bold shadow">
            🔄
          </div>
          <div>
            <h4 className={`text-xs uppercase tracking-wider ${textMuted} font-extrabold`}>New vs Rev Split</h4>
            <div className={`text-2xl font-extrabold ${textTitle}`}>
              {newPct} : {revPct}
            </div>
            <div className={`text-xs font-bold ${revPct < 30 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {revPct < 30 ? '⚠️ Revision Deficit (< 30%)' : '✅ Ideal Balance'}
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-4.5 flex items-center gap-3.5 transition-all`}>
          <div className="w-12 h-12 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xl shrink-0 font-bold shadow">
            📝
          </div>
          <div>
            <h4 className={`text-xs uppercase tracking-wider ${textMuted} font-extrabold`}>Weekly Answers Written</h4>
            <div className={`text-2xl font-extrabold ${textTitle}`}>{weeklyAnsCount}</div>
            <div className={`text-xs ${textMuted}`}>Target: 15+ Mains Answers</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex gap-2 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3 mb-6 overflow-x-auto`}>
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'daily'
              ? 'bg-amber-600 text-white shadow-md border border-amber-500'
              : `${textMuted} hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800`
          }`}
        >
          <Calendar size={16} /> Daily & Weekly Hours Tracker
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'revision'
              ? 'bg-amber-600 text-white shadow-md border border-amber-500'
              : `${textMuted} hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800`
          }`}
        >
          <RotateCcw size={16} /> Spaced Revision Engine
          <span className="bg-rose-600 text-white text-[11px] px-2 py-0.5 rounded-full font-extrabold">
            {dueRevisions.length} Due
          </span>
        </button>

        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'syllabus'
              ? 'bg-amber-600 text-white shadow-md border border-amber-500'
              : `${textMuted} hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800`
          }`}
        >
          <BookOpen size={16} /> Subject Milestone Matrix
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'tests'
              ? 'bg-amber-600 text-white shadow-md border border-amber-500'
              : `${textMuted} hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800`
          }`}
        >
          <FileText size={16} /> Test Series & PYQ Tracker
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'timetable'
              ? 'bg-amber-600 text-white shadow-md border border-amber-500'
              : `${textMuted} hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800`
          }`}
        >
          <Clock size={16} /> Master Daily Routine
        </button>
      </div>

      {/* TAB 1: SUBJECT MILESTONE MATRIX */}
      {activeTab === 'syllabus' && (
        <div className={`${cardBg} rounded-xl p-4 sm:p-6 animate-fade-in space-y-6`}>
          <div className={`flex justify-between items-center flex-wrap gap-3 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-4`}>
            <div>
              <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle}`}>📌 Subject Milestone Progress Matrix</h3>
              <p className={`text-xs sm:text-sm ${textMuted}`}>
                Click any milestone pill to toggle completed stages for each subject in your database!
              </p>
            </div>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus size={16} /> Add Custom Subject
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={syllabusCategoryFilter}
              onChange={(e) => setSyllabusCategoryFilter(e.target.value)}
              className={`${inputBg} text-xs sm:text-sm px-3 py-2 rounded-lg outline-none font-bold`}
            >
              <option value="ALL">All Categories (GS1-4, Maths, CSAT)</option>
              <option value="GS1">GS Paper 1 (History, Geography, Society)</option>
              <option value="GS2">GS Paper 2 (Polity, Governance, IR)</option>
              <option value="GS3">GS Paper 3 (Economy, Env, S&T, Security)</option>
              <option value="GS4">GS Paper 4 (Ethics, Integrity)</option>
              <option value="MATHS">Maths Optional (P1 & P2)</option>
              <option value="CSAT">CSAT Aptitude</option>
            </select>

            <input
              type="text"
              placeholder="🔍 Search subject (e.g. Modern History, Polity, Laxmikanth...)"
              value={syllabusSearch}
              onChange={(e) => setSyllabusSearch(e.target.value)}
              className={`${inputBg} text-xs sm:text-sm px-3 py-2 rounded-lg flex-1 min-w-[220px] outline-none`}
            />
          </div>

          {/* Subject Milestone Cards */}
          <div className="space-y-4">
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-bold">
                No subjects found matching your filter.
              </div>
            ) : (
              filteredSubjects.map((s) => {
                const subTopicsCount = topicRevisions.filter(
                  (tr: any) => tr.subject?.toLowerCase() === s.subject?.toLowerCase()
                ).length;

                return (
                  <div
                    key={s.id}
                    className={`${cardInnerBg} p-4 sm:p-5 rounded-xl space-y-3 transition-all`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${getCategoryBadge(s.category)}`}>
                            {s.category}
                          </span>
                          <h4
                            onClick={() => openSubjectTopicsModal(s)}
                            className={`font-extrabold ${textTitle} text-base sm:text-lg cursor-pointer hover:underline flex items-center gap-1.5`}
                            title="Click to view revision topics table"
                          >
                            {s.subject} {s.source ? <span className="text-amber-700 dark:text-amber-400 text-sm font-extrabold">— {s.source}</span> : ''}
                          </h4>
                        </div>
                        <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                          Reference Book / Source: <span className="font-bold text-slate-900 dark:text-slate-100">{s.source || 'Standard Reference'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSubjectTopicsModal(s)}
                          className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-400/40 text-xs rounded-lg font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
                          title={`View revision topics table for ${s.subject}`}
                        >
                          <Table size={14} /> View Topics ({subTopicsCount})
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(s.id)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-all shadow-sm"
                          title="Delete Subject"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                  {/* Milestone Checkboxes / Pills */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { key: 'firstRead', label: '📖 Reading 1' },
                      { key: 'rev1', label: '🔄 Rev 1' },
                      { key: 'rev2', label: '🔄 Rev 2' },
                      { key: 'preNotes', label: '📝 Pre Notes' },
                      { key: 'mainsNotes', label: '📝 Mains Notes' },
                      { key: 'questionBank', label: '❓ Q-Bank' },
                      { key: 'prePyq', label: '🎯 Pre PYQ' },
                      { key: 'mainsPyq', label: '🎯 Mains PYQ' },
                      { key: 'ansWriting', label: '✍️ Ans Writing' },
                      { key: 'preFinalRev', label: '⚡ Pre Final Rev' },
                      { key: 'mainsFinalRev', label: '⚡ Mains Final Rev' }
                    ].map((m) => {
                      const isDone = !!s[m.key];
                      return (
                        <button
                          key={m.key}
                          onClick={() => handleToggleMilestone(s, m.key)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 border ${
                            isDone
                              ? 'bg-emerald-600 text-white border-emerald-500 font-extrabold shadow-md'
                              : isLight
                              ? 'bg-white text-slate-800 border-slate-300 hover:border-amber-500 hover:text-amber-900 font-bold'
                              : 'bg-slate-800 text-slate-100 border-slate-700 hover:border-amber-400 hover:text-amber-300 font-bold'
                          }`}
                        >
                          {isDone ? <Check size={14} className="text-white" /> : null}
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      )}

      {/* TAB 2: SPACED REVISION ENGINE */}
      {activeTab === 'revision' && (
        <div className="space-y-6 animate-fade-in">
          {/* Explanation Box */}
          <div className={`${cardBg} rounded-xl p-5 border-l-4 border-l-amber-600`}>
            <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2 mb-2`}>
              <Info size={18} className="text-amber-600" /> Spaced Revision Engine
            </h3>
            <p className={`text-xs sm:text-sm ${textMuted} leading-relaxed font-semibold`}>
              • <strong>Today's Revision Queue:</strong> Unrevised topics appear at the <strong>TOP</strong> of the list.
              <br />
              • <strong>Completed Items Move to Bottom:</strong> When you click <strong>Mark Revised Today</strong>, the topic automatically moves to the <strong>LAST</strong> of the list as <strong>Completed Today</strong>!
            </p>
          </div>

          <div className={`${cardBg} rounded-xl p-4 sm:p-6 space-y-5`}>
            {/* View Switcher Header */}
            <div className={`flex items-center justify-between flex-wrap gap-3 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-4`}>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setRevisionSubTab('today')}
                  className={`px-4 py-2 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    revisionSubTab === 'today'
                      ? 'bg-amber-600 text-white shadow-md border border-amber-500'
                      : `${textMuted} hover:bg-slate-200 dark:hover:bg-slate-800`
                  }`}
                >
                  <CalendarDays size={16} /> Today's Revisions List (Not Done + Done)
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${revisionSubTab === 'today' ? 'bg-white text-amber-900' : 'bg-slate-700 text-white'}`}>
                    {todayNotDone.length + todayDone.length}
                  </span>
                </button>

                <button
                  onClick={() => setRevisionSubTab('overdue')}
                  className={`px-4 py-2 rounded-lg font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    revisionSubTab === 'overdue'
                      ? 'bg-rose-600 text-white shadow-md border border-rose-500'
                      : `${textMuted} hover:bg-slate-200 dark:hover:bg-slate-800`
                  }`}
                >
                  <AlertTriangle size={16} /> Overdue Debt
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${revisionSubTab === 'overdue' ? 'bg-white text-rose-900' : 'bg-slate-700 text-white'}`}>
                    {overdueRevisions.length}
                  </span>
                </button>

              </div>

              {overdueRevisions.length > 0 && revisionSubTab !== 'overdue' && (
                <button
                  onClick={() => setRevisionSubTab('overdue')}
                  className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-300 border border-rose-400 text-xs px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle size={14} /> View {overdueRevisions.length} Overdue Topic{overdueRevisions.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* MAIN TODAY'S REVISION SPACE (NOT DONE AT TOP + DONE AT LAST) */}
            {revisionSubTab === 'today' && (
              <div className="space-y-4">
                {todayNotDone.length === 0 && todayDone.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-bold space-y-2">
                    <span className="text-4xl block">📅</span>
                    <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>No Revisions Scheduled For Today!</h4>
                    <p className={`text-xs sm:text-sm ${textMuted}`}>All today's study items are up to date.</p>
                    {overdueRevisions.length > 0 && (
                      <button
                        onClick={() => setRevisionSubTab('overdue')}
                        className="mt-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow"
                      >
                        Check {overdueRevisions.length} Overdue Topics From Previous Days
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: NOT DONE TOPICS (AT TOP) */}
                    {todayNotDone.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <Clock size={14} /> Pending Revisions Due Today ({todayNotDone.length})
                        </div>
                        {todayNotDone.map((s) => {
                          const badge = getSpacedStageBadge(s);
                          return (
                            <div
                              key={s.id}
                              className={`${cardInnerBg} p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border-l-4 border-l-amber-600`}
                            >
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${getCategoryBadge(s.category)}`}>
                                    {s.category}
                                  </span>
                                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                  <div className={`font-extrabold ${textTitle} text-base sm:text-lg`}>
                                    {s.subject} {s.topic || s.source ? <span className="text-amber-600 dark:text-cyan-300 font-extrabold">— {s.topic || s.source}</span> : ''}
                                  </div>
                                </div>
                                <div className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                                  Exact Topic / Chapter: <span className="font-extrabold text-amber-700 dark:text-cyan-300">{s.topic || s.source || 'Standard Book'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                <button
                                  onClick={() => openSkipModal(s)}
                                  className="w-1/2 sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-200 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition-all border border-slate-600"
                                  title="Skip this revision schedule with custom remarks"
                                >
                                  <span>⏭️</span> Skip
                                </button>
                                <button
                                  onClick={() => handleAdvanceSpacedRepetition(s.id)}
                                  className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition-all"
                                >
                                  <CheckCircle size={16} /> Mark Revised Today
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* SECTION 2: COMPLETED TODAY TOPICS (AT LAST / BOTTOM OF LIST) */}
                    {todayDone.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-slate-300 dark:border-slate-800">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle size={14} /> Completed Today ({todayDone.length}) — Moved to Last of List
                        </div>
                        {todayDone.map((s) => {
                          const badge = getSpacedStageBadge(s);
                          return (
                            <div
                              key={s.id}
                              className="p-4 rounded-xl border border-emerald-400 bg-emerald-100/80 dark:bg-emerald-500/10 dark:border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                            >
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${getCategoryBadge(s.category)}`}>
                                    {s.category}
                                  </span>
                                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                  <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-base sm:text-lg">
                                    {s.subject} {s.topic || s.source ? `— ${s.topic || s.source}` : ''}
                                  </span>
                                </div>
                                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mt-1">
                                  ✅ Marked Revised Today ({today})
                                </p>
                              </div>

                              <span className="text-xs bg-emerald-700 text-white px-3.5 py-1 rounded-full font-extrabold shadow-sm shrink-0">
                                Next Revision: {s.nextRev}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* OVERDUE DEBT VIEW */}
            {revisionSubTab === 'overdue' && (
              <div className="space-y-3">
                {overdueRevisions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-bold space-y-2">
                    <span className="text-4xl block">🎉</span>
                    <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>Zero Overdue Debt!</h4>
                    <p className={`text-xs sm:text-sm ${textMuted}`}>You have no pending topics from previous days.</p>
                  </div>
                ) : (
                  overdueRevisions.map((s) => {
                    const badge = getSpacedStageBadge(s);
                    return (
                      <div
                        key={s.id}
                        className={`${cardInnerBg} p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border-l-4 border-l-rose-600 bg-rose-500/10`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${getCategoryBadge(s.category)}`}>
                              {s.category}
                            </span>
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <div className={`font-extrabold ${textTitle} text-base sm:text-lg`}>
                              {s.subject} {s.topic || s.source ? <span className="text-amber-600 dark:text-cyan-300 font-extrabold">— {s.topic || s.source}</span> : ''}
                            </div>
                          </div>
                          <div className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                            Exact Topic / Chapter: <span className="font-extrabold text-amber-700 dark:text-cyan-300">{s.topic || s.source || 'Standard Book'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300">
                              🚨 OVERDUE (NOT DONE YET) — Scheduled: {s.nextRev}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            onClick={() => openSkipModal(s)}
                            className="w-1/2 sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition-all"
                            title="Skip this overdue topic and advance to next milestone"
                          >
                            <span>⏭️</span> Skip
                          </button>
                          <button
                            onClick={() => handleAdvanceSpacedRepetition(s.id)}
                            className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow transition-all"
                          >
                            <CheckCircle size={16} /> Mark Revised Today
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY & WEEKLY HOURS TRACKER */}
      {activeTab === 'daily' && (
        <div className="space-y-6 animate-fade-in">
          {/* How Daily/Weekly Tracking Works Explanation */}
          <div className={`${cardBg} rounded-xl p-5 border-l-4 border-l-emerald-600`}>
            <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2 mb-2`}>
              <HelpCircle size={18} className="text-emerald-600" /> How Daily & Weekly Tracking Works
            </h3>
            <p className={`text-xs sm:text-sm ${textMuted} leading-relaxed font-semibold`}>
              • <strong>Sunday 12:00 AM Auto-Reset:</strong> Weekly logged hours automatically calculate for the current week (<strong>{startOfWeek}</strong> to <strong>{endOfWeek}</strong>) and reset every Sunday night!
              <br />
              • <strong>Multi-Subject & Topic Tags:</strong> Add topics read/revised today using topic tags. Today's revised & read topics auto-save into your activity log!
              <br />
              • <strong>View & Edit Rules:</strong> Today's log has an <strong>Edit</strong> button available till midnight. Past logs are locked (<strong>View</strong> only) to enforce discipline!
            </p>
          </div>

          {/* Weekly Subject Hours Roll-Up Table */}
          <div className={`${cardBg} rounded-xl p-4 sm:p-6`}>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>📊 Weekly Subject Hours Roll-Up</h3>
                  <span className="text-xs bg-slate-200 text-slate-900 border border-slate-300 dark:bg-blue-500/20 dark:text-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                    Current Week: {startOfWeek} to {endOfWeek} (Resets Sun 12 AM)
                  </span>
                </div>
                <p className={`text-xs sm:text-sm ${textMuted}`}>Current week progress against your customizable target goals.</p>
              </div>
              <button
                onClick={() => {
                  setTempTargetsList(weeklyTargetsList);
                  setShowTargetModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow"
              >
                <Edit2 size={14} /> Edit Weekly Target Hours
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800`}>
                    <th className="p-3">Subject / Track</th>
                    <th className="p-3">Target (Weekly)</th>
                    <th className="p-3">Actual Logged (This Week)</th>
                    <th className="p-3 w-1/3">Progress</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
                  {weeklyTargetsList.map((t, idx) => {
                    let actual = 0;
                    if (t.id === 'gs') {
                      actual = currentWeekLogs.reduce((acc, l) => acc + (l.gs || 0), 0);
                    } else if (t.id === 'maths') {
                      actual = currentWeekLogs.reduce((acc, l) => acc + (l.maths || 0), 0);
                    } else if (t.id === 'ca') {
                      actual = currentWeekLogs.reduce((acc, l) => acc + (l.ca || 0), 0);
                    } else if (t.id === 'ans') {
                      actual = currentWeekLogs.reduce((acc, l) => acc + (l.ans || 0), 0);
                    } else {
                      actual = currentWeekLogs.reduce((acc, l) => {
                        const matchedTag = l.subjectTags?.find(
                          (tag: any) =>
                            tag.subject?.toLowerCase().includes(t.name.toLowerCase()) ||
                            tag.topic?.toLowerCase().includes(t.name.toLowerCase())
                        );
                        return acc + (matchedTag ? (l.total || 0) / (l.subjectTags.length || 1) : 0);
                      }, 0);
                    }

                    const pct = t.target > 0 ? Math.min(100, Math.round((actual / t.target) * 100)) : 0;
                    return (
                      <tr key={t.id || idx} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className={`p-3 font-extrabold ${textTitle}`}>
                          {t.name}{' '}
                          {!t.isDefault && (
                            <span className="text-[10px] bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-400 px-2 py-0.5 rounded font-extrabold ml-1.5">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className={`p-3 font-bold ${textMuted}`}>{t.target} Hrs</td>
                        <td className="p-3 font-extrabold text-amber-700 dark:text-cyan-400">{actual.toFixed(1)} Hrs</td>
                        <td className="p-3">
                          <div className={`flex justify-between text-xs font-bold mb-1 ${textMuted}`}>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-300 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-extrabold text-xs ${
                              pct >= 80 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-700' : 'text-rose-700'
                            }`}
                          >
                            {pct >= 80 ? '✅ On Track' : pct >= 50 ? '⚠️ Moderate' : '🚨 Lagging'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Logs History */}
          <div className={`${cardBg} rounded-xl p-4 sm:p-6`}>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div>
                <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>📖 Daily Activity Log History</h3>
                <p className={`text-xs sm:text-sm ${textMuted}`}>
                  Detailed view of topics read/revised daily. (Today's log is editable; past days are View-only).
                </p>
              </div>
              <button
                onClick={openAddDailyLogModal}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Plus size={16} /> Log Today's Study
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800`}>
                    <th className="p-3">Date</th>
                    <th className="p-3">Today's Revised & Read Topics (Tags)</th>
                    <th className="p-3">Total Hours</th>
                    <th className="p-3">GS / Maths / CA</th>
                    <th className="p-3">New vs Rev</th>
                    <th className="p-3">Answers</th>
                    <th className="p-3">Focus</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
                  {dailyLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-500 font-bold">
                        No study logs recorded yet. Click "Log Today's Study" above!
                      </td>
                    </tr>
                  ) : (
                    dailyLogs.map((l) => {
                      const isTodayLog = l.date === today;
                      if (l.isOff) {
                        return (
                          <tr key={l.id} className="bg-amber-100/70 dark:bg-amber-500/10">
                            <td className={`p-3 font-extrabold ${textTitle} flex items-center gap-1`}>
                              {l.date} {isTodayLog && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">Today</span>}
                            </td>
                            <td colSpan={2} className={`p-3 ${textMuted} font-bold italic`}>
                              Off Day / Rest Day Logged (Honesty Rule)
                            </td>
                            <td colSpan={3} className="p-3 text-amber-950 dark:text-amber-200 font-bold">
                              Note: {l.weakest || 'Rest Day'}
                            </td>
                            <td className={`p-3 ${textMuted}`}>-</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openViewDailyLogModal(l)}
                                  className="p-1.5 bg-blue-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                                >
                                  <Eye size={13} /> View
                                </button>
                                {isTodayLog && (
                                  <button
                                    onClick={() => openEditDailyLogModal(l)}
                                    className="p-1.5 bg-amber-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                                  >
                                    <Edit2 size={13} /> Edit
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      const totSplit = (l.newH || 0) + (l.revH || 0);
                      const rRatio = totSplit > 0 ? Math.round(((l.revH || 0) / totSplit) * 100) : 0;
                      return (
                        <tr key={l.id} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className={`p-3 font-extrabold ${textTitle}`}>
                            <div className="flex items-center gap-1.5">
                              <span>{l.date}</span>
                              {isTodayLog && (
                                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">
                                  Today
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {l.subjectTags && l.subjectTags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {l.subjectTags.map((t: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded font-bold border ${
                                      t.isRevision
                                        ? 'bg-amber-600 text-white border-amber-700'
                                        : 'bg-blue-600 text-white border-blue-700'
                                    }`}
                                  >
                                    <Tag size={11} /> [{t.category}] {t.subject}: {t.topic}{' '}
                                    <strong className="text-[10px] text-slate-100">{t.isRevision ? '(Rev)' : '(New)'}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className={`text-xs sm:text-sm font-bold ${textMuted}`}>
                                {l.topicsRead || l.selectedSubject || 'General Study Session'}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-extrabold text-amber-700 dark:text-cyan-400">{l.total?.toFixed(1)} Hrs</td>
                          <td className={`p-3 font-bold ${textMuted}`}>
                            GS: {l.gs}h | M: {l.maths}h | CA: {l.ca}h
                          </td>
                          <td className={`p-3 font-bold ${textMuted}`}>
                            {l.newH}h New / {l.revH}h Rev{' '}
                            <span className={`font-extrabold ${rRatio < 30 ? 'text-rose-700' : 'text-emerald-700'}`}>
                              ({rRatio}%)
                            </span>
                          </td>
                          <td className={`p-3 font-extrabold ${textTitle}`}>{l.ansCount} ans</td>
                          <td className="p-3 text-amber-500">{'⭐'.repeat(l.focus || 3)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openViewDailyLogModal(l)}
                                className="p-1.5 bg-blue-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                              >
                                <Eye size={13} /> View
                              </button>
                              {isTodayLog && (
                                <button
                                  onClick={() => openEditDailyLogModal(l)}
                                  className="p-1.5 bg-amber-600 text-white rounded flex items-center gap-1 text-xs font-bold shadow-sm"
                                >
                                  <Edit2 size={13} /> Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEST SERIES TRACKER */}
      {activeTab === 'tests' && (
        <div className={`${cardBg} rounded-xl p-4 sm:p-6 animate-fade-in`}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>📝 Test Series Results & Error Analysis</h3>
              <p className={`text-xs sm:text-sm ${textMuted}`}>
                Track mock scores, accuracy, and mistake breakdown (Concept / Silly / Time).
              </p>
            </div>
            <button
              onClick={() => {
                setTestCode('');
                setTestDate(getTodayStr());
                setTestSubject('');
                setTestScore('');
                setTestAccuracy('');
                setTestConceptGap('40');
                setTestSillyError('40');
                setTestTimePressure('20');
                setTestTakeaway('');
                setShowTestModal(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus size={16} /> Log New Test
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[700px]">
              <thead>
                <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800`}>
                  <th className="p-3">Test Code</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Mistake Split (Concept / Silly / Time)</th>
                  <th className="p-3">Key Takeaway</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
                {testLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-slate-500 font-bold">
                      No test series results logged yet.
                    </td>
                  </tr>
                ) : (
                  testLogs.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className={`p-3 font-extrabold ${textTitle}`}>{t.code}</td>
                      <td className={`p-3 font-bold ${textMuted}`}>{t.date}</td>
                      <td className={`p-3 font-extrabold ${textTitle}`}>{t.subject}</td>
                      <td className="p-3 font-extrabold text-amber-700 dark:text-amber-400">{t.score}</td>
                      <td className="p-3 font-extrabold text-emerald-700 dark:text-emerald-400">{t.accuracy}%</td>
                      <td className={`p-3 font-bold ${textMuted}`}>
                        Concept: {t.concept}% | Silly: {t.silly}% | Time: {t.timeP}%
                      </td>
                      <td className={`p-3 font-bold ${textTitle}`}>{t.takeaway || '-'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteTestResult(t.id)}
                          className="p-1.5 bg-rose-600 text-white rounded font-bold"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TIMETABLE & MASTER ROUTINE */}
      {activeTab === 'timetable' && (
        <div className={`${cardBg} rounded-xl p-4 sm:p-6 animate-fade-in space-y-6`}>
          <div className={`border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-4`}>
            <h3 className={`font-extrabold text-xl ${textTitle} flex items-center gap-2`}>
              <Clock className="text-amber-600" /> Master Daily Routine & Schedule Protocols
            </h3>
            <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
              Aligned with 4:00 AM wake up, morning GS & Hindu lecture, Library study block, and 6:00 PM gym protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`${cardInnerBg} rounded-xl p-4 border-t-4 border-t-amber-600`}>
              <div className="text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-1">Block 1 • Morning Focus</div>
              <div className={`font-extrabold text-lg ${textTitle} mb-2`}>04:00 AM – 08:00 AM</div>
              <ul className={`text-xs sm:text-sm ${textMuted} space-y-1.5 list-disc list-inside font-bold`}>
                <li>04:00 AM: Wake up, Refresh & Tea</li>
                <li>04:30 AM – 06:00 AM: High-Focus GS + The Hindu CA Lecture</li>
                <li>06:00 AM – 08:00 AM: Library Commute & Deep GS Reading</li>
              </ul>
            </div>

            <div className={`${cardInnerBg} rounded-xl p-4 border-t-4 border-t-blue-600`}>
              <div className="text-blue-700 dark:text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-1">Block 2 • Optional & CSAT</div>
              <div className={`font-extrabold text-lg ${textTitle} mb-2`}>08:30 AM – 01:00 PM</div>
              <ul className={`text-xs sm:text-sm ${textMuted} space-y-1.5 list-disc list-inside font-bold`}>
                <li>08:30 AM – 11:00 AM: Maths Optional (P1/P2) & CSAT Practice</li>
                <li>11:00 AM – 12:00 PM: Answer Writing & PYQ Analysis</li>
                <li>12:00 PM – 01:00 PM: PW Mock Test Slot / Weekly Assessment</li>
              </ul>
            </div>

            <div className={`${cardInnerBg} rounded-xl p-4 border-t-4 border-t-purple-600`}>
              <div className="text-purple-700 dark:text-purple-400 font-extrabold text-xs uppercase tracking-wider mb-1">Block 3 • Library GS Session</div>
              <div className={`font-extrabold text-lg ${textTitle} mb-2`}>02:00 PM – 05:30 PM</div>
              <ul className={`text-xs sm:text-sm ${textMuted} space-y-1.5 list-disc list-inside font-bold`}>
                <li>01:00 PM – 02:00 PM: Lunch & Rest Interval</li>
                <li>02:00 PM – 05:30 PM: GS Session (Geography / Economics alternate)</li>
                <li>05:30 PM – 06:00 PM: Return Home & Prep for Gym</li>
              </ul>
            </div>

            <div className={`${cardInnerBg} rounded-xl p-4 border-t-4 border-t-emerald-600`}>
              <div className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">Block 4 • Evening Gym & Rest</div>
              <div className={`font-extrabold text-lg ${textTitle} mb-2`}>06:00 PM – 08:00 PM</div>
              <ul className={`text-xs sm:text-sm ${textMuted} space-y-1.5 list-disc list-inside font-bold`}>
                <li>06:00 PM – 08:00 PM: Workout & Physical Training Protocol</li>
                <li>08:00 PM – 08:30 PM: Post-Gym Shower & Protein Refresh</li>
              </ul>
            </div>

            <div className={`${cardInnerBg} rounded-xl p-4 border-t-4 border-t-rose-600`}>
              <div className="text-rose-700 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider mb-1">Block 5 • Spaced Revision</div>
              <div className={`font-extrabold text-lg ${textTitle} mb-2`}>08:30 PM – 10:00 PM</div>
              <ul className={`text-xs sm:text-sm ${textMuted} space-y-1.5 list-disc list-inside font-bold`}>
                <li>08:30 PM – 09:30 PM: Spaced Repetition Queue Clear</li>
                <li>09:30 PM – 10:00 PM: Quick 3-Min Daily Log & Bedtime Prep</li>
                <li>10:00 PM: Mandatory Bedtime Sleep Protocol</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: QUICK DAILY LOG (EDIT / ADD) */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
              <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
                ⚡ {editLogId ? 'Edit Daily Study Log' : 'Quick Daily Study Log (< 3 Mins)'}
              </h3>
              <button onClick={() => setShowDailyModal(false)} className={`${textMuted} hover:text-amber-600`}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-bold">
              <div>
                <label className={`block ${textMuted} mb-1 font-extrabold flex items-center gap-1.5`}>
                  <CalendarDays size={16} className="text-amber-600" /> Select Date (Tap Anywhere to Open Calendar)
                </label>
                <div
                  onClick={() => {
                    try {
                      dailyDateInputRef.current?.showPicker();
                    } catch (e) {}
                  }}
                  className={`relative flex items-center ${inputBg} rounded-xl p-3 cursor-pointer transition-all shadow-inner`}
                >
                  <input
                    ref={dailyDateInputRef}
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as any).showPicker?.();
                      } catch (err) {}
                    }}
                    className={`w-full bg-transparent font-extrabold outline-none cursor-pointer ${isLight ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
                  />
                  <Calendar className="text-amber-600 pointer-events-none ml-2 shrink-0" size={20} />
                </div>
              </div>

              <div className={`flex items-center gap-2 ${cardInnerBg} p-3 rounded-lg border border-slate-300 dark:border-slate-800`}>
                <input
                  type="checkbox"
                  id="chkOff"
                  checked={logOffDay}
                  onChange={(e) => setLogOffDay(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
                <label htmlFor="chkOff" className="text-amber-950 dark:text-amber-200 font-extrabold cursor-pointer">
                  Log as Honesty Rule Off / Rest Day (0 Hours)
                </label>
              </div>

              {!logOffDay && (
                <>
                  {/* SECTION 1: Due Spaced Revisions Checklist (Overdue / Not Done First) */}
                  {dueRevisions.length > 0 && (
                    <div className={`${cardInnerBg} p-3.5 rounded-xl space-y-2`}>
                      <div className="font-extrabold text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-1.5">
                        <RotateCcw size={16} /> Due Spaced Revisions (Overdue / Pending First)
                      </div>
                      <p className={`text-xs ${textMuted}`}>
                        Check subjects revised today. Checking will automatically advance their SRS interval!
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {dueRevisions.map((s) => {
                          const isChecked = checkedRevisions.includes(s.id);
                          const isOverdue = s.nextRev < today;
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-emerald-700 text-white border-emerald-800 font-extrabold'
                                  : isOverdue
                                  ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold'
                                  : isLight
                                  ? 'bg-white border-slate-300 text-slate-900 font-bold hover:border-amber-500'
                                  : 'bg-slate-900 border-slate-800 text-slate-200 font-bold hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCheckedRevisions([...checkedRevisions, s.id]);
                                    } else {
                                      setCheckedRevisions(checkedRevisions.filter((id) => id !== s.id));
                                    }
                                  }}
                                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                />
                                <span>
                                  [{s.category}] <strong>{s.subject}</strong>{' '}
                                  {s.source ? <span className="text-amber-700 dark:text-cyan-300">({s.source})</span> : ''}
                                </span>
                              </div>
                              <span className={`text-xs font-extrabold ${isOverdue ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-300'}`}>
                                {isOverdue ? '🚨 OVERDUE' : '⏰ Due'}: {s.nextRev}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: Multi-Subject & Topic Tags Input */}
                  <div className={`${cardInnerBg} p-3.5 rounded-xl space-y-3`}>
                    <div className="font-extrabold text-amber-700 dark:text-blue-300 text-xs sm:text-sm flex items-center gap-1.5">
                      <Tag size={16} /> Add Multiple Subjects & Topic Tags Studied Today
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                      <div>
                        <label className={`block ${textMuted} mb-1 font-extrabold`}>Category</label>
                        <select
                          value={tagCategory}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setTagCategory(newCat);
                            const filtered = syllabusList.filter((s) => s.category === newCat);
                            if (filtered.length > 0) {
                              setTagSubject(filtered[0].subject);
                            } else {
                              setTagSubject('');
                            }
                          }}
                          className={`w-full ${inputBg} rounded-lg p-2.5 font-extrabold outline-none`}
                        >
                          <option value="GS1">GS1 (His, Geo, Soc)</option>
                          <option value="GS2">GS2 (Pol, Gov, IR)</option>
                          <option value="GS3">GS3 (Eco, Env, Sci)</option>
                          <option value="GS4">GS4 (Ethics, Integrity)</option>
                          <option value="MATHS">Maths Optional</option>
                          <option value="CA">Current Affairs</option>
                          <option value="ESSAY">Essay</option>
                          <option value="CSAT">CSAT</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block ${textMuted} mb-1 font-extrabold`}>Subject Name ({tagCategory})</label>
                        {syllabusList.filter((s) => s.category === tagCategory).length > 0 ? (
                          <select
                            value={tagSubject}
                            onChange={(e) => setTagSubject(e.target.value)}
                            className={`w-full ${inputBg} rounded-lg p-2.5 font-extrabold outline-none`}
                          >
                            {syllabusList
                              .filter((s) => s.category === tagCategory)
                              .map((s) => (
                                <option key={s.id || s.customId || s._id} value={s.subject}>
                                  {s.subject}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Subject (e.g. Geo, Polity)"
                            value={tagSubject}
                            onChange={(e) => setTagSubject(e.target.value)}
                            className={`w-full ${inputBg} rounded-lg p-2.5 outline-none font-bold`}
                          />
                        )}
                      </div>

                      <div>
                        <label className={`block ${textMuted} mb-1 font-extrabold`}>Topic</label>
                        <input
                          type="text"
                          placeholder="e.g. Revolt of 1857"
                          value={tagTopic}
                          onChange={(e) => setTagTopic(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubjectTag();
                            }
                          }}
                          className={`w-full ${inputBg} rounded-lg p-2.5 outline-none font-bold`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleAddSubjectTag}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow text-xs transition-all"
                      >
                        <Plus size={15} /> Add Topic Tag
                      </button>
                    </div>

                    {/* Added Tags Display */}
                    {logSubjectTags.length > 0 && (
                      <div className={`flex flex-wrap gap-2 pt-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-900'}`}>
                        {logSubjectTags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-extrabold border ${
                              t.isRevision
                                ? 'bg-amber-600 text-white border-amber-700'
                                : 'bg-blue-600 text-white border-blue-700'
                            }`}
                          >
                            <span>
                              [{t.category}] {t.subject}: {t.topic} ({t.isRevision ? 'Rev' : 'New'})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectTag(idx)}
                              className="text-slate-200 hover:text-white"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: Study Hours Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>GS Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 5"
                        value={logGsHours}
                        onChange={(e) => setLogGsHours(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>Maths Optional Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 3"
                        value={logMathsHours}
                        onChange={(e) => setLogMathsHours(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>Current Affairs Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 1.5"
                        value={logCaHours}
                        onChange={(e) => setLogCaHours(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>Answer Writing Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 1"
                        value={logAnsHours}
                        onChange={(e) => setLogAnsHours(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>New Topics Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 7"
                        value={logNewHours}
                        onChange={(e) => setLogNewHours(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>Revision Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 3.5"
                        value={logRevHours}
                        onChange={(e) => setLogRevHours(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>CA Read Done?</label>
                      <select
                        value={logCaDone}
                        onChange={(e) => setLogCaDone(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      >
                        <option value="YES">Yes ✅</option>
                        <option value="NO">No ❌</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block ${textMuted} mb-1 font-bold`}>Mains Answers Written</label>
                      <input
                        type="number"
                        placeholder="e.g. 3"
                        value={logAnsCount}
                        onChange={(e) => setLogAnsCount(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block ${textMuted} mb-1 font-bold`}>Focus Quality Rating</label>
                    <select
                      value={logFocusQuality}
                      onChange={(e) => setLogFocusQuality(e.target.value)}
                      className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5/5 — Deep Focus)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5 — Good Focus)</option>
                      <option value="3">⭐⭐⭐ (3/5 — Moderate)</option>
                      <option value="2">⭐⭐ (2/5 — Distracted)</option>
                      <option value="1">⭐ (1/5 — Poor Output)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className={`flex justify-end gap-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
              <button
                onClick={() => setShowDailyModal(false)}
                className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDailyLog}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold rounded-lg shadow"
              >
                Save Daily Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1.5: VIEW DAILY LOG DETAILS */}
      {showViewDailyModal && selectedViewLog && (() => {
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`${cardBg} rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
              <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
                <div>
                  <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
                    📖 Daily Log Details — <span className="text-amber-700 dark:text-cyan-400">{selectedViewLog.date}</span>
                  </h3>
                  {selectedViewLog.date === today && (
                    <span className="text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-extrabold">
                      Today's Active Log
                    </span>
                  )}
                </div>
                <button onClick={() => setShowViewDailyModal(false)} className={`${textMuted} hover:text-amber-600`}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm font-bold">
                {selectedViewLog.isOff ? (
                  <div className="bg-amber-100 border border-amber-400 p-4 rounded-xl text-amber-950 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200 space-y-2">
                    <div className="font-extrabold text-base">Honesty Rule Rest / Off Day</div>
                    <p>Note: {selectedViewLog.weakest || 'No study output recorded for this date.'}</p>
                  </div>
                ) : (
                  <>
                    {/* Total & Hours summary */}
                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${cardInnerBg} p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 text-center`}>
                      <div>
                        <div className={`text-xs font-bold uppercase ${textMuted}`}>Total Output</div>
                        <div className="text-xl font-extrabold text-amber-700 dark:text-cyan-400">{selectedViewLog.total?.toFixed(1)} Hrs</div>
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase ${textMuted}`}>GS / Maths</div>
                        <div className={`text-base font-extrabold ${textTitle}`}>
                          {selectedViewLog.gs}h / {selectedViewLog.maths}h
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase ${textMuted}`}>CA / Ans</div>
                        <div className={`text-base font-extrabold ${textTitle}`}>
                          {selectedViewLog.ca}h / {selectedViewLog.ansCount} ans
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase ${textMuted}`}>Focus Rating</div>
                        <div className="text-base font-extrabold text-amber-500">
                          {'⭐'.repeat(selectedViewLog.focus || 3)}
                        </div>
                      </div>
                    </div>

                    {/* Topics Revised & Read Today */}
                    {(() => {
                      const logDateStr = selectedViewLog.date;
                      const tagsOnLog = (selectedViewLog.subjectTags || []).filter(
                        (t: any) => !t.note?.toLowerCase().includes('skipped')
                      );
                      const topicsFromEngine = topicRevisions.filter(
                        (tr: any) => {
                          const isSkipped = tr.r1Status === 'Skipped' || tr.r2Status === 'Skipped' || tr.r3Status === 'Skipped';
                          if (isSkipped) {
                            return tr.firstReadDate === logDateStr;
                          }
                          return (
                            tr.firstReadDate === logDateStr ||
                            tr.r1CompletedDate === logDateStr ||
                            tr.r2CompletedDate === logDateStr ||
                            tr.r3CompletedDate === logDateStr
                          );
                        }
                      );

                      const combinedMap = new Map();
                      tagsOnLog.forEach((t: any) => {
                        if (!t.subject || !t.topic) return;
                        const key = `${t.subject}-${t.topic}`.toLowerCase();
                        combinedMap.set(key, {
                          category: t.category || 'GS1',
                          subject: t.subject,
                          topic: t.topic,
                          isRevision: !!t.isRevision
                        });
                      });

                      topicsFromEngine.forEach((tr: any) => {
                        const key = `${tr.subject}-${tr.topic}`.toLowerCase();
                        const isRev =
                          tr.r1CompletedDate === logDateStr ||
                          tr.r2CompletedDate === logDateStr ||
                          tr.r3CompletedDate === logDateStr;
                        if (!combinedMap.has(key)) {
                          combinedMap.set(key, {
                            category: tr.category || 'GS1',
                            subject: tr.subject,
                            topic: tr.topic,
                            isRevision: isRev
                          });
                        }
                      });

                      const allDayTopics = Array.from(combinedMap.values());

                      return (
                        <div className={`${cardInnerBg} p-4 rounded-xl space-y-2 border border-slate-300 dark:border-slate-800`}>
                          <div className={`font-extrabold text-sm ${textTitle} flex items-center justify-between gap-1.5`}>
                            <span className="flex items-center gap-1.5">
                              <Tag size={16} className="text-amber-600" /> Topics Read & Revised On This Day
                            </span>
                            <span className="text-xs text-amber-600 font-extrabold">{allDayTopics.length} Topics Recorded</span>
                          </div>

                          {allDayTopics.length > 0 ? (
                            <div className="space-y-2 pt-1">
                              {allDayTopics.map((t: any, idx: number) => {
                                const matchTR = topicRevisions.find(
                                  (tr: any) =>
                                    tr.subject?.toLowerCase() === t.subject?.toLowerCase() &&
                                    tr.topic?.toLowerCase() === t.topic?.toLowerCase()
                                );
                                return (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-lg border text-xs sm:text-sm space-y-1.5 font-bold ${
                                      t.isRevision
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                                        : 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center flex-wrap gap-1">
                                      <div>
                                        <span className="font-extrabold">[{t.category || 'GS1'}] {t.subject}:</span> {t.topic}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2.5 py-0.5 rounded font-extrabold ${t.isRevision ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'}`}>
                                          {t.isRevision ? '🔄 Revised Today' : '📖 First Read Today'}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteTopic(matchTR?.id || matchTR?._id || matchTR?.customId, t.subject, t.topic)}
                                          className="p-1 hover:bg-rose-500/20 text-rose-500 rounded transition-all shrink-0"
                                          title="Delete topic added by mistake"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>

                                    {matchTR && (
                                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 pt-1.5 border-t border-slate-300 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1">
                                        <span>📅 First Read: <strong>{matchTR.firstReadDate || 'N/A'}</strong></span>
                                        <span>🎯 R1 (+7d Target): <strong>{matchTR.r1ScheduledDate || '—'}</strong> {matchTR.r1CompletedDate ? `(Done: ${matchTR.r1CompletedDate})` : ''}</span>
                                        <span>🚀 R2 (+21d Target): <strong>{matchTR.r2ScheduledDate || '—'}</strong> {matchTR.r2CompletedDate ? `(Done: ${matchTR.r2CompletedDate})` : ''}</span>
                                        {matchTR.nextScheduledDate && (
                                          <span className={`font-extrabold ${matchTR.isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {matchTR.isOverdue ? `⚠️ Overdue (+${matchTR.overdueDays}d)` : `⏰ Next Target: ${matchTR.nextScheduledDate}`}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold space-y-1">
                              <p className={textTitle}>
                                {selectedViewLog.topicsRead || selectedViewLog.selectedSubject || 'General Study Session'}
                              </p>
                              <p className={`${textMuted} text-[11px]`}>
                                Tip: Click "Edit Log for {selectedViewLog.date}" below to add specific subject & topic tags to this log.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}



                    {/* Weakest Area Note */}
                    {selectedViewLog.weakest && (
                      <div className={`${cardInnerBg} p-3.5 rounded-xl space-y-1 border border-slate-300 dark:border-slate-800`}>
                        <div className={`font-extrabold text-xs uppercase ${textMuted}`}>Weakest Area / Retrospective Note</div>
                        <p className={`text-xs sm:text-sm ${textTitle}`}>{selectedViewLog.weakest}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className={`flex justify-between items-center border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
                <button
                  onClick={() => {
                    setShowViewDailyModal(false);
                    openEditDailyLogModal(selectedViewLog);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-extrabold rounded-lg flex items-center gap-1.5 shadow transition-all"
                >
                  <Edit2 size={14} /> Edit Log for {selectedViewLog.date}
                </button>

                <button
                  onClick={() => setShowViewDailyModal(false)}
                  className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: EDIT WEEKLY TARGET HOURS */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
              <div>
                <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>Edit Weekly Target Hours</h3>
                <p className={`text-xs ${textMuted}`}>Auto-resets back to baseline default 4 targets every Sunday Midnight.</p>
              </div>
              <button onClick={() => setShowTargetModal(false)} className={`${textMuted} hover:text-amber-600`}>
                <X size={20} />
              </button>
            </div>

            {/* Target List */}
            <div className="space-y-3 text-xs sm:text-sm font-bold">
              {tempTargetsList.map((tgt, index) => (
                <div key={tgt.id || index} className={`${cardInnerBg} p-3 rounded-xl border flex items-center justify-between gap-3`}>
                  <div className="flex-1">
                    <label className={`block ${textMuted} mb-1 font-extrabold flex items-center gap-1.5`}>
                      {tgt.name}
                      {!tgt.isDefault && (
                        <span className="text-[10px] bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-400 px-1.5 py-0.2 rounded font-extrabold">
                          Custom
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={tgt.target}
                      onChange={(e) => {
                        const updated = [...tempTargetsList];
                        updated[index].target = parseFloat(e.target.value) || 0;
                        setTempTargetsList(updated);
                      }}
                      className={`w-full ${inputBg} rounded-lg p-2 outline-none text-xs sm:text-sm`}
                    />
                  </div>
                  {!tgt.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomTarget(tgt.id)}
                      className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 mt-5"
                      title="Remove this custom target"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Weekly Target Form */}
            <div className="pt-3 border-t border-slate-300 dark:border-slate-800 space-y-2">
              <label className={`block text-xs font-extrabold ${textTitle}`}>+ Add Custom Target Topic For This Week</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Topic Name (e.g. CSAT, Essay, Ethics)"
                  value={customTargetName}
                  onChange={(e) => setCustomTargetName(e.target.value)}
                  className={`flex-1 ${inputBg} rounded-lg p-2 text-xs outline-none`}
                />
                <input
                  type="number"
                  placeholder="Hours"
                  value={customTargetHours}
                  onChange={(e) => setCustomTargetHours(e.target.value)}
                  className={`w-full sm:w-24 ${inputBg} rounded-lg p-2 text-xs outline-none`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTarget}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-3 py-2 rounded-lg shrink-0 flex items-center justify-center gap-1 shadow"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex justify-between items-center border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
              <button
                type="button"
                onClick={handleResetToDefaultTargets}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-extrabold flex items-center gap-1"
              >
                <RotateCcw size={13} /> Reset to Default 4 Targets
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-3.5 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveWeeklyTargets}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-lg shadow"
                >
                  Save Targets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
              <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>Add Custom UPSC Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} className={`${textMuted} hover:text-amber-600`}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-bold">
              <div>
                <label className={`block ${textMuted} mb-1 font-bold`}>Category</label>
                <select
                  value={newSubjCategory}
                  onChange={(e) => setNewSubjCategory(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                >
                  <option value="GS1">GS Paper 1</option>
                  <option value="GS2">GS Paper 2</option>
                  <option value="GS3">GS Paper 3</option>
                  <option value="GS4">GS Paper 4</option>
                  <option value="MATHS">Maths Optional</option>
                  <option value="CSAT">CSAT</option>
                </select>
              </div>

              <div>
                <label className={`block ${textMuted} mb-1 font-bold`}>Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. World History / Internal Security"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                />
              </div>

              <div>
                <label className={`block ${textMuted} mb-1 font-bold`}>Standard Source / Topic Book</label>
                <input
                  type="text"
                  placeholder="e.g. NCERT Class 11 / Laxmikanth Ch 3-8"
                  value={newSubjSource}
                  onChange={(e) => setNewSubjSource(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-extrabold rounded-lg shadow"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LOG TEST */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
              <h3 className={`font-extrabold text-base sm:text-lg ${textTitle}`}>Log Test Series Result</h3>
              <button onClick={() => setShowTestModal(false)} className={`${textMuted} hover:text-amber-600`}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-bold">
              <div>
                <label className={`block ${textMuted} mb-1 font-bold`}>Test Code / Title</label>
                <input
                  type="text"
                  placeholder="e.g. PW GS Prelims Mock 04"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                />
              </div>

              <div>
                <label className={`block ${textMuted} mb-1 font-extrabold flex items-center gap-1.5`}>
                  <CalendarDays size={16} className="text-amber-600" /> Date Taken (Tap Anywhere to Open Calendar)
                </label>
                <div
                  onClick={() => {
                    try {
                      testDateInputRef.current?.showPicker();
                    } catch (e) {}
                  }}
                  className={`relative flex items-center ${inputBg} rounded-xl p-3 cursor-pointer transition-all shadow-inner`}
                >
                  <input
                    ref={testDateInputRef}
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as any).showPicker?.();
                      } catch (err) {}
                    }}
                    className={`w-full bg-transparent font-extrabold outline-none cursor-pointer ${isLight ? '[color-scheme:light]' : '[color-scheme:dark]'}`}
                  />
                  <Calendar className="text-amber-600 pointer-events-none ml-2 shrink-0" size={20} />
                </div>
              </div>

              <div>
                <label className={`block ${textMuted} mb-1 font-bold`}>Subject / Topic Covered</label>
                <input
                  type="text"
                  placeholder="e.g. Polity + Current Affairs May 2026"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block ${textMuted} mb-1 font-bold`}>Score Obtained</label>
                  <input
                    type="text"
                    placeholder="e.g. 112 / 200"
                    value={testScore}
                    onChange={(e) => setTestScore(e.target.value)}
                    className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                  />
                </div>
                <div>
                  <label className={`block ${textMuted} mb-1 font-bold`}>Accuracy %</label>
                  <input
                    type="text"
                    placeholder="e.g. 78%"
                    value={testAccuracy}
                    onChange={(e) => setTestAccuracy(e.target.value)}
                    className={`w-full ${inputBg} rounded-lg p-2.5 outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block ${textMuted} mb-1 font-bold`}>% Concept Gap</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={testConceptGap}
                    onChange={(e) => setTestConceptGap(e.target.value)}
                    className={`w-full ${inputBg} rounded-lg p-2 outline-none`}
                  />
                </div>
                <div>
                  <label className={`block ${textMuted} mb-1 font-bold`}>% Silly Error</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={testSillyError}
                    onChange={(e) => setTestSillyError(e.target.value)}
                    className={`w-full ${inputBg} rounded-lg p-2 outline-none`}
                  />
                </div>
                <div>
                  <label className={`block ${textMuted} mb-1 font-bold`}>% Time Pressure</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={testTimePressure}
                    onChange={(e) => setTestTimePressure(e.target.value)}
                    className={`w-full ${inputBg} rounded-lg p-2 outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${textMuted} mb-1 font-bold`}>Key Takeaways / Weak Areas</label>
                <textarea
                  placeholder="e.g. Revise Constitutional Bodies Articles & Negative Marking control"
                  value={testTakeaway}
                  onChange={(e) => setTestTakeaway(e.target.value)}
                  className={`w-full ${inputBg} rounded-lg p-2.5 outline-none h-20`}
                />
              </div>
            </div>

            <div className={`flex justify-end gap-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTestResult}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-extrabold rounded-lg shadow"
              >
                Save Test Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SUBJECT REVISION TOPICS TABLE POPUP */}
      {selectedSubjectTopics && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fade-in">
          <div className={`${cardBg} rounded-2xl w-full max-w-6xl lg:max-w-8xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-300 dark:border-slate-800`}>
            <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${getCategoryBadge(selectedSubjectTopics.category)}`}>
                  {selectedSubjectTopics.category}
                </span>
                <h3 className={`font-extrabold text-base sm:text-xl ${textTitle}`}>
                  {selectedSubjectTopics.subject} — Spaced Repetition Revision Topics
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubjectTopics(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const allSubjTopics = topicRevisions.filter(
                (tr: any) =>
                  tr.subject?.toLowerCase() === selectedSubjectTopics.subject?.toLowerCase()
              );

              const subjTopics = allSubjTopics.filter((tr: any) =>
                !modalTopicSearch || tr.topic?.toLowerCase().includes(modalTopicSearch.toLowerCase())
              );

              return (
                <div className="space-y-4">
                  {/* Search Bar inside Modal */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Search micro-topics in ${selectedSubjectTopics.subject}...`}
                      value={modalTopicSearch}
                      onChange={(e) => setModalTopicSearch(e.target.value)}
                      className={`w-full ${inputBg} rounded-xl pl-9 pr-12 py-2 text-xs sm:text-sm outline-none border border-slate-300 dark:border-slate-800 font-bold focus:border-amber-500 transition-all`}
                    />
                    {modalTopicSearch && (
                      <button
                        onClick={() => setModalTopicSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 text-xs font-extrabold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Batch Revision & Cluster Action Banner */}
                  {selectedTopicNames.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 sm:p-4 space-y-3 animate-fade-in shadow-md">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-extrabold text-amber-600 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                          ⚡ Batch Cluster Revision ({selectedTopicNames.length} topics selected: {selectedTopicNames.slice(0, 3).join(', ')}{selectedTopicNames.length > 3 ? '...' : ''})
                        </span>
                        <button
                          onClick={() => setSelectedTopicNames([])}
                          className="text-xs text-slate-400 hover:text-amber-500 font-extrabold underline"
                        >
                          Deselect All
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="text"
                          placeholder={`Optional Block/Cluster Title (e.g. "Geo Block 1 Rev")...`}
                          value={clusterTitleInput}
                          onChange={(e) => setClusterTitleInput(e.target.value)}
                          className={`flex-1 ${inputBg} rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none border border-slate-300 dark:border-slate-800 font-bold focus:border-amber-500`}
                        />
                        <button
                          onClick={handleBatchLogCluster}
                          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md shrink-0 transition-all"
                        >
                          ⚡ Log Revision Today & Save Cluster ({selectedTopicNames.length})
                        </button>
                      </div>
                    </div>
                  )}

                  {allSubjTopics.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 font-bold space-y-2 max-w-md mx-auto">
                      <span className="text-4xl block">📖</span>
                      <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>
                        No Revision Topics Logged for {selectedSubjectTopics.subject} Yet!
                      </h4>
                      <p className={`text-xs sm:text-sm ${textMuted}`}>
                        Type a topic name above and click <strong>"+ Add Topic"</strong> (or press Enter) to create your first revision log!
                      </p>
                    </div>
                  ) : subjTopics.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 font-bold space-y-1">
                      <span className="text-2xl block">🔍</span>
                      <p className="text-xs sm:text-sm">No topics matching "{modalTopicSearch}".</p>
                      <button
                        onClick={() => setModalTopicSearch('')}
                        className="text-xs text-amber-500 hover:underline font-extrabold mt-1"
                      >
                        Clear search filter
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-300 dark:border-slate-800 rounded-xl shadow-inner scrollbar-thin">
                      <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[950px]">
                        <thead>
                          <tr className={`${tableHeaderBg} uppercase text-xs tracking-wider border-b border-slate-300 dark:border-slate-800 whitespace-nowrap`}>
                            <th className="p-3.5 sm:p-4 font-extrabold w-10 text-center">
                              <input
                                type="checkbox"
                                checked={subjTopics.length > 0 && selectedTopicNames.length === subjTopics.length}
                                onChange={() => {
                                  if (selectedTopicNames.length === subjTopics.length) setSelectedTopicNames([]);
                                  else setSelectedTopicNames(subjTopics.map((tr: any) => tr.topic));
                                }}
                                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                title="Select / Deselect all topics"
                              />
                            </th>
                            <th className="p-3.5 sm:p-4 font-extrabold">Topic / Chapter</th>
                            <th className="p-3.5 sm:p-4 font-extrabold">First Read Date</th>
                            <th className="p-3.5 sm:p-4 font-extrabold">R1 Target (+7d)</th>
                            <th className="p-3.5 sm:p-4 font-extrabold">R2 Target (+21d)</th>
                            <th className="p-3.5 sm:p-4 font-extrabold">R3 Target (+45d)</th>
                            <th className="p-3.5 sm:p-4 font-extrabold">Current Status</th>
                            <th className="p-3.5 sm:p-4 font-extrabold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 dark:divide-slate-800">
                          {subjTopics.map((t: any) => {
                            const topicKey = t.id || t._id;
                            const isExpanded = expandedTopicId === topicKey;
                            const isSelected = selectedTopicNames.includes(t.topic);
                            const isMastered = !!(t.r3Status === 'Completed' || t.r3CompletedDate);
                            const stageLabel = isMastered
                              ? 'Mastered'
                              : !t.r1CompletedDate
                              ? 'R1 Pending (+7d)'
                              : !t.r2CompletedDate
                              ? 'R2 Pending (+21d)'
                              : 'R3 Pending (+45d)';
                            const extraCount = t.extraRevisions?.length || 0;

                            return (
                              <>
                                <tr key={topicKey} className={`hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors font-bold ${isSelected ? 'bg-amber-500/10' : ''}`}>
                                  <td className="p-3.5 sm:p-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSelectTopicName(t.topic)}
                                      className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-3.5 sm:p-4 font-extrabold text-amber-600 dark:text-cyan-300 min-w-[180px]">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-2">
                                        <span>{t.topic}</span>
                                      </div>
                                      {t.isCluster && t.subTopics && t.subTopics.length > 0 && (
                                        <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold pl-0.5">
                                          🔗 Clustered Topics: {t.subTopics.join(', ')}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`p-3.5 sm:p-4 ${textMuted} whitespace-nowrap`}>{t.firstReadDate || 'N/A'}</td>

                                  {/* R1 */}
                                  <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[11px] text-slate-400 font-extrabold">Target: {t.r1ScheduledDate || '—'}</span>
                                      {t.r1Status === 'Skipped' ? (
                                        <span className="text-[10px] bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-0.5 rounded font-extrabold w-fit">
                                          ⏭️ Skipped
                                        </span>
                                      ) : t.r1Status === 'Completed' || t.r1CompletedDate ? (
                                        <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded font-extrabold w-fit">
                                          Done: {t.r1CompletedDate}
                                        </span>
                                      ) : t.isOverdue && !t.r1CompletedDate ? (
                                        <span className="text-[10px] bg-rose-600 text-white px-2.5 py-0.5 rounded font-extrabold w-fit animate-pulse">
                                          Overdue (+{t.overdueDays}d)
                                        </span>
                                      ) : (
                                        <span className="text-[10px] bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded font-bold w-fit">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* R2 */}
                                  <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[11px] text-slate-400 font-extrabold">Target: {t.r2ScheduledDate || '—'}</span>
                                      {t.r2Status === 'Skipped' ? (
                                        <span className="text-[10px] bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-0.5 rounded font-extrabold w-fit">
                                          ⏭️ Skipped
                                        </span>
                                      ) : t.r2Status === 'Completed' || t.r2CompletedDate ? (
                                        <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded font-extrabold w-fit">
                                          Done: {t.r2CompletedDate}
                                        </span>
                                      ) : t.isOverdue && t.r1CompletedDate && !t.r2CompletedDate ? (
                                        <span className="text-[10px] bg-rose-600 text-white px-2.5 py-0.5 rounded font-extrabold w-fit animate-pulse">
                                          Overdue (+{t.overdueDays}d)
                                        </span>
                                      ) : (
                                        <span className="text-[10px] bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded font-bold w-fit">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* R3 */}
                                  <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[11px] text-slate-400 font-extrabold">Target: {t.r3ScheduledDate || '—'}</span>
                                      {t.r3Status === 'Skipped' ? (
                                        <span className="text-[10px] bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-0.5 rounded font-extrabold w-fit">
                                          ⏭️ Skipped
                                        </span>
                                      ) : t.r3Status === 'Completed' || t.r3CompletedDate ? (
                                        <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded font-extrabold w-fit">
                                          Done: {t.r3CompletedDate}
                                        </span>
                                      ) : t.isOverdue && t.r2CompletedDate && !t.r3CompletedDate ? (
                                        <span className="text-[10px] bg-rose-600 text-white px-2.5 py-0.5 rounded font-extrabold w-fit animate-pulse">
                                          Overdue (+{t.overdueDays}d)
                                        </span>
                                      ) : (
                                        <span className="text-[10px] bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded font-bold w-fit">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                  </td>



                                  {/* Stage Status */}
                                  <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap inline-block ${
                                        isMastered
                                          ? 'bg-emerald-600 text-white'
                                          : t.isOverdue
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-amber-600 text-white'
                                      }`}
                                    >
                                      {stageLabel}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleDeleteTopic(t.id || t._id || t.customId, t.subject, t.topic)}
                                        className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded transition-all shrink-0"
                                        title="Delete topic"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubjectTopics(null)}
                className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Skip Revision Modal */}
      {skipModalTopic && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-700 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span className="text-rose-500">⏭️</span> Skip Pending / Overdue Revision
              </h3>
              <button
                onClick={() => setSkipModalTopic(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider">{skipModalTopic.subject}</span>
              <h4 className="text-sm sm:text-base font-extrabold text-white">{skipModalTopic.topic || skipModalTopic.source}</h4>
            </div>

            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Skipping this item will clear its overdue status, record the skip reason in your revision audit logs, and schedule the next spaced milestone.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-200">
                ✏️ Reason for Skipping (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Prioritized mock test, already mastered notes..."
                value={skipNoteInput}
                onChange={(e) => setSkipNoteInput(e.target.value)}
                className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none border border-slate-700 font-bold focus:border-rose-500 text-white placeholder-slate-500"
              />
            </div>

            <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSkipModalTopic(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSkipTopicRevision(skipModalTopic.id || skipModalTopic._id || skipModalTopic.customId, skipNoteInput);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all flex items-center gap-2"
              >
                <span>⏭️</span> Confirm & Skip Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
