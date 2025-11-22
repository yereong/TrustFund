// src/routes/index.ts
import { Router } from "express";
import authRouter from "./auth";

const router = Router();

// 기본 테스트
router.get("/", (_req, res) => {
  res.json({ message: "TrustFund API v1" });
});

// Auth 관련
router.use("/auth", authRouter);

// 나중에 projects, funding 등도 이렇게 추가
// router.use("/projects", projectsRouter);

export default router;
