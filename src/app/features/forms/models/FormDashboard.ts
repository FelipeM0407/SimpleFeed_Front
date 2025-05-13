export interface FormDashboard {
    id: number;
    name: string;
    responseCount: number;
    status: boolean;
    newFeedbackCount: number;
    lastUpdated: Date;
    createdAt: Date;
    expirationDate: Date | null;
  }
  