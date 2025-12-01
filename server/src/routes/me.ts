// src/routes/me.ts
import { Router } from "express";
import type { AuthRequest } from "../middleware/requireAuth";
import { requireAuth } from "../middleware/requireAuth";
import { Project } from "../models/Project";
import { Investment } from "../models/Investment";

const router = Router();

/**
 * 🔥 마이페이지 대시보드
 *
 * GET /api/me/dashboard
 * - 내가 올린 프로젝트 목록
 * - 내가 참여한 펀딩 목록
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
      ? await Project.find({ $or: ownerFilter }).sort({ createdAt: -1 }).lean()
      : [];

    const myProjectIds = myProjectsDocs.map((p) => p._id);

    // 각 프로젝트별 총 펀딩 금액 계산
    let myProjectsFundingAgg: any[] = [];
    if (myProjectIds.length > 0) {
      myProjectsFundingAgg = await Investment.aggregate([
        { $match: { project: { $in: myProjectIds } } },
        {
          $group: {
            _id: "$project",
            total: { $sum: "$amount" },
          },
        },
      ]);
    }

    const myProjectsFundingMap = new Map<string, number>();
    myProjectsFundingAgg.forEach((f: any) => {
      myProjectsFundingMap.set(String(f._id), f.total || 0);
    });

    const myProjects = myProjectsDocs.map((p) => {
      const currentAmount = myProjectsFundingMap.get(String(p._id)) || 0;
      const targetAmount = p.targetAmount || 0;

      // 달성률 (0~100)
      const progress =
        targetAmount > 0
          ? Math.min(100, Math.floor((currentAmount / targetAmount) * 100))
          : 0;

      return {
        id: String(p._id),
        title: p.title,
        status: p.status,           // "FUNDING" | "COMPLETED" | "CANCELLED"
        targetAmount,
        currentAmount,
        progress,
        createdAt: p.createdAt,
      };
    });

    /* ------------------------------------------------------------------
     * 2) 내가 참여한 펀딩들 조회
     * ------------------------------------------------------------------ */
    const investorFilter: any[] = [];
    if (userId) investorFilter.push({ user: userId });
    if (walletAddress) investorFilter.push({ wallet: walletAddress });

    const myInvestments = investorFilter.length
      ? await Investment.find({ $or: investorFilter }).lean()
      : [];

    const fundedProjectIdSet = new Set<string>();
    myInvestments.forEach((inv) => {
      fundedProjectIdSet.add(String(inv.project));
    });

    const fundedProjectIds = Array.from(fundedProjectIdSet);

    let fundedProjectsDocs: any[] = [];
    if (fundedProjectIds.length > 0) {
      fundedProjectsDocs = await Project.find({
        _id: { $in: fundedProjectIds },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // 각 프로젝트별 총 펀딩 (전체) + 내가 넣은 금액 (myAmount) 계산
    let allFundingAgg: any[] = [];
    if (fundedProjectIds.length > 0) {
      allFundingAgg = await Investment.aggregate([
        { $match: { project: { $in: fundedProjectIds } } },
        {
          $group: {
            _id: "$project",
            total: { $sum: "$amount" },
          },
        },
      ]);
    }

    const allFundingMap = new Map<string, number>();
    allFundingAgg.forEach((f: any) => {
      allFundingMap.set(String(f._id), f.total || 0);
    });

    // 내가 각각의 프로젝트에 넣은 금액 합산
    const myFundingMap = new Map<string, number>();
    myInvestments.forEach((inv) => {
      const key = String(inv.project);
      const prev = myFundingMap.get(key) || 0;
      myFundingMap.set(key, prev + (inv.amount || 0));
    });

    const myFundings = fundedProjectsDocs.map((p) => {
      const projectId = String(p._id);
      const currentAmount = allFundingMap.get(projectId) || 0;
      const targetAmount = p.targetAmount || 0;
      const myAmount = myFundingMap.get(projectId) || 0;

      const progress =
        targetAmount > 0
          ? Math.min(100, Math.floor((currentAmount / targetAmount) * 100))
          : 0;

      return {
        id: projectId,
        title: p.title,
        status: p.status,       // "FUNDING" | "COMPLETED" | "CANCELLED"
        targetAmount,
        currentAmount,
        myAmount,               // 🔥 내가 이 프로젝트에 넣은 금액
        progress,
        createdAt: p.createdAt,
      };
    });

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
