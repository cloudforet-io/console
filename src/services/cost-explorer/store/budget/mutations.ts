import { Mutation } from 'vuex';
import { BudgetStoreState } from '@/services/cost-explorer/store/budget/type';
import { BudgetData, BudgetUsageData } from '@/services/cost-explorer/budget/type';

export const setBudgetData: Mutation<BudgetStoreState> = (state, budgetData: Partial<BudgetData>) => {
    state.budgetData = budgetData;
};

export const setBudgetUsageData: Mutation<BudgetStoreState> = (state, budgetUsageData: Partial<BudgetUsageData>) => {
    state.budgetUsageData = budgetUsageData;
};
