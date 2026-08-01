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

export const DEFAULT_MASTER_ROUTINE_CONFIG: MasterRoutineConfig = {
  title: "Master Routine & Schedule",
  subtitle: "4:00 AM wake-up schedule, 86.5h weekly output timetable & Satak Goals roadmap.",
  timeSlots: [
    { time: "4:00-4:30", label: "Shower & Fresh" },
    { time: "4:30-6:00", label: "GS + Hindu Lect" },
    { time: "6:00-6:15", label: "Travel Library" },
    { time: "6:15-6:30", label: "Quick Revision" },
    { time: "6:30-10:30", label: "GS @ Library" },
    { time: "10:30-11:00", label: "GS Read" },
    { time: "11:00-11:30", label: "MEETING" },
    { time: "11:30-1:00", label: "GS Backlog" },
    { time: "1:00-2:00", label: "LUNCH" },
    { time: "2:00-5:00", label: "Maths / CSAT" },
    { time: "5:00-6:00", label: "Weekly CA & Home" },
    { time: "6:00-8:00", label: "GYM (Leave 8:00)" },
    { time: "8:00-8:45", label: "Shower & Dress" },
    { time: "8:45-9:15", label: "DINNER" },
    { time: "9:15-10:00", label: "Walk & Rev" },
    { time: "10:00 PM", label: "SLEEP" }
  ],
  cells: [
    // Column 0: 4:00-4:30 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 0, rowSpan: 6, title: "Wake Up,\nShower & Fresh", colorTheme: "pink" },
    // Column 1: 4:30-6:00 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 1, rowSpan: 6, title: "GS Lecture &\nHindu CA Lecture", colorTheme: "indigo" },
    // Column 2: 6:00-6:15 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 2, rowSpan: 6, title: "Travel\nLibrary @ 6:15", colorTheme: "orange" },
    // Column 3: 6:15-6:30 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 3, rowSpan: 6, title: "Quick Revision", subtitle: "(6:15 - 6:30)", colorTheme: "pink" },
    // Column 4: 6:30-10:30 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 4, rowSpan: 6, title: "Current GS (Weekly)", colorTheme: "indigo" },
    
    // Column 5: 10:30-11:00
    { day: "MON", slotIndex: 5, rowSpan: 3, title: "GS Backlog", colorTheme: "pink" },
    { day: "THU", slotIndex: 5, rowSpan: 2, title: "Revise GS", colorTheme: "pink" },
    { day: "SAT", slotIndex: 5, colSpan: 3, title: "Revise GS (C + B) + CA & Meeting", colorTheme: "pink" },

    // Column 6: 11:00-11:30 (MON-FRI, rowSpan=5)
    { day: "MON", slotIndex: 6, rowSpan: 5, title: "MEETING", colorTheme: "rose" },

    // Column 7: 11:30-1:00
    { day: "MON", slotIndex: 7, rowSpan: 3, title: "GS Backlog", colorTheme: "pink" },
    { day: "THU", slotIndex: 7, rowSpan: 2, title: "Revise GS", colorTheme: "pink" },

    // Column 8: 1:00-2:00 (MON-SUN, rowSpan=7)
    { day: "MON", slotIndex: 8, rowSpan: 7, title: "LUNCH", colorTheme: "emerald" },

    // Column 9: 2:00-5:00
    { day: "MON", slotIndex: 9, rowSpan: 4, title: "Maths Optional", colorTheme: "amber" },
    { day: "FRI", slotIndex: 9, title: "CSAT Lecture", colorTheme: "amber" },
    { day: "SAT", slotIndex: 9, title: "Revise (Maths + CSAT)", colorTheme: "amber" },

    // Column 10: 5:00-6:00 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 10, rowSpan: 6, title: "Weekly CA Read", subtitle: "& Home @ 6:00 PM", colorTheme: "emerald" },
    // Column 11: 6:00-8:00 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 11, rowSpan: 6, title: "GYM", subtitle: "(Leave @ 8:00)", colorTheme: "sky" },
    // Column 12: 8:00-8:45 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 12, rowSpan: 6, title: "Post-Gym Shower\n& Clothing", colorTheme: "pink" },
    // Column 13: 8:45-9:15 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 13, rowSpan: 6, title: "DINNER", colorTheme: "purple" },
    // Column 14: 9:15-10:00 (MON-SAT, rowSpan=6)
    { day: "MON", slotIndex: 14, rowSpan: 6, title: "Walk & Revision / Relax", colorTheme: "slate" },
    // Column 15: 10:00 PM (MON-SUN, rowSpan=7)
    { day: "MON", slotIndex: 15, rowSpan: 7, title: "SLEEP", colorTheme: "slate" },

    // SUNDAY special row cells
    { day: "SUN", slotIndex: 0, colSpan: 2, title: "Early Morning Refresh & Light Rev", colorTheme: "slate" },
    { day: "SUN", slotIndex: 2, title: "Reach Library @ 6:30", colorTheme: "orange" },
    { day: "SUN", slotIndex: 3, colSpan: 2, title: "Test (CA + GS)", colorTheme: "slate" },
    { day: "SUN", slotIndex: 5, colSpan: 2, title: "Test Revision & Prep", colorTheme: "slate" },
    { day: "SUN", slotIndex: 7, title: "PW Test", subtitle: "(12:00 - 1:00 PM)", colorTheme: "emerald" },
    { day: "SUN", slotIndex: 9, title: "CSAT Practice", colorTheme: "amber" },
    { day: "SUN", slotIndex: 10, colSpan: 2, title: "Evaluate Tests & GYM (Leave @ 8:00)", colorTheme: "indigo" },
    { day: "SUN", slotIndex: 12, colSpan: 3, title: "Post-Gym Shower, Dinner & Movie / Rest", colorTheme: "slate" }
  ],
  metrics: {
    dailyHours: "Daily (Mon–Fri): 12.5 Hours",
    saturdayHours: "Saturday: 12.5 Hours",
    sundayHours: "Sunday Tests: 11.5 Hours",
    weeklyOutput: "Total Weekly Output: 86.5 Hours / Week"
  },
  satakGoals: [
    {
      phase: "TILL DECEMBER 2026",
      primaryGoal: "Polity, History, Economics, Geography for Mains. Complete 2 revisions, PYQs, and mains notes.",
      supportWork: "Optional full syllabus completion, 1 revision, and 1 test."
    },
    {
      phase: "JAN TO APRIL 2027",
      primaryGoal: "Prelims notes, MCQ practice, PYQs, GS1, CSAT papers, and CA compilation from May 2026 to April 2027.",
      supportWork: "Keep revising optional, mains question banks, mains boosters, and prelims boosters."
    },
    {
      phase: "EXTRA TRACKS",
      primaryGoal: "Thematic notes and thematic revision across long subject blocks.",
      supportWork: "Continuous CA revision, GS revision, optional maths revision, map practice, and map revision."
    },
    {
      phase: "ALWAYS ON",
      primaryGoal: "Notes for mains and prelims should keep getting updated while revision cycles continue.",
      supportWork: ""
    }
  ]
};
