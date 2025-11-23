import Link from "next/link";
import { Bell, Plus, Menu, X } from "lucide-react";

interface HeaderActionsProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export default function HeaderActions({
  isMobileMenuOpen,
  onToggleMobileMenu,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* 글 작성 버튼 (데스크탑) */}
      <Link
        href="/create"
        className="hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-white/90 transition"
      >
        <Plus size={18} /> 글 작성
      </Link>

      {/* 알림 아이콘 */}
      <button className="relative">
        <Bell
          size={22}
          className="text-white/90 hover:text-white transition"
        />
        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
      </button>

      {/* 모바일 메뉴 토글 버튼 */}
      <button className="md:hidden" onClick={onToggleMobileMenu}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
