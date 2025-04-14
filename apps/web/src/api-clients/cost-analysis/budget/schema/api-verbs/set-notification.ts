import type { BudgetNotification } from '@/api-clients/cost-analysis/budget/schema/type';

export interface BudgetSetNotificationParameters {
    budget_id: string;
    notification: BudgetNotification;
}
