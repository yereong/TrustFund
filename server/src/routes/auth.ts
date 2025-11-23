// src/routes/auth.ts
import { Router } from "express";
import { User } from "../models/User";

const router = Router();

/**
 * Web3Auth 로그인 성공 시 유저 정보 저장/업데이트 + 리디렉션 판단
 *
 * POST /api/auth/web3
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

    const lowerWallet = walletAddress.toLowerCase();

    // 🔍 1) 기존 유저 조회
    const existingUser = await User.findOne({ walletAddress: lowerWallet });

    // 🔎 CASE A: 기존 유저였고 name/email이 이미 DB에 저장되어 있음 → /main
    if (existingUser && (existingUser.name || existingUser.email)) {
      // 기존 유저의 lastLoginAt 업데이트
      existingUser.lastLoginAt = new Date();
      await existingUser.save();

      return res.status(200).json({
        redirect: "/main",
        user: existingUser,
      });
    }

    // 🔎 CASE B: 신규 유저인데 name/email이 요청에 없음 → /info (추가 정보 필요)
    if (!existingUser && !name && !email) {
      // 아직 DB에 생성하지 않음 (정보 부족)
      return res.status(200).json({
        redirect: "/info",
      });
    }

    // 🔎 CASE C: 기존 유저이지만 name/email이 비어있음 → /info
     if (existingUser && (!existingUser.name || !existingUser.email)) {

      return res.status(200).json({
        redirect: "/info",
      });
    }

    const now = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: lowerWallet },
      {
        walletAddress: lowerWallet,
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
      redirect: "/main",
      user: updatedUser,
    });
  } catch (err) {
    console.error("[POST /api/auth/web3] error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
