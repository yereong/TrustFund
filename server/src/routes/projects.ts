// src/routes/projects.ts
import { Router } from "express";
import { Project } from "../models/Project";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Investment } from "../models/Investment";

const router = Router();

/**
 * 프로젝트 생성
 *
 * POST /api/projects
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      chainProjectId, // ✅ 온체인 projectId
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

    if (typeof chainProjectId !== "number") {
      return res.status(400).json({ message: "chainProjectId가 필요합니다." });
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
      chainProjectId, // 🔥 저장
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
router.get("/:id", requireAuth,async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;
    const userWallet = req.auth?.walletAddress;
    console.log('유저아이디:', userId);

    // 🔥 여기서는 lean() 말고 Document로 가져와서 status 수정 가능하게
    const projectDoc = await Project.findById(id);
    if (!projectDoc) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    // ✅ 총 펀딩 금액 계산
    const totalFunding = await Investment.aggregate([
      { $match: { project: projectDoc._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const currentAmount = totalFunding[0]?.total || 0;

    // ✅ 1. currentAmount와 targetAmount 비교해서 status 업데이트
    if (
      currentAmount >= projectDoc.targetAmount && // 같거나 초과하면
      projectDoc.status !== "COMPLETED"
    ) {
      projectDoc.status = "COMPLETED";
      await projectDoc.save();
    }

    // ✅ 3. isOwner 계산 (ownerUser 또는 ownerWallet 기준)
    const isOwner =
      (
        (userId == projectDoc.ownerUser) ||
        (userWallet == projectDoc.ownerWallet.toLowerCase())
      );

    // ✅ 2. hasParticipated: Investment에 기록이 있으면 true
    let hasParticipated = false;

    if (userId || userWallet) {
      const orConds: any[] = [];
      if (userId) {
        orConds.push({ user: userId });
      }
      if (userWallet) {
        orConds.push({ wallet: userWallet.toLowerCase() });
      }

      if (orConds.length > 0) {
        const invested = await Investment.exists({
          project: projectDoc._id,
          user: userId,
        });
        hasParticipated = !!invested;
      }
    }

    const project = projectDoc.toObject();

    return res.status(200).json({
      project: {
        ...project,
        isOwner,
        hasParticipated,
        currentAmount,
      },
    });
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
      return res
        .status(403)
        .json({ message: "프로젝트 수정 권한이 없습니다." });
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
      return res
        .status(403)
        .json({ message: "프로젝트 삭제 권한이 없습니다." });
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

      if (milestone.status !== "PENDING") {
        return res.status(400).json({
          message: "이미 종료된 마일스톤에는 투표할 수 없습니다.",
        });
      }

      const alreadyVoted = milestone.votes?.some(
        (v: any) =>
          v.voterWallet.toLowerCase() === walletAddress.toLowerCase()
      );
      if (alreadyVoted) {
        return res.status(400).json({ message: "이미 투표한 마일스톤입니다." });
      }

      milestone.votes.push({
        voterUser: userId,
        voterWallet: walletAddress.toLowerCase(),
        choice,
        amount,
        createdAt: new Date(),
      });

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

/**
 * 🔥 마일스톤 완료 요청 + 증빙 저장
 *
 * POST /api/projects/:projectId/milestones/:milestoneId/request-completion
 * body: { description: string, proofUrl?: string }
 */
router.post(
  "/:projectId/milestones/:milestoneId/request-completion",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { projectId, milestoneId } = req.params;
      const { description, proofUrl } = req.body || {};

      const walletAddress = req.auth?.walletAddress;
      const userId = req.auth?.userId;

      if (!walletAddress) {
        return res.status(401).json({ message: "인증된 유저가 아닙니다." });
      }

      if (!description || typeof description !== "string") {
        return res
          .status(400)
          .json({ message: "description(완료 상세 내용)은 필수입니다." });
      }

      const project: any = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
      }

      // 작성자만 완료 요청 가능
      const isOwnerByUserId =
        userId && project.ownerUser && project.ownerUser.toString() === userId;
      const isOwnerByWallet =
        project.ownerWallet.toLowerCase() === walletAddress.toLowerCase();

      if (!isOwnerByUserId && !isOwnerByWallet) {
        return res
          .status(403)
          .json({ message: "마일스톤 완료 요청 권한이 없습니다." });
      }

      const milestone = project.milestones.id(milestoneId);
      if (!milestone) {
        return res
          .status(404)
          .json({ message: "마일스톤을 찾을 수 없습니다." });
      }

      // 완료 보고 내용 & 증빙 자료 URL 저장
      milestone.completionDetail = description;
      if (proofUrl) {
        milestone.proofUrl = proofUrl;
      }

      // 완료 요청 상태 플래그
      milestone.requestSent = true;
      milestone.requestAt = new Date();

      await project.save();

      return res.status(200).json({
        message: "마일스톤 완료 요청이 저장되었습니다.",
        milestone,
      });
    } catch (err) {
      console.error(
        "[POST /api/projects/:projectId/milestones/:milestoneId/request-completion] error:",
        err
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/**
 * 프로젝트 펀딩 참여 (온체인 완료 후 기록용)
 *
 * POST /api/projects/:id/fund
 * body: { amount: number, txHash?: string }
 */
router.post("/:id/fund", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, txHash } = req.body;

    const walletAddress = req.auth?.walletAddress;
    const userId = req.auth?.userId;

    if (!walletAddress) {
      return res.status(401).json({ message: "인증된 유저가 아닙니다." });
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount는 1 이상의 숫자여야 합니다." });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    const funding = await Investment.create({
      project: project._id,
      user: userId,
      wallet: walletAddress.toLowerCase(),
      amount,
      txHash,
    });

    // ✅ 펀딩 후 총액 다시 계산해서 status 갱신
    const totalFunding = await Investment.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const currentAmount = totalFunding[0]?.total || 0;

    if (
      currentAmount >= project.targetAmount && // 같거나 초과
      project.status !== "COMPLETED"
    ) {
      project.status = "COMPLETED";
      await project.save();
    }

    return res.status(201).json({
      message: "펀딩 참여가 완료되었습니다.",
      funding,
      currentAmount,
      status: project.status,
    });
  } catch (err) {
    console.error("[POST /api/projects/:id/fund] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
