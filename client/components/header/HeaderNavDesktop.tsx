import Link from "next/link";

export default function HeaderNavDesktop() {
  return (
    <nav className="hidden md:flex gap-6 text-sm text-white/80 ">
      <Link href="/main" className="hover:text-white transition">
        전체
      </Link>
      <Link href="/mypage" className="hover:text-white transition">
        마이페이지
      </Link>
    </nav>
  );
}
