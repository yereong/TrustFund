export type GetProjectDetailResponse = {
    createdAt: string;
    description: string;
    expectedCompletionDate?: string;
    hasParticipated: boolean;
    isOwner: boolean;
    milestones: {
        _id: string;
        title: string;
        allocatedAmount: number;
        noAmount: number;
        noCount: number;
        order: number;
        requestSent: boolean;
        status: "PENDING" | "APPROVED" | "REJECTED";
        votes: {
            amount?: number;
            choice: "YES" | "NO";
            createdAt: string;
            voterUser?: string;
            voterWallet: string;
        }[];
        yesAmount: number;
        yesCount: number;
    }[];
    ownerUser?: string;
    ownerWallet: string;
    representativeImage?: string;
    status: "FUNDING" | "COMPLETED" | "CANCELLED";
    targetAmount: number;
    currentAmount: number;
    title: string;
    updatedAt: string;
    chainProjectId:number;
    _id: string;
};