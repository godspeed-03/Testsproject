import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHabitHistory {
  date: string;
  status: 'done' | 'pending' | 'failed' | 'skipped';
  value?: number;
  note?: string;
}

export interface IHabitItem extends Document {
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
  priority: 'low' | 'medium' | 'high';
  frequency: {
    mode: 'daily' | 'weekly' | 'monthly' | 'once' | 'specific_days';
    days?: string[];
    monthlyDay?: number;
  };
  target: {
    value: number;
    unit: string;
  };
  reminders?: Array<{
    time: string;
    enabled: boolean;
  }>;
  startDate: string;
  endDate?: string | null;
  isStudyTask?: boolean;
  subject?: string;
  topic?: string;
  color?: string;
  icon?: string;
  streakCurrent: number;
  streakBest: number;
  history: IHabitHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const HabitItemSchema = new Schema<IHabitItem>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['habit', 'task', 'event'], default: 'habit' },
    title: { type: String, required: true },
    category: {
      id: { type: String, default: 'general' },
      label: { type: String, default: 'General' },
      icon: { type: String, default: '📌' },
      color: { type: String, default: '#6366F1' }
    },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    frequency: {
      mode: { type: String, enum: ['daily', 'weekly', 'monthly', 'once', 'specific_days'], default: 'daily' },
      days: { type: [String], default: [] },
      monthlyDay: { type: Number, default: 1 }
    },
    target: {
      value: { type: Number, default: 1 },
      unit: { type: String, default: 'times' }
    },
    reminders: [
      {
        time: { type: String, default: '08:00' },
        enabled: { type: Boolean, default: true }
      }
    ],
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    isStudyTask: { type: Boolean, default: false },
    subject: { type: String, default: '' },
    topic: { type: String, default: '' },
    color: { type: String, default: '#6366F1' },
    icon: { type: String, default: '🏃' },
    streakCurrent: { type: Number, default: 0 },
    streakBest: { type: Number, default: 0 },
    history: [
      {
        date: { type: String, required: true },
        status: { type: String, enum: ['done', 'pending', 'failed', 'skipped'], default: 'pending' },
        value: { type: Number, default: 0 },
        note: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

const HabitItem: Model<IHabitItem> =
  mongoose.models.HabitItem || mongoose.model<IHabitItem>('HabitItem', HabitItemSchema);

export default HabitItem;
