import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMilestoneVote {
  voterUser?: mongoose.Types.ObjectId; // 선택: User _id
  voterWallet: string;                 // 지갑 주소
  choice: "YES" | "NO";                // 찬성 / 반대
  amount?: number;                     // 선택: 이 유저가 투자한 금액
  createdAt: Date;
}

export interface IMilestone {
  title: string;                       // 마일스톤 제목
  description?: string;                // 설명
  order: number;                       // 순서 (1~5)

  allocatedAmount: number;             // 이 마일스톤에 할당된 금액

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
  votes: IMilestoneVote[];
}

export interface IProject extends Document {
  ownerUser?: mongoose.Types.ObjectId;  // 작성자 User _id (있으면 더 좋음)
  ownerWallet: string;                  // 작성자 지갑

  // 🔥 온체인 TrustFund 컨트랙트의 projectId (uint256)
  chainProjectId?: number;

  representativeImage?: string;         // 대표 이미지 URL
  title: string;                        // 프로젝트 제목
  targetAmount: number;                 // 목표 금액 (원 또는 ETH, 네가 정한 기준)
  expectedCompletionDate?: Date;        // 예상 완료 기한
  milestones: IMilestone[];             // 마일스톤 최대 5개
  description: string;                  // 설명

  status: "FUNDING" | "COMPLETED" | "CANCELLED";

  createdAt: Date;
  updatedAt: Date;
}

const MilestoneVoteSchema = new Schema<IMilestoneVote>(
  {
    voterUser: { type: Schema.Types.ObjectId, ref: "User" },
    voterWallet: { type: String, required: true },
    choice: { type: String, enum: ["YES", "NO"], required: true },
    amount: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MilestoneSchema = new Schema<IMilestone>(
  {
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },

    allocatedAmount: { type: Number, required: true, default: 0 },

    requestSent: { type: Boolean, default: false },
    requestAt: { type: Date },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    yesCount: { type: Number, default: 0 },
    noCount: { type: Number, default: 0 },
    yesAmount: { type: Number, default: 0 },
    noAmount: { type: Number, default: 0 },

    votes: { type: [MilestoneVoteSchema], default: [] },
  },
  {
    _id: true, // 각 마일스톤마다 고유 _id
  }
);

function milestoneLimit(val: IMilestone[]) {
  return !val || val.length <= 5;
}

const ProjectSchema = new Schema<IProject>(
  {
    ownerUser: { type: Schema.Types.ObjectId, ref: "User" },
    ownerWallet: { type: String, required: true, index: true },

    // 🔥 온체인 projectId 저장용
    chainProjectId: { type: Number, index: true },

    representativeImage: { type: String },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    expectedCompletionDate: { type: Date },

    milestones: {
      type: [MilestoneSchema],
      validate: [milestoneLimit, "마일스톤은 최대 5개까지 등록할 수 있습니다."],
      default: [],
    },

    description: { type: String, required: true },

    status: {
      type: String,
      enum: ["FUNDING", "COMPLETED", "CANCELLED"],
      default: "FUNDING",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동
  }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
