'use client';

import React from 'react';
import { ListTodo, Plus, Trash2, PlusCircle, CheckSquare, Square, Loader2 } from 'lucide-react';
import { useTracker } from '../TrackerContext';

export default function ChecklistPage() {
  const {
    lists,
    saving,
    deletingId,
    newListInput,
    setNewListInput,
    handleToggleListItem,
    handleAddListItem,
    handleDeleteList,
    handleOpenCreateModal
  } = useTracker();

  const cardBg = 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80';
  const textTitle = 'text-slate-900 dark:text-slate-100';
  const textMuted = 'text-slate-500 dark:text-slate-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg sm:text-xl font-black font-display ${textTitle}`}>Checklists & Task Notebooks</h2>
          <p className={`text-xs ${textMuted}`}>Create customizable lists, study topics, and exam packing checklists.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenCreateModal('list')}
          className="bg-accent-gradient text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-accent/20 transition-all shrink-0 active:scale-95"
        >
          <Plus size={16} /> New Checklist
        </button>
      </div>

      {lists.length === 0 ? (
        <div className={`p-10 rounded-2xl border ${cardBg} text-center space-y-3`}>
          <ListTodo size={32} className="text-accent-primary mx-auto" />
          <h4 className={`font-black text-base ${textTitle}`}>No Checklists Created Yet</h4>
          <p className={`text-xs ${textMuted}`}>Keep track of revision topics, books to read, or exam day checklists.</p>
          <button
            type="button"
            onClick={() => handleOpenCreateModal('list')}
            className="px-4 py-2 rounded-xl bg-accent-gradient text-white font-bold text-xs inline-block"
          >
            Create First Checklist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lists.map((list: any) => {
            const items = list.items || [];
            const completedCount = items.filter((i: any) => i.completed).length;
            const isListFullyDone = items.length > 0 && completedCount === items.length;
            const listCardBg = isListFullyDone
              ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-950/30 dark:border-emerald-500/40'
              : cardBg;

            return (
              <div key={list._id} className={`p-5 rounded-2xl border ${listCardBg} space-y-4 shadow-xs transition-all`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-black text-base ${isListFullyDone ? 'line-through text-emerald-700 dark:text-emerald-400' : textTitle}`}>{list.title}</h3>
                    <p className={`text-xs ${textMuted} font-bold mt-0.5`}>
                      {completedCount} of {items.length} items completed
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={saving || deletingId === list._id}
                    onClick={() => handleDeleteList(list._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    title="Delete Checklist"
                  >
                    {deletingId === list._id ? <Loader2 size={16} className="animate-spin text-rose-500" /> : <Trash2 size={16} />}
                  </button>
                </div>

                {/* Checklist Items */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {items.map((item: any) => (
                    <div
                      key={item._id}
                      onClick={() => handleToggleListItem(list._id, item._id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        item.completed
                          ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-accent-primary/50'
                      }`}
                    >
                      {item.completed ? (
                        <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Square size={16} className="text-slate-400 shrink-0" />
                      )}
                      <span className={`text-xs font-bold ${item.completed ? 'line-through text-emerald-700 dark:text-emerald-400' : textTitle}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Item Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Add new item..."
                    value={newListInput[list._id] || ''}
                    onChange={(e) => setNewListInput({ ...newListInput, [list._id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddListItem(list._id);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none focus:border-accent-primary"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleAddListItem(list._id)}
                    className="p-2 rounded-xl bg-accent-gradient text-white font-bold text-xs disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin text-white" /> : <PlusCircle size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
