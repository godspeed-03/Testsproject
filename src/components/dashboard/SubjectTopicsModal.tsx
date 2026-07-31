'use client';

import { useState } from 'react';
import { X, Search, BookOpen, Trash2, Loader2 } from 'lucide-react';

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
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
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
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fade-in`}>
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
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

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
                type="button"
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
                  Batch Cluster Revision ({selectedTopicNames.length} topics selected: {selectedTopicNames.slice(0, 3).join(', ')}{selectedTopicNames.length > 3 ? '...' : ''})
                </span>
                <button
                  type="button"
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
                  type="button"
                  onClick={handleClusterSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md shrink-0 transition-all"
                >
                  Log Revision Today & Save Cluster ({selectedTopicNames.length})
                </button>
              </div>
            </div>
          )}

          {allSubjTopics.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-bold space-y-2 max-w-md mx-auto">
              <BookOpen size={36} className="text-amber-500" />
              <h4 className={`font-extrabold ${textTitle} text-base sm:text-lg`}>
                No Revision Topics Logged for {selectedSubjectTopics.subject} Yet!
              </h4>
              <p className={`text-xs sm:text-sm ${textMuted}`}>
                Log a daily study session or add topics to build your revision queue!
              </p>
            </div>
          ) : subjTopics.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-bold space-y-1">
              <span className="text-2xl block">🔍</span>
              <p className="text-xs sm:text-sm">No topics matching "{modalTopicSearch}".</p>
              <button
                type="button"
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
                    const topicKey = t.id || t._id || t.customId;
                    const isSelected = selectedTopicNames.includes(t.topic);
                    const isMastered = !!(t.r3Status === 'Completed' || t.r3CompletedDate);
                    const stageLabel = isMastered
                      ? 'Mastered'
                      : !t.r1CompletedDate
                      ? 'R1 Pending (+7d)'
                      : !t.r2CompletedDate
                      ? 'R2 Pending (+21d)'
                      : 'R3 Pending (+45d)';

                    return (
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
                                Skipped
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
                                Skipped
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
                                Skipped
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
                              className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded transition-all shrink-0 disabled:opacity-50"
                              title="Delete topic"
                            >
                              {deletingTopicId === (t.id || t._id || t.customId) ? (
                                <Loader2 size={15} className="animate-spin text-rose-500" />
                              ) : (
                                <Trash2 size={15} />
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

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
