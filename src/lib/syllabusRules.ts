import { ISyllabusRuleState } from '@/models/SyllabusItem';

export interface IRuleTemplate {
  key: string;
  label: string;
  short: string;
}

export const DEFAULT_RULESETS: { name: string; category: string; rules: IRuleTemplate[] }[] = [
  {
    name: 'GS Standard Rule Set',
    category: 'GS',
    rules: [
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
    ]
  },
  {
    name: 'Maths Optional Rule Set',
    category: 'Maths',
    rules: [
      { key: 'firstRead', label: 'Lectures', short: 'Lec' },
      { key: 'rev1', label: 'Examples PYQ', short: 'Ex PYQ' },
      { key: 'prePyq', label: 'PYQ Sheet', short: 'PYQ Sh' },
      { key: 'mainsNotes', label: 'Notes Mains', short: 'MN' },
      { key: 'rev2', label: 'Rev 1', short: 'Rv1' },
      { key: 'preFinalRev', label: 'Rev 2', short: 'Rv2' },
      { key: 'ansWriting', label: 'Practice 1', short: 'P1' },
      { key: 'mainsFinalRev', label: 'Practice 2', short: 'P2' }
    ]
  },
  {
    name: 'CSAT Rule Set',
    category: 'CSAT',
    rules: [
      { key: 'firstRead', label: 'Reading', short: 'Rdg' },
      { key: 'rev1', label: 'DPP', short: 'DPP' },
      { key: 'prePyq', label: 'PYQ', short: 'PYQ' },
      { key: 'preNotes', label: 'Short Notes', short: 'SN' }
    ]
  }
];

export function getDefaultRulesForCategory(category: string): IRuleTemplate[] {
  const cat = (category || '').toLowerCase();
  if (cat.includes('csat')) {
    return DEFAULT_RULESETS.find((r) => r.category === 'CSAT')!.rules;
  }
  if (cat.includes('math')) {
    return DEFAULT_RULESETS.find((r) => r.category === 'Maths')!.rules;
  }
  return DEFAULT_RULESETS.find((r) => r.category === 'GS')!.rules;
}

export function buildDynamicRulesFromLegacy(item: any): ISyllabusRuleState[] {
  if (item.rules && Array.isArray(item.rules) && item.rules.length > 0) {
    return item.rules.map((r: any) => ({
      key: r.key || r.label.toLowerCase().replace(/\s+/g, '_'),
      label: r.label,
      short: r.short || r.label,
      completed: !!r.completed
    }));
  }

  const defaultTemplates = getDefaultRulesForCategory(item.category || '');
  return defaultTemplates.map((t) => ({
    key: t.key,
    label: t.label,
    short: t.short,
    completed: !!item[t.key]
  }));
}
