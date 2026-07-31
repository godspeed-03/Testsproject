'use client';

import { useState, useMemo } from 'react';
import { Plus, Table, Trash2, Check, Loader2 } from 'lucide-react';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      <div className={`flex justify-between items-center flex-wrap gap-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-4`}>
        <div>
          <h3 className={`font-extrabold text-lg sm:text-xl ${textTitle}`}>Subject Milestone Progress Matrix</h3>
          <p className={`text-xs sm:text-sm ${textMuted}`}>
            Click any milestone pill to toggle completed stages for each subject in your database!
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddSubjectModal}
          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus size={16} /> Add Custom Subject
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={syllabusCategoryFilter}
          onChange={(e) => setSyllabusCategoryFilter(e.target.value)}
          className={`${inputBg} text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none font-bold border border-slate-300 dark:border-slate-700`}
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
          className={`${inputBg} text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex-1 min-w-[220px] outline-none font-bold border border-slate-300 dark:border-slate-700`}
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
              className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow transition-all"
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
                className={`${cardInnerBg} p-4 sm:p-5 rounded-xl space-y-3 transition-all border border-slate-300 dark:border-slate-800 shadow-2xs`}
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${getCategoryBadge(s.category)}`}>
                        {s.category}
                      </span>
                      <h4
                        onClick={() => onOpenSubjectTopicsModal(s)}
                        className={`font-extrabold ${textTitle} text-base sm:text-lg cursor-pointer hover:underline flex items-center gap-1.5`}
                        title="Click to view revision topics table"
                      >
                        {s.subject} {s.source ? <span className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-extrabold">— {s.source}</span> : ''}
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
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs rounded-xl font-extrabold flex items-center gap-1.5 transition-all shadow-2xs"
                      title={`View revision topics table for ${s.subject}`}
                    >
                      <Table size={14} /> View Topics ({subTopicsCount})
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === s.id}
                      onClick={async () => {
                        setDeletingId(s.id);
                        try {
                          await onDeleteSubject(s.id);
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800 font-bold transition-all shadow-2xs disabled:opacity-50"
                      title="Delete Subject"
                    >
                      {deletingId === s.id ? <Loader2 size={15} className="animate-spin text-rose-500" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                {/* Responsive Milestone Grid: 2 cols on mobile, flex wrap on desktop */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs pt-1">
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
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 border ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-500 font-extrabold shadow-xs'
                            : isLight
                            ? 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100 font-semibold'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 hover:bg-slate-700 font-semibold'
                        }`}
                      >
                        {isDone ? <Check size={14} className="text-white shrink-0" /> : null}
                        <span className="truncate">{m.label}</span>
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
