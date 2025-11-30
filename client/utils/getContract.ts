import { ethers } from "ethers";
import { getSigner } from "./getWeb3Signer";
import TrustFundAbi from "@/contract/TrustFund.json"; // 컴파일 후 생성된 ABI
import { CONTRACT_ADDRESS } from "@/contstants/contract";

export async function getContract(provider: any) {
  const signer = await getSigner(provider);
  return new ethers.Contract(CONTRACT_ADDRESS, TrustFundAbi.abi, signer);
}
