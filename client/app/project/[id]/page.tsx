"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// 예시 데이터
const dummyProject = {
  id: 1,
  title: "친환경 재활용 텀블러 제작 프로젝트",
  thumbnail: "/sample1.jpg",
  targetAmount: 2000000,
  currentAmount: 1440000,
  description:
    "이 프로젝트는 폐플라스틱을 재활용하여 새로운 친환경 텀블러를 제작하는 캠페인입니다. 환경 문제를 해결하면서도 실용적인 제품을 만드는 것을 목표로 하고 있습니다.",
  status: "펀딩 모집중", // 펀딩 모집중 | 모집 완료 | 취소됨 | 완료됨
  milestones: [
    { id: 1, name: "시제품 디자인", done: true, requested: false },
    { id: 2, name: "금형 제작", done: false, requested: true }, // 창작자가 완료 요청 보낸 상태 예시
    { id: 3, name: "초기 생산", done: false, requested: false },
    { id: 4, name: "배송 준비", done: false, requested: false },
  ],
};

// TODO: 실제 로그인/유저 정보 기반으로 설정
const isOwner = false;          // 본인이 생성한 글인지 여부
const hasParticipated = true;  // 본인이 참여한 펀딩인지 여부

export default function ProjectDetail() {
  const progress =
    (dummyProject.currentAmount / dummyProject.targetAmount) * 100;

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

          <div className="w-8" /> {/* 빈 공간(정렬용) */}
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-10">
        {/* 좌측: 메인 정보 */}
        <section className="space-y-8">
          {/* 썸네일 */}
          <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10">
            <Image
              src={dummyProject.thumbnail}
              alt="thumbnail"
              fill
              className="object-cover"
            />
          </div>

          {/* 제목 */}
          <h2 className="text-3xl font-bold">{dummyProject.title}</h2>

          {/* 프로젝트 상태 */}
          <div className="inline-block px-4 py-1 text-sm rounded-full border border-white/20 bg-white/5">
            {dummyProject.status}
          </div>

          {/* 설명 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">프로젝트 소개</h3>
            <p className="text-white/70 leading-relaxed">
              {dummyProject.description}
            </p>
          </div>

          {/* 마일스톤 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">마일스톤 진행 상황</h3>

            <div className="space-y-3">
              {dummyProject.milestones.map((m) => {
                const showCreatorAction = isOwner && !m.done;
                const showVoteAction =
                  !isOwner && hasParticipated && m.requested && !m.done;

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    {/* 왼쪽: 마일스톤 이름 + 상태 텍스트 */}
                    <div className="flex flex-col">
                      <span className="text-sm">{m.name}</span>
                      <span
                        className={`text-[11px] ${
                          m.done ? "text-cyan-400" : "text-white/50"
                        }`}
                      >
                        {m.done ? "완료됨" : "진행 예정"}
                      </span>
                    </div>

                    {/* 오른쪽: 유저 타입에 따른 액션 */}
                    {showCreatorAction ? (
                      <Link
                        href={`/project/${dummyProject.id}/request?milestoneId=${m.id}`}
                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300"
                      >
                        완료 요청 보내기
                      </Link>
                    ) : showVoteAction ? (
                      <Link 
                        href={`/project/${dummyProject.id}/vote?milestoneId=${m.id}`}
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

          {/* 금액 및 달성률 */}
          <div>
            <div className="text-3xl font-bold">
              {(dummyProject.currentAmount / 10000).toFixed(1)}만 원
            </div>
            <p className="text-white/60 text-sm">
              목표금액 {dummyProject.targetAmount.toLocaleString()}원
            </p>
          </div>

          {/* 진행률 바 */}
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

          {/* 펀딩하기 버튼 */}
          {dummyProject.status === "펀딩 모집중" ? (
            <button className="w-full rounded-xl bg-white text-black font-medium py-3 hover:bg-white/90 transition">
              펀딩 참여하기
            </button>
          ) : (
            <button className="w-full rounded-xl bg-white/20 text-white font-medium py-3 cursor-not-allowed">
              현재 참여 불가
            </button>
          )}
        </aside>
      </main>
    </div>
  );
}
