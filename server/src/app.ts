import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();
const allowedOrigins = [
  "https://trust-fund-five.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      // Postman 같은 비브라우저 요청은 origin이 없을 수 있어서 허용
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ CORS 차단 origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());             // ⭐ 쿠키 파서 추가

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
