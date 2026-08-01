import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklyDayEntry {
  day: string;
  dateKey: string;
  hours: number;
  tasksCount: number;
  target: number;
}

export interface IDistributionItem {
  subject: string;
  hours: string;
  pct: number;
  color: string;
}

export interface IWeeklyData extends Document {
  userId: string;
  weekKey: string; // e.g. "2026-W31" or "2026-08-01_2026-08-07"
  startDate: string;
  endDate: string;
  weeklyTotalHours: number;
  dailyAverageHours: number;
  consistencyPct: number;
  totalTasksDone: number;
  weeklyData: IWeeklyDayEntry[];
  subjectDistribution: IDistributionItem[];
  habitDistribution: IDistributionItem[];
  calculatedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyDataSchema = new Schema<IWeeklyData>(
  {
    userId: { type: String, required: true, index: true },
    weekKey: { type: String, required: true, index: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    weeklyTotalHours: { type: Number, required: true, default: 0 },
    dailyAverageHours: { type: Number, required: true, default: 0 },
    consistencyPct: { type: Number, required: true, default: 0 },
    totalTasksDone: { type: Number, required: true, default: 0 },
    weeklyData: [Schema.Types.Mixed],
    subjectDistribution: [Schema.Types.Mixed],
    habitDistribution: [Schema.Types.Mixed],
    calculatedAt: { type: String, default: '' }
  },
  { timestamps: true }
);

WeeklyDataSchema.index({ userId: 1, weekKey: 1 }, { unique: true });

const WeeklyData: Model<IWeeklyData> =
  mongoose.models.WeeklyData || mongoose.model<IWeeklyData>('WeeklyData', WeeklyDataSchema);

export default WeeklyData;
