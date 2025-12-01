"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, LogOut, RefreshCw } from "lucide-react";
import {
  useWeb3AuthUser,
  useWeb3AuthDisconnect,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { ethers } from "ethers";

type MyProject = {
  id: string;
  title: string;
  status: "FUNDING" | "COMPLETED" | "CANCELLED" | string;
  targetAmount: number;
  currentAmount: number;
  progress: number; // 0~100
  createdAt?: string;
};

type MyFunding = {
  id: string;
  title: string;
  status: "FUNDING" | "COMPLETED" | "CANCELLED" | string;
  targetAmount: number;
  currentAmount: number; // 전체 모금액
  myAmount: number; // 내가 넣은 금액
  progress: number;
  createdAt?: string;
};

export default function MyPage() {
  const { userInfo } = useWeb3AuthUser();
  const { disconnect } = useWeb3AuthDisconnect();
  const { provider } = useWeb3Auth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "myProjects" | "myFundings" | "profile"
  >("myProjects");

  const [wallet, setWallet] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [myFundings, setMyFundings] = useState<MyFunding[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const serverApiUrl =
    process.env.NEXT_SERVER_API_URL || "https://3.38.41.124.nip.io";

  // 🔹 상태 한글 변환
  const renderStatus = (status: string) => {
    switch (status) {
      case "FUNDING":
        return "펀딩 모집중";
      case "COMPLETED":
        return "완료됨";
      case "CANCELLED":
        return "취소됨";
      default:
        return status;
    }
  };

  // 🔹 지갑 주소 + 잔액 조회
  const loadWalletInfo = async () => {
    try {
      if (!provider) return;

      setLoadingBalance(true);

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const address = await signer.getAddress();
      setWallet(address);

      const rawBalance = await ethersProvider.getBalance(address);
      setBalance(ethers.formatEther(rawBalance));
    } catch (err) {
      console.error("잔액 조회 실패:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  // 마이페이지 방문 시 자동으로 지갑 정보 로드
  useEffect(() => {
    loadWalletInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // 🔹 마이페이지 대시보드 API 호출 (내 프로젝트 / 참여 펀딩)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${serverApiUrl}/api/me/dashboard`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.message || "마이페이지 정보를 불러오지 못했습니다."
          );
        }

        const data = await res.json();
        console.log("마이페이지 대시보드 데이터:", data);
        setMyProjects(data.myProjects || []);
        setMyFundings(data.myFundings || []);
      } catch (err: any) {
        console.error("마이페이지 대시보드 로드 실패:", err);
        alert(
          err.message ??
            "마이페이지 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, [serverApiUrl]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      {/* 헤더 */}
      <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/main"
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </Link>

          <h1 className="text-xl font-semibold">마이페이지</h1>

          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-[1.2fr,2fr] gap-8">
        {/* 왼쪽: 프로필 카드 */}
        <section className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 grid place-items-center text-lg font-bold">
                {userInfo?.name?.[0] || userInfo?.email?.[0] || "U"}
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {userInfo?.name || "사용자"}
                </div>
                <div className="text-sm text-white/60">
                  {userInfo?.email || "이메일 미연동"}
                </div>
              </div>
            </div>

            {/* 지갑 주소 */}
            <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10 text-xs break-all">
              <div className="text-white/60 mb-1">지갑 주소</div>
              <div className="text-white">{wallet || "연결 중..."}</div>
            </div>

            {/* 잔액 */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs mt-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60">ETH 잔액</span>
                <button
                  onClick={loadWalletInfo}
                  className="text-white/60 hover:text-white transition"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="text-lg font-semibold mt-1">
                {loadingBalance ? "조회중..." : `${balance} ETH`}
              </div>

              {/* 테스트넷 충전 버튼 */}
              <button
                onClick={() => {
                  if (!wallet) return alert("지갑 주소를 찾을 수 없습니다.");
                  const faucetUrl = `https://ghostchain.io/faucet/ethereum-sepolia/?address=${wallet}`;
                  window.open(faucetUrl, "_blank");
                }}
                className="mt-3 w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-xl text-sm font-medium transition"
              >
                🔋 테스트넷 ETH 충전하기
              </button>
            </div>

            {/* 요약 통계 */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs text-white/60 mb-1">올린 글</div>
                <div className="text-lg font-semibold">
                  {myProjects.length}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs text-white/60 mb-1">참여 펀딩</div>
                <div className="text-lg font-semibold">
                  {myFundings.length}
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs text-white/60 mb-1">완료 프로젝트</div>
                <div className="text-lg font-semibold">
                  {myProjects.filter((p) => p.status === "COMPLETED").length}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                disconnect();
                router.push("/");
              }}
              className="w-full"
            >
              <div className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-white/70 bg-white/5 border border-white/20 rounded-xl py-2 hover:bg-white/10 transition">
                <LogOut size={16} />
                로그아웃
              </div>
            </button>
          </div>
        </section>

        {/* 오른쪽: 탭 + 컨텐츠 */}
        <section className="space-y-6">
          {/* 탭 */}
          <div className="flex gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab("myProjects")}
              className={`px-4 py-2 rounded-xl text-sm ${
                activeTab === "myProjects"
                  ? "bg-white text-black font-semibold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              내가 올린 글
            </button>
            <button
              onClick={() => setActiveTab("myFundings")}
              className={`px-4 py-2 rounded-xl text-sm ${
                activeTab === "myFundings"
                  ? "bg-white text-black font-semibold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              내가 참여한 펀딩
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-sm ${
                activeTab === "profile"
                  ? "bg-white text-black font-semibold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              내 정보
            </button>
          </div>

          {/* 탭별 내용 */}
          {activeTab === "myProjects" && (
            <div className="space-y-4">
              {loadingDashboard && (
                <div className="text-sm text-white/60">로딩 중...</div>
              )}

              {!loadingDashboard && myProjects.length === 0 && (
                <div className="text-sm text-white/60">
                  아직 등록한 프로젝트가 없습니다.
                </div>
              )}

              {!loadingDashboard &&
                myProjects.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm md:text-base">
                        {p.title}
                      </h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        {renderStatus(p.status)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{p.progress}% 달성</span>
                      <span>
                        {(p.currentAmount / 10000).toFixed(1)}만원 모금
                      </span>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/project/${p.id}`}
                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                      >
                        상세 보기
                      </Link>
                      <button className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
                        <Edit3 size={14} />
                        수정하기
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}

          {activeTab === "myFundings" && (
            <div className="space-y-4">
              {loadingDashboard && (
                <div className="text-sm text-white/60">로딩 중...</div>
              )}

              {!loadingDashboard && myFundings.length === 0 && (
                <div className="text-sm text-white/60">
                  아직 참여한 펀딩이 없습니다.
                </div>
              )}

              {!loadingDashboard &&
                myFundings.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm md:text-base">
                        {p.title}
                      </h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        {renderStatus(p.status)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs text-white/70 gap-1 md:gap-0">
                      <span>{p.progress}% 달성</span>
                      <span>
                        전체 모금:{" "}
                        {p.currentAmount}ETH / 내 참여:{" "}
                        {p.myAmount}ETH
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/project/${p.id}`}
                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                      >
                        프로젝트 보기
                      </Link>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-md">
              <h3 className="text-lg font-semibold mb-2">내 정보</h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/60">이름</label>
                  <input
                    type="text"
                    defaultValue={userInfo?.name || ""}
                    className="w-full bg-white/10 px-4 py-2 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60">이메일</label>
                  <input
                    type="email"
                    defaultValue={userInfo?.email || ""}
                    className="w-full bg-white/10 px-4 py-2 rounded-xl border border-white/20 focus:outline-none focus:border-indigo-400 text-sm"
                    disabled
                  />
                  <p className="text-[11px] text-white/40">
                    이메일은 Web3Auth 계정 기준으로 표시됩니다.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60">소개</label>
                  <textarea
                    rows={3}
                    placeholder="간단한 자기소개를 입력하세요."
                    className="w-full bg-white/10 px-4 py-2 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
              </div>

              <button className="w-full mt-3 bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition flex items-center justify-center gap-2">
                <Edit3 size={16} />
                정보 수정하기
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
