// src/ipfs.ts
import axios, { AxiosError } from "axios";
import FormData from "form-data";

export const uploadToIPFS = async (fileBuffer: Buffer, fileName: string) => {
  try {
    if (!process.env.PINATA_JWT) {
      console.error("[Pinata] PINATA_JWT 가 설정되어 있지 않습니다.");
      throw new Error("PINATA_JWT env 누락");
    }

    const formData = new FormData();
    formData.append("file", fileBuffer, { filename: fileName });

    console.log("[Pinata] 업로드 시작:", {
      fileName,
      size: fileBuffer.length,
    });

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("[Pinata] 업로드 성공:", res.data);

    const cid = res.data.IpfsHash;
    const gateway =
      process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

    return {
      cid,
      url: `${gateway}${cid}`,
    };
  } catch (err) {
    // 🔍 디버깅용 상세 로그
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<any>;
      console.error("[Pinata Axios error status]", axiosErr.response?.status);
      console.error("[Pinata Axios error data]", axiosErr.response?.data);
      console.error("[Pinata Axios error headers]", axiosErr.response?.headers);
    } else {
      console.error("[Pinata unknown error]", err);
    }

    throw new Error("Pinata 업로드 실패");
  }
};
