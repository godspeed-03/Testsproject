'use client';

import { useState } from 'react';
import { X, Search, BookOpen, Trash2, Loader2, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface SubjectTopicsModalProps {
  selectedSubjectTopics: any | null;
  onClose: () => void;
  topicRevisions: any[];
  onBatchLogCluster: (subject: string, category: string, clusterTitle: string, topicNames: string[]) => Promise<void>;
  onDeleteTopic: (topicId: string, subject: string, topic: string) => Promise<void>;
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
  onBatchLogCluster,
  onDeleteTopic,
  getCategoryBadge,
  isLight,
  cardBg,
  inputBg,
  textTitle,
  textMuted,
  tableHeaderBg,
}: SubjectTopicsModalProps) {
  const [modalTopicSearch, setModalTopicSearch] = useState('');
  const [selectedTopicNames, setSelectedTopicNames] = useState<string[]>([]);
  const [clusterTitleInput, setClusterTitleInput] = useState('');
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  if (!selectedSubjectTopics) return null;

  const toggleSelectTopicName = (topicName: string) => {
    if (selectedTopicNames.includes(topicName)) {
      setSelectedTopicNames(selectedTopicNames.filter((t) => t !== topicName));
    } else {
      setSelectedTopicNames([...selectedTopicNames, topicName]);
    }
  };

  const handleClusterSubmit = async () => {
    if (selectedTopicNames.length === 0) return;
    await onBatchLogCluster(
      selectedSubjectTopics.subject,
      selectedSubjectTopics.category || 'GS1',
      clusterTitleInput,
      selectedTopicNames
    );
    setSelectedTopicNames([]);
    setClusterTitleInput('');
  };

  const allSubjTopics = topicRevisions.filter(
    (tr: any) => tr.subject?.toLowerCase() === selectedSubjectTopics.subject?.toLowerCase()
  );

  const subjTopics = allSubjTopics.filter((tr: any) =>
    !modalTopicSearch || tr.topic?.toLowerCase().includes(modalTopicSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900/95 rounded-3xl w-full max-w-6xl lg:max-w-7xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800/80 glass-panel">
        
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

          {/* Batch Cluster Revision Card */}
          {selectedTopicNames.length > 0 && (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-fade-in shadow-lg">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="font-black text-amber-700 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                  <span>Batch Cluster Revision ({selectedTopicNames.length} topics selected)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTopicNames([])}
                  className="text-xs text-slate-400 hover:text-amber-500 font-extrabold underline transition-colors"
                >
                  Deselect All
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  placeholder={`Optional Cluster Title (e.g., "Block 1 Revision")...`}
                  value={clusterTitleInput}
                  onChange={(e) => setClusterTitleInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleClusterSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shrink-0 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Log Revision Today ({selectedTopicNames.length})</span>
                </button>
              </div>
            </div>
          )}

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
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={subjTopics.length > 0 && selectedTopicNames.length === subjTopics.length}
                        onChange={() => {
                          if (selectedTopicNames.length === subjTopics.length) setSelectedTopicNames([]);
                          else setSelectedTopicNames(subjTopics.map((tr: any) => tr.topic));
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        title="Select / Deselect all topics"
                      />
                    </th>
                    <th className="p-4 font-black">Topic / Chapter</th>
                    <th className="p-4 font-black">First Read Date</th>
                    <th className="p-4 font-black">R1 Target (+7d)</th>
                    <th className="p-4 font-black">R2 Target (+21d)</th>
                    <th className="p-4 font-black">R3 Target (+45d)</th>
                    <th className="p-4 font-black">Current Status</th>
                    <th className="p-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-bold">
                  {subjTopics.map((t: any) => {
                    const topicKey = t.id || t._id || t.customId;
                    const isSelected = selectedTopicNames.includes(t.topic);
                    const isAugmented = t.isAugmentedRevision;
                    const revisions = t.revisions || [];
                    const r1 = revisions.find((r: any) => r.stage === 'R1');
                    const r2 = revisions.find((r: any) => r.stage === 'R2');
                    const r3 = revisions.find((r: any) => r.stage === 'R3');
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

                    return (
                      <tr 
                        key={topicKey} 
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isSelected ? 'bg-amber-500/10 dark:bg-amber-500/15' : ''}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTopicName(t.topic)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-4 font-black text-slate-900 dark:text-slate-100 min-w-[200px]">
                          <span className="hover:text-amber-500 transition-colors">{t.topic}</span>
                        </td>

                        <td className="p-4 text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">
                          {t.firstReadDate || '—'}
                        </td>

                        {/* R1 */}
                        <td className="p-4 whitespace-nowrap">
                          {isAugmented ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-slate-400 font-extrabold">Target: {r1?.scheduledDate || '—'}</span>
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
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* R2 */}
                        <td className="p-4 whitespace-nowrap">
                          {isAugmented ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-slate-400 font-extrabold">Target: {r2?.scheduledDate || '—'}</span>
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
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* R3 */}
                        <td className="p-4 whitespace-nowrap">
                          {isAugmented ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-slate-400 font-extrabold">Target: {r3?.scheduledDate || '—'}</span>
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
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* Stage Status */}
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap inline-flex items-center gap-1 border shadow-xs ${
                              !isAugmented || isMastered
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : t.isOverdue
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {stageLabel}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={deletingTopicId === (t.id || t._id || t.customId)}
                              onClick={async () => {
                                const tid = t.id || t._id || t.customId;
                                setDeletingTopicId(tid);
                                try {
                                  await onDeleteTopic(tid, t.subject, t.topic);
                                } finally {
                                  setDeletingTopicId(null);
                                }
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Delete topic"
                            >
                              {deletingTopicId === (t.id || t._id || t.customId) ? (
                                <Loader2 size={16} className="animate-spin text-rose-500" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
