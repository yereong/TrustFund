"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { GetProjectDetailResponse } from "@/types/GetProjectDetail";
import FundingModal from "@/components/FundingModal";
import { ethers, BrowserProvider } from "ethers";
import TrustFundAbi from "@/contract/TrustFund.json";
import { CONTRACT_ADDRESS } from "@/contstants/contract";
import { useWeb3Auth } from "@web3auth/modal/react";

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<GetProjectDetailResponse>(
    {} as GetProjectDetailResponse
  );
  const [openFunding, setOpenFunding] = useState(false);
  const serverApiUrl = process.env.NEXT_SERVER_API_URL || "https://3.38.41.124.nip.io";

  // 🔥 펀딩 진행 상태
  const [isFunding, setIsFunding] = useState(false);
  const [fundingStatus, setFundingStatus] = useState<string | null>(null);

  const { provider } = useWeb3Auth();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(
          `${serverApiUrl}/api/projects/${projectId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setProject(data.project);
        console.log("프로젝트 데이터:", data.project);
        setLoading(false);
      } catch (error) {
        console.error("프로젝트 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  // 🔥 펀딩 처리 로직 (온체인 + 백엔드 기록)
  const handleFunding = async (ethAmount: number) => {
    setIsFunding(true);
    setFundingStatus("📌 스마트컨트랙트 호출 준비 중...");

    try {
      if (!provider) {
        alert("지갑이 연결되지 않았습니다.");
        setFundingStatus("❌ 지갑이 연결되지 않았습니다.");
        return;
      }

      if (
        project.chainProjectId === null ||
        project.chainProjectId === undefined
      ) {
        alert("온체인 projectId(chainProjectId)가 없습니다.");
        setFundingStatus("❌ 온체인 projectId(chainProjectId)가 없습니다.");
        return;
      }

      console.log("📌 펀딩 시작: ", ethAmount, "ETH");
      console.log("📌 chainProjectId:", project.chainProjectId);

      // 1) Web3Auth → ethers Signer 생성
      setFundingStatus("📌 스마트컨트랙트 호출 중...");
      const web3Provider = new BrowserProvider(provider as any);
      await web3Provider.ready;
      const signer = await web3Provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TrustFundAbi.abi,
        signer
      );

      // ETH를 Wei로 변환
      const value = ethers.parseEther(ethAmount.toString());

      console.log("📌 스마트컨트랙트 호출 fundProject...");

      // 2) 컨트랙트에 송금 실행
      const tx = await contract.fundProject(project.chainProjectId, {
        value,
      });

      console.log("⏳ 트랜잭션 대기중...");
      setFundingStatus("⏳ 트랜잭션 대기중...");

      const receipt = await tx.wait();
      console.log("🚀 펀딩 트랜잭션 성공:", tx.hash);
      console.log("📜 receipt:", receipt);

      // 3) 백엔드에 펀딩 정보 저장
      setFundingStatus("✅ 온체인 펀딩 성공! 백엔드에 기록 중...");
      console.log("📌 백엔드에 펀딩 정보 저장...");
      await fetch(`${serverApiUrl}/api/projects/${project._id}/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: Number(ethAmount),
          txHash: tx.hash,
        }),
      });

      setFundingStatus("🎉 펀딩이 완료되었습니다!");
      alert("펀딩이 완료되었습니다!");
      setOpenFunding(false);

      // UI 다시 불러오기
      location.reload();
    } catch (err) {
      console.error("펀딩 실패:", err);
      setFundingStatus("❌ 펀딩 중 오류가 발생했습니다.");
      alert("펀딩 중 오류가 발생했습니다.");
    } finally {
      setIsFunding(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
        <p>로딩 중...</p>
      </div>
    );
  }

  const progress =
    project.targetAmount && project.targetAmount > 0
      ? (project.currentAmount / project.targetAmount) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      {/* 헤더 */}
      <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/main"
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </Link>

          <h1 className="text-xl font-semibold">프로젝트 상세</h1>

          <div className="w-8" />
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-10">
        {/* 좌측: 메인 정보 */}
        <section className="space-y-8">
          {/* 썸네일 */}
          <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            {project.representativeImage ? (
              <img
                src={project.representativeImage}
                alt="thumbnail"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                이미지 없음
              </div>
            )}
          </div>

          {/* 제목 */}
          <h2 className="text-3xl font-bold">{project.title}</h2>

          {/* 프로젝트 상태 */}
          <div className="inline-block px-4 py-1 text-sm rounded-full border border-white/20 bg-white/5">
            {project.status}
          </div>

          {/* 설명 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">프로젝트 소개</h3>
            <p className="text-white/70 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* 마일스톤 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">마일스톤 진행 상황</h3>

            <div className="space-y-3">
              {project.milestones?.map((m) => {
                const showCreatorAction =
                  project.isOwner && !(m.status === "APPROVED");
                const showVoteAction =
                  !project.isOwner &&
                  project.hasParticipated &&
                  m.requestSent &&
                  !(m.status === "APPROVED");

                return (
                  <div
                    key={m._id}
                    className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex flex-row justify-between w-full items-center">
                      <div className="text-sm">
                        {m.title}
                        <div className="text-green-400 text-[10px]">
                          요청금액: {m.allocatedAmount}
                        </div>
                      </div>
                      <div
                        className={`text-[11px] ${
                          m.status === "APPROVED"
                            ? "text-cyan-400"
                            : "text-white/50"
                        }`}
                      >
                        {m.status === "APPROVED" ? "완료됨" : "진행 예정"}
                      </div>
                    </div>

                    {showCreatorAction && project.status == 'COMPLETED' ? (
                      <Link
                        href={`/project/${project._id}/request?milestoneId=${m._id}`}
                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 ml-4 w-20"
                      >
                        완료 요청
                      </Link>
                    ) : showVoteAction ? (
                      <Link
                        href={`/project/${project._id}/vote?milestoneId=${m._id}`}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        투표하기
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 우측: 펀딩 정보 패널 */}
        <aside className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-28 h-fit space-y-6 backdrop-blur-md">
          <h3 className="text-xl font-semibold">펀딩 정보</h3>

          <div>
            <div className="text-3xl font-bold">
              {project.currentAmount} ETH
            </div>
            <p className="text-white/60 text-sm">
              목표금액 {project.targetAmount.toLocaleString()}ETH
            </p>
          </div>

          <div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-white/60 text-sm mt-2">
              {progress.toFixed(1)}% 달성
            </p>
          </div>

          {project.status === "FUNDING" ? (
            <button
              className="w-full rounded-xl bg-white text-black font-medium py-3 hover:bg:white/90 transition"
              onClick={() => {
                setFundingStatus(null);
                setOpenFunding(true);
              }}
            >
              펀딩 참여하기
            </button>
          ) : (
            <button className="w-full rounded-xl bg:white/20 text-white font-medium py-3 cursor-not-allowed">
              현재 참여 불가
            </button>
          )}
        </aside>
      </main>

      <FundingModal
        isOpen={openFunding}
        onClose={() => setOpenFunding(false)}
        onSubmit={handleFunding}
        loading={isFunding}
        statusMessage={fundingStatus || undefined}
      />
    </div>
  );
}
