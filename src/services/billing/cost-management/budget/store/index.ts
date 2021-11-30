import { BudgetStoreState } from '@/services/billing/cost-management/budget/store/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: BudgetStoreState = {
    budgetData: null,
    budgetUsageData: null,
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
