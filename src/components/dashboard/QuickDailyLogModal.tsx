'use client';

import { useState } from 'react';
import { Zap, CalendarDays, RotateCcw, Tag, Plus, X, Loader2 } from 'lucide-react';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';
import ShadcnSelect, { SelectOption } from '@/components/ui/ShadcnSelect';

interface QuickDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editLogId: string | null;
  logDate: string;
  setLogDate: (date: string) => void;
  syllabusList: any[];
  dueRevisions: any[];
  onSaveDailyLog: (logData: any) => Promise<void>;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function QuickDailyLogModal({
  isOpen,
  onClose,
  editLogId,
  logDate,
  setLogDate,
  syllabusList,
  dueRevisions,
  onSaveDailyLog,
  isLight,
  cardBg,
  cardInnerBg,
  inputBg,
  textTitle,
  textMuted,
}: QuickDailyLogModalProps) {
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
  const [logSubjectTags, setLogSubjectTags] = useState<any[]>([]);
  const [checkedRevisions, setCheckedRevisions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const initialSubj = syllabusList.length > 0 ? syllabusList[0].subject : 'General Studies';
  const initialCat = syllabusList.length > 0 ? syllabusList[0].category || 'GS1' : 'GS1';
  const [tagCategory, setTagCategory] = useState(initialCat);
  const [tagSubject, setTagSubject] = useState(initialSubj);
  const [tagTopic, setTagTopic] = useState('');

  if (!isOpen) return null;

  const handleAddSubjectTag = () => {
    if (!tagSubject || !tagTopic) return;
    setLogSubjectTags([
      ...logSubjectTags,
      {
        category: tagCategory,
        subject: tagSubject,
        topic: tagTopic,
        isRevision: false,
      },
    ]);
    setTagTopic('');
  };

  const handleRemoveSubjectTag = (idx: number) => {
    setLogSubjectTags(logSubjectTags.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
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
          completedRevisions: [],
        };
      } else {
        const gs = parseFloat(logGsHours) || 0;
        const maths = parseFloat(logMathsHours) || 0;
        const ca = parseFloat(logCaHours) || 0;
        const ans = parseFloat(logAnsHours) || 0;
        const newH = parseFloat(logNewHours) || 0;
        const revH = parseFloat(logRevHours) || 0;

        const mergedTags = [...logSubjectTags];
        checkedRevisions.forEach((sId) => {
          const matchedSubj = syllabusList.find((s) => s.id === sId);
          if (matchedSubj) {
            const exists = mergedTags.some((t) => t.subject === matchedSubj.subject && t.isRevision);
            if (!exists) {
              mergedTags.push({
                subject: matchedSubj.subject,
                category: matchedSubj.category || 'GS1',
                topic: matchedSubj.source ? `Spaced Rev: ${matchedSubj.source}` : 'Spaced Revision Milestone',
                isRevision: true,
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
          completedRevisions: checkedRevisions,
        };
      }

      await onSaveDailyLog(entry);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'} backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in`}>
      <div className={`${cardBg} rounded-2xl w-full max-w-2xl sm:max-w-3xl shadow-2xl border border-slate-300 dark:border-slate-800 flex flex-col max-h-[90vh]`}>
        {/* Pinned Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} shrink-0`}>
          <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
            <Zap size={18} className="text-amber-500" /> {editLogId ? 'Edit Daily Study Log' : 'Quick Daily Study Log (< 3 Mins)'}
          </h3>
          <button type="button" onClick={onClose} disabled={loading} className={`${textMuted} hover:text-amber-600 p-1.5 rounded-lg transition-colors`}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs sm:text-sm font-bold flex-1">
          {/* Top Control Bar: Date Selector + Rest Day Toggle in ONE clean line */}
          <div className={`${cardInnerBg} p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4`}>
            <div className="flex items-center gap-2.5">
              <label className={`font-extrabold flex items-center gap-1.5 ${textTitle} text-xs sm:text-sm shrink-0`}>
                <CalendarDays size={16} className="text-amber-500" /> Select Date:
              </label>
              <ShadcnDatePicker
                selectedDate={logDate}
                onSelectDate={setLogDate}
                disablePastDates={true}
              />
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-500/30 shrink-0">
              <input
                type="checkbox"
                id="chkOff"
                checked={logOffDay}
                onChange={(e) => setLogOffDay(e.target.checked)}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
              <label htmlFor="chkOff" className="text-amber-900 dark:text-amber-200 font-extrabold text-xs cursor-pointer select-none">
                Honesty Rule Off / Rest Day
              </label>
            </div>
          </div>

          {!logOffDay && (
            <>
              {/* Due Spaced Revisions Checklist */}
              {dueRevisions.length > 0 && (
                <div className={`${cardInnerBg} p-3.5 rounded-xl space-y-2 border border-slate-300 dark:border-slate-800`}>
                  <div className="font-extrabold text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <RotateCcw size={16} /> Due Spaced Revisions (Overdue / Pending First)
                  </div>
                  <p className={`text-xs ${textMuted}`}>
                    Check subjects revised today. Checking will automatically advance their SRS interval!
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {dueRevisions.map((s) => {
                      const isChecked = checkedRevisions.includes(s.id);
                      const isOverdue = s.nextRev < logDate;
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
                            {isOverdue ? 'OVERDUE' : 'Due'}: {s.nextRev}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Subject & Topic Tags Input */}
              <div className={`${cardInnerBg} p-3.5 rounded-xl space-y-3 border border-slate-300 dark:border-slate-800`}>
                <div className="font-extrabold text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <Tag size={16} /> Add Multiple Subjects & Topic Tags Studied Today
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div>
                    <label className={`block ${textMuted} mb-1 font-extrabold`}>Category</label>
                    <ShadcnSelect
                      value={tagCategory}
                      isLight={isLight}
                      options={[
                        { value: 'GS1', label: 'GS1 (His, Geo, Soc)' },
                        { value: 'GS2', label: 'GS2 (Pol, Gov, IR)' },
                        { value: 'GS3', label: 'GS3 (Eco, Env, Sci)' },
                        { value: 'GS4', label: 'GS4 (Ethics, Integrity)' },
                        { value: 'MATHS', label: 'Maths Optional' },
                        { value: 'CA', label: 'Current Affairs' },
                        { value: 'ESSAY', label: 'Essay' },
                        { value: 'CSAT', label: 'CSAT' },
                      ]}
                      onChange={(newCat) => {
                        setTagCategory(newCat);
                        const filtered = syllabusList.filter((s) => s.category === newCat);
                        if (filtered.length > 0) {
                          setTagSubject(filtered[0].subject);
                        } else {
                          setTagSubject('');
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className={`block ${textMuted} mb-1 font-extrabold`}>Subject Name ({tagCategory})</label>
                    {syllabusList.filter((s) => s.category === tagCategory).length > 0 ? (
                      <ShadcnSelect
                        value={tagSubject}
                        isLight={isLight}
                        options={syllabusList
                          .filter((s) => s.category === tagCategory)
                          .map((s) => ({ value: s.subject, label: s.subject }))}
                        onChange={(newSub) => setTagSubject(newSub)}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Subject (e.g. Geo, Polity)"
                        value={tagSubject}
                        onChange={(e) => setTagSubject(e.target.value)}
                        className={`w-full ${inputBg} rounded-xl p-2.5 outline-none font-bold`}
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
                      className={`w-full ${inputBg} rounded-xl p-2.5 outline-none font-bold`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleAddSubjectTag}
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow text-xs transition-all"
                  >
                    <Plus size={15} /> Add Topic Tag
                  </button>
                </div>

                {/* Added Tags Display */}
                {logSubjectTags.length > 0 && (
                  <div className={`flex flex-wrap gap-2 pt-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
                    {logSubjectTags.map((t, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-extrabold border shadow-2xs ${
                          t.isRevision
                            ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        <span>
                          [{t.category}] {t.subject}: {t.topic} ({t.isRevision ? 'Rev' : 'New'})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubjectTag(idx)}
                          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Study Hours Breakdown */}
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
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
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

        {/* Pinned Footer */}
        <div className={`flex justify-end gap-3 px-5 sm:px-6 py-4 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs sm:text-sm font-extrabold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Log...</span>
              </>
            ) : (
              <span>Save Daily Log</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
