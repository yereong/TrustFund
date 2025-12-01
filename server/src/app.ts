import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();

const allowedOrigins = [
  "https://trust-fund-five.vercel.app",
  "http://localhost:3000",
];

// 1) CORS 옵션 분리
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // origin이 없으면(서버 간 통신, Postman 등) 그냥 허용
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ CORS 차단 origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// 2) 모든 요청에 CORS 적용
app.use(cors(corsOptions));

// 3) 모든 프리플라이트(OPTIONS)에 대해서도 CORS 적용
app.options("*", cors(corsOptions));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
