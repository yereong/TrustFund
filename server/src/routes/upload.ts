// src/routes/upload.ts
import { Router } from "express";
import multer from "multer";
import { uploadToIPFS } from "../ipfs";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/image",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    try {
      // 🔍 1) 요청 들어올 때 기본 정보 로그
      console.log("[POST /api/upload/image] 요청 도착", {
        userId: req.auth?.userId,
        walletAddress: req.auth?.walletAddress,
        hasFile: !!req.file,
      });

      if (!req.file) {
        console.warn("[POST /api/upload/image] 파일 없음");
        return res.status(400).json({ message: "파일이 없습니다." });
      }

      const { buffer, originalname, mimetype, size } = req.file;

      // 🔍 2) 파일 메타데이터 로그
      console.log("[POST /api/upload/image] 파일 정보", {
        originalname,
        mimetype,
        size,
      });

      // 🔥 3) IPFS 업로드 호출 전 로그
      console.log("[POST /api/upload/image] IPFS 업로드 시작...");

      const result = await uploadToIPFS(buffer, originalname);

      // ✅ 4) 성공 로그
      console.log("[POST /api/upload/image] IPFS 업로드 성공", {
        cid: result.cid,
        url: result.url,
      });

      return res.status(200).json({
        cid: result.cid,
        url: result.url,
      });
    } catch (err: any) {
      // ❌ 5) 에러 상세 로그
      console.error("[POST /api/upload/image] error 발생");

      if (err instanceof Error) {
        console.error("  ├─ name   :", err.name);
        console.error("  ├─ message:", err.message);
        console.error("  └─ stack  :", err.stack);
      } else {
        console.error("  └─ raw error:", err);
      }

      // 필요하면 클라이언트로도 detail 내려주기 (개발 중에만)
      return res.status(500).json({
        message: "IPFS 업로드 실패",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

export default router;
