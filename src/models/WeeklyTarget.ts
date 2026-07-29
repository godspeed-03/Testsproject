import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyTargetItem {
  id: string;
  name: string;
  target: number;
  isDefault: boolean;
}

export interface IWeeklyTargetDoc extends Document {
  userId: string;
  startOfWeek: string;
  targets: IWeeklyTargetItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyTargetSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    startOfWeek: { type: String, required: true },
    targets: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        target: { type: Number, required: true, default: 0 },
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.WeeklyTarget || mongoose.model<IWeeklyTargetDoc>('WeeklyTarget', WeeklyTargetSchema);
