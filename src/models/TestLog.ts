import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestLog extends Document {
  userId: mongoose.Types.ObjectId;
  customId: string;
  code: string;
  date: string;
  subject: string;
  score: string;
  accuracy: string;
  concept: number;
  silly: number;
  timeP: number;
  takeaway: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestLogSchema: Schema<ITestLog> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customId: { type: String, required: true },
    code: { type: String, required: true },
    date: { type: String, default: '' },
    subject: { type: String, default: '' },
    score: { type: String, default: '' },
    accuracy: { type: String, default: '' },
    concept: { type: Number, default: 0 },
    silly: { type: Number, default: 0 },
    timeP: { type: Number, default: 0 },
    takeaway: { type: String, default: '' }
  },
  { timestamps: true }
);

const TestLog: Model<ITestLog> =
  mongoose.models.TestLog || mongoose.model<ITestLog>('TestLog', TestLogSchema);

export default TestLog;
