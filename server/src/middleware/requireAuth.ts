// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthTokenPayload } from "../utils/jwt";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
  auth?: AuthTokenPayload;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const tokenFromCookie = req.cookies?.auth_token;
    
    const token = tokenFromCookie;

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 없습니다." });
    }

    // 🔐 JWT 검증
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

    if (!decoded.walletAddress) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    // ✅ 여기서 userId가 비어있으면 DB에서 찾아서 채워 넣기
    if (!decoded.userId) {
      const user = await User.findOne({
        walletAddress: decoded.walletAddress.toLowerCase(),
      }).select("_id");

      if (user) {
        decoded.userId = user._id.toString();
      }
    }

    // 🔥 req.auth에 최종 payload 넣기
    req.auth = decoded;

    // 디버깅용
    console.log("🔐 req.auth =", req.auth);

    next();
  } catch (err) {
    console.error("[requireAuth] error:", err);
    return res.status(401).json({ message: "인증 실패" });
  }
}
