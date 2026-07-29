'use client';

import { useState, useEffect } from 'react';
import { Hourglass, Target, Moon, Sun, Download, Upload } from 'lucide-react';

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
    <div className={`rounded-2xl p-3.5 sm:p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3.5 text-xs sm:text-sm border transition-colors shadow-sm ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800' 
        : 'bg-slate-900 border-slate-800 text-slate-100'
    }`}>
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
          isLight 
            ? 'bg-blue-50 text-blue-900 border-blue-200/80 shadow-2xs' 
            : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
        }`}>
          <Hourglass size={14} className="text-blue-500" /> Prelims 2027: <strong className={isLight ? 'text-blue-700' : 'text-blue-400'}>{cdPrelims}</strong>
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
          isLight 
            ? 'bg-purple-50 text-purple-900 border-purple-200/80 shadow-2xs' 
            : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        }`}>
          <Target size={14} className="text-purple-500" /> Mains 2027: <strong className={isLight ? 'text-purple-700' : 'text-purple-400'}>{cdMains}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
        <button
          type="button"
          onClick={onExportData}
          className={`font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition-all border shadow-xs ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Backup system database to JSON"
        >
          <Download size={14} /> Export Backup
        </button>

        <label className={`font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition-all border shadow-xs cursor-pointer ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}>
          <Upload size={14} /> Import
          <input type="file" accept=".json" onChange={onImportData} className="hidden" />
        </label>

        <button
          type="button"
          onClick={toggleTheme}
          className={`font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition-all shadow-sm ${
            isLight
              ? 'bg-slate-900 hover:bg-slate-800 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </div>
  );
}
