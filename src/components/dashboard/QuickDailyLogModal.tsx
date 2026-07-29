'use client';

import { useState } from 'react';
import { Zap, CalendarDays, RotateCcw, Tag, Plus, X, Loader2 } from 'lucide-react';
import ShadcnDatePicker from '@/components/ui/ShadcnDatePicker';

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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`${cardBg} rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-300 dark:border-slate-800`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
            <Zap size={16} className="text-amber-500" /> {editLogId ? 'Edit Daily Study Log' : 'Quick Daily Study Log (< 3 Mins)'}
          </h3>
          <button type="button" onClick={onClose} disabled={loading} className={`${textMuted} hover:text-amber-600`}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-bold">
          <div>
            <label className={`block ${textMuted} mb-1.5 font-extrabold flex items-center gap-1.5`}>
              <CalendarDays size={16} className="text-amber-600" /> Select Date
            </label>
            <div className="pt-1">
              <ShadcnDatePicker
                selectedDate={logDate}
                onSelectDate={setLogDate}
                disablePastDates={true}
              />
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
                  <div className={`flex flex-wrap gap-2 pt-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
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

        <div className={`flex justify-end gap-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold rounded-lg shadow flex items-center gap-2"
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
