'use client';

import { useState, useMemo } from 'react';
import { Plus, Table, Trash2, Check } from 'lucide-react';

interface SyllabusModuleProps {
  syllabusList: any[];
  topicRevisions: any[];
  onToggleMilestone: (subjectItem: any, key: string) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onOpenSubjectTopicsModal: (subject: any) => void;
  onOpenAddSubjectModal: () => void;
  getCategoryBadge: (category: string) => string;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function SyllabusModule({
  syllabusList,
  topicRevisions,
  onToggleMilestone,
  onDeleteSubject,
  onOpenSubjectTopicsModal,
  onOpenAddSubjectModal,
  getCategoryBadge,
  isLight,
  cardBg,
  cardInnerBg,
  inputBg,
  textTitle,
  textMuted,
}: SyllabusModuleProps) {
  const [syllabusCategoryFilter, setSyllabusCategoryFilter] = useState('ALL');
  const [syllabusSearch, setSyllabusSearch] = useState('');

  const filteredSubjects = useMemo(() => {
    return syllabusList.filter((s) => {
      const matchCat = syllabusCategoryFilter === 'ALL' || s.category === syllabusCategoryFilter;
      const matchSearch =
        !syllabusSearch ||
        s.subject?.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
        s.source?.toLowerCase().includes(syllabusSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [syllabusList, syllabusCategoryFilter, syllabusSearch]);

  return (
    <div className={`${cardBg} rounded-xl p-4 sm:p-6 animate-fade-in space-y-6`}>
      <div className={`flex justify-between items-center flex-wrap gap-3 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-4`}>
        <div>
          <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle}`}>Subject Milestone Progress Matrix</h3>
          <p className={`text-xs sm:text-sm ${textMuted}`}>
            Click any milestone pill to toggle completed stages for each subject in your database!
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddSubjectModal}
          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all"
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
          <div className={`${cardInnerBg} rounded-xl p-10 text-center space-y-3 border border-slate-300 dark:border-slate-800`}>
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
              <Table size={24} />
            </div>
            <h4 className={`font-extrabold text-base ${textTitle}`}>No Subjects Found</h4>
            <p className={`text-xs ${textMuted} max-w-sm mx-auto`}>
              No syllabus items match your current filter or search criteria. Try adjusting your search term or add a new custom subject.
            </p>
            <button
              type="button"
              onClick={onOpenAddSubjectModal}
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 shadow transition-all"
            >
              <Plus size={15} /> Add Custom Subject
            </button>
          </div>
        ) : (
          filteredSubjects.map((s) => {
            const subTopicsCount = topicRevisions.filter(
              (tr: any) => tr.subject?.toLowerCase() === s.subject?.toLowerCase()
            ).length;

            return (
              <div
                key={s.id}
                className={`${cardInnerBg} p-4 sm:p-5 rounded-xl space-y-3 transition-all border border-slate-300 dark:border-slate-800`}
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${getCategoryBadge(s.category)}`}>
                        {s.category}
                      </span>
                      <h4
                        onClick={() => onOpenSubjectTopicsModal(s)}
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
                      type="button"
                      onClick={() => onOpenSubjectTopicsModal(s)}
                      className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-400/40 text-xs rounded-lg font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
                      title={`View revision topics table for ${s.subject}`}
                    >
                      <Table size={14} /> View Topics ({subTopicsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSubject(s.id)}
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
                    { key: 'firstRead', label: 'Reading 1' },
                    { key: 'rev1', label: 'Rev 1' },
                    { key: 'rev2', label: 'Rev 2' },
                    { key: 'preNotes', label: 'Pre Notes' },
                    { key: 'mainsNotes', label: 'Mains Notes' },
                    { key: 'questionBank', label: 'Q-Bank' },
                    { key: 'prePyq', label: 'Pre PYQ' },
                    { key: 'mainsPyq', label: 'Mains PYQ' },
                    { key: 'ansWriting', label: 'Ans Writing' },
                    { key: 'preFinalRev', label: 'Pre Final Rev' },
                    { key: 'mainsFinalRev', label: 'Mains Final Rev' }
                  ].map((m) => {
                    const isDone = !!s[m.key];
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => onToggleMilestone(s, m.key)}
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
  );
}
