import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMonthlyHabitItem {
  habitId: string;
  title: string;
  type?: string;
  category?: string;
  scheduledDays: number;
  completedDays: number;
  score: number;
  streakCurrent: number;
  streakBest: number;
}

export interface IMonthlySubjectItem {
  subject: string;
  revisionsDue: number;
  revisionsDone: number;
  revisionsMissed: number;
  score: number;
  topicsRead: number;
}

export interface ICategoryItem {
  category: string;
  subject?: string;
  revisionsDue: number;
  revisionsDone: number;
  revisionsMissed: number;
  score: number;
  topicsRead?: number;
}

export interface IMonthlySnapshot extends Document {
  userId: string;
  monthKey: string;  // "YYYY-MM"
  monthName: string; // "August 2026"
  overallScore: number;
  habitScore: number;
  taskScore: number;
  revisionScore: number;
  daysWithData: number;
  habitBreakdown: IMonthlyHabitItem[];
  categoryBreakdown?: ICategoryItem[];
  subjectBreakdown: IMonthlySubjectItem[];
  calculatedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlySnapshotSchema = new Schema<IMonthlySnapshot>(
  {
    userId: { type: String, required: true, index: true },
    monthKey: { type: String, required: true, index: true },
    monthName: { type: String, required: true },
    overallScore: { type: Number, required: true, default: 0 },
    habitScore: { type: Number, required: true, default: 0 },
    taskScore: { type: Number, required: true, default: 0 },
    revisionScore: { type: Number, required: true, default: 0 },
    daysWithData: { type: Number, required: true, default: 0 },
    habitBreakdown: [Schema.Types.Mixed],
    categoryBreakdown: [Schema.Types.Mixed],
    subjectBreakdown: [Schema.Types.Mixed],
    calculatedAt: { type: String, default: '' }
  },
  { timestamps: true }
);

MonthlySnapshotSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

const MonthlySnapshot: Model<IMonthlySnapshot> =
  mongoose.models.MonthlySnapshot || mongoose.model<IMonthlySnapshot>('MonthlySnapshot', MonthlySnapshotSchema);

export default MonthlySnapshot;
