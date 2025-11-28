"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const router = useRouter();

  const [milestones, setMilestones] = useState([{ id: 1, name: "", amount: "" }]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState(0);

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now(), name: "", amount: "" }]);
  };

  const updateMilestone = (id: number, key: "name" | "amount", value: string) => {
  const updated = milestones.map((m) =>
    m.id === id ? { ...m, [key]: value } : m
  );

  setMilestones(updated);

  const sum = updated.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  setTargetAmount(sum);
};



  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  // 이미지 파일 선택 시 미리보기 URL 생성
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
  };

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(null);
      return;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [thumbnailFile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData(e.currentTarget);
      const title = (formData.get("title") as string)?.trim();
      const expectedEnd = formData.get("expectedEnd") as string;
      const description = (formData.get("description") as string)?.trim();

      const totalAmount = targetAmount;

      // 간단 검증
      if (!title || !targetAmount || !description) {
        setErrorMessage("제목, 목표 금액, 설명은 필수입니다.");
        return;
      }

      // 1️⃣ 썸네일 이미지가 있으면 먼저 Pinata(IPFS)에 업로드
      let representativeImage: string | null = null;

      if (thumbnailFile) {
        const imgFormData = new FormData();
        imgFormData.append("file", thumbnailFile);

        const imgRes = await fetch("http://localhost:4000/api/upload/image", {
          method: "POST",
          body: imgFormData,
          credentials: "include", // JWT 쿠키 사용 중이면 유지
        });

        if (!imgRes.ok) {
          const data = await imgRes.json().catch(() => ({}));
          throw new Error(
            data.message ?? "이미지 업로드 중 오류가 발생했습니다."
          );
        }

        const imgData = await imgRes.json();
        representativeImage = imgData.url; // 👈 IPFS 게이트웨이 URL
      }

      // 2️⃣ 마일스톤 데이터 변환 (백엔드에서 기대하는 형태)
      const milestonePayload = milestones
        .map((m, idx) => {
          if (!m.name.trim() || !m.amount) return null;

          return {
            title: m.name.trim(),
            order: idx + 1,
            allocatedAmount: Number(m.amount),
          };
        })
        .filter(Boolean);



      // 3️⃣ 프로젝트 생성 요청
      const payload = {
        title,
        targetAmount: totalAmount,
        expectedCompletionDate: expectedEnd || undefined,
        description,
        representativeImage, 
        milestones: milestonePayload,
      };

      const res = await fetch("http://localhost:4000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // JWT 쿠키 포함
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ?? "프로젝트 생성 중 오류가 발생했습니다."
        );
      }

      // 성공 시 메인 화면으로 이동 (또는 상세 페이지로 이동도 가능)
      router.push("/main");
    } catch (err: any) {
      console.error("프로젝트 생성 에러:", err);
      setErrorMessage(err.message ?? "알 수 없는 에러가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      {/* 헤더 */}
      <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/main"
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </Link>

          <h1 className="text-xl font-semibold">새 프로젝트 만들기</h1>

          <div className="w-8" />
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-5 py-10 space-y-10">
        <h2 className="text-3xl font-bold mb-4">프로젝트 정보 입력</h2>

        {errorMessage && (
          <p className="text-sm text-red-400 mb-2">{errorMessage}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md space-y-8"
        >
          {/* 썸네일 이미지 업로드 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">대표 이미지</label>

            <div className="flex flex-col md:flex-row gap-4">
              {/* 업로드 영역 */}
              <label className="flex-1 cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/30 bg-white/5 rounded-2xl px-4 py-6 hover:bg-white/10 transition">
                  <ImageIcon className="text-white/70" />
                  <span className="text-sm text-white/80">
                    클릭해서 이미지를 업로드하세요
                  </span>
                  <span className="text-[11px] text-white/50">
                    JPG, PNG 등 이미지 파일 / 10MB 이하 권장
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
              </label>

              {/* 미리보기 */}
              {thumbnailPreview && (
                <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview}
                    alt="thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">프로젝트 제목</label>
            <input
              type="text"
              name="title"
              placeholder="예: 친환경 재활용 텀블러 만들기"
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 목표 금액 (자동 계산됨) */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">목표 금액 (자동 계산)</label>
            <input
              type="number"
              name="targetAmount"
              value={targetAmount}
              disabled
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 text-white
                        placeholder-white/40 opacity-60 cursor-not-allowed"
            />
          </div>


          {/* 예상 완료 기한 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">예상 완료 기한</label>
            <input
              type="date"
              name="expectedEnd"
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 text-white"
            />
          </div>

        {/* 마일스톤 */}
        <div className="space-y-3">
          <label className="text-sm text-white/70">마일스톤</label>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                {/* 마일스톤 이름 */}
                <input
                  type="text"
                  placeholder={`마일스톤 ${idx + 1} 이름`}
                  value={m.name}
                  onChange={(e) =>
                    updateMilestone(m.id, "name", e.target.value)
                  }
                  className="flex-1 bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-indigo-400"
                />

                {/* 필요 금액 */}
                <input
                  type="number"
                  placeholder="필요 금액 (원)"
                  value={m.amount}
                  onChange={(e) =>
                    updateMilestone(m.id, "amount", e.target.value)
                  }
                  className="w-40 bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-cyan-400"
                />

                {/* 삭제 */}
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="p-2 bg-white/10 border border-white/20 rounded-xl hover:bg-red-500/20 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* 마일스톤 추가 */}
          <button
            type="button"
            onClick={addMilestone}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mt-2"
          >
            <Plus size={16} /> 마일스톤 추가
          </button>
        </div>


          {/* 설명 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">프로젝트 설명</label>
            <textarea
              name="description"
              rows={6}
              placeholder="프로젝트의 스토리를 작성해주세요. (제품 소개, 해결하는 문제, 왜 필요한지 등)"
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-black py-4 rounded-xl font-semibold hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "등록 중..." : "프로젝트 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
