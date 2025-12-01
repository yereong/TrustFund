"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { useWeb3Auth } from "@web3auth/modal/react";
import { voteMilestone as voteMilestoneOnChain } from "@/utils/contractActions";

type VoteChoice = "YES" | "NO" | null;
type TxStatus = "idle" | "sending" | "success" | "error";

type MilestoneVoteInfo = {
  projectId: string;
  projectTitle: string;
  chainProjectId?: number;
  milestoneIndex: number;
  milestone: {
    _id: string;
    title: string;
    order: number;
    description?: string;
    completionDetail?: string;
    proofUrl?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestSent: boolean;
    requestAt?: string;
    yesCount: number;
    noCount: number;
    yesAmount: number;
    noAmount: number;
  };
};

export default function MilestoneVotePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const projectId = params?.id as string | undefined;
  const milestoneId = searchParams.get("milestoneId");

  const serverApiUrl =
    process.env.NEXT_SERVER_API_URL || "https://3.38.41.124.nip.io";

  const { provider } = useWeb3Auth();

  const [info, setInfo] = useState<MilestoneVoteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteChoice, setVoteChoice] = useState<VoteChoice>(null);
  const [submitting, setSubmitting] = useState(false);

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !milestoneId) return;

    const fetchInfo = async () => {
      try {
        const res = await fetch(
          `${serverApiUrl}/api/projects/${projectId}/milestones/${milestoneId}/completion-info`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || "완료 보고 정보를 불러오지 못했습니다."
          );
        }

        const data = await res.json();
        setInfo(data);
      } catch (err: any) {
        console.error(err);
        alert(err.message ?? "완료 보고 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [projectId, milestoneId, serverApiUrl]);

  const handleVote = async (choice: "YES" | "NO") => {
    if (!projectId || !milestoneId || !info) return;
    if (submitting) return;

    if (!provider) {
      alert("지갑이 연결되어 있지 않습니다.");
      return;
    }

    if (
      info.chainProjectId === null ||
      info.chainProjectId === undefined ||
      info.milestoneIndex === undefined ||
      info.milestoneIndex < 0
    ) {
      alert("온체인 projectId 또는 milestoneIndex 정보가 없습니다.");
      return;
    }

    const ok = window.confirm(
      "투표 참여 후에는 변경하거나 취소할 수 없습니다.\n" +
        "온체인 트랜잭션을 포함한 작업이 진행됩니다.\n\n" +
        "정말로 이 선택으로 투표하시겠습니까?"
    );
    if (!ok) return;

    setVoteChoice(choice);
    setSubmitting(true);
    setTxStatus("sending");
    setTxHash(null);

    try {
      // 1️⃣ 온체인 투표 먼저 실행
      const approve = choice === "YES";

      console.log(
        "📡 온체인 마일스톤 투표:",
        "chainProjectId=",
        info.chainProjectId,
        "milestoneIndex=",
        info.milestoneIndex,
        "approve=",
        approve
      );

      const onchainResult = await voteMilestoneOnChain(
        provider,
        info.chainProjectId,
        info.milestoneIndex,
        approve
      );

      console.log("✅ 온체인 마일스톤 투표 성공:", onchainResult);
      setTxHash(onchainResult.txHash);
      setTxStatus("success");

      // 2️⃣ 온체인 성공 후, 백엔드에 투표 기록 저장
      const res = await fetch(
        `${serverApiUrl}/api/projects/${projectId}/milestones/${milestoneId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            choice,
            // amount는 필요하면 서버/온체인 로직에 따라 추가
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "투표 중 오류가 발생했습니다.");
      }

      alert(
        "투표가 완료되었습니다. (투표는 취소/변경할 수 없습니다)\n" +
          (onchainResult.txHash
            ? `트랜잭션 해시: ${onchainResult.txHash}`
            : "")
      );
      router.push(`/project/${projectId}`);
    } catch (err: any) {
      console.error("투표 실패:", err);
      setTxStatus("error");
      alert(err.message ?? "투표 중 오류가 발생했습니다.");

      // 실패 시 선택 초기화
      setVoteChoice(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        완료 보고 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const { projectTitle, milestone } = info;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      {/* 헤더 */}
      <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href={`/project/${projectId ?? ""}`}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            프로젝트로 돌아가기
          </Link>

          <h1 className="text-xl font-semibold">마일스톤 투표</h1>

          <div className="w-8" />
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-5 py-10 space-y-8">
        {/* 상단 소개 */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">
            {projectTitle} – 마일스톤 투표
          </h2>
          <p className="text-sm text-white/60">
            창작자가 제출한 마일스톤 완료 보고와 증빙 자료를 확인한 뒤,
            이번 단계의 송금에 대해 찬성 또는 반대를 선택해주세요.
          </p>
        </section>

        
        {/* 완료 보고 & 증빙 카드 */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-md">
          <div className="space-y-1">
            <p className="text-xs text-white/50 uppercase tracking-[0.16em]">
              마일스톤
            </p>
            <h3 className="text-xl font-semibold">
              {milestone.order}. {milestone.title}
            </h3>
            {milestone.description && (
              <p className="text-sm text-white/60 mt-1">
                {milestone.description}
              </p>
            )}
          </div>

          {/* 완료 상세 내용 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">
              창작자 완료 보고 내용
            </h4>
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white/80 whitespace-pre-wrap">
              {milestone.completionDetail
                ? milestone.completionDetail
                : "등록된 완료 보고 내용이 없습니다."}
            </div>
          </div>

          {/* 증빙 자료 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">
              증빙 자료 (IPFS)
            </h4>

            {milestone.proofUrl ? (
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* 이미지 시도 */}
                <div className="w-full md:w-56 h-56 rounded-2xl overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={milestone.proofUrl}
                    alt="proof"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지가 아닐 수도 있으니 깨지면 단순 배경으로만
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>

                <div className="text-xs text-white/70 break-all">
                  <p className="mb-1">IPFS URL</p>
                  <a
                    href={milestone.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline break-all text-cyan-300"
                  >
                    {milestone.proofUrl}
                  </a>
                  <p className="mt-2 text-white/50">
                    위 링크가 이미지가 아닌 문서/PDF일 수 있습니다. 새 탭에서
                    열어 내용을 확인해주세요.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/50">
                등록된 증빙 자료가 없습니다.
              </p>
            )}
          </div>

          {/* 상태/기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-white/60 mt-4">
            <div>
              <p className="text-white/40 mb-1">요청 상태</p>
              <p>
                {milestone.status === "PENDING"
                  ? "투표 진행 중"
                  : milestone.status === "APPROVED"
                  ? "승인됨"
                  : "반려됨"}
              </p>
            </div>
            <div>
              <p className="text-white/40 mb-1">요청 일시</p>
              <p>
                {milestone.requestAt
                  ? new Date(milestone.requestAt).toLocaleString()
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-white/40 mb-1">현재 투표 집계</p>
              <p>
                YES {milestone.yesCount} / NO {milestone.noCount}
              </p>
            </div>
          </div>
        </section>

        {/* 컨트랙트 진행 상황 표시 영역 */}
        <section className="bg-white/5 border border-white/15 rounded-2xl p-4 text-xs space-y-1">
          {txStatus === "idle" && (
            <p className="text-white/60">
              투표 시 온체인 트랜잭션(voteMilestone) 실행 후, 백엔드에 투표
              결과가 기록됩니다.
            </p>
          )}
          {txStatus === "sending" && (
            <p className="text-amber-300">
              📡 온체인 투표 트랜잭션을 전송 중입니다. 지갑에서 서명을 완료한
              뒤, 블록에 포함되기를 기다리는 중입니다...
            </p>
          )}
          {txStatus === "success" && (
            <p className="text-emerald-300">
              ✅ 온체인 투표가 성공적으로 처리되었습니다.
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
              ❌ 온체인 투표 중 오류가 발생했습니다. 네트워크 상태와 지갑
              연결을 확인한 뒤 다시 시도해주세요.
            </p>
          )}
        </section>

        {/* 투표 경고 문구 */}
        <section className="bg-red-900/30 border border-red-500/40 rounded-2xl p-4 flex gap-3 items-start">
          <AlertTriangle className="mt-1 shrink-0" size={18} />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-red-200">
              투표 참여 후에는 취소하거나 변경할 수 없습니다.
            </p>
            <p className="text-red-100/80 mt-1">
              온체인 트랜잭션으로 기록되며, 한 번 제출된 찬성/반대 투표는 되돌릴
              수 없습니다. 충분히 내용을 확인한 뒤 신중하게 선택해주세요.
            </p>
          </div>
        </section>

        {/* 투표 버튼 영역 */}
        <section className="flex flex-col md:flex-row gap-4 justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={submitting}
            onClick={() => handleVote("YES")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${
              voteChoice === "YES"
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-emerald-900 text-emerald-50 border-emerald-600 hover:bg-emerald-800"
            } disabled:opacity-60`}
          >
            {submitting && voteChoice === "YES"
              ? "찬성 투표 진행 중..."
              : "찬성"}
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={submitting}
            onClick={() => handleVote("NO")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${
              voteChoice === "NO"
                ? "bg-red-500 text-black border-red-400"
                : "bg-red-900 text-red-50 border-red-600 hover:bg-red-800"
            } disabled:opacity-60`}
          >
            {submitting && voteChoice === "NO"
              ? "반대 투표 진행 중..."
              : "반대"}
          </motion.button>
        </section>
      </main>
    </div>
  );
}
