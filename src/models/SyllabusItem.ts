import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyllabusItem extends Document {
  userId: mongoose.Types.ObjectId;
  customId: string;
  subject: string;
  category: string; // GS1, GS2, GS3, GS4, MATHS, CSAT
  status: string;
  source: string;
  date: string;
  nextRev: string;
  // Milestone Checklists
  firstRead: boolean;
  rev1: boolean;
  rev2: boolean;
  preNotes: boolean;
  mainsNotes: boolean;
  questionBank: boolean;
  prePyq: boolean;
  mainsPyq: boolean;
  ansWriting: boolean;
  preFinalRev: boolean;
  mainsFinalRev: boolean;
  topicRevisionIds?: (mongoose.Types.ObjectId | string)[];
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusItemSchema: Schema<ISyllabusItem> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customId: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, default: 'GS1' },
    status: { type: String, default: 'Not Started' },
    source: { type: String, default: '' },
    date: { type: String, default: '' },
    nextRev: { type: String, default: '' },
    firstRead: { type: Boolean, default: false },
    rev1: { type: Boolean, default: false },
    rev2: { type: Boolean, default: false },
    preNotes: { type: Boolean, default: false },
    mainsNotes: { type: Boolean, default: false },
    questionBank: { type: Boolean, default: false },
    prePyq: { type: Boolean, default: false },
    mainsPyq: { type: Boolean, default: false },
    ansWriting: { type: Boolean, default: false },
    preFinalRev: { type: Boolean, default: false },
    mainsFinalRev: { type: Boolean, default: false },
    topicRevisionIds: [{ type: Schema.Types.ObjectId, ref: 'TopicRevision' }]
  },
  { timestamps: true }
);

const SyllabusItem: Model<ISyllabusItem> =
  mongoose.models.SyllabusItem || mongoose.model<ISyllabusItem>('SyllabusItem', SyllabusItemSchema);

export default SyllabusItem;
