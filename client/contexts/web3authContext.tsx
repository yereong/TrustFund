// src/contexts/web3authContext.ts
import { WEB3AUTH_NETWORK, type Web3AuthOptions } from "@web3auth/modal";
import type { Web3AuthContextConfig } from "@web3auth/modal/react";

// .env에 넣어둔 클라이언트 ID
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  // 문자열 "sapphire_devnet" 이런 거 말고, enum을 써야 TS 에러 안 남
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,

  // 선택 옵션들
  uiConfig: {
    appName: "TrustFund",
    theme: {
      primary: "#22d3ee",
    },
  },
  // sessionTime: 86400,   // 필요하면 세션 시간(초)
  // enableLogging: true,
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
  // 🔥 v10에서는 여기서 adapters, chainConfig 같은 거 안 넣어도 됨
};

export default web3AuthContextConfig;
