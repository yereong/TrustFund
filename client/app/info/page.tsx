"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useWeb3Auth,
  useWeb3AuthUser,
  useWeb3AuthConnect,
} from "@web3auth/modal/react";
import { BrowserProvider } from "ethers";

export default function InfoPage() {
  const router = useRouter();
  const { provider } = useWeb3Auth();
  const { isConnected } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const serverApiUrl = process.env.NEXT_SERVER_API_URL || "https://3.38.41.124.nip.io";

  // 초기값: Web3Auth userInfo 로부터 가져오기
  useEffect(() => {
    if (userInfo) {
      if (userInfo.name) setNickname(userInfo.name);
      if (userInfo.email) setEmail(userInfo.email);
    }
  }, [userInfo]);

  // 로그인 안 된 상태에서 /info 들어오면 홈으로 돌려보내기 (안전장치)
  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!provider) {
      setErrorMessage("지갑 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) 지갑 주소 가져오기
      const web3Provider = new BrowserProvider(provider as any);
      const signer = await web3Provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 2) 백엔드로 전달할 데이터 구성
      const payload = {
        walletAddress,
        name: nickname.trim(),
        email: email.trim() || undefined,
      };

      console.log("전송할 프로필 데이터:", payload);
      // 3) 백엔드로 전송 (기존 /api/auth/web3 upsert 로직 재사용)
      const res = await fetch(`${serverApiUrl}/api/users/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(data);
        throw new Error(data.message || "프로필 저장에 실패했습니다.");
      }

      // 4) 저장 후 메인으로 이동
      router.push("/main");
    } catch (err: any) {
      console.error("프로필 저장 중 에러:", err);
      setErrorMessage(err.message || "알 수 없는 에러가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center mb-2">
          프로필 설정
        </h1>
        <p className="text-xs text-white/60 text-center mb-4 leading-relaxed">
          메타마스크로 로그인한 계정의 기본 정보를 설정해주세요.
          <br />
          이 정보는 추후 펀딩 참여/프로젝트 생성에 사용됩니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 */}
          <div className="space-y-1">
            <label className="text-xs text-white/70">닉네임</label>
            <input
              type="text"
              placeholder="사용할 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          {/* 이메일 */}
          <div className="space-y-1">
            <label className="text-xs text-white/70">이메일 (선택)</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-indigo-400 text-sm"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-300 mt-1 text-center">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-white text-black py-3 rounded-xl font-semibold text-sm hover:bg-white/90 disabled:opacity-60 transition"
          >
            {submitting ? "저장 중..." : "저장하고 계속하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
