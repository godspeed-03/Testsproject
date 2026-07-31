import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopicRevision extends Document {
  userId: string;
  customId?: string;
  subject: string;
  category: string;
  topic: string;
  firstReadDate: string;
  lastRevisedDate?: string;
  status?: string;
  r1ScheduledDate?: string;
  r1CompletedDate?: string;
  r1Status?: string;
  r2ScheduledDate?: string;
  r2CompletedDate?: string;
  r2Status?: string;
  r3ScheduledDate?: string;
  r3CompletedDate?: string;
  r3Status?: string;
  isOverdue?: boolean;
  overdueDays?: number;
  nextScheduledDate?: string;
  isCluster?: boolean;
  subTopics?: string[];
  extraRevisions?: any[];
  revisionLogs?: any[];
  createdAt: Date;
  updatedAt: Date;
}

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
    r1ScheduledDate: { type: String, default: '' },
    r1CompletedDate: { type: String, default: '' },
    r1Status: { type: String, default: 'Pending' },
    r2ScheduledDate: { type: String, default: '' },
    r2CompletedDate: { type: String, default: '' },
    r2Status: { type: String, default: 'Pending' },
    r3ScheduledDate: { type: String, default: '' },
    r3CompletedDate: { type: String, default: '' },
    r3Status: { type: String, default: 'Pending' },
    isOverdue: { type: Boolean, default: false },
    overdueDays: { type: Number, default: 0 },
    nextScheduledDate: { type: String, default: '' },
    isCluster: { type: Boolean, default: false },
    subTopics: [{ type: String }],
    extraRevisions: [Schema.Types.Mixed],
    revisionLogs: [Schema.Types.Mixed]
  },
  { timestamps: true }
);

const TopicRevision: Model<ITopicRevision> =
  mongoose.models.TopicRevision || mongoose.model<ITopicRevision>('TopicRevision', TopicRevisionSchema);

export default TopicRevision;
