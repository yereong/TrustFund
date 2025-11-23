export type Project = {
  _id: string;
  title: string;
  representativeImage?: string;
  targetAmount: number;
  // 백엔드에 나중에 추가될 수도 있는 필드들 (optional)
  currentAmount?: number;
  progress?: number; // currentAmount / targetAmount 로 계산해서 내려줄 수도 있음
};