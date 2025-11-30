
export interface Project {
  _id: string;
  ownerUser?: string;
  ownerWallet: string;
  title: string;
  targetAmount: number;
  milestones: Milestone[];
  description: string;
  status: "FUNDING" | "COMPLETED" | "CANCELLED";
}

export interface Milestone {
  title: string;                       // 마일스톤 제목
  description?: string;                // 설명
  order: number;                       // 순서 (1~5)

  // 마일스톤 완료 요청 및 상태
  requestSent: boolean;                // 창작자가 완료 요청 보냈는지
  requestAt?: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";

  // 투표 집계
  yesCount: number;
  noCount: number;
  yesAmount: number;
  noAmount: number;

  // 개별 투표 내역
 // votes: IMilestoneVote[];
}