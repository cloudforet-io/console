import { Mutation } from 'vuex';
import { BudgetStoreState } from '@/services/billing/cost-management/budget/store/type';
import { BudgetData, BudgetUsageData } from '@/services/billing/cost-management/budget/type';

export const setBudgetData: Mutation<BudgetStoreState> = (state, budgetData: Partial<BudgetData>) => {
    state.budgetData = budgetData;
};

export const setBudgetUsageData: Mutation<BudgetStoreState> = (state, budgetUsageData: Partial<BudgetUsageData>) => {
    state.budgetUsageData = budgetUsageData;
};
