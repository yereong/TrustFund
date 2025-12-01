interface MobileNavProps {
  isOpen: boolean;
  onNavigate: (href: string) => void;
}

export default function MobileNav({ isOpen, onNavigate }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-white/10 bg-[#0F0F0F]/95 backdrop-blur-xl">
      <nav className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-3 text-sm text-white/80">
        <button
          onClick={() => onNavigate("/main")}
          className="text-left hover:text-white transition"
        >
          전체
        </button>
        <button
          onClick={() => onNavigate("/mypage")}
          className="text-left hover:text-white transition"
        >
          마이페이지
        </button>
        <button
          onClick={() => onNavigate("/create")}
          className="mt-2 flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-white/90 transition"
        >
          글 작성
        </button>
      </nav>
    </div>
  );
}
