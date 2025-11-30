// src/lib/web3Actions.ts
import { ethers } from "ethers";
import { getContract } from "./getContract";

/**
 * 🔥 펀딩하기 (ETH 전송)
 */
export async function fundProject(
  provider: any,
  projectId: number,
  ethAmount: string
) {
  if (!provider) throw new Error("지갑(provider)이 없습니다.");

  const contract = await getContract(provider);

  const value = ethers.parseEther(ethAmount);

  const tx = await contract.fundProject(projectId, { value });
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    receipt,
  };
}

/**
 * 🔥 프로젝트 생성 (온체인)
 * - milestoneAmounts는 ETH 단위로 들어오므로 parseEther 필요
 */
export async function createProject(
  provider: any,
  titles: string[],
  amounts: number[]
) {
  if (!provider) throw new Error("지갑(provider)이 없습니다.");

  const contract = await getContract(provider);

  // ETH → Wei 변환
  const weiAmounts = amounts.map((v) => ethers.parseEther(v.toString()));

  const tx = await contract.createProject(titles, weiAmounts);
  const receipt = await tx.wait();

  // 이벤트에서 projectId 추출
  let projectId = null;

  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "ProjectCreated") {
        projectId = Number(parsed.args.projectId);
      }
    } catch (_) {}
  }

  return {
    txHash: tx.hash,
    projectId, // 스마트컨트랙트의 projectId (uint256)
  };
}

/**
 * 🔥 마일스톤 투표
 */
export async function voteMilestone(
  provider: any,
  projectId: number,
  milestoneId: number,
  approve: boolean
) {
  if (!provider) throw new Error("지갑(provider)이 없습니다.");

  const contract = await getContract(provider);

  const tx = await contract.voteMilestone(projectId, milestoneId, approve);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    receipt,
  };
}

/**
 * 🔥 마일스톤 요청(창작자)
 */
export async function requestMilestone(
  provider: any,
  projectId: number,
  milestoneId: number
) {
  const contract = await getContract(provider);

  const tx = await contract.requestMilestone(projectId, milestoneId);
  await tx.wait();

  return tx.hash;
}

/**
 * 🔥 마일스톤 지급 승인(투표 과반 획득)
 */
export async function releaseMilestone(
  provider: any,
  projectId: number,
  milestoneId: number
) {
  const contract = await getContract(provider);

  const tx = await contract.releaseMilestone(projectId, milestoneId);
  await tx.wait();

  return tx.hash;
}
