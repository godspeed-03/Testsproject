import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResponse {
  questionId: string;
  selectedAnswer: any; // Can be string, number, array, boolean, etc.
  isCorrect: boolean;
  timeTaken: number;
  status?: 'seen' | 'answered' | 'review';
}

export interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  testId: string;
  mode: 'practice' | 'test';
  responses: IResponse[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  sectionScores?: Record<string, number>;
  status: 'in-progress' | 'completed';
  timeLeft?: number;
  timingMode?: 'full' | 'per-question';
}

const ResponseSchema = new Schema({
  questionId: { type: String, required: true },
  selectedAnswer: { type: Schema.Types.Mixed },
  isCorrect: { type: Boolean, required: true, default: false },
  timeTaken: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['seen', 'answered', 'review'], default: 'seen' }
}, { _id: false });

const AttemptSchema: Schema<IAttempt> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: String, required: true },
  mode: { type: String, enum: ['practice', 'test'], required: true },
  responses: [ResponseSchema],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  score: { type: Number },
  sectionScores: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  timeLeft: { type: Number },
  timingMode: { type: String, enum: ['full', 'per-question'] }
});

const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
export default Attempt;
