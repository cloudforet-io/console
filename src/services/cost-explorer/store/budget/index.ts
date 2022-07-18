import type { BudgetStoreState } from '@/services/cost-explorer/store/budget/type';

import * as actions from './actions';
import * as getters from './getters';
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
