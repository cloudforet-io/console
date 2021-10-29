import { CHART_TYPE, CURRENCY, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { CostAnalysisStoreState } from '@/services/billing/cost-management/cost-analysis/store/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';


const state: CostAnalysisStoreState = {
    chartType: CHART_TYPE.STACKED_COLUMN,
    granularity: GRANULARITY.DAILY,
    groupByItems: [],
    groupByItem: undefined,
    selectedDates: [],
    currency: CURRENCY.USD,
    chartData: [],
    legends: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
