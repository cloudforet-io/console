export type BudgetTimeUnit = 'MONTHLY' | 'TOTAL';
type BudgetNotificationUnit = 'PERCENT';
type BudgetNotificationState = 'ENABLED' | 'DISABLED';

interface BudgetNotificationPlan {
    threshold: number;
    unit: BudgetNotificationUnit;
}

export interface BudgetNotificationRecipients {
    users: string[];
}

export interface BudgetNotification {
    state: BudgetNotificationState;
    plans?: BudgetNotificationPlan[];
    recipients?: BudgetNotificationRecipients;
}

export interface BudgetPlannedLimit {
    date: string;
    limit: number;
}

export interface ProviderFilter {
    providers: string[];
    state: 'ENABLED' | 'DISABLED';
}
