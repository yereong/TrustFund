"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, ImageIcon, FileText } from "lucide-react";

type UploadedFilePreview = {
  file: File;
  url: string | null;
  isImage: boolean;
};

// TODO: 실제 데이터 연동 시 API로 교체
const dummyMilestones = [
  { id: 1, name: "시제품 디자인 완료" },
  { id: 2, name: "금형 제작 완료" },
  { id: 3, name: "초기 생산 완료" },
];

export default function MilestoneRequestPage() {
  const params = useParams();
  const projectId = params?.id;

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    dummyMilestones[0]?.id ?? null
  );
  const [description, setDescription] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFilePreview | null>(
    null
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMilestoneId) {
      alert("완료한 마일스톤을 선택해주세요.");
      return;
    }
    if (!requestAmount) {
      alert("이번 송금 요청 금액을 입력해주세요.");
      return;
    }

    // TODO: 여기서 실제 API 호출 또는 스마트컨트랙트 트랜잭션 연결
    // - projectId
    // - selectedMilestoneId
    // - description
    // - requestAmount
    // - uploadedFile.file
    console.log({
      projectId,
      selectedMilestoneId,
      description,
      requestAmount,
      uploadedFile,
    });

    alert("마일스톤 완료 요청이 제출되었습니다. (투표 대기)");
  };

  const selectedMilestone = dummyMilestones.find(
    (m) => m.id === selectedMilestoneId
  );

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

          <h1 className="text-xl font-semibold">마일스톤 완료 요청</h1>

          <div className="w-8" />
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-5 py-10 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">
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
              onChange={(e) => setSelectedMilestoneId(Number(e.target.value))}
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 text-sm"
            >
              {dummyMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
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
                  ? `${selectedMilestone.name} 마일스톤이 어떻게 완료되었는지, 진행 과정과 결과를 상세히 작성해주세요.`
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

          {/* 송금 요청 금액 */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">
              다음 마일스톤 진행을 위한 송금 요청 금액 (원)
            </label>
            <input
              type="number"
              placeholder="예: 500000 (이번 단계에 필요한 금액)"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="w-full bg-white/10 px-4 py-3 rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:border-cyan-400 text-sm"
            />
            <p className="text-[11px] text-white/50">
              이 금액은 후원자 투표에서 승인될 경우, 스마트컨트랙트에서 자동으로
              송금됩니다.
            </p>
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
