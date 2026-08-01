import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHabitBreakdownItem {
  id: string;
  title: string;
  type: string;
  icon?: string;
  subject?: string;
  category?: string;
  score: number;
  doneCount: number;
  streakCurrent: number;
  streakBest: number;
}

export interface ICategoryBreakdownItem {
  category: string;
  score: number;
  totalDone: number;
  habitsCount: number;
}

export interface IConsistencySnapshot extends Document {
  userId: string;
  studyDayKey: string; // e.g. "2026-08-01"
  monthKey: string;    // e.g. "2026-08"
  monthName: string;   // e.g. "August 2026"
  overallScore: number;
  tillDateScore?: number;
  habitScore: number;
  taskScore: number;
  revisionScore: number;
  totalDone: number;
  habitBreakdown?: IHabitBreakdownItem[];
  categoryBreakdown?: ICategoryBreakdownItem[];
  calculatedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsistencySnapshotSchema = new Schema<IConsistencySnapshot>(
  {
    userId: { type: String, required: true, index: true },
    studyDayKey: { type: String, required: true, index: true },
    monthKey: { type: String, required: true, index: true },
    monthName: { type: String, required: true },
    overallScore: { type: Number, required: true, default: 0 },
    tillDateScore: { type: Number, default: 100 },
    habitScore: { type: Number, required: true, default: 0 },
    taskScore: { type: Number, required: true, default: 0 },
    revisionScore: { type: Number, required: true, default: 0 },
    totalDone: { type: Number, required: true, default: 0 },
    habitBreakdown: { type: Array, default: [] },
    categoryBreakdown: { type: Array, default: [] },
    calculatedAt: { type: String, default: '' }
  },
  { timestamps: true }
);

// Ensure unique index per user per study day
ConsistencySnapshotSchema.index({ userId: 1, studyDayKey: 1 }, { unique: true });

const ConsistencySnapshot: Model<IConsistencySnapshot> =
  mongoose.models.ConsistencySnapshot ||
  mongoose.model<IConsistencySnapshot>('ConsistencySnapshot', ConsistencySnapshotSchema);

export default ConsistencySnapshot;
