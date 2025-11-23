// src/utils/jwt.ts
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// SECRET은 반드시 string or buffer 타입이어야 함 → Secret으로 명확히 지정
const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-secret";

// expiresIn은 string | number 형태만 허용되므로 SignOptions["expiresIn"] 타입 지정
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

// 우리가 JWT에 담을 payload 타입
export interface AuthTokenPayload {
  walletAddress: string;
  userId?: string;
}

/* ------------------------------------------------------------------
   JWT 생성
------------------------------------------------------------------ */
export function signAuthToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/* ------------------------------------------------------------------
   JWT 검증
   - 실패하면 null 반환
   - 성공하면 payload(AuthTokenPayload) 반환
------------------------------------------------------------------ */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (err) {
    console.error("JWT 검증 실패:", err);
    return null; // 토큰 유효하지 않을 때
  }
}
