import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRevisionEntry {
  stage: string;
  scheduledDate?: string;
  completedDate?: string;
  status?: string;
  note?: string;
}

export interface ITopicRevision extends Document {
  userId: string;
  customId?: string;
  subject: string;
  category: string;
  topic: string;
  firstReadDate: string;
  lastRevisedDate?: string;
  status?: string;
  isAugmentedRevision?: boolean;
  nextScheduledDate?: string;
  isOverdue?: boolean;
  overdueDays?: number;
  revisions?: IRevisionEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const RevisionEntrySchema = new Schema(
  {
    stage: { type: String, required: true },
    scheduledDate: { type: String, default: '' },
    completedDate: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const TopicRevisionSchema = new Schema<ITopicRevision>(
  {
    userId: { type: String, required: true, index: true },
    customId: { type: String },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    topic: { type: String, required: true },
    firstReadDate: { type: String, default: '' },
    lastRevisedDate: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    isAugmentedRevision: { type: Boolean, default: true },
    nextScheduledDate: { type: String, default: '' },
    isOverdue: { type: Boolean, default: false },
    overdueDays: { type: Number, default: 0 },
    revisions: [RevisionEntrySchema]
  },
  { timestamps: true }
);

TopicRevisionSchema.index({ userId: 1, subject: 1, topic: 1 });
TopicRevisionSchema.index({ userId: 1, nextScheduledDate: 1 });

if (mongoose.models && (mongoose.models as any).TopicRevision) {
  delete (mongoose.models as any).TopicRevision;
}

const TopicRevision: Model<ITopicRevision> =
  mongoose.models.TopicRevision || mongoose.model<ITopicRevision>('TopicRevision', TopicRevisionSchema);

export default TopicRevision;
