// components/Web3AuthProviderWrapper.tsx
"use client";

import { Web3AuthProvider } from "@web3auth/modal/react";
import type { ReactNode } from "react";
import web3AuthContextConfig from "@/contexts/web3authContext";

export default function Web3AuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      {children}
    </Web3AuthProvider>
  );
}
