export interface TimeSlotConfig {
  time: string;
  label: string;
}

export interface RoutineCell {
  day: string; // 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
  slotIndex: number;
  rowSpan?: number;
  colSpan?: number;
  title: string;
  subtitle?: string;
  colorTheme?: 'pink' | 'indigo' | 'orange' | 'rose' | 'emerald' | 'amber' | 'sky' | 'purple' | 'slate';
}

export interface SatakGoalConfig {
  phase: string;
  primaryGoal: string;
  supportWork?: string;
}

export interface MasterRoutineConfig {
  title: string;
  subtitle: string;
  timeSlots: TimeSlotConfig[];
  cells: RoutineCell[];
  metrics: {
    dailyHours: string;
    saturdayHours: string;
    sundayHours: string;
    weeklyOutput: string;
  };
  satakGoals: SatakGoalConfig[];
}


