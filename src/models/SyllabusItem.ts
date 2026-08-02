import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyllabusRuleState {
  key: string;
  label: string;
  short: string;
  completed: boolean;
}

export interface ISyllabusItem extends Document {
  userId: string;
  customId?: string;
  subject: string;
  category: string;
  status: string;
  source?: string;
  date?: string;
  nextRev?: string;
  rules?: ISyllabusRuleState[];
  topicRevisionIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusItemSchema = new Schema<ISyllabusItem>(
  {
    userId: { type: String, required: true, index: true },
    customId: { type: String },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'Not Started' },
    source: { type: String, default: '' },
    date: { type: String, default: '' },
    nextRev: { type: String, default: '' },
    rules: [
      {
        key: { type: String },
        label: { type: String },
        short: { type: String },
        completed: { type: Boolean, default: false }
      }
    ],
    topicRevisionIds: [{ type: String }]
  },
  { timestamps: true }
);

SyllabusItemSchema.index({ userId: 1, subject: 1 });
SyllabusItemSchema.index({ userId: 1, category: 1 });

const SyllabusItem: Model<ISyllabusItem> =
  mongoose.models.SyllabusItem || mongoose.model<ISyllabusItem>('SyllabusItem', SyllabusItemSchema);

export default SyllabusItem;
