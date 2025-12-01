import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: "https://trust-fund-five.vercel.app/", // 프론트 주소
    credentials: true,               // ⭐ 쿠키 주고 받기 위해 필요
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
