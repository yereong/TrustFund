import Link from "next/link";

export default function HeaderNavDesktop() {
  return (
    <nav className="hidden md:flex gap-6 text-sm text-white/80">
      <Link href="/main" className="hover:text-white transition">
        전체
      </Link>
      <Link href="/popular" className="hover:text-white transition">
        인기
      </Link>
      <Link href="/new" className="hover:text-white transition">
        신규
      </Link>
      <Link href="/categories" className="hover:text-white transition">
        카테고리
      </Link>
      <Link href="/mypage" className="hover:text-white transition">
        마이페이지
      </Link>
    </nav>
  );
}
