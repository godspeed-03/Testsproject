import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestLog extends Document {
  userId: string;
  customId?: string;
  testName?: string;
  code?: string;
  subject?: string;
  accuracy?: string;
  score?: any;
  concept?: any;
  silly?: any;
  timeP?: any;
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
    subject: { type: String, default: '' },
    accuracy: { type: String, default: '' },
    score: { type: Schema.Types.Mixed, default: '' },
    concept: { type: Schema.Types.Mixed, default: 0 },
    silly: { type: Schema.Types.Mixed, default: 0 },
    timeP: { type: Schema.Types.Mixed, default: 0 },
    takeaway: { type: String, default: '' },
    date: { type: String, default: '' }
  },
  { timestamps: true }
);

const TestLog: Model<ITestLog> =
  mongoose.models.TestLog || mongoose.model<ITestLog>('TestLog', TestLogSchema);

export default TestLog;
