// Centralized Subject Palette & Icon Map for UPSC and Non-UPSC Tracker Items

export interface ISubjectTheme {
  id: string;
  name: string;
  category: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Maths' | 'CSAT' | 'General';
  color: string;
  icon: string;
}

// 35 Curated Subject Palette Options for UPSC Subjects
export const SUBJECT_COLOR_OPTIONS: string[] = [
  '#FF5722', '#795548', '#E91E63', '#D81B60', '#C2185B',
  '#AB47BC', '#8E24AA', '#7B1FA2', '#42A5F5', '#1E88E5',
  '#1565C0', '#00ACC1', '#00838F', '#26A69A', '#00897B',
  '#7E57C2', '#5E35B1', '#3F51B5', '#00E676', '#43A047',
  '#558B2F', '#FF3D00', '#F4511E', '#76FF03', '#9C27B0',
  '#673AB7', '#8E24AA', '#FFA726', '#FB8C00', '#F57C00',
  '#EF6C00', '#E65100', '#0288D1', '#0097A7', '#388E3C'
];

// 10 Non-Subject Custom Palette Options (Reserved exclusively for custom non-UPSC habits/tasks)
export const NON_SUBJECT_COLOR_OPTIONS: string[] = [
  '#FF70A6', // Vivid Pink
  '#FF9F1C', // Bright Amber
  '#FFBF69', // Soft Peach
  '#2EC4B6', // Turquoise
  '#9B5DE5', // Neon Purple
  '#F15BB5', // Soft Fuchsia
  '#00BBF9', // Electric Cyan
  '#00F5D4', // Mint Neon
  '#E63946', // Soft Crimson
  '#457B9D', // Slate Blue
];

// Non-Subject Icons for custom tasks/habits
export const NON_SUBJECT_ICON_OPTIONS: string[] = [
  '🏃', '🏋️', '🧘', '💧', '🥗', '📖', '✍️', '🎸', '💻', '🎯', '⚡', '🌟', '🎨', '🎧', '🧹'
];

// Expanded 150+ UPSC Subject, Syllabus & Custom Task Icons
export const ALL_UPSC_ICONS: string[] = [
  // Core Academic & UPSC Subjects
  '📚', '✍️', '📖', '📝', '💡', '🎓', '🧠', '🔬', '🧪', '📐',
  '🏛️', '🌍', '⚖️', '📜', '🎯', '🔥', '📊', '⚡', '💻', '📂',
  '📋', '📌', '🗳️', '🎖️', '🌐', '🛡️', '📈', '🖋️', '🧭', '🗺️',
  '🛰️', '⚙️', '🌲', '🌱', '💰', '🗞️', '🖊️', '🔍', '⭐', '🏆',

  // History, Heritage & Art Culture
  '🇮🇳', '🏰', '🗿', '⚔️', '👑', '🏺', '🕌', '⛩️', '🚩', '🎨',
  '🎭', '🎬', '🥁', '🪕', '🪔', '💃', '📜', '⚓', '🧭', '🗝️',

  // Polity, Governance & International Relations
  '🏛️', '🏢', '💼', '🗳️', '📑', '👔', '🕊️', '✈️', '🤝', '🔒',
  '👮', '🏥', '🏫', '⚖️', '📋', '📂', '📌', '💬', '👁️', '🛡️',

  // Geography, Environment & Disasters
  '🌋', '🏞️', '🏔️', '🌊', '🌪️', '🌤️', '⛰️', '🏝️', '🌴', '☘️',
  '🍃', '🐯', '🐘', '🦋', '🌧️', '🚜', '🌾', '🍏', '🚨', '🚑',

  // Economy, Science, Tech & Math
  '💳', '🏦', '💹', '💵', '📡', '🚀', '🧬', '🤖', '🔋', '🧮',
  '🔢', '🧩', '∫', '∑', '√', '⏱️', '⏳', '⏰', '📅', '📉',

  // Study Habits, Focus & Achievements
  '🥇', '🎖️', '🎗️', '🏅', '☕', '🍎', '🏃', '🏋️', '🧘', '💧',
  '🥗', '🎧', '💎', '🕯️', '🏷️', '📦', '🧱', '🔍', '✨', '🎯'
];

/**
 * Returns default theme for a subject string if matched, otherwise undefined
 * (Hardcoded auto-mapping disabled per user request so users can freely select any icon & color)
 */
export function getSubjectTheme(_subjectName: string): ISubjectTheme | undefined {
  return undefined;
}

/**
 * Ensures every subject in a list has a unique icon and color assigned.
 * Automatically assigns non-colliding icons and colors from the palette pool to any item missing them.
 */
export function ensureUniqueColorsAndIcons(syllabusItems: any[]): any[] {
  if (!Array.isArray(syllabusItems)) return [];

  const usedColors = new Set<string>();
  const usedIcons = new Set<string>();

  // Collect explicitly assigned colors & icons
  syllabusItems.forEach((item) => {
    if (item.color) usedColors.add(String(item.color).toLowerCase());
    if (item.icon) usedIcons.add(String(item.icon));
  });

  let colorIdx = 0;
  let iconIdx = 0;

  syllabusItems.forEach((item) => {
    if (!item.color) {
      while (
        colorIdx < SUBJECT_COLOR_OPTIONS.length &&
        usedColors.has(SUBJECT_COLOR_OPTIONS[colorIdx].toLowerCase())
      ) {
        colorIdx++;
      }
      const assignedColor =
        colorIdx < SUBJECT_COLOR_OPTIONS.length
          ? SUBJECT_COLOR_OPTIONS[colorIdx]
          : SUBJECT_COLOR_OPTIONS[colorIdx % SUBJECT_COLOR_OPTIONS.length];
      item.color = assignedColor;
      usedColors.add(assignedColor.toLowerCase());
    }

    if (!item.icon) {
      while (
        iconIdx < ALL_UPSC_ICONS.length &&
        usedIcons.has(ALL_UPSC_ICONS[iconIdx])
      ) {
        iconIdx++;
      }
      const assignedIcon =
        iconIdx < ALL_UPSC_ICONS.length
          ? ALL_UPSC_ICONS[iconIdx]
          : ALL_UPSC_ICONS[iconIdx % ALL_UPSC_ICONS.length];
      item.icon = assignedIcon;
      usedIcons.add(assignedIcon);
    }
  });

  return syllabusItems;
}