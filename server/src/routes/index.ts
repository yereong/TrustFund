// src/routes/index.ts
import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import projectsRouter from "./projects";
import uploadRouter from "./upload";

const router = Router();

// 기본 테스트
router.get("/", (_req, res) => {
  res.json({ message: "TrustFund API v1" });
});

// Auth 관련
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/projects", projectsRouter);
router.use("/upload", uploadRouter);


export default router;
