export interface FormDashboard {
    id: number;
    name: string;
    responseCount: number;
    status: boolean;
    newFeedbackCount: number;
    lastUpdated: Date;
    createdAt: Date;
    inativationDate: Date | null;
  }
  