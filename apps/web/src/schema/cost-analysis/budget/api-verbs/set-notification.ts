import type { BudgetNotification } from '@/schema/cost-analysis/budget/type';

export interface BudgetSetNotificationParameters {
    budget_id: string;
    notifications: BudgetNotification[];
}
