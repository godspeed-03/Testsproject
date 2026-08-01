import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyHabitItem {
  habitId: string;
  title: string;
  type: string;
  icon?: string;
  category?: string;
  subject?: string;
  scheduled: boolean;
  done: boolean;
  score: number;
}

export interface IDailySubjectItem {
  subject: string;
  revisionsDue: number;
  revisionsDone: number;
  revisionsMissed: number;
  score: number;
  topicsReadToday: number;
}

export interface IDailyCategoryItem {
  category: string;
  subject?: string;
  revisionsDue: number;
  revisionsDone: number;
  revisionsMissed: number;
  score: number;
  topicsReadToday?: number;
}

export interface IDailySnapshot extends Document {
  userId: string;
  studyDayKey: string; // "YYYY-MM-DD"
  monthKey: string;    // "YYYY-MM"
  monthName: string;   // "August 2026"
  habitScore: number;
  taskScore: number;
  revisionScore: number;
  overallScore: number;
  habitBreakdown: IDailyHabitItem[];
  categoryBreakdown: IDailyCategoryItem[];
  subjectBreakdown: IDailySubjectItem[];
  calculatedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailySnapshotSchema = new Schema<IDailySnapshot>(
  {
    userId: { type: String, required: true, index: true },
    studyDayKey: { type: String, required: true, index: true },
    monthKey: { type: String, required: true, index: true },
    monthName: { type: String, required: true },
    habitScore: { type: Number, required: true, default: 0 },
    taskScore: { type: Number, required: true, default: 0 },
    revisionScore: { type: Number, required: true, default: 0 },
    overallScore: { type: Number, required: true, default: 0 },
    habitBreakdown: [Schema.Types.Mixed],
    categoryBreakdown: [Schema.Types.Mixed],
    subjectBreakdown: [Schema.Types.Mixed],
    calculatedAt: { type: String, default: '' }
  },
  { timestamps: true }
);

DailySnapshotSchema.index({ userId: 1, studyDayKey: 1 }, { unique: true });

const DailySnapshot: Model<IDailySnapshot> =
  mongoose.models.DailySnapshot || mongoose.model<IDailySnapshot>('DailySnapshot', DailySnapshotSchema);

export default DailySnapshot;
