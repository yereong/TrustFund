// src/routes/projects.ts
import { Router } from "express";
import { Project } from "../models/Project";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

/**
 * 프로젝트 생성
 *
 * POST /api/projects
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      targetAmount,
      representativeImage,
      expectedCompletionDate,
      milestones,
      description,
    } = req.body || {};

    const walletAddress = req.auth?.walletAddress;
    const userId = req.auth?.userId;

    if (!walletAddress) {
      return res.status(401).json({ message: "인증된 유저가 아닙니다." });
    }

    if (!title || !targetAmount || !description) {
      return res.status(400).json({
        message: "title, targetAmount, description은 필수입니다.",
      });
    }

    const project = await Project.create({
      ownerUser: userId,
      ownerWallet: walletAddress.toLowerCase(),
      representativeImage,
      title,
      targetAmount,
      expectedCompletionDate: expectedCompletionDate
        ? new Date(expectedCompletionDate)
        : undefined,
      milestones,
      description,
    });

    return res.status(201).json({ project });
  } catch (err) {
    console.error("[POST /api/projects] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * 프로젝트 목록 조회
 *
 * GET /api/projects?status=FUNDING
 */
router.get("/", async (req, res) => {
  try {
    const { status, page = "1", limit = "9" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && typeof status === "string") {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({ projects });
  } catch (err) {
    console.error("[GET /api/projects] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * 프로젝트 상세 조회
 *
 * GET /api/projects/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).lean();

    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    return res.status(200).json({ project });
  } catch (err) {
    console.error("[GET /api/projects/:id] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * 프로젝트 수정 (작성자만)
 *
 * PUT /api/projects/:id
 */
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      targetAmount,
      representativeImage,
      expectedCompletionDate,
      milestones,
      description,
      status,
    } = req.body || {};

    const walletAddress = req.auth?.walletAddress;
    const userId = req.auth?.userId;

    if (!walletAddress) {
      return res.status(401).json({ message: "인증된 유저가 아닙니다." });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    const isOwnerByUserId =
      userId && project.ownerUser && project.ownerUser.toString() === userId;
    const isOwnerByWallet =
      project.ownerWallet.toLowerCase() === walletAddress.toLowerCase();

    if (!isOwnerByUserId && !isOwnerByWallet) {
      return res.status(403).json({ message: "프로젝트 수정 권한이 없습니다." });
    }

    if (title !== undefined) project.title = title;
    if (targetAmount !== undefined) project.targetAmount = targetAmount;
    if (representativeImage !== undefined)
      project.representativeImage = representativeImage;
    if (expectedCompletionDate !== undefined)
      project.expectedCompletionDate = expectedCompletionDate
        ? new Date(expectedCompletionDate)
        : undefined;
    if (milestones !== undefined) project.milestones = milestones;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;

    await project.save();

    return res.status(200).json({ project });
  } catch (err) {
    console.error("[PUT /api/projects/:id] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * 프로젝트 삭제 (작성자만)
 *
 * DELETE /api/projects/:id
 */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const walletAddress = req.auth?.walletAddress;
    const userId = req.auth?.userId;

    if (!walletAddress) {
      return res.status(401).json({ message: "인증된 유저가 아닙니다." });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    const isOwnerByUserId =
      userId && project.ownerUser && project.ownerUser.toString() === userId;
    const isOwnerByWallet =
      project.ownerWallet.toLowerCase() === walletAddress.toLowerCase();

    if (!isOwnerByUserId && !isOwnerByWallet) {
      return res.status(403).json({ message: "프로젝트 삭제 권한이 없습니다." });
    }

    await project.deleteOne();

    return res.status(200).json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error("[DELETE /api/projects/:id] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * 마일스톤에 대한 투표
 *
 * POST /api/projects/:projectId/milestones/:milestoneId/vote
 * body: { choice: "YES" | "NO", amount?: number }
 */
router.post(
  "/:projectId/milestones/:milestoneId/vote",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { projectId, milestoneId } = req.params;
      const { choice, amount } = req.body as {
        choice: "YES" | "NO";
        amount?: number;
      };

      const walletAddress = req.auth?.walletAddress;
      const userId = req.auth?.userId;

      if (!walletAddress) {
        return res.status(401).json({ message: "인증된 유저가 아닙니다." });
      }

      if (!["YES", "NO"].includes(choice)) {
        return res
          .status(400)
          .json({ message: "choice는 YES 또는 NO 여야 합니다." });
      }

      const project: any = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
      }

      const milestone = project.milestones.id(milestoneId);
      if (!milestone) {
        return res
          .status(404)
          .json({ message: "마일스톤을 찾을 수 없습니다." });
      }

      // (선택사항) 이미 완료된 마일스톤은 투표 막기
      if (milestone.status !== "PENDING") {
        return res.status(400).json({
          message: "이미 종료된 마일스톤에는 투표할 수 없습니다.",
        });
      }

      // 이미 투표한 적 있는지 체크 (지갑 기준)
      const alreadyVoted = milestone.votes?.some(
        (v: any) =>
          v.voterWallet.toLowerCase() === walletAddress.toLowerCase()
      );
      if (alreadyVoted) {
        return res.status(400).json({ message: "이미 투표한 마일스톤입니다." });
      }

      // 투표 저장
      milestone.votes.push({
        voterUser: userId,
        voterWallet: walletAddress.toLowerCase(),
        choice,
        amount,
        createdAt: new Date(),
      });

      // 집계값 업데이트
      if (choice === "YES") {
        milestone.yesCount += 1;
        if (amount) milestone.yesAmount += amount;
      } else {
        milestone.noCount += 1;
        if (amount) milestone.noAmount += amount;
      }

      await project.save();

      return res.status(200).json({ milestone });
    } catch (err) {
      console.error(
        "[POST /api/projects/:projectId/milestones/:milestoneId/vote] error:",
        err
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
