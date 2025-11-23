// src/routes/users.ts
import { Router } from "express";
import { User } from "../models/User";

const router = Router();

/**
 * Web3Auth info 저장/업데이트
 *
 * POST /api/users/info
 */
router.post("/info", async (req, res) => {
  try {
    const {
      walletAddress,
      email,
      name
    } = req.body || {};

    if (!walletAddress) {
      return res.status(400).json({ message: "walletAddress는 필수입니다." });
    }

    const lowerWallet = walletAddress.toLowerCase();

    const now = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: lowerWallet },
      {
        walletAddress: lowerWallet,
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
