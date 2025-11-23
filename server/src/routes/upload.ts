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
      if (!req.file) {
        return res.status(400).json({ message: "파일이 없습니다." });
      }

      const { buffer, originalname } = req.file;

      const result = await uploadToIPFS(buffer, originalname);

      return res.status(200).json({
        cid: result.cid,
        url: result.url,
      });
    } catch (err) {
      console.error("[POST /api/upload/image] error:", err);
      return res.status(500).json({ message: "IPFS 업로드 실패" });
    }
  }
);

export default router;
