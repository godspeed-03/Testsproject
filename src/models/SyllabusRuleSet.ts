import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRuleItem {
  key: string;
  label: string;
  short: string;
}

export interface ISyllabusRuleSet extends Document {
  userId: string;
  name: string;
  category: string;
  rules: IRuleItem[];
  createdAt: Date;
  updatedAt: Date;
}

const RuleItemSchema = new Schema<IRuleItem>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  short: { type: String, required: true }
});

const SyllabusRuleSetSchema = new Schema<ISyllabusRuleSet>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    rules: [RuleItemSchema]
  },
  { timestamps: true }
);

const SyllabusRuleSet: Model<ISyllabusRuleSet> =
  mongoose.models.SyllabusRuleSet || mongoose.model<ISyllabusRuleSet>('SyllabusRuleSet', SyllabusRuleSetSchema);

export default SyllabusRuleSet;
