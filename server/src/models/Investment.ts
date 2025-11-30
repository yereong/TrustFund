// src/models/Investment.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface Investment extends Document {
  project: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  wallet: string;
  amount: number;
  createdAt: Date;
}

const InvestmentSchema = new Schema<Investment>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    wallet: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Investment: Model<Investment> =
  mongoose.models.Investment ||
  mongoose.model<Investment>("Investment", InvestmentSchema);
