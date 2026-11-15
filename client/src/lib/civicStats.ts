export interface CivicStats {
  total: number;
  reported: number;
  underReview: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  aiVerified: number;
  duplicateReports: number;
  authoritiesConnected: number;
  averageResponseHours: number | null;
  responseSampleSize: number;
  latestReport: {
    title: string;
    category: string;
    status: string;
    severity: string;
    priorityScore: number;
    aiVerified: boolean;
    aiCategory: string | null;
    aiConfidence: number | null;
    duplicateDetected: boolean;
    department: string | null;
    createdAt: string;
  } | null;
}
