// src/contexts/web3authContext.ts
import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import type { Web3AuthOptions } from "@web3auth/modal";
import type { Web3AuthContextConfig } from "@web3auth/modal/react";

const web3AuthOptions = {
  clientId:
    "BDsxnuyLV6tBqPZMmw2VyvDCQqteHq_SvmJ16_HVVwo12awmshyI5GomoU44KeAi1k0VwufGvbjt5S3hQxodegI",
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,

  // 🔥 타입에는 없어도 실제로 지원됨
  // @ts-ignore
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x539", // Hardhat 1337 → 0x539
    rpcTarget: "http://localhost:8545",
    displayName: "Hardhat Local",
    ticker: "ETH",
    tickerName: "Ethereum",
  },
} as Web3AuthOptions;

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export default web3AuthContextConfig;
