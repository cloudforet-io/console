// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Getter } from 'vuex';

import type { BudgetStoreState } from '@/services/cost-explorer/store/budget/type';

export const isBudgetLoading: Getter<BudgetStoreState, any> = ({ budgetData }) => budgetData === null;
export const isBudgetUsageLoading: Getter<BudgetStoreState, any> = ({ budgetUsageData }) => budgetUsageData === null;
