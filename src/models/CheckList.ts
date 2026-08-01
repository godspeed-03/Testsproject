import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICheckListItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ICheckList extends Document {
  userId: string;
  title: string;
  color?: string;
  items: ICheckListItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CheckListSchema = new Schema<ICheckList>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    color: { type: String, default: '#6366F1' },
    items: [
      new Schema(
        {
          id: { type: String, required: true },
          text: { type: String, required: true },
          checked: { type: Boolean, default: false }
        },
        { _id: false }
      )
    ]
  },
  { timestamps: true }
);

const CheckList: Model<ICheckList> =
  mongoose.models.CheckList || mongoose.model<ICheckList>('CheckList', CheckListSchema);

export default CheckList;
