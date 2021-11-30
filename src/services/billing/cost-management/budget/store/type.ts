import { BudgetData, BudgetUsageData } from '@/services/billing/cost-management/budget/type';

export interface BudgetStoreState {
	budgetData: Partial<BudgetData>|null;
	budgetUsageData: Partial<BudgetUsageData>|null;
}

export interface UpdateBudgetParams {
	budgetId: string;
	updateParams: object;
}
