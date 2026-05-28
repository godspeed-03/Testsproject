import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITest extends Document {
  testId: string;
  testName: string;
  testJSON: any; // Raw JSON for flexibility, or we can define it strictly
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  totalQuestions: number;
  totalTime: number; // in seconds
  settings: {
    isLive: boolean;
    strictSectionOrder: boolean;
    goLiveDate?: Date | null;
    allowPracticeMode: boolean;
    allowTestMode: boolean;
    timingMode: 'full' | 'per-question';
  };
}

const TestSchema: Schema<ITest> = new Schema({
  testId: { type: String, required: true, unique: true },
  testName: { type: String, required: true },
  testJSON: { type: Schema.Types.Mixed, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  totalQuestions: { type: Number, required: true, default: 0 },
  totalTime: { type: Number, required: true, default: 0 },
  settings: {
    isLive: { type: Boolean, default: true },
    strictSectionOrder: { type: Boolean, default: false },
    goLiveDate: { type: Date, default: null },
    allowPracticeMode: { type: Boolean, default: true },
    allowTestMode: { type: Boolean, default: true },
    timingMode: { type: String, enum: ['full', 'per-question'], default: 'full' }
  }
});

const Test: Model<ITest> = mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
export default Test;
