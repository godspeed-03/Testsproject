'use client';

import { useState } from 'react';
import { Target, X, Trash2, Plus } from 'lucide-react';

interface EditTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyTargetsList: any[];
  onSaveTargets: (targets: any[]) => void;
  isLight: boolean;
  cardBg: string;
  cardInnerBg: string;
  inputBg: string;
  textTitle: string;
  textMuted: string;
}

export default function EditTargetsModal({
  isOpen,
  onClose,
  weeklyTargetsList,
  onSaveTargets,
  isLight,
  cardBg,
  cardInnerBg,
  inputBg,
  textTitle,
  textMuted,
}: EditTargetsModalProps) {
  const [tempTargetsList, setTempTargetsList] = useState<any[]>(
    JSON.parse(JSON.stringify(weeklyTargetsList))
  );
  const [customTargetName, setCustomTargetName] = useState('');
  const [customTargetHours, setCustomTargetHours] = useState('');

  if (!isOpen) return null;

  const handleAddCustomTarget = () => {
    if (!customTargetName.trim() || !customTargetHours) return;
    const newTarget = {
      id: `custom_${Date.now()}`,
      name: customTargetName.trim(),
      target: parseFloat(customTargetHours) || 0,
      isDefault: false,
    };
    setTempTargetsList([...tempTargetsList, newTarget]);
    setCustomTargetName('');
    setCustomTargetHours('');
  };

  const handleRemoveCustomTarget = (idToRemove: string) => {
    setTempTargetsList(tempTargetsList.filter((t) => t.id !== idToRemove));
  };

  const handleSave = () => {
    onSaveTargets(tempTargetsList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`${cardBg} rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-300 dark:border-slate-800`}>
        <div className={`flex justify-between items-center border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-3`}>
          <div>
            <h3 className={`font-extrabold text-base sm:text-lg ${textTitle} flex items-center gap-2`}>
              <Target size={18} className="text-amber-500" /> Edit Weekly Target Hours
            </h3>
            <p className={`text-xs ${textMuted}`}>Auto-resets back to baseline default targets every Sunday Midnight.</p>
          </div>
          <button type="button" onClick={onClose} className={`${textMuted} hover:text-amber-600`}>
            <X size={20} />
          </button>
        </div>

        {/* Target List */}
        <div className="space-y-3 text-xs sm:text-sm font-bold">
          {tempTargetsList.map((tgt, index) => (
            <div key={tgt.id || index} className={`${cardInnerBg} p-3 rounded-xl border border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3`}>
              <div className="flex-1">
                <label className={`block ${textMuted} mb-1 font-extrabold flex items-center gap-1.5`}>
                  {tgt.name}
                  {!tgt.isDefault && (
                    <span className="text-[10px] bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-400 px-1.5 py-0.2 rounded font-extrabold">
                      Custom
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={tgt.target}
                  onChange={(e) => {
                    const updated = [...tempTargetsList];
                    updated[index].target = parseFloat(e.target.value) || 0;
                    setTempTargetsList(updated);
                  }}
                  className={`w-full ${inputBg} rounded-lg p-2 outline-none text-xs sm:text-sm`}
                />
              </div>
              {!tgt.isDefault && (
                <button
                  type="button"
                  onClick={() => handleRemoveCustomTarget(tgt.id)}
                  className="p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 mt-5"
                  title="Remove this custom target"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Weekly Target Form */}
        <div className="pt-3 border-t border-slate-300 dark:border-slate-800 space-y-2">
          <label className={`block text-xs font-extrabold ${textTitle}`}>+ Add Custom Target Topic For This Week</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Topic Name (e.g. CSAT, Essay, Ethics)"
              value={customTargetName}
              onChange={(e) => setCustomTargetName(e.target.value)}
              className={`flex-1 ${inputBg} rounded-lg p-2 text-xs outline-none`}
            />
            <input
              type="number"
              step="0.5"
              placeholder="Target (h)"
              value={customTargetHours}
              onChange={(e) => setCustomTargetHours(e.target.value)}
              className={`w-28 ${inputBg} rounded-lg p-2 text-xs outline-none`}
            />
            <button
              type="button"
              onClick={handleAddCustomTarget}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-3 py-2 rounded-lg flex items-center gap-1 shrink-0"
            >
              <Plus size={14} /> Add Target
            </button>
          </div>
        </div>

        <div className={`flex justify-end gap-2 border-t ${isLight ? 'border-slate-300' : 'border-slate-800'} pt-3`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-extrabold rounded-lg shadow"
          >
            Save Target Hours
          </button>
        </div>
      </div>
    </div>
  );
}
