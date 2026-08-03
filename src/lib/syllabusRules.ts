import { ISyllabusRuleState } from '@/types';

export interface IRuleTemplate {
  key: string;
  label: string;
  short: string;
}

export const DEFAULT_RULESETS: { name: string; category: string; rules: IRuleTemplate[] }[] = [];

export function getDefaultRulesForCategory(category: string, dbRuleSets: any[] = []): IRuleTemplate[] {
  const cat = (category || '').toLowerCase();
  if (!cat) return [];
  const found = dbRuleSets.find((r) => r.category && r.category.toLowerCase() === cat);
  if (found && Array.isArray(found.rules)) {
    return found.rules;
  }
  return [];
}

export function buildDynamicRulesFromLegacy(item: any, dbRuleSets: any[] = []): ISyllabusRuleState[] {
  if (item.rules && Array.isArray(item.rules) && item.rules.length > 0) {
    return item.rules.map((r: any) => ({
      key: r.key || (r.label ? r.label.toLowerCase().replace(/\s+/g, '_') : 'rule'),
      label: r.label || r.key || 'Rule',
      short: r.short || r.label || r.key || 'R',
      completed: !!r.completed,
    }));
  }

  const defaultTemplates = getDefaultRulesForCategory(item.category || '', dbRuleSets);
  return defaultTemplates.map((t) => ({
    key: t.key,
    label: t.label,
    short: t.short,
    completed: !!item[t.key],
  }));
}
