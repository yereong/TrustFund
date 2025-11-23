"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Plus, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

// 더미 데이터 예시
const dummyProjects = [
  {
    id: 1,
    title: "친환경 재활용 텀블러 프로젝트",
    thumbnail: "/sample1.jpg",
    progress: 72,
    amount: 1440000,
  },
  {
    id: 2,
    title: "스마트 IoT 반려동물 급식기",
    thumbnail: "/sample2.jpg",
    progress: 45,
    amount: 900000,
  },
  {
    id: 3,
    title: "휴대용 미니 공기청정기",
    thumbnail: "/sample3.jpg",
    progress: 88,
    amount: 2200000,
  },
];

export default function MainPage() {
    const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      {/* ---------------------------------------------- */}
      {/* 헤더 */}
      {/* ---------------------------------------------- */}
      <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/main" className="text-2xl font-bold tracking-tight">
            TrustFund
          </Link>

          {/* 네비게이터 */}
          <nav className="hidden md:flex gap-6 text-sm text-white/80">
            <Link href="/main" className="hover:text-white transition">전체</Link>
            <Link href="/popular" className="hover:text-white transition">인기</Link>
            <Link href="/new" className="hover:text-white transition">신규</Link>
            <Link href="/categories" className="hover:text-white transition">카테고리</Link>
                        <Link href="/mypage" className="hover:text-white transition">마이페이지</Link>

          </nav>

          {/* 아이콘 그룹 */}
          <div className="flex items-center gap-4">
            {/* 글 작성 버튼 */}
            <Link
              href="/create"
              className="hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-white/90 transition"
            >
              <Plus size={18} /> 글 작성
            </Link>

            {/* 알림 아이콘 */}
            <button className="relative">
              <Bell size={22} className="text-white/90 hover:text-white transition" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* 모바일 메뉴 */}
            <button className="md:hidden">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------- */}
      {/* 메인 컨텐츠 */}
      {/* ---------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-xl font-semibold mb-6">진행 중인 펀딩</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {dummyProjects.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition backdrop-blur-md cursor-pointer"
            >
                <div onClick={()=>router.push(`/project/${p.id}`)}>
                     {/* 썸네일 */}
                    <div className="relative h-48 w-full">
                        <Image
                        src={p.thumbnail}
                        alt={p.title}
                        fill
                        className="object-cover"
                        />
                    </div>

                    {/* 내용 */}
                    <div className="p-5 space-y-3">
                        <h3 className="font-semibold text-lg leading-tight">{p.title}</h3>

                        {/* 진행률 바 */}
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                            style={{ width: `${p.progress}%` }}
                        />
                        </div>

                        {/* 금액 */}
                        <p className="text-sm text-white/70">
                        {p.progress}% 달성 · {(p.amount / 10000).toFixed(1)}만원
                        </p>
                    </div>
                </div>
             
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
