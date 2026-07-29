'use client';

import { Clock, Printer, Target } from 'lucide-react';

export default function MasterRoutineTable() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Timetable Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[1250px] text-xs">
            <thead>
              <tr className="bg-slate-950 text-white font-bold text-[11px] uppercase tracking-wider divide-x divide-slate-800">
                <th className="p-3 whitespace-nowrap bg-slate-900 sticky left-0 z-10">DAYS</th>
                <th className="p-2.5">
                  4:00-4:30
                  <span className="block text-[9px] text-slate-400 font-normal">Shower & Fresh</span>
                </th>
                <th className="p-2.5">
                  4:30-6:00
                  <span className="block text-[9px] text-slate-400 font-normal">GS + Hindu Lect</span>
                </th>
                <th className="p-2.5">
                  6:00-6:15
                  <span className="block text-[9px] text-slate-400 font-normal">Travel Library</span>
                </th>
                <th className="p-2.5">
                  6:15-6:30
                  <span className="block text-[9px] text-slate-400 font-normal">Quick Revision</span>
                </th>
                <th className="p-2.5">
                  6:30-10:30
                  <span className="block text-[9px] text-slate-400 font-normal">GS @ Library</span>
                </th>
                <th className="p-2.5">
                  10:30-11:00
                  <span className="block text-[9px] text-slate-400 font-normal">GS Read</span>
                </th>
                <th className="p-2.5">
                  11:00-11:30
                  <span className="block text-[9px] text-slate-400 font-normal">MEETING</span>
                </th>
                <th className="p-2.5">
                  11:30-1:00
                  <span className="block text-[9px] text-slate-400 font-normal">GS Backlog</span>
                </th>
                <th className="p-2.5">
                  1:00-2:00
                  <span className="block text-[9px] text-slate-400 font-normal">LUNCH</span>
                </th>
                <th className="p-2.5">
                  2:00-5:00
                  <span className="block text-[9px] text-slate-400 font-normal">Maths / CSAT</span>
                </th>
                <th className="p-2.5">
                  5:00-6:00
                  <span className="block text-[9px] text-slate-400 font-normal">Weekly CA & Home</span>
                </th>
                <th className="p-2.5">
                  6:00-8:00
                  <span className="block text-[9px] text-slate-400 font-normal">GYM (Leave 8:00)</span>
                </th>
                <th className="p-2.5">
                  8:00-8:45
                  <span className="block text-[9px] text-slate-400 font-normal">Shower & Dress</span>
                </th>
                <th className="p-2.5">
                  8:45-9:15
                  <span className="block text-[9px] text-slate-400 font-normal">DINNER</span>
                </th>
                <th className="p-2.5">
                  9:15-10:00
                  <span className="block text-[9px] text-slate-400 font-normal">Walk & Rev</span>
                </th>
                <th className="p-2.5">
                  10:00 PM
                  <span className="block text-[9px] text-slate-400 font-normal">SLEEP</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {/* MONDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">MON</td>
                <td rowSpan={6} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  Wake Up,<br />Shower & Fresh
                </td>
                <td rowSpan={6} className="p-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
                  GS Lecture &<br />Hindu CA Lecture
                </td>
                <td rowSpan={6} className="p-2 bg-orange-500/10 text-orange-700 dark:text-orange-300 font-bold border border-orange-500/20">
                  Travel<br />Library @ 6:15
                </td>
                <td rowSpan={6} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  Quick Revision<br />
                  <span className="text-[10px] opacity-75">(6:15 - 6:30)</span>
                </td>
                <td rowSpan={6} className="p-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
                  Current GS (Weekly)
                </td>
                <td rowSpan={3} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  GS Backlog
                </td>
                <td rowSpan={5} className="p-2 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-extrabold border border-rose-500/30">
                  MEETING
                </td>
                <td rowSpan={3} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  GS Backlog
                </td>
                <td rowSpan={7} className="p-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-500/30">
                  LUNCH
                </td>
                <td rowSpan={4} className="p-2 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30">
                  Maths Optional
                </td>
                <td rowSpan={6} className="p-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                  Weekly CA Read<br />
                  <span className="text-[10px] opacity-75">& Home @ 6:00 PM</span>
                </td>
                <td rowSpan={6} className="p-2 bg-sky-500/15 text-sky-800 dark:text-sky-300 font-extrabold border border-sky-500/30">
                  GYM<br />
                  <span className="text-[10px] opacity-75">(Leave @ 8:00)</span>
                </td>
                <td rowSpan={6} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  Post-Gym Shower<br />& Clothing
                </td>
                <td rowSpan={6} className="p-2 bg-purple-500/15 text-purple-800 dark:text-purple-300 font-extrabold border border-purple-500/30">
                  DINNER
                </td>
                <td rowSpan={6} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  Walk & Revision / Relax
                </td>
                <td rowSpan={7} className="p-2 bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-400 font-extrabold border border-slate-300 dark:border-slate-800">
                  SLEEP
                </td>
              </tr>

              {/* TUESDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">TUE</td>
              </tr>

              {/* WEDNESDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">WED</td>
              </tr>

              {/* THURSDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">THU</td>
                <td rowSpan={2} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  Revise GS
                </td>
                <td rowSpan={2} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  Revise GS
                </td>
              </tr>

              {/* FRIDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">FRI</td>
                <td className="p-2 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30">
                  CSAT Lecture
                </td>
              </tr>

              {/* SATURDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">SAT</td>
                <td colSpan={3} className="p-2 bg-pink-500/10 text-pink-700 dark:text-pink-300 font-bold border border-pink-500/20">
                  Revise GS (C + B) + CA & Meeting
                </td>
                <td className="p-2 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30">
                  Revise (Maths + CSAT)
                </td>
              </tr>

              {/* SUNDAY */}
              <tr className="divide-x divide-slate-200 dark:divide-slate-800">
                <td className="p-3 bg-slate-900 text-white font-extrabold text-xs sticky left-0 z-10">SUN</td>
                <td colSpan={2} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  Early Morning Refresh & Light Rev
                </td>
                <td className="p-2 bg-orange-500/10 text-orange-700 dark:text-orange-300 font-bold border border-orange-500/20">
                  Reach Library @ 6:30
                </td>
                <td colSpan={2} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  Test (CA + GS)
                </td>
                <td colSpan={2} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  Test Revision & Prep
                </td>
                <td className="p-2 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-500/30">
                  PW Test<br />
                  <span className="text-[10px] opacity-75">(12:00 - 1:00 PM)</span>
                </td>
                <td className="p-2 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30">
                  CSAT Practice
                </td>
                <td colSpan={2} className="p-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
                  Evaluate Tests & GYM (Leave @ 8:00)
                </td>
                <td colSpan={3} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  Post-Gym Shower, Dinner & Movie / Rest
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Study Hours Metrics Banner */}
        <div className="bg-slate-950 text-white px-4 py-3 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-amber-400">⚡ Daily (Mon–Fri): 12.5 Hours</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">📊 Saturday: 12.5 Hours</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400">🎯 Sunday Tests: 11.5 Hours</span>
          </div>
          <div className="text-pink-400 font-extrabold text-xs sm:text-sm">
            🔥 Total Weekly Output: 86.5 Hours / Week
          </div>
        </div>
      </div>

      {/* Satak Goals Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-900 text-white font-extrabold text-sm uppercase tracking-wider px-5 py-3 flex items-center gap-2">
          <Target size={16} className="text-amber-400" /> SATAK GOALS — MAINS + PRELIMS ROADMAP
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/60 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="p-3.5 w-44">PHASE</th>
                <th className="p-3.5">PRIMARY GOAL</th>
                <th className="p-3.5">SUPPORT WORK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/20 whitespace-nowrap">
                  TILL DECEMBER 2026
                </td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Polity, History, Economics, Geography for Mains. Complete 2 revisions, PYQs, and mains notes.
                </td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Optional full syllabus completion, 1 revision, and 1 test.
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/20 whitespace-nowrap">
                  JAN TO APRIL 2027
                </td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Prelims notes, MCQ practice, PYQs, GS1, CSAT papers, and CA compilation from May 2026 to April 2027.
                </td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Keep revising optional, mains question banks, mains boosters, and prelims boosters.
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/20 whitespace-nowrap">
                  EXTRA TRACKS
                </td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Thematic notes and thematic revision across long subject blocks.
                </td>
                <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Continuous CA revision, GS revision, optional maths revision, map practice, and map revision.
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/20 whitespace-nowrap">
                  ALWAYS ON
                </td>
                <td colSpan={2} className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Notes for mains and prelims should keep getting updated while revision cycles continue.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
