import { BrowserProvider } from "ethers";

export async function getSigner(provider: any) {
  if (!provider) throw new Error("Web3Auth provider not found");

  const ethersProvider = new BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  return signer;
}
