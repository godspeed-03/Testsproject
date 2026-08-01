import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoutineConfig extends Document {
  userId: string;
  title?: string;
  subtitle?: string;
  timeSlots?: { time: string; label: string }[];
  cells?: any[];
  metrics?: any;
  satakGoals?: any[];
  tables?: any[];
  weeklySummary?: any;
  configPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineConfigSchema: Schema = new Schema<IRoutineConfig>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Master Routine & Schedule' },
    subtitle: { type: String, default: 'Personalized daily schedule, weekly study timetable & strategic roadmap.' },
    timeSlots: { type: Schema.Types.Mixed, default: [] },
    cells: { type: Schema.Types.Mixed, default: [] },
    metrics: { type: Schema.Types.Mixed, default: {} },
    satakGoals: { type: Schema.Types.Mixed, default: [] },
    tables: { type: Schema.Types.Mixed, default: undefined },
    weeklySummary: { type: Schema.Types.Mixed, default: undefined },
    configPayload: { type: Schema.Types.Mixed, default: undefined }
  },
  { timestamps: true, strict: false }
);

const RoutineConfig: Model<IRoutineConfig> =
  mongoose.models.RoutineConfig || mongoose.model<IRoutineConfig>('RoutineConfig', RoutineConfigSchema);

export default RoutineConfig;
