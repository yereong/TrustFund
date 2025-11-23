"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderLogo from "@/components/header/HeaderLogo";
import HeaderNavDesktop from "../header/HeaderNavDesktop";
import HeaderActions from "../header/HeaderActions";
import MobileNav from "../header/MobileNav";

export default function MainHeader() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen((prev) => !prev),
    []
  );

  const closeMobileMenuAndGo = useCallback(
    (href: string) => {
      setIsMobileMenuOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <header className="w-full border-b border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <HeaderLogo />

        <HeaderNavDesktop />

        <HeaderActions
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
        />
      </div>

      <MobileNav
        isOpen={isMobileMenuOpen}
        onNavigate={closeMobileMenuAndGo}
      />
    </header>
  );
}
