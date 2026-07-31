import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopicRevision extends Document {
  userId: mongoose.Types.ObjectId | string;
  customId?: string;

  subject: string;
  category: string;
  topic: string;

  firstReadDate: string;
  lastRevisedDate?: string;

  // Revision 1 (+7 days target)
  r1ScheduledDate: string;
  r1CompletedDate: string;
  r1Status: 'Pending' | 'Completed' | 'Overdue' | 'Skipped' | string;

  // Revision 2 (+21 days target)
  r2ScheduledDate: string;
  r2CompletedDate: string;
  r2Status: 'Pending' | 'Completed' | 'Overdue' | 'Skipped' | string;

  // Revision 3 (+45 days target)
  r3ScheduledDate: string;
  r3CompletedDate: string;
  r3Status: 'Pending' | 'Completed' | 'Overdue' | 'Skipped' | string;

  // Dynamic Overdue Tracking Flags
  isOverdue: boolean;
  overdueDays: number;
  nextScheduledDate: string;
  isCluster?: boolean;

  // Clustered micro-topics breakdown
  subTopics?: string[];

  // Historical Extra Revisions (Post-R3)
  extraRevisions?: {
    date: string;
    note?: string;
    clusterTitle?: string;
    subTopics?: string[];
  }[];

  // Comprehensive Revision Audit History Log
  revisionLogs?: {
    date: string;
    stage?: string;
    note?: string;
    clusterTitle?: string;
    subTopics?: string[];
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}

const TopicRevisionSchema = new Schema<ITopicRevision>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    customId: { type: String, unique: true, sparse: true },

    subject: { type: String, required: true, index: true },
    category: { type: String, default: 'GS1' },
    topic: { type: String, required: true, index: true },

    firstReadDate: { type: String, default: '' },
    lastRevisedDate: { type: String, default: '' },

    r1ScheduledDate: { type: String, default: '' },
    r1CompletedDate: { type: String, default: '' },
    r1Status: { type: String, default: 'Pending' },

    r2ScheduledDate: { type: String, default: '' },
    r2CompletedDate: { type: String, default: '' },
    r2Status: { type: String, default: 'Pending' },

    r3ScheduledDate: { type: String, default: '' },
    r3CompletedDate: { type: String, default: '' },
    r3Status: { type: String, default: 'Pending' },

    isOverdue: { type: Boolean, default: false, index: true },
    overdueDays: { type: Number, default: 0 },
    nextScheduledDate: { type: String, default: '', index: true },
    isCluster: { type: Boolean, default: false },

    subTopics: [{ type: String }],

    revisionLogs: [
      {
        date: { type: String, required: true },
        stage: { type: String, default: '' },
        note: { type: String, default: '' },
        clusterTitle: { type: String, default: '' },
        subTopics: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

// In Next.js dev mode, clear cached model to prevent stale enum schema validation errors
if (mongoose.models && mongoose.models.TopicRevision) {
  delete mongoose.models.TopicRevision;
}

const TopicRevision: Model<ITopicRevision> =
  mongoose.models.TopicRevision || mongoose.model<ITopicRevision>('TopicRevision', TopicRevisionSchema);

export default TopicRevision;
