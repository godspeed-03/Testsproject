import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestLog extends Document {
  userId: string;
  customId?: string;
  testName?: string;
  code?: string;
  type?: string;
  category?: string;
  subject?: string;
  accuracy?: string;
  score?: any;
  maxScore?: any;
  percent?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  negMarks?: number;
  durationMins?: number;
  benchmarkCutoff?: number;
  concept?: any;
  silly?: any;
  timeP?: any;
  weakAreas?: string[];
  takeaway?: string;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestLogSchema = new Schema<ITestLog>(
  {
    userId: { type: String, required: true, index: true },
    customId: { type: String },
    testName: { type: String, default: '' },
    code: { type: String, default: '' },
    type: { type: String, default: 'PRELIMS' },
    category: { type: String, default: 'GS1' },
    subject: { type: String, default: '' },
    accuracy: { type: String, default: '' },
    score: { type: Schema.Types.Mixed, default: 0 },
    maxScore: { type: Schema.Types.Mixed, default: 200 },
    percent: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unattemptedCount: { type: Number, default: 0 },
    negMarks: { type: Number, default: 0 },
    durationMins: { type: Number, default: 120 },
    benchmarkCutoff: { type: Number, default: 100 },
    concept: { type: Schema.Types.Mixed, default: 0 },
    silly: { type: Schema.Types.Mixed, default: 0 },
    timeP: { type: Schema.Types.Mixed, default: 0 },
    weakAreas: { type: [String], default: [] },
    takeaway: { type: String, default: '' },
    date: { type: String, default: '' }
  },
  { timestamps: true, strict: false }
);

TestLogSchema.index({ userId: 1, createdAt: -1 });

const TestLog: Model<ITestLog> =
  mongoose.models.TestLog || mongoose.model<ITestLog>('TestLog', TestLogSchema);

export default TestLog;
