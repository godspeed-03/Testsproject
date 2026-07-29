'use client';

import { useState, useEffect } from 'react';
import { Hourglass, Target, Flame, Moon, Sun, Download, Upload } from 'lucide-react';

interface CountdownHeaderProps {
  theme: string;
  toggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CountdownHeader({
  theme,
  toggleTheme,
  onExportData,
  onImportData,
}: CountdownHeaderProps) {
  const [cdPrelims, setCdPrelims] = useState('');
  const [cdMains, setCdMains] = useState('');

  useEffect(() => {
    const calc = () => {
      const pDate = new Date('2027-05-23T00:00:00');
      const mDate = new Date('2027-09-17T00:00:00');
      const now = new Date();

      const pDiff = Math.max(0, Math.floor((pDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const mDiff = Math.max(0, Math.floor((mDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      setCdPrelims(`${pDiff} Days Left`);
      setCdMains(`${mDiff} Days Left`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, []);

  const isLight = theme === 'light';

  return (
    <div className="bg-slate-900 border border-slate-800 dark:bg-slate-900 light:bg-white rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm shadow-md">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
        <span className="inline-flex items-center gap-1.5 bg-slate-800/90 text-slate-100 border border-slate-700/80 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
          <Hourglass size={14} className="text-blue-400" /> Prelims 2027: <strong className="text-blue-300">{cdPrelims}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-slate-800/90 text-slate-100 border border-slate-700/80 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
          <Target size={14} className="text-purple-400" /> Mains 2027: <strong className="text-purple-300">{cdMains}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
        <button
          type="button"
          onClick={onExportData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-all border border-slate-700 shadow-sm"
          title="Backup system database to JSON"
        >
          <Download size={14} /> Export Backup
        </button>

        <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-all border border-slate-700 shadow-sm cursor-pointer">
          <Upload size={14} /> Import
          <input type="file" accept=".json" onChange={onImportData} className="hidden" />
        </label>

        <button
          type="button"
          onClick={toggleTheme}
          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs transition-all shadow-sm"
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </div>
  );
}
