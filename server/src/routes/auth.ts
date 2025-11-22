// src/routes/auth.ts
import { Router } from "express";
import { User } from "../models/User";

const router = Router();

/**
 * Web3Auth 로그인 성공 시 유저 정보 저장/업데이트
 *
 * POST /api/auth/web3
 * body: {
 *   walletAddress: string;
 *   email?: string;
 *   name?: string;
 *   profileImage?: string;
 *   provider?: string;
 *   web3authUserId?: string;
 * }
 */
router.post("/web3", async (req, res) => {
  try {
    const {
      walletAddress,
      email,
      name,
      profileImage,
      provider,
      web3authUserId,
    } = req.body || {};

    if (!walletAddress) {
      return res.status(400).json({ message: "walletAddress는 필수입니다." });
    }

    const now = new Date();

    // upsert: 있으면 업데이트, 없으면 생성
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        walletAddress: walletAddress.toLowerCase(),
        email,
        name,
        profileImage,
        provider,
        web3authUserId,
        lastLoginAt: now,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      message: "ok",
      user,
    });
  } catch (err) {
    console.error("[POST /api/auth/web3] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
