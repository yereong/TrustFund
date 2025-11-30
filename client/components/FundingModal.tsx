"use client";

import { useState } from "react";

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}


export default function FundingModal({ isOpen, onClose, onSubmit }: FundingModalProps) {
  const [amount, setAmount] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      alert("유효한 금액을 입력하세요.");
      return;
    }

    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-[#1A1A1A] p-6 rounded-xl w-[90%] max-w-md border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">펀딩 참여하기</h2>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액 입력 (ETH)"
          className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 text-white rounded-lg"
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-white text-black rounded-lg font-semibold"
          >
            참여하기
          </button>
        </div>
      </div>
    </div>
  );
}
