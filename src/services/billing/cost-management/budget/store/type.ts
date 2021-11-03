import { BudgetData } from '@/services/billing/cost-management/budget/type';

export interface BudgetStoreState {
	budgetData: Partial<BudgetData>|null;
}

export interface UpdateBudgetParams {
	budgetId: string;
	updateParams: object;
}
