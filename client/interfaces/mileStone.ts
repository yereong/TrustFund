export interface milestone {
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
    }