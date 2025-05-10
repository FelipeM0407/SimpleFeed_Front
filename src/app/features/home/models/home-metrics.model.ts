export interface FeedbacksCountByDay {
    label: string;
    value: number;
}

export interface HomeMetrics {
    newFeedbacksCount: number;
    allFeedbacksCount: number;
    todayFeedbacksCount: number;
    allActiveFormsCount: number;
    feedbacksCountLast30Days: FeedbacksCountByDay[];
}
