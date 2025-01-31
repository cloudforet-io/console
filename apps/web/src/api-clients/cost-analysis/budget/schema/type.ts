export type BudgetTimeUnit = 'MONTHLY' | 'TOTAL';
type BudgetNotificationType = 'CRITICAL' | 'WARNING';
type BudgetNotificationUnit = 'PERCENT' | 'ACTUAL_COST';

export interface BudgetNotification {
    threshold: number;
    unit: BudgetNotificationUnit;
    notification_type: BudgetNotificationType;
}

export interface BudgetPlannedLimit {
    date: string;
    limit: number;
}

export interface ProviderFilter {
    providers: string[];
    state: 'ENABLED' | 'DISABLED';
}
