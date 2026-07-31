import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklyTarget extends Document {
  userId: string;
  title?: string;
  target?: number;
  completed?: number;
  targets?: any;
  startOfWeek?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyTargetSchema = new Schema<IWeeklyTarget>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    target: { type: Number, default: 1 },
    completed: { type: Number, default: 0 },
    targets: { type: Schema.Types.Mixed },
    startOfWeek: { type: String, default: '' }
  },
  { timestamps: true }
);

const WeeklyTarget: Model<IWeeklyTarget> =
  mongoose.models.WeeklyTarget || mongoose.model<IWeeklyTarget>('WeeklyTarget', WeeklyTargetSchema);

export default WeeklyTarget;
