import type { BudgetData, BudgetUsageData } from '@/services/cost-explorer/budget/type';

export interface BudgetStoreState {
	budgetData: Partial<BudgetData>|null;
	budgetUsageData: Partial<BudgetUsageData>|null;
}

export interface UpdateBudgetParams {
	budgetId: string;
	updateParams: any;
}
