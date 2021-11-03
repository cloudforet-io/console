import { Mutation } from 'vuex';
import { BudgetStoreState } from '@/services/billing/cost-management/budget/store/type';
import { BudgetData } from '@/services/billing/cost-management/budget/type';

export const setBudgetData: Mutation<BudgetStoreState> = (state, budgetData: Partial<BudgetData>) => {
    state.budgetData = budgetData;
};
