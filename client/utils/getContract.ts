import { BrowserProvider, Contract } from "ethers";
import TrustFundAbi from "@/contract/TrustFund.json";
import { CONTRACT_ADDRESS } from "@/contstants/contract";

export async function getContract(provider: any) {
  if (!provider) throw new Error("Web3 provider가 없습니다.");

  const browserProvider = new BrowserProvider(provider);
  const signer = await browserProvider.getSigner();

  const network = await browserProvider.getNetwork();

  const chainId = Number(network.chainId); 
  console.log("📡 연결된 네트워크:", chainId);

  // Sepolia: 11155111
  if (chainId !== 11155111) {
    throw new Error(
      `현재 네트워크가 Sepolia가 아닙니다. (chainId: ${chainId})`
    );
  }

  return new Contract(CONTRACT_ADDRESS, TrustFundAbi.abi, signer);
}
