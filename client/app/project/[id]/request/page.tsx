"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { m, motion } from "framer-motion";
import { ArrowLeft, Upload, ImageIcon, FileText } from "lucide-react";
import { milestone } from "@/interfaces/mileStone";

import { useWeb3Auth } from "@web3auth/modal/react";
import { requestMilestone as requestMilestoneOnChain } from "@/utils/contractActions";

type UploadedFilePreview = {
  file: File;
  url: string | null;
  isImage: boolean;
};

type TxStatus = "idle" | "sending" | "success" | "error";

export default function MilestoneRequestPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;

  const searchParams = useSearchParams();
  const initialmilestoneId = searchParams.get("milestoneId");

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    initialmilestoneId ?? null
  );
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFilePreview | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<milestone[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { provider } = useWeb3Auth();
  const [chainProjectId, setChainProjectId] = useState<number | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

   useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/projects/${projectId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log(data.project)
        setMilestones(data.project.milestones);
        setChainProjectId(data.project.chainProjectId);
        setLoading(false);
      } catch (error) {
        console.error("프로젝트 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    let url: string | null = null;

    if (isImage) {
      url = URL.createObjectURL(file);
    }

    setUploadedFile({ file, url, isImage });
  };

  useEffect(() => {
    return () => {
      if (uploadedFile?.url) URL.revokeObjectURL(uploadedFile.url);
    };
  }, [uploadedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!projectId) {
      alert("프로젝트 정보가 없습니다.");
      return;
    }

    if (!selectedMilestoneId) {
      alert("완료한 마일스톤을 선택해주세요.");
      return;
    }
    if (!description.trim()) {
      alert("완료 상세 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      if (!provider) {
        throw new Error("지갑이 연결되지 않았습니다.");
      }
      if (chainProjectId === null || chainProjectId === undefined) {
        throw new Error("온체인 projectId(chainProjectId)가 없습니다.");
      }

      const milestoneIndex = milestones.findIndex(
        (m) => m._id === selectedMilestoneId
      );
      if (milestoneIndex === -1) {
        throw new Error("선택한 마일스톤을 찾을 수 없습니다.");
      }

      console.log(
        "📡 온체인 마일스톤 완료 요청:",
        "projectId(체인)=",
        chainProjectId,
        "milestoneIndex=",
        milestoneIndex
      );

      setTxStatus("sending");
      const onchainResult = await requestMilestoneOnChain(
        provider,
        chainProjectId,
        milestoneIndex
      );

      console.log("✅ 온체인 마일스톤 요청 성공:", onchainResult);
      setTxHash(onchainResult.txHash);
      setTxStatus("success");

      // 1️⃣ 증빙 파일이 있으면 먼저 IPFS 업로드 (/api/upload/image)
      let proofUrl: string | null = null;

      if (uploadedFile?.file) {
        const imgForm = new FormData();
        imgForm.append("file", uploadedFile.file);

        const imgRes = await fetch("http://localhost:4000/api/upload/image", {
          method: "POST",
          body: imgForm,
          credentials: "include",
        });

        if (!imgRes.ok) {
          throw new Error("증빙 파일 업로드 실패");
        }

        const imgData = await imgRes.json();
        proofUrl = imgData.url;
        console.log("📌 IPFS 업로드 완료, url:", proofUrl);
      }

      // 2️⃣ 백엔드에 완료 보고 내용 + 증빙 URL 저장
      const res = await fetch(
        `http://localhost:4000/api/projects/${projectId}/milestones/${selectedMilestoneId}/request-completion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            description,
            proofUrl,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "마일스톤 완료 요청 실패");
      }

      alert("마일스톤 완료 요청이 제출되었습니다. (투표 대기)");
      router.push(`/project/${projectId}`);
    } catch (err: any) {
      console.error("마일스톤 완료 요청 실패:", err);
      alert(err.message ?? "요청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMilestone = milestones.find(
    (m) => m._id === selectedMilestoneId
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      {/* 헤더 */}
      <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-around">
          <Link
            href={`/project/${projectId ?? ""}`}
            className="flex items-center gap-2 text-white/80 hover:text-white ml-[-100px]"
          >
            <ArrowLeft size={20} />
            프로젝트로 돌아가기
          </Link>

          <h1 className="text-xl font-semibold">마일스톤 완료 요청</h1>

          <div className="w-8" />
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-5 py-10 space-y-8 flex flex-col justify-center items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          후원자 투표를 위한 완료 보고
        </h2>
        <p className="text-sm text-white/60">
          완료된 마일스톤과 증빙 자료를 제출하면, 후원자들이 투표를 통해 이번
          단계의 송금 여부를 결정합니다.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md space-y-8"
        >
          {/* 완료 마일스톤 선택 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">완료한 마일스톤</label>
            <select
              value={selectedMilestoneId ?? ""}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 text-sm"
            >
              {milestones.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* 마일스톤 완료 내용 상세 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">
              완료 마일스톤 상세 내용
            </label>
            <textarea
              rows={5}
              placeholder={
                selectedMilestone
                  ? `${selectedMilestone.title} 마일스톤이 어떻게 완료되었는지, 진행 과정과 결과를 상세히 작성해주세요.`
                  : "마일스톤 진행 상황을 상세히 작성해주세요."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-indigo-400 text-sm"
            />
          </div>

          {/* 증빙 자료 첨부 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">
              증빙 자료 첨부 (이미지 또는 파일)
            </label>

            <div className="flex flex-col md:flex-row gap-4">
              {/* 업로드 영역 */}
              <label className="flex-1 cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/30 bg-white/5 rounded-2xl px-4 py-6 hover:bg-white/10 transition">
                  <Upload className="text-white/80" />
                  <span className="text-sm text-white/80">
                    증빙 자료를 업로드하세요
                  </span>
                  <span className="text-[11px] text-white/50">
                    이미지, PDF, 문서 등 / 10MB 이하 권장
                  </span>
                  {uploadedFile?.file && (
                    <span className="text-xs text-cyan-300 mt-1">
                      선택된 파일: {uploadedFile.file.name}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* 미리보기 영역 */}
              {uploadedFile && (
                <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center bg-white/5">
                  {uploadedFile.isImage && uploadedFile.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadedFile.url}
                      alt="proof preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-xs text-white/70">
                      <FileText />
                      <span>파일 미리보기</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 🔥 온체인 진행 상태 표시 영역 */}
          <div className="mt-2 text-xs">
            {txStatus === "idle" && (
              <p className="text-white/50">
                제출 시 온체인 마일스톤 완료 요청 후, 백엔드에 완료 보고가
                저장됩니다.
              </p>
            )}
            {txStatus === "sending" && (
              <p className="text-amber-300">
                📡 온체인 마일스톤 완료 요청 중입니다. 지갑에서 서명을 완료한
                후, 블록에 포함되기를 기다리는 중입니다...
              </p>
            )}
            {txStatus === "success" && (
              <p className="text-emerald-300">
                ✅ 온체인 마일스톤 완료 요청이 성공적으로 처리되었습니다.
                {txHash && (
                  <>
                    {" "}
                    트랜잭션:{" "}
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {txHash.slice(0, 10)}...
                    </a>
                  </>
                )}
              </p>
            )}
            {txStatus === "error" && (
              <p className="text-red-400">
                ❌ 온체인 요청 중 오류가 발생했습니다. 네트워크 상태와 지갑
                연결을 확인한 뒤 다시 시도해주세요.
              </p>
            )}
          </div>

          {/* 제출 버튼 */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="w-full mt-2 bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition"
          >
            마일스톤 완료 요청 보내기
          </motion.button>
        </form>
      </main>
    </div>
  );
}
