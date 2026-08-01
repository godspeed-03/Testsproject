import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMilestonesForCategory(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('csat')) {
    return [
      { key: 'firstRead', label: 'Reading', short: 'Rdg' },
      { key: 'rev1', label: 'DPP', short: 'DPP' },
      { key: 'prePyq', label: 'PYQ', short: 'PYQ' },
      { key: 'preNotes', label: 'Short Notes', short: 'SN' },
    ];
  }
  if (cat.includes('math')) {
    return [
      { key: 'firstRead', label: 'Lectures', short: 'Lec' },
      { key: 'rev1', label: 'Examples PYQ', short: 'Ex PYQ' },
      { key: 'prePyq', label: 'PYQ Sheet', short: 'PYQ Sh' },
      { key: 'mainsNotes', label: 'Notes Mains', short: 'MN' },
      { key: 'rev2', label: 'Rev 1', short: 'Rv1' },
      { key: 'preFinalRev', label: 'Rev 2', short: 'Rv2' },
      { key: 'ansWriting', label: 'Practice 1', short: 'P1' },
      { key: 'mainsFinalRev', label: 'Practice 2', short: 'P2' },
    ];
  }
  return [
    { key: 'firstRead', label: 'Reading 1', short: 'R1' },
    { key: 'rev1', label: 'Rev 1', short: 'Rv1' },
    { key: 'rev2', label: 'Rev 2', short: 'Rv2' },
    { key: 'preNotes', label: 'Pre Notes', short: 'PN' },
    { key: 'mainsNotes', label: 'Mains Notes', short: 'MN' },
    { key: 'questionBank', label: 'Q-Bank', short: 'QB' },
    { key: 'prePyq', label: 'Pre PYQ', short: 'PP' },
    { key: 'mainsPyq', label: 'Mains PYQ', short: 'MP' },
    { key: 'ansWriting', label: 'Ans Writing', short: 'AW' },
    { key: 'preFinalRev', label: 'Pre Final Rev', short: 'PF' },
    { key: 'mainsFinalRev', label: 'Mains Final Rev', short: 'MF' }
  ];
}
