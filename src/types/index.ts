export interface ISyllabusRuleState {
  key: string;
  label: string;
  short: string;
  completed: boolean;
}

export interface IHabitHistory {
  date: string;
  status: 'done' | 'pending' | 'failed' | 'skipped';
  value?: number;
  note?: string;
}

export interface IHabitItem {
  id?: string;
  _id?: string;
  userId: string;
  type: 'habit' | 'task' | 'event';
  title: string;
  category: {
    id: string;
    label: string;
    icon?: string;
    color?: string;
  };
  description?: string;
  frequency: {
    mode: 'daily' | 'weekly' | 'monthly' | 'once' | 'specific_days';
    days?: string[];
    monthlyDay?: number;
  };
  target: {
    value: number;
    unit: string;
  };
  startDate: string;
  endDate?: string | null;
  isStudyTask?: boolean;
  isAugmentedRevision?: boolean;
  subject?: string;
  topic?: string;
  color?: string;
  icon?: string;
  streakCurrent: number;
  streakBest: number;
  history: IHabitHistory[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ISyllabusItem {
  id?: string;
  _id?: string;
  userId: string;
  customId?: string;
  subject: string;
  category: string;
  status: string;
  date?: string;
  nextRev?: string;
  rules?: ISyllabusRuleState[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IRevisionEntry {
  stage: string;
  scheduledDate?: string;
  completedDate?: string;
  status?: string;
  note?: string;
}

export interface ITopicRevision {
  id?: string;
  _id?: string;
  userId: string;
  customId?: string;
  subject: string;
  category: string;
  topic: string;
  firstReadDate: string;
  lastRevisedDate?: string;
  status?: string;
  isAugmentedRevision?: boolean;
  nextScheduledDate?: string;
  isOverdue?: boolean;
  overdueDays?: number;
  revisions?: IRevisionEntry[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ITestLog {
  id?: string;
  _id?: string;
  userId: string;
  customId?: string;
  testName?: string;
  code?: string;
  type?: string;
  category?: string;
  subject?: string;
  accuracy?: string;
  score?: any;
  maxScore?: any;
  percent?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  negMarks?: number;
  durationMins?: number;
  benchmarkCutoff?: number;
  concept?: any;
  silly?: any;
  timeP?: any;
  weakAreas?: string[];
  takeaway?: string;
  date?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICheckList {
  id?: string;
  _id?: string;
  userId: string;
  customId?: string;
  text: string;
  category?: string;
  completed: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
