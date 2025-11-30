"use client";

import { useState } from "react";

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>; // ⬅ async로 변경
  loading?: boolean;
  statusMessage?: string | null;
}

export default function FundingModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  statusMessage,
}: FundingModalProps) {
  const [amount, setAmount] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    try {
      await onSubmit(value);
    } catch (e) {
      // 에러 메시지는 부모에서 이미 처리하니까 여기선 조용히 무시해도 됨
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#1A1A1A] p-6 rounded-xl w-[90%] max-w-md border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">
          펀딩 참여하기
        </h2>

        {/* 진행 상태 메시지 */}
        {statusMessage && (
          <p className="text-xs text-white/60 mb-2 whitespace-pre-line">
            {statusMessage}
          </p>
        )}

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액 입력 (ETH)"
          className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white mb-4"
          disabled={loading}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 text-white rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-white text-black rounded-lg font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "진행 중..." : "참여하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
