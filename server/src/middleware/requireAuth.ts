// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyAuthToken, AuthTokenPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
  auth?: AuthTokenPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ message: "인증이 필요합니다. (토큰 없음)" });
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return res
        .status(401)
        .json({ message: "인증이 필요합니다. (유효하지 않은 토큰)" });
    }

    // 인증된 유저 정보 요청 객체에 저장
    req.auth = payload;

    return next();
  } catch (err) {
    console.error("[requireAuth] error:", err);
    return res.status(401).json({ message: "인증 실패" });
  }
}
