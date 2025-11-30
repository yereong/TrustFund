// src/routes/users.ts
import { Router } from "express";
import { User } from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

/**
 * 추가 회원 정보 저장/업데이트
 *
 * POST /api/users/info
 */
router.post("/info", async (req, res) => {
  try {
    const { email, name } = req.body || {};

    // walletAddress는 클라이언트 body에서 읽으면 위험!
    const walletAddress = req.body.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ message: "인증된 유저가 아닙니다." });
    }

    const lowerWallet = walletAddress.toLowerCase();
    const now = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: lowerWallet },
      {
        email,
        name,
        lastLoginAt: now,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      user: updatedUser,
    });
  } catch (err) {
    console.error("[POST /api/users/info] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
