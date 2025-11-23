"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { BrowserProvider } from "ethers";

export default function Home() {
  const { connect, loading, isConnected, error, } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { provider, status } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    const syncUserToBackend = async () => {
      // 아직 로그인 안 됐거나, provider / userInfo 없으면 스킵
      if (!isConnected || !provider || !userInfo) return;

      try {
        // 1) EOA(지갑 주소) 가져오기
        // ethers v6
        const web3Provider = new BrowserProvider(provider as any);
        const signer = await web3Provider.getSigner();
        const walletAddress = await signer.getAddress();

        // 2) Web3Auth에서 받은 유저 정보 정리
        const payload = {
          walletAddress,
          email: userInfo.email,
          name: userInfo.name,
          profileImage: userInfo.profileImage,
         
        };

        // 3) 백엔드로 전송
        const res = await fetch("http://localhost:4000/api/auth/web3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("백엔드 동기화 응답:", data);

        if (data.redirect) {
          router.push(data.redirect);
        }

      } catch (e) {
        console.error("유저 동기화 중 에러:", e);
        // 실패해도 일단 메인으로 보내고 싶으면 여기서도 push 가능
        // router.push("/main");
      }
    };

    syncUserToBackend();
  }, [isConnected, provider, userInfo, router]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      {/* 배경 이미지 */}
      <Image
        src="/Background.svg"
        alt="Background"
        fill
        priority
        style={{ objectFit: "cover" }}
      />

      {/* 로고 / 타이틀 */}
      <motion.div
        className="z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-white font-[Inter] font-bold text-[64px] drop-shadow">
          TrustFund
        </div>

        {/* 로그인 카드 */}
        <div className="w-full max-w-xs rounded-3xl  backdrop-blur-lg border border-white/10 px-6 py-5 flex flex-col gap-3 text-white">
          {!isConnected ? (
            <>
              <button
                onClick={() => connect()}
                disabled={loading}
                className="w-full rounded-2xl bg-white text-slate-900 font-bold px-4 py-3 hover:bg-white/90 disabled:opacity-50 transition"
              >
                {loading ? "로그인 중..." : "로그인하기"}
              </button>
              {error && (
                <p className="text-xs text-red-300 mt-1">
                  {error.message ?? "로그인 중 오류가 발생했어요."}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {userInfo?.profileImage && (
                    <img
                      src={userInfo.profileImage}
                      alt="avatar"
                      className="h-7 w-7 rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {userInfo?.name || userInfo?.email || "로그인됨"}
                    </span>
                    {userInfo?.email && (
                      <span className="text-xs text-white/60">
                        {userInfo.email}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="rounded-2xl border border-white/30 px-3 py-1 text-xs hover:bg-white/10 transition"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}

          <p className="mt-1 text-[11px] text-white/50 leading-relaxed flex justify-center text-center">
            계속하면 서비스 이용약관과 개인정보 처리방침에 <br/> 동의하는 것으로
            간주됩니다.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
