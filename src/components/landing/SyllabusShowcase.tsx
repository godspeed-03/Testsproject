'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  Sparkles,
  Plus,
  Settings,
  Search,
  Trash2,
  Table,
  Filter,
  X,
  PlusCircle,
  Check
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  GS1: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  GS2: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  GS3: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  GS4: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Maths: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  CSAT: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
};

const CATEGORIES = [
  'All Categories',
  'GS Paper 1',
  'GS Paper 2',
  'GS Paper 3',
  'GS Paper 4',
  'Maths Optional',
  'CSAT'
];

const STATUS_STAGES = [
  { value: 'Not Started', label: 'Not Started', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700', dotColor: 'bg-slate-400' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dotColor: 'bg-amber-500' },
  { value: 'Revision Phase', label: 'Revision Phase', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', dotColor: 'bg-indigo-500' },
  { value: 'Completed', label: 'Completed', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dotColor: 'bg-emerald-500' }
];

const DEFAULT_GS_RULES = [
  { short: 'In P', label: 'In Progress', completed: false },
  { short: 'R1', label: 'Reading 1', completed: false },
  { short: 'Rv1', label: 'Rev 1', completed: false },
  { short: 'Rv2', label: 'Rev 2', completed: false },
  { short: 'PN', label: 'Pre Notes', completed: false },
  { short: 'MN', label: 'Mains Notes', completed: false },
  { short: 'QB', label: 'Q-Bank', completed: false },
  { short: 'PP', label: 'Pre PYQ', completed: false },
  { short: 'MP', label: 'Mains PYQ', completed: false },
  { short: 'AW', label: 'Ans Writing', completed: false },
  { short: 'PF', label: 'Pre Final Rev', completed: false },
  { short: 'MF', label: 'Mains Final Rev', completed: false }
];

const INITIAL_SYLLABUS = [
  {
    id: 's1',
    subject: 'Ancient History',
    category: 'GS1',
    status: 'Not Started',
    topicCount: 0,
    topics: [] as string[],
    rules: [...DEFAULT_GS_RULES]
  },
  {
    id: 's2',
    subject: 'Geography',
    category: 'GS1',
    status: 'Not Started',
    topicCount: 0,
    topics: [] as string[],
    rules: [...DEFAULT_GS_RULES]
  },
  {
    id: 's3',
    subject: 'Polity',
    category: 'GS2',
    status: 'Not Started',
    topicCount: 0,
    topics: [] as string[],
    rules: [
      ...DEFAULT_GS_RULES,
      { short: 'Read', label: 'Read LaxmiKant', completed: false }
    ]
  },
  {
    id: 's4',
    subject: 'Economics',
    category: 'GS3',
    status: 'Not Started',
    topicCount: 0,
    topics: [] as string[],
    rules: [...DEFAULT_GS_RULES]
  },
  {
    id: 's5',
    subject: 'Ethics',
    category: 'GS4',
    status: 'Not Started',
    topicCount: 0,
    topics: [] as string[],
    rules: [
      { short: 'In P', label: 'In Progress', completed: false },
      { short: 'R1', label: 'Reading 1', completed: false },
      { short: 'Read', label: 'Read Lexicon', completed: false },
      { short: 'Rv1', label: 'Rev 1', completed: false },
      { short: 'Rv2', label: 'Rev 2', completed: false },
      { short: 'PN', label: 'Pre Notes', completed: false },
      { short: 'MN', label: 'Mains Notes', completed: false },
      { short: 'QB', label: 'Q-Bank', completed: false },
      { short: 'PP', label: 'Pre PYQ', completed: false },
      { short: 'MP', label: 'Mains PYQ', completed: false },
      { short: 'AW', label: 'Ans Writing', completed: false },
      { short: 'PF', label: 'Pre Final Rev', completed: false },
      { short: 'MF', label: 'Mains Final Rev', completed: false }
    ]
  },
  {
    id: 's6',
    subject: 'Differential Calculas',
    category: 'Maths',
    status: 'Not Started',
    topicCount: 1,
    topics: ['Limits & Continuity'],
    rules: [
      { short: 'Lec', label: 'Lectures', completed: false },
      { short: 'Ex PYQ', label: 'Examples PYQ', completed: false },
      { short: 'PYQ Sh', label: 'PYQ Sheet', completed: false },
      { short: 'MN', label: 'Notes Mains', completed: false },
      { short: 'Rv1', label: 'Rev 1', completed: false },
      { short: 'Rv2', label: 'Rev 2', completed: false },
      { short: 'P1', label: 'Practice 1', completed: false },
      { short: 'P2', label: 'Practice 2', completed: false }
    ]
  },
  {
    id: 's7',
    subject: 'Calendar',
    category: 'CSAT',
    status: 'Not Started',
    topicCount: 0,
    topics: [] as string[],
    rules: [
      { short: 'Rdg', label: 'Reading', completed: false },
      { short: 'SN', label: 'Short Notes', completed: false },
      { short: 'DPP', label: 'DPP', completed: false },
      { short: 'BOOK', label: 'BOOK (Schand)', completed: false },
      { short: 'PYQ', label: 'PYQ', completed: false }
    ]
  }
];

const BULK_PRESETS = [
  { subject: 'Indian Society', category: 'GS1' },
  { subject: 'World History', category: 'GS1' },
  { subject: 'International Relations', category: 'GS2' },
  { subject: 'Governance', category: 'GS2' },
  { subject: 'Disaster Management', category: 'GS3' },
  { subject: 'Internal Security', category: 'GS3' },
  { subject: 'Science & Tech', category: 'GS3' },
  { subject: 'Case Studies', category: 'GS4' }
];

export default function SyllabusShowcase() {
  const [syllabus, setSyllabus] = useState(INITIAL_SYLLABUS);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<'addSubject' | 'bulk' | 'rulesets' | 'topics' | 'editRules' | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Add Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('GS1');

  // Bulk Add Form State
  const [selectedBulkItems, setSelectedBulkItems] = useState<string[]>(['Indian Society', 'Governance']);

  // Topic Addition State
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Custom Rule Addition State
  const [newRuleShort, setNewRuleShort] = useState('');
  const [newRuleLabel, setNewRuleLabel] = useState('');

  // Filter items dynamically
  const filteredSyllabus = syllabus.filter((item) => {
    const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'All Categories') return matchesSearch;
    if (selectedCategory === 'GS Paper 1') return item.category === 'GS1' && matchesSearch;
    if (selectedCategory === 'GS Paper 2') return item.category === 'GS2' && matchesSearch;
    if (selectedCategory === 'GS Paper 3') return item.category === 'GS3' && matchesSearch;
    if (selectedCategory === 'GS Paper 4') return item.category === 'GS4' && matchesSearch;
    if (selectedCategory === 'Maths Optional') return item.category === 'Maths' && matchesSearch;
    if (selectedCategory === 'CSAT') return item.category === 'CSAT' && matchesSearch;
    return matchesSearch;
  });

  const activeSubjectObj = syllabus.find((s) => s.id === activeSubjectId);

  // Actions
  const toggleRule = (subId: string, ruleIdx: number) => {
    setSyllabus((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        const updatedRules = [...sub.rules];
        updatedRules[ruleIdx] = {
          ...updatedRules[ruleIdx],
          completed: !updatedRules[ruleIdx].completed
        };
        return { ...sub, rules: updatedRules };
      })
    );
  };

  const changeStatus = (subId: string, newStatus: string) => {
    setSyllabus((prev) =>
      prev.map((sub) => (sub.id === subId ? { ...sub, status: newStatus } : sub))
    );
    setOpenStatusDropdown(null);
  };

  const deleteSubject = (subId: string) => {
    setSyllabus((prev) => prev.filter((sub) => sub.id !== subId));
  };

  // Add Single Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const newSubject = {
      id: `s_${Date.now()}`,
      subject: newSubName.trim(),
      category: newSubCategory,
      status: 'Not Started',
      topicCount: 0,
      topics: [],
      rules: [...DEFAULT_GS_RULES]
    };
    setSyllabus((prev) => [...prev, newSubject]);
    setNewSubName('');
    setActiveModal(null);
  };

  // Bulk Add Subjects
  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const toAdd = BULK_PRESETS.filter((item) => selectedBulkItems.includes(item.subject));
    const newEntries = toAdd.map((item, idx) => ({
      id: `bulk_${Date.now()}_${idx}`,
      subject: item.subject,
      category: item.category,
      status: 'Not Started',
      topicCount: 0,
      topics: [],
      rules: [...DEFAULT_GS_RULES]
    }));
    setSyllabus((prev) => [...prev, ...newEntries]);
    setActiveModal(null);
  };

  // Add Topic to Subject
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubjectId || !newTopicTitle.trim()) return;
    setSyllabus((prev) =>
      prev.map((sub) => {
        if (sub.id !== activeSubjectId) return sub;
        const updatedTopics = [...sub.topics, newTopicTitle.trim()];
        return { ...sub, topics: updatedTopics, topicCount: updatedTopics.length };
      })
    );
    setNewTopicTitle('');
  };

  // Add Rule to Subject
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubjectId || !newRuleShort.trim()) return;
    setSyllabus((prev) =>
      prev.map((sub) => {
        if (sub.id !== activeSubjectId) return sub;
        const updatedRules = [
          ...sub.rules,
          { short: newRuleShort.trim(), label: newRuleLabel.trim() || newRuleShort.trim(), completed: false }
        ];
        return { ...sub, rules: updatedRules };
      })
    );
    setNewRuleShort('');
    setNewRuleLabel('');
  };

  // Delete Rule from Subject
  const handleDeleteRule = (subId: string, ruleIdx: number) => {
    setSyllabus((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        const updatedRules = sub.rules.filter((_, idx) => idx !== ruleIdx);
        return { ...sub, rules: updatedRules };
      })
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/60 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/20">
            <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
            Feature 07 — Syllabus Progress Matrix
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Database-Driven Syllabus Matrix
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Interactive syllabus pipeline with dynamic milestone rules per subject category. Try clicking rules, changing stage statuses, or adding subjects below!
          </p>
        </div>

        {/* Main Matrix Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          {/* Header Row: Title & Top Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">Syllabus Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Track subject-wise coverage across dynamic milestone rules stored in Database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModal('rulesets')}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                <Settings size={15} className="text-amber-500" /> Ruleset Templates
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('bulk')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles size={15} /> Bulk Add
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('addSubject')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> Add Subject
              </button>
            </div>
          </div>

          {/* Filter Bar & Search Input Container */}
          <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Filter size={14} className="text-slate-400 shrink-0 ml-1" />
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject by title or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Table Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[170px]">SUBJECT</th>
                  <th className="py-3.5 px-3 min-w-[90px]">CATEGORY</th>
                  <th className="py-3.5 px-3 min-w-[150px]">STATUS STAGE</th>
                  <th className="py-3.5 px-4 min-w-[450px]">PROGRESS PIPELINE</th>
                  <th className="py-3.5 px-4 text-right min-w-[150px]">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                {filteredSyllabus.map((item) => {
                  const completedCount = item.rules.filter((r) => r.completed).length;
                  const activeStageObj =
                    STATUS_STAGES.find((st) => st.value === item.status) || STATUS_STAGES[0];

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Subject Name */}
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                        {item.subject}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.GS1}`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Status Stage Dropdown */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenStatusDropdown(openStatusDropdown === item.id ? null : item.id)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-2xs ${activeStageObj.color}`}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${activeStageObj.dotColor}`} />
                            <span>{activeStageObj.label}</span>
                            <ChevronDown size={13} />
                          </button>

                          {openStatusDropdown === item.id && (
                            <div className="absolute left-0 top-full mt-1 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 min-w-[140px] space-y-1">
                              {STATUS_STAGES.map((st) => (
                                <button
                                  key={st.value}
                                  type="button"
                                  onClick={() => changeStatus(item.id, st.value)}
                                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Progress Pipeline Rules */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.rules.map((rule, rIdx) => {
                            const isDone = rule.completed;
                            return (
                              <button
                                key={rIdx}
                                type="button"
                                onClick={() => toggleRule(item.id, rIdx)}
                                title={rule.label}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
                                )}
                                <span>{rule.short}</span>
                              </button>
                            );
                          })}

                          <span className="text-slate-400 text-xs font-bold ml-1 whitespace-nowrap">
                            {completedCount}/{item.rules.length}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSubjectId(item.id);
                              setActiveModal('topics');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Table size={13} /> ({item.topicCount})
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveSubjectId(item.id);
                              setActiveModal('editRules');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer"
                          >
                            + Rules
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSubject(item.id)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: + Add Subject */}
        {activeModal === 'addSubject' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <form onSubmit={handleAddSubject} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle size={16} className="text-indigo-600 dark:text-indigo-400" /> Add New Subject
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Indian History"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Subject Category</label>
                  <div className="relative mt-1">
                    <select
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none appearance-none"
                    >
                      <option value="GS1">GS1</option>
                      <option value="GS2">GS2</option>
                      <option value="GS3">GS3</option>
                      <option value="GS4">GS4</option>
                      <option value="Maths">Maths</option>
                      <option value="CSAT">CSAT</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 2: ✨ Bulk Add */}
        {activeModal === 'bulk' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <form onSubmit={handleBulkAdd} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400" /> Bulk Add Subjects
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Select Subjects to Import</label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {BULK_PRESETS.map((preset) => {
                    const isSelected = selectedBulkItems.includes(preset.subject);
                    return (
                      <button
                        key={preset.subject}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBulkItems(selectedBulkItems.filter((s) => s !== preset.subject));
                          } else {
                            setSelectedBulkItems([...selectedBulkItems, preset.subject]);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{preset.subject} ({preset.category})</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-black text-xs shadow-md shadow-cyan-600/20"
                >
                  Add Selected ({selectedBulkItems.length})
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL 3: ⚙️ Ruleset Templates */}
        {activeModal === 'rulesets' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings size={16} className="text-amber-500" /> Ruleset Templates
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1">
                  <span className="font-black text-indigo-900 dark:text-indigo-200">UPSC GS Standard Template (12 Rules)</span>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">In Progress, R1, Rev1, Rev2, Pre Notes, Mains Notes, Q-Bank, Pre PYQ, Mains PYQ, Ans Writing, Pre Final Rev, Mains Final Rev.</p>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
                  <span className="font-black text-rose-900 dark:text-rose-200">Maths Optional Template (8 Rules)</span>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">Lectures, Examples PYQ, PYQ Sheet, Notes Mains, Rev 1, Rev 2, Practice 1, Practice 2.</p>
                </div>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 rounded-xl space-y-1">
                  <span className="font-black text-cyan-900 dark:text-cyan-200">CSAT Quick Template (5 Rules)</span>
                  <p className="text-[11px] text-cyan-700 dark:text-cyan-300">Reading, Short Notes, DPP, BOOK, PYQ.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: ⊞ Topic Revisions */}
        {activeModal === 'topics' && activeSubjectObj && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Table size={16} className="text-purple-600 dark:text-purple-400" /> Topics — {activeSubjectObj.subject}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTopic} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Topic Name (e.g. Climatology)"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  + Add
                </button>
              </form>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeSubjectObj.topics.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic text-center py-4">No topics added yet.</p>
                ) : (
                  activeSubjectObj.topics.map((top, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{top}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-black">Topic #{idx + 1}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: + Edit Rules */}
        {activeModal === 'editRules' && activeSubjectObj && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings size={16} className="text-indigo-600 dark:text-indigo-400" /> Edit Rules — {activeSubjectObj.subject}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddRule} className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Short (e.g. Read)"
                  value={newRuleShort}
                  onChange={(e) => setNewRuleShort(e.target.value)}
                  className="col-span-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
                <input
                  type="text"
                  placeholder="Full Label"
                  value={newRuleLabel}
                  onChange={(e) => setNewRuleLabel(e.target.value)}
                  className="col-span-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
                <button
                  type="submit"
                  className="col-span-1 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  + Add Rule
                </button>
              </form>

              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {activeSubjectObj.rules.map((rule, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{rule.short} ({rule.label})</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(activeSubjectObj.id, idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
