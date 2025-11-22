// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  walletAddress: string; // 지갑 주소 (필수, unique)
  email?: string;
  name?: string;
  profileImage?: string;
  provider?: string; // 예: "google", "twitter" 등
  web3authUserId?: string; // Web3Auth 고유 id (sub)
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: { type: String },
    name: { type: String },
    profileImage: { type: String },
    provider: { type: String },
    web3authUserId: { type: String },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 관리
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
