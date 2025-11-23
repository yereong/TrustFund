"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Project } from "@/types/Project";
import MainHeader from "@/components/layout/MainHeader";

const PAGE_SIZE = 9;

export default function MainPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false); // ✅ 실제 fetch 중인지 동기 관리

  const fetchProjects = useCallback(async () => {
    // 여기서 loading 대신 ref 사용
    if (isFetchingRef.current || !hasMore) return;

    try {
      isFetchingRef.current = true; // ✅ 즉시 반영
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(
        `http://localhost:4000/api/projects?page=${page}&limit=${PAGE_SIZE}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("프로젝트 목록을 불러오는데 실패했습니다.");
      }

      const data = await res.json();
      console.log("불러온 프로젝트 데이터:", data);

      const newProjects: Project[] = data.projects || [];

      setProjects((prev) => [...prev, ...newProjects]);

      if (newProjects.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setPage((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("프로젝트 목록 로딩 에러:", err);
      setErrorMessage(err.message ?? "알 수 없는 에러가 발생했습니다.");
    } finally {
      isFetchingRef.current = false; // ✅ 요청 끝
      setLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!hasMore || loading) return;

    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchProjects();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [fetchProjects, hasMore, loading]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-[Inter]">
      <MainHeader />

      <main className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-xl font-semibold mb-6">진행 중인 펀딩</h2>

        {errorMessage && (
          <p className="text-sm text-red-400 mb-4">{errorMessage}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {projects.map((p) => {
            const progress =
              p.progress ??
              (p.currentAmount && p.targetAmount
                ? Math.min(100, (p.currentAmount / p.targetAmount) * 100)
                : 0);

            const amountDisplay = p.currentAmount ?? p.targetAmount ?? 0;

            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition backdrop-blur-md cursor-pointer"
                onClick={() => router.push(`/project/${p._id}`)}
              >
                <div className="relative h-48 w-full">
                  <img
                    src={p.representativeImage || "/sample1.jpg"}
                    alt={p.title}
                    className="object-cover"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg leading-tight">
                    {p.title}
                  </h3>

                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-sm text-white/70">
                    {progress.toFixed(1)}% 달성 ·{" "}
                    {(amountDisplay / 10000).toFixed(1)}만원
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div
          ref={observerRef}
          className="h-10 flex items-center justify-center"
        >
          {loading && (
            <span className="text-xs text-white/60">불러오는 중...</span>
          )}
          {!hasMore && !loading && projects.length > 0 && (
            <span className="text-xs text-white/40">
              모든 프로젝트를 불러왔습니다.
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
