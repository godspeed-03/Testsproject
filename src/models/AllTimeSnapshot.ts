import mongoose, { Schema, Document, Model } from 'mongoose';
import { IMonthlyHabitItem, IMonthlySubjectItem, ICategoryItem } from './MonthlySnapshot';

export interface IAllTimeSnapshot extends Document {
  userId: string;
  overallScore: number;
  habitScore: number;
  taskScore: number;
  revisionScore: number;
  totalDaysRecorded: number;
  habitBreakdown: IMonthlyHabitItem[];
  categoryBreakdown?: ICategoryItem[];
  subjectBreakdown: IMonthlySubjectItem[];
  calculatedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllTimeSnapshotSchema = new Schema<IAllTimeSnapshot>(
  {
    userId: { type: String, required: true, index: true, unique: true },
    overallScore: { type: Number, required: true, default: 0 },
    habitScore: { type: Number, required: true, default: 0 },
    taskScore: { type: Number, required: true, default: 0 },
    revisionScore: { type: Number, required: true, default: 0 },
    totalDaysRecorded: { type: Number, required: true, default: 0 },
    habitBreakdown: [Schema.Types.Mixed],
    categoryBreakdown: [Schema.Types.Mixed],
    subjectBreakdown: [Schema.Types.Mixed],
    calculatedAt: { type: String, default: '' }
  },
  { timestamps: true }
);

const AllTimeSnapshot: Model<IAllTimeSnapshot> =
  mongoose.models.AllTimeSnapshot || mongoose.model<IAllTimeSnapshot>('AllTimeSnapshot', AllTimeSnapshotSchema);

export default AllTimeSnapshot;
