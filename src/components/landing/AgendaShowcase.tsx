'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trash2,
  Check,
  Circle,
  BarChart2,
  Clock,
  CheckSquare,
  Sparkles,
  Calendar,
  Layers,
  Plus,
  X,
  Play,
  BookOpen,
  ChevronDown,
  Save,
  GraduationCap
} from 'lucide-react';

interface AgendaItem {
  id: string;
  type: string;
  tag?: string;
  title: string;
  logged?: string;
  goal?: string;
  time?: string;
  streak?: string;
  done: boolean;
  icon: string;
  bgColor: string;
}

const INITIAL_AGENDA_ITEMS: AgendaItem[] = [
  {
    id: 'a1',
    type: 'TASK',
    tag: '📚 TOPIC TASK',
    title: 'Differential Calculus: ghsghdgsd',
    logged: 'Logged: 1 / 3 hours',
    done: false,
    icon: '🏃',
    bgColor: 'bg-purple-500/15 text-purple-600 border-purple-500/30'
  },
  {
    id: 'a2',
    type: 'HABIT',
    title: 'Gym',
    goal: 'Goal: 1 times',
    time: '18:00',
    streak: '2d streak',
    done: true,
    icon: '🏃',
    bgColor: 'bg-amber-500/15 text-amber-600 border-amber-500/30'
  },
  {
    id: 'a3',
    type: 'HABIT',
    title: 'Water',
    logged: 'Logged: 3.8 / 3 ltrs',
    streak: '1d streak',
    done: true,
    icon: '💧',
    bgColor: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30'
  }
];

const DEMO_CHECKLISTS = [
  {
    id: 1,
    title: '📋 UPSC Prelims Exam Day Essential Kit',
    completedCount: 0,
    totalCount: 5,
    items: [
      { id: 1, text: 'Printed e-Admit Card (Clear Black & White or Color)', checked: false },
      { id: 2, text: 'Original Photo ID Card (Aadhaar / Voter ID / Passport)', checked: false },
      { id: 3, text: '2 Black Ballpoint Pens (0.7mm thick point for fast OMR)', checked: false },
      { id: 4, text: '2 Passport Size Photographs (matching Admit Card photo)', checked: false },
      { id: 5, text: 'Transparent Water Bottle (1 Litre without labels)', checked: false }
    ]
  },
  {
    id: 2,
    title: '⚖️ Polity Laxmikanth High-Yield Chapter Checklist',
    completedCount: 0,
    totalCount: 5,
    items: [
      { id: 1, text: 'Preamble & Salient Features of the Indian Constitution', checked: false },
      { id: 2, text: 'Fundamental Rights (Articles 12-35) & Writs Jurisdiction', checked: false },
      { id: 3, text: 'Directive Principles of State Policy (DPSP) & Duties', checked: false },
      { id: 4, text: 'President, Vice President & Governor Powers', checked: false },
      { id: 5, text: 'Parliamentary Committees & Legislative Procedure', checked: false }
    ]
  }
];

export default function AgendaShowcase() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'habits' | 'calendar' | 'analytics' | 'checklists' | 'focus'>('agenda');
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(INITIAL_AGENDA_ITEMS);
  const [checklists, setChecklists] = useState(DEMO_CHECKLISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [itemType, setItemType] = useState<'habit' | 'task' | 'checklist'>('task');
  const [linkSyllabus, setLinkSyllabus] = useState(true);
  const [srsEnabled, setSrsEnabled] = useState(true);
  const [subject, setSubject] = useState('Geography');
  const [topicName, setTopicName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GS1');
  const [pattern, setPattern] = useState<'everyday' | 'specific' | 'monthly' | 'onetime'>('onetime');
  const [targetQty, setTargetQty] = useState('3');
  const [unit, setUnit] = useState('Hours');
  const [timeReminderToggle, setTimeReminderToggle] = useState(false);
  const [timeReminder, setTimeReminder] = useState('09:00 AM');
  const [checklistName, setChecklistName] = useState('');

  // Toggle agenda item completion
  const toggleAgendaItem = (id: string) => {
    setAgendaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // Delete agenda item
  const deleteAgendaItem = (id: string) => {
    setAgendaItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle checklist item
  const toggleChecklistItem = (listId: number, itemId: number) => {
    setChecklists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        const updatedItems = list.items.map((it) =>
          it.id === itemId ? { ...it, checked: !it.checked } : it
        );
        const count = updatedItems.filter((i) => i.checked).length;
        return { ...list, items: updatedItems, completedCount: count };
      })
    );
  };

  // Handle Add New Tracker Item
  const handleCreateTrackerItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (itemType === 'checklist') {
      if (!checklistName.trim()) return;
      const newList = {
        id: Date.now(),
        title: `📋 ${checklistName.trim()}`,
        completedCount: 0,
        totalCount: 0,
        items: []
      };
      setChecklists((prev) => [newList, ...prev]);
      setChecklistName('');
      setIsNewModalOpen(false);
      return;
    }

    const itemTitle = linkSyllabus && topicName ? `${subject}: ${topicName}` : title || 'New Study Item';
    const newItem: AgendaItem = {
      id: `a_${Date.now()}`,
      type: itemType === 'task' ? 'TASK' : 'HABIT',
      tag: linkSyllabus ? '📚 TOPIC TASK' : undefined,
      title: itemTitle,
      logged: itemType === 'task' ? `Logged: 0 / ${targetQty} ${unit.toLowerCase()}` : undefined,
      goal: itemType === 'habit' ? `Goal: ${targetQty} ${unit.toLowerCase()}` : undefined,
      time: timeReminderToggle ? timeReminder : undefined,
      streak: itemType === 'habit' ? '0d streak' : undefined,
      done: false,
      icon: '🏃',
      bgColor: itemType === 'task' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
    };

    setAgendaItems((prev) => [newItem, ...prev]);
    setTitle('');
    setTopicName('');
    setIsNewModalOpen(false);
  };

  const filteredItems = agendaItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/60 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/20">
            <CalendarIcon size={14} className="text-amber-600 dark:text-amber-400" />
            Feature 01 — Today's Daily Agenda
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Habit & Task Module
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
          </p>
        </div>

        {/* Outer Application Mock Container */}
        <div className="bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
          {/* Top Bar with New Habit Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-2">
            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white">Habit & Task Module</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Track events, to-dos, recurring habits, streaks, and focus timers seamlessly in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-violet-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              + New Habit or Task
            </button>
          </div>

          {/* Grid Layout: Left Nav + Right Main View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left Sidebar Navigation */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                {/* 1. Today Agenda */}
                <button
                  type="button"
                  onClick={() => setActiveTab('agenda')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'agenda'
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare size={14} /> Today Agenda
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'agenda' ? 'bg-[#6D28D9] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {agendaItems.length}
                  </span>
                </button>

                {/* 2. Habits & Streaks */}
                <button
                  type="button"
                  onClick={() => setActiveTab('habits')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'habits'
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Flame size={14} className={activeTab === 'habits' ? 'text-amber-300' : 'text-amber-500'} /> Habits & Streaks
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'habits' ? 'bg-[#6D28D9] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    11
                  </span>
                </button>

                {/* 3. Month Calendar */}
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    activeTab === 'calendar'
                      ? 'bg-[#7C3AED] text-white font-black shadow-md shadow-violet-600/20'
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <Calendar size={14} /> Month Calendar
                </button>

                {/* 4. Analytics & Scores */}
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-[#7C3AED] text-white font-black shadow-md shadow-violet-600/20'
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <BarChart2 size={14} /> Analytics & Scores
                </button>

                {/* 5. Checklists */}
                <button
                  type="button"
                  onClick={() => setActiveTab('checklists')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'checklists'
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Checklists
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'checklists' ? 'bg-[#6D28D9] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {checklists.length}
                  </span>
                </button>

                {/* 6. Focus Timer */}
                <button
                  type="button"
                  onClick={() => setActiveTab('focus')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    activeTab === 'focus'
                      ? 'bg-[#7C3AED] text-white font-black shadow-md shadow-violet-600/20'
                      : 'text-slate-600 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <Clock size={14} /> Focus Timer
                </button>
              </div>

              {/* Daily Target Widget */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-black uppercase">
                  <span>📈 DAILY TARGET</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Today's Completion</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {agendaItems.filter((i) => i.done).length} / {agendaItems.length} Done
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${agendaItems.length > 0 ? (agendaItems.filter((i) => i.done).length / agendaItems.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                  <span>Hours Read Today</span>
                  <span className="font-black text-slate-900 dark:text-white">1 hr</span>
                </div>
              </div>
            </div>

            {/* Right Main Workspace depending on activeTab */}
            <div className="md:col-span-3 space-y-4">
              {activeTab === 'agenda' && (
                <>
                  {/* Filter Strip */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <CalendarIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Aug 1, 2026</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 w-44 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          All Items ∨
                        </div>
                      </div>
                    </div>

                    {/* 7-Day Calendar Strip */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                      <button type="button" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <ChevronLeft size={16} />
                      </button>

                      <div className="grid grid-cols-7 gap-1.5 flex-1 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDay(26)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 26 ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 ring-2 ring-rose-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">SUN</span>
                          <span className="text-base font-black">26</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(27)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 27 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">MON</span>
                          <span className="text-base font-black">27</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(28)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 28 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">TUE</span>
                          <span className="text-base font-black">28</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(29)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 29 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">WED</span>
                          <span className="text-base font-black">29</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(30)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 30 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">THU</span>
                          <span className="text-base font-black">30</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(31)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 31 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">FRI</span>
                          <span className="text-base font-black">31</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(1)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDay === 1 ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30 ring-2 ring-amber-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase block">SAT</span>
                          <span className="text-base font-black">1</span>
                        </button>
                      </div>

                      <button type="button" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Task Items List */}
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border flex items-center justify-between gap-4 shadow-2xs transition-all ${
                          item.done ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold ${item.bgColor}`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {item.type}
                              </span>
                              {item.tag && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                                  {item.tag}
                                </span>
                              )}
                              <h4 className={`font-black text-sm text-slate-900 dark:text-white ${item.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                {item.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {item.logged && (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-black">
                                  {item.logged}
                                </span>
                              )}
                              {item.goal && (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-black">
                                  {item.goal}
                                </span>
                              )}
                              {item.time && (
                                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                  <Clock size={12} /> {item.time}
                                </span>
                              )}
                              {item.streak && (
                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black">
                                  <Flame size={12} /> {item.streak}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => deleteAgendaItem(item.id)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleAgendaItem(item.id)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                              item.done
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                            }`}
                          >
                            {item.done ? <Check size={20} className="stroke-[3]" /> : null}
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredItems.length === 0 && (
                      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium text-xs">
                        No tasks found matching query. Click "+ New Habit or Task" above to add one!
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Checklists tab view */}
              {activeTab === 'checklists' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <div>
                      <h4 className="font-black text-lg text-slate-900 dark:text-white">Checklists & Task Notebooks</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create customizable lists and packing checklists.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {checklists.map((list) => (
                      <div key={list.id} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                        <h5 className="font-black text-base text-slate-900 dark:text-white">{list.title}</h5>
                        <div className="space-y-2">
                          {list.items.map((it) => (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => toggleChecklistItem(list.id, it.id)}
                              className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                                it.checked ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                it.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {it.checked && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span className={`text-xs font-bold ${it.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                {it.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Timer tab view */}
              {activeTab === 'focus' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-2xs">
                  <div className="bg-indigo-50/40 rounded-2xl border border-indigo-100 p-4">
                    <label className="text-[10px] font-black uppercase text-indigo-700 flex items-center gap-1.5">
                      <BookOpen size={12} /> ACTIVE STUDY TASK
                    </label>
                    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 mt-1">
                      <span>🏃 Differential Calculus [1 hr / 3 hrs]</span>
                      <ChevronDown size={14} className="text-slate-400" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="w-56 h-56 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-4xl font-black text-slate-900 font-sans tabular-nums">00:00:00</span>
                      <span className="text-[10px] font-black text-indigo-700 uppercase mt-2 px-3 py-0.5 rounded-full bg-indigo-100">
                        DIFFERENTIAL CALCULUS
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button type="button" className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25">
                      <Play size={16} fill="white" /> Start Focus
                    </button>
                    <button type="button" className="px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                      <Plus size={16} /> Save Session
                    </button>
                  </div>
                </div>
              )}

              {/* Other tabs fallback */}
              {(activeTab === 'habits' || activeTab === 'calendar' || activeTab === 'analytics') && (
                <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center space-y-2">
                  <h4 className="font-black text-base text-slate-900 capitalize">
                    {activeTab === 'habits' && '🔥 Habits & Streaks Workspace'}
                    {activeTab === 'calendar' && '📅 Month Calendar Workspace'}
                    {activeTab === 'analytics' && '📊 Analytics & Scores Workspace'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Interactive view tab preview active. Switch back to Today Agenda or Checklists above to test live items!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Create New Tracker Item (Exact Production UI) */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <form onSubmit={handleCreateTrackerItem} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-xl text-slate-900">Create New Tracker Item</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Define schedule, target goals, and syllabus categories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Top Mode Selector Tabs */}
              <div className="bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setItemType('habit')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    itemType === 'habit' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <Flame size={14} className={itemType === 'habit' ? 'text-amber-300' : 'text-amber-500'} /> Recurring Habit
                </button>

                <button
                  type="button"
                  onClick={() => setItemType('task')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    itemType === 'task' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  📝 One-time Task
                </button>

                <button
                  type="button"
                  onClick={() => setItemType('checklist')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    itemType === 'checklist' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  📋 Checklist List
                </button>
              </div>

              {/* Mode 1 & Mode 2 Fields */}
              {(itemType === 'task' || itemType === 'habit') && (
                <>
                  {/* Purple UPSC Syllabus Link Box (Task Only) */}
                  {itemType === 'task' && (
                    <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-black text-xs text-purple-900 flex items-center gap-2">
                          <GraduationCap size={16} className="text-purple-600" /> Link to UPSC Syllabus Matrix?
                        </label>
                        <button
                          type="button"
                          onClick={() => setLinkSyllabus(!linkSyllabus)}
                          className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${linkSyllabus ? 'bg-purple-600' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${linkSyllabus ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {linkSyllabus && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Subject</label>
                              <div className="relative mt-1">
                                <select
                                  value={subject}
                                  onChange={(e) => setSubject(e.target.value)}
                                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none appearance-none"
                                >
                                  <option value="Geography">Geography</option>
                                  <option value="Ancient History">Ancient History</option>
                                  <option value="Polity">Polity</option>
                                  <option value="Economics">Economics</option>
                                  <option value="Ethics">Ethics</option>
                                  <option value="Differential Calculus">Differential Calculus</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Topic Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Ocean Currents & Tides"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none mt-1"
                              />
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-purple-200 p-3 flex items-center justify-between">
                            <span className="text-xs font-black text-purple-900">Spaced Repetition SRS (R1, R2, R3)?</span>
                            <button
                              type="button"
                              onClick={() => setSrsEnabled(!srsEnabled)}
                              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${srsEnabled ? 'bg-purple-600' : 'bg-slate-300'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${srsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Title & Syllabus Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Title</label>
                      <div className="flex items-center gap-2 mt-1">
                        <button type="button" className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                          🏃 ∨
                        </button>
                        <input
                          type="text"
                          placeholder={itemType === 'task' ? 'Task Title' : 'e.g., Daily Answer Writing / Running'}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Syllabus Category</label>
                      <div className="relative mt-1">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none appearance-none"
                        >
                          <option value="GS1">GS1</option>
                          <option value="GS2">GS2</option>
                          <option value="GS3">GS3</option>
                          <option value="GS4">GS4</option>
                          <option value="Maths">Maths</option>
                          <option value="CSAT">CSAT</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Recurrence Pattern */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Recurrence Pattern</label>
                      {itemType === 'task' && (
                        <span className="text-[10px] font-black text-purple-600 flex items-center gap-1">
                          ⚡ One-Time required for Syllabus Link
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setPattern('everyday')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          pattern === 'everyday' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Everyday
                      </button>
                      <button
                        type="button"
                        onClick={() => setPattern('specific')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          pattern === 'specific' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Specific Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setPattern('monthly')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          pattern === 'monthly' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setPattern('onetime')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          pattern === 'onetime' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        One Time
                      </button>
                    </div>
                  </div>

                  {/* Target Quantity & Unit Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Target Quantity</label>
                      <input
                        type="text"
                        value={targetQty}
                        onChange={(e) => setTargetQty(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Unit Selector</label>
                      <div className="relative mt-1">
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none appearance-none"
                        >
                          <option value="Hours">Hours</option>
                          <option value="Pages">Pages</option>
                          <option value="Questions">Questions</option>
                          <option value="Times">Times</option>
                          <option value="Ltrs">Ltrs</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Date & Time Reminder */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Scheduled Date</label>
                      <div className="relative mt-1">
                        <div className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-indigo-600" /> Aug 1, 2026
                          </span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Time Reminder</label>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setTimeReminderToggle(!timeReminderToggle)}
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${timeReminderToggle ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${timeReminderToggle ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <div className="flex-1 relative">
                          <div className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Clock size={14} className="text-indigo-600" /> {timeReminder}
                            </span>
                            <ChevronDown size={14} className="text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Mode 3: Checklist List */}
              {itemType === 'checklist' && (
                <div className="space-y-2 py-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Checklist Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mains Paper 1 Revision Topics"
                    value={checklistName}
                    onChange={(e) => setChecklistName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
                >
                  <Save size={16} /> Create Item
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
