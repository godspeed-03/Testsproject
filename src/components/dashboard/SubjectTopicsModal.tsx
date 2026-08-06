import { useState } from 'react';
import { X, Search, BookOpen, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

function addDaysToStr(dateStr: string, days: number): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '—';
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '—';
  }
}

interface SubjectTopicsModalProps {
  selectedSubjectTopics: any | null;
  onClose: () => void;
  topicRevisions: any[];
  batchedRevisions?: any[];
  getCategoryBadge: (category: string) => string;
  isLight: boolean;
  cardBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
  tableHeaderBg: string;
}

export default function SubjectTopicsModal({
  selectedSubjectTopics,
  onClose,
  topicRevisions,
  batchedRevisions = [],
  getCategoryBadge,
  isLight,
  cardBg,
  inputBg,
  textTitle,
  textMuted,
  tableHeaderBg,
}: SubjectTopicsModalProps) {
  const [modalTopicSearch, setModalTopicSearch] = useState('');

  if (!selectedSubjectTopics) return null;

  const subjNorm = selectedSubjectTopics.subject?.toLowerCase();

  const allSubjTopics = topicRevisions.filter(
    (tr: any) => tr.subject?.toLowerCase() === subjNorm
  );

  const subjTopics = allSubjTopics.filter((tr: any) =>
    !modalTopicSearch || tr.topic?.toLowerCase().includes(modalTopicSearch.toLowerCase())
  );

  const subjIdNorm = (selectedSubjectTopics.id || selectedSubjectTopics.dbId || '').toLowerCase();

  const relevantBatches = (batchedRevisions || []).filter((batch: any) => {
    const topics = Array.isArray(batch.topicStatuses) ? batch.topicStatuses : [];
    const subjectIds = Array.isArray(batch.subjectIds) ? batch.subjectIds : [];
    return (
      subjectIds.some((s: string) => {
        const sLower = String(s).toLowerCase();
        return sLower === subjNorm || (subjIdNorm && sLower === subjIdNorm);
      }) ||
      topics.some(
        (t: any) =>
          String(t.subject || '').toLowerCase() === subjNorm ||
          (subjIdNorm && String(t.syllabusItemId || '').toLowerCase() === subjIdNorm)
      )
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900/95 rounded-3xl w-full max-w-6xl lg:max-w-7xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800/80 glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-xs border ${getCategoryBadge(selectedSubjectTopics.category)}`}>
              {selectedSubjectTopics.category}
            </span>
            <div>
              <h3 className="font-black font-display text-lg sm:text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{selectedSubjectTopics.subject}</span>
                <span className="text-slate-400 font-normal text-sm sm:text-base">— Micro-Topics Revision Queue</span>
              </h3>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95"
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search micro-topics in ${selectedSubjectTopics.subject}...`}
              value={modalTopicSearch}
              onChange={(e) => setModalTopicSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl pl-10 pr-12 py-3 text-xs sm:text-sm outline-none border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-inner"
            />
            {modalTopicSearch && (
              <button
                type="button"
                onClick={() => setModalTopicSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>



          {allSubjTopics.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <BookOpen size={28} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg font-display">
                No Topics Logged for {selectedSubjectTopics.subject}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log a daily study task with a topic name to build your automated spaced repetition revision queue.
              </p>
            </div>
          ) : subjTopics.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold space-y-2">
              <span className="text-3xl block">🔍</span>
              <p className="text-xs sm:text-sm">No topics match your search "{modalTopicSearch}".</p>
              <button
                type="button"
                onClick={() => setModalTopicSearch('')}
                className="text-xs text-amber-500 hover:underline font-black cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm scrollbar-thin">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[980px]">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-950/80 uppercase text-[11px] font-black tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-black">Topic / Chapter</th>
                    <th className="p-4 font-black">First Read Date</th>
                    <th className="p-4 font-black">R1 Target (+7d)</th>
                    <th className="p-4 font-black">R2 Target (+21d)</th>
                    <th className="p-4 font-black">R3 Target (+45d)</th>
                    <th className="p-4 font-black">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-bold">
                  {subjTopics.map((t: any) => {
                    const topicKey = t.id || t._id || t.customId;
                    const revisions = t.revisions || [];
                    const r1 = revisions.find((r: any) => r.stage === 'R1');
                    const r2 = revisions.find((r: any) => r.stage === 'R2');
                    const r3 = revisions.find((r: any) => r.stage === 'R3');

                    const isBatchRevTopic = false; // Will be set after matchingBatch is computed

                    const isAugmented = t.isAugmentedRevision !== false && !isBatchRevTopic;
                    const isMastered = isAugmented ? !!(r3?.status === 'Completed' || r3?.completedDate) : true;
                    const stageLabel = !isAugmented
                      ? 'Topic Logged'
                      : isMastered
                      ? 'Mastered'
                      : !r1?.completedDate
                      ? 'R1 Pending (+7d)'
                      : !r2?.completedDate
                      ? 'R2 Pending (+21d)'
                      : 'R3 Pending (+45d)';

                    const matchingBatch = (batchedRevisions || []).find((b: any) => {
                      const revIdsArr = Array.isArray(b.topicRevisionIds) ? b.topicRevisionIds : [];
                      if (revIdsArr.includes(t.id) || revIdsArr.includes(t.customId)) return true;
                      const statuses = Array.isArray(b.topicStatuses) ? b.topicStatuses : [];
                      if (statuses.some((ts: any) => ts.topicRevisionId === t.id || ts.topicRevisionId === t.customId || (ts.topic && t.topic && ts.topic.trim().toLowerCase() === t.topic.trim().toLowerCase()))) return true;
                      if (b.title && t.topic && b.title.trim().toLowerCase() === t.topic.trim().toLowerCase()) return true;
                      return false;
                    });

                    const clusterSubjTopics = matchingBatch
                      ? (Array.isArray(matchingBatch.topicStatuses) ? matchingBatch.topicStatuses : [])
                          .filter((ts: any) => {
                            if (typeof ts === 'string') return true;
                            if (!ts.subject) return true;
                            const sLower = String(ts.subject).trim().toLowerCase();
                            return sLower === subjNorm || (subjIdNorm && sLower === subjIdNorm);
                          })
                          .map((ts: any) => (typeof ts === 'string' ? ts : ts.topic || ts.name || ts.topicId))
                          .filter(Boolean)
                      : [];

                    const baseDate = t.firstReadDate || t.lastRevisedDate || '';
                    const r1TargetDate = r1?.scheduledDate || (baseDate ? addDaysToStr(baseDate, 7) : '—');
                    const r2TargetDate = r2?.scheduledDate || (baseDate ? addDaysToStr(baseDate, 21) : '—');
                    const r3TargetDate = r3?.scheduledDate || (baseDate ? addDaysToStr(baseDate, 45) : '—');

                    return (
                      <tr 
                        key={topicKey} 
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >

                        <td className="p-4 font-black text-slate-900 dark:text-slate-100 min-w-[220px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold hover:text-indigo-500 transition-colors text-sm">
                                {t.topic}
                              </span>
                              {/* {(isBatchRevTopic || matchingBatch) && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                                  ⚡ Batch Revision
                                </span>
                              )} */}
                            </div>

                            {/* Extra Revisions Array Logs */}
                            {Array.isArray(revisions) && revisions.filter((r: any) => r.stage?.includes('Extra')).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {revisions
                                  .filter((r: any) => r.stage?.includes('Extra'))
                                  .map((exR: any, exIdx: number) => (
                                    <span
                                      key={exIdx}
                                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20"
                                      title={exR.note || 'Extra Revision'}
                                    >
                                      📌 {exR.completedDate || exR.scheduledDate}: {exR.stage}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">
                          {t.firstReadDate || baseDate || '—'}
                        </td>

                        {/* Middle columns: R1/R2/R3 + Status for Augmented vs Merged Subtopics (colSpan 4) for Batched */}
                        {isAugmented ? (
                          <>
                            {/* R1 Target */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 font-extrabold">Target: {r1TargetDate}</span>
                                {r1?.status === 'Skipped' ? (
                                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-md font-black w-fit border border-slate-300 dark:border-slate-700">
                                    Skipped
                                  </span>
                                ) : r1?.status === 'Completed' || r1?.completedDate ? (
                                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-black w-fit flex items-center gap-1">
                                    <CheckCircle2 size={11} /> {r1?.completedDate}
                                  </span>
                                ) : t.isOverdue && (!r1 || !r1.completedDate) ? (
                                  <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-md font-black w-fit animate-pulse flex items-center gap-1">
                                    <AlertTriangle size={11} /> Overdue (+{t.overdueDays}d)
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md font-black w-fit flex items-center gap-1">
                                    <Clock size={11} /> Pending
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* R2 Target */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 font-extrabold">Target: {r2TargetDate}</span>
                                {r2?.status === 'Skipped' ? (
                                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-md font-black w-fit border border-slate-300 dark:border-slate-700">
                                    Skipped
                                  </span>
                                ) : r2?.status === 'Completed' || r2?.completedDate ? (
                                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-black w-fit flex items-center gap-1">
                                    <CheckCircle2 size={11} /> {r2?.completedDate}
                                  </span>
                                ) : t.isOverdue && r1?.completedDate && (!r2 || !r2.completedDate) ? (
                                  <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-md font-black w-fit animate-pulse flex items-center gap-1">
                                    <AlertTriangle size={11} /> Overdue (+{t.overdueDays}d)
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md font-black w-fit flex items-center gap-1">
                                    <Clock size={11} /> Pending
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* R3 Target */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 font-extrabold">Target: {r3TargetDate}</span>
                                {r3?.status === 'Skipped' ? (
                                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-md font-black w-fit border border-slate-300 dark:border-slate-700">
                                    Skipped
                                  </span>
                                ) : r3?.status === 'Completed' || r3?.completedDate ? (
                                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-black w-fit flex items-center gap-1">
                                    <CheckCircle2 size={11} /> {r3?.completedDate}
                                  </span>
                                ) : t.isOverdue && r2?.completedDate && (!r3 || !r3.completedDate) ? (
                                  <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-md font-black w-fit animate-pulse flex items-center gap-1">
                                    <AlertTriangle size={11} /> Overdue (+{t.overdueDays}d)
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md font-black w-fit flex items-center gap-1">
                                    <Clock size={11} /> Pending
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Stage Status */}
                            <td className="p-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap inline-flex items-center gap-1 border shadow-xs ${
                                  isMastered
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                    : t.isOverdue
                                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                }`}
                              >
                                {stageLabel}
                              </span>
                            </td>
                          </>
                        ) : (
                          /* Non-Augmented / Batched Revision Sub-topics merged area across all 4 remaining columns */
                          <td colSpan={4} className="p-4">
                            {clusterSubjTopics.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-extrabold uppercase text-purple-500 dark:text-purple-400 tracking-wider mr-1">
                                  Associated Topics ({clusterSubjTopics.length}):
                                </span>
                                {clusterSubjTopics.map((topName: string, topIdx: number) => (
                                  <span
                                    key={topIdx}
                                    className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-200 border border-purple-500/30 shadow-xs cursor-pointer hover:scale-105 hover:bg-purple-500/25 transition-all"
                                  >
                                    {topName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-semibold">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
