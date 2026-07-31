import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  isOff: boolean;
  total: number;
  gs: number;
  maths: number;
  ca: number;
  ans: number;
  newH: number;
  revH: number;
  caDone: string;
  ansCount: number;
  focus: number;
  weakest: string;
  topicsRead: string;
  selectedSubject: string;
  topicRevisionIds: (mongoose.Types.ObjectId | string)[];
  subjectTags?: any[];
  completedRevisions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema: Schema<IDailyLog> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    isOff: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    gs: { type: Number, default: 0 },
    maths: { type: Number, default: 0 },
    ca: { type: Number, default: 0 },
    ans: { type: Number, default: 0 },
    newH: { type: Number, default: 0 },
    revH: { type: Number, default: 0 },
    caDone: { type: String, default: 'NO' },
    ansCount: { type: Number, default: 0 },
    focus: { type: Number, default: 3 },
    weakest: { type: String, default: '' },
    topicsRead: { type: String, default: '' },
    selectedSubject: { type: String, default: '' },
    topicRevisionIds: [{ type: Schema.Types.ObjectId, ref: 'TopicRevision' }],
    subjectTags: [{ type: Schema.Types.Mixed }],
    completedRevisions: [{ type: String }]
  },
  { timestamps: true }
);

// Ensure one log per user per date
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

if (mongoose.models && mongoose.models.DailyLog) {
  delete mongoose.models.DailyLog;
}

const DailyLog: Model<IDailyLog> = mongoose.models.DailyLog || mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);

export default DailyLog;
