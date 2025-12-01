// src/server.ts
import app from "./app";
import dotenv from "dotenv";
import { connectMongo } from "./db/mongo";

dotenv.config();

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log("ENV TEST", process.env.MONGO_URI);

    });
  } catch (err) {
    console.error("서버 시작 중 에러:", err);
    process.exit(1);
  }
}

bootstrap();
