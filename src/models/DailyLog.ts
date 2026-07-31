import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyLog extends Document {
  userId: string;
  date: string;
  total?: number;
  gs?: number;
  maths?: number;
  ca?: number;
  ans?: number;
  newH?: number;
  revH?: number;
  caDone?: boolean;
  ansCount?: number;
  focus?: number;
  weakest?: string;
  topicsRead?: string;
  selectedSubject?: string;
  topicRevisionIds?: string[];
  subjectTags?: any[];
  completedRevisions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    total: { type: Number, default: 0 },
    gs: { type: Number, default: 0 },
    maths: { type: Number, default: 0 },
    ca: { type: Number, default: 0 },
    ans: { type: Number, default: 0 },
    newH: { type: Number, default: 0 },
    revH: { type: Number, default: 0 },
    caDone: { type: Boolean, default: false },
    ansCount: { type: Number, default: 0 },
    focus: { type: Number, default: 3 },
    weakest: { type: String, default: '' },
    topicsRead: { type: String, default: '' },
    selectedSubject: { type: String, default: '' },
    topicRevisionIds: [{ type: String }],
    subjectTags: [Schema.Types.Mixed],
    completedRevisions: [{ type: String }]
  },
  { timestamps: true }
);

const DailyLog: Model<IDailyLog> =
  mongoose.models.DailyLog || mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);

export default DailyLog;
