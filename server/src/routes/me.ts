// src/routes/me.ts
import { Router } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/requireAuth";
import { requireAuth } from "../middleware/requireAuth";
import { Project } from "../models/Project";
import { Investment } from "../models/Investment";

const router = Router();

/**
 * 🔥 마이페이지 대시보드
 *
 * GET /api/me/dashboard
 * - 내가 올린 프로젝트 목록 (currentAmount 포함)
 * - 내가 참여한 펀딩 목록 (currentAmount, myAmount 포함)
 */
router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.auth?.userId;
    const walletAddress = req.auth?.walletAddress?.toLowerCase();

    if (!walletAddress && !userId) {
      return res.status(401).json({ message: "인증된 유저가 아닙니다." });
    }

    /* ------------------------------------------------------------------
     * 1) 내가 올린 프로젝트들 조회
     * ------------------------------------------------------------------ */
    const ownerFilter: any[] = [];
    if (userId) ownerFilter.push({ ownerUser: userId });
    if (walletAddress) ownerFilter.push({ ownerWallet: walletAddress });

    const myProjectsDocs = ownerFilter.length
      ? await Project.find({ $or: ownerFilter })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    let myProjects: any[] = [];

    if (myProjectsDocs.length > 0) {
      const myProjectIds = myProjectsDocs.map((p) => p._id);

      // ✅ /api/projects 목록과 동일한 방식으로 aggregate
      const fundingAgg = await Investment.aggregate([
        { $match: { project: { $in: myProjectIds } } },
        {
          $group: {
            _id: "$project",
            total: { $sum: "$amount" },
          },
        },
      ]);

      const fundingMap = new Map<string, number>();
      fundingAgg.forEach((f: any) => {
        fundingMap.set(String(f._id), f.total || 0);
      });

      myProjects = myProjectsDocs.map((p) => {
        const currentAmount = fundingMap.get(String(p._id)) || 0;
        const targetAmount = p.targetAmount || 0;

        // 달성률 (0~100)
        const progress =
          targetAmount > 0
            ? Math.min(100, Math.floor((currentAmount / targetAmount) * 100))
            : 0;

        return {
          id: String(p._id),
          title: p.title,
          status: p.status, // "FUNDING" | "COMPLETED" | "CANCELLED"
          targetAmount,
          currentAmount, // ✅ 내가 올린 프로젝트의 현재 모금액
          progress,
          createdAt: p.createdAt,
        };
      });
    }

    /* ------------------------------------------------------------------
     * 2) 내가 참여한 펀딩들 조회
     * ------------------------------------------------------------------ */
    const investorFilter: any[] = [];
    if (userId) investorFilter.push({ user: userId });
    if (walletAddress) investorFilter.push({ wallet: walletAddress });

    const myInvestments = investorFilter.length
      ? await Investment.find({ $or: investorFilter }).lean()
      : [];

    // 🔥 참여한 프로젝트 id (string) 중복 제거
    const fundedProjectIdStrings = Array.from(
      new Set(myInvestments.map((inv) => String(inv.project)))
    );

    // 🔥 aggregate / find 에서 쓸 ObjectId 배열로 변환
    const fundedProjectIds = fundedProjectIdStrings.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    let myFundings: any[] = [];

    if (fundedProjectIds.length > 0) {
      // 내가 참여한 프로젝트들 정보
      const fundedProjectsDocs = await Project.find({
        _id: { $in: fundedProjectIds },
      })
        .sort({ createdAt: -1 })
        .lean();

      // ✅ 각 프로젝트별 전체 펀딩 총액 (currentAmount)
      const allFundingAgg = await Investment.aggregate([
        { $match: { project: { $in: fundedProjectIds } } },
        {
          $group: {
            _id: "$project",
            total: { $sum: "$amount" },
          },
        },
      ]);

      const allFundingMap = new Map<string, number>();
      allFundingAgg.forEach((f: any) => {
        allFundingMap.set(String(f._id), f.total || 0);
      });

      // ✅ 내가 각각의 프로젝트에 넣은 금액 합산 (myAmount)
      const myFundingMap = new Map<string, number>();
      myInvestments.forEach((inv) => {
        const key = String(inv.project);
        const prev = myFundingMap.get(key) || 0;
        myFundingMap.set(key, prev + (inv.amount || 0));
      });

      myFundings = fundedProjectsDocs.map((p) => {
        const projectId = String(p._id);
        const currentAmount = allFundingMap.get(projectId) || 0; // ✅ 전체 모금액
        const targetAmount = p.targetAmount || 0;
        const myAmount = myFundingMap.get(projectId) || 0; // ✅ 내가 넣은 금액

        const progress =
          targetAmount > 0
            ? Math.min(100, Math.floor((currentAmount / targetAmount) * 100))
            : 0;

        return {
          id: projectId,
          title: p.title,
          status: p.status,
          targetAmount,
          currentAmount,
          myAmount,
          progress,
          createdAt: p.createdAt,
        };
      });
    }

    /* ------------------------------------------------------------------
     * 3) 리턴
     * ------------------------------------------------------------------ */
    return res.status(200).json({
      myProjects,
      myFundings,
    });
  } catch (err) {
    console.error("[GET /api/me/dashboard] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
