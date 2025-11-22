// src/db/mongo.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

// 이 파일에서 직접 .env 로드
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.warn("[MongoDB] MONGO_URI 환경변수가 설정되어 있지 않습니다.");
}

export async function connectMongo() {
  try {
    if (!MONGO_URI) return;

    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB 연결 성공");
  } catch (err) {
    console.error("❌ MongoDB 연결 실패:", err);
    throw err;
  }
}
