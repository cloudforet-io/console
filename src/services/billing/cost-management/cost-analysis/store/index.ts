import { CHART_TYPE, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { CostAnalysisStoreState } from '@/services/billing/cost-management/cost-analysis/store/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';


const state: CostAnalysisStoreState = {
    selectedChartType: CHART_TYPE.STACKED_COLUMN,
    selectedGranularity: GRANULARITY.DAILY,
    selectedGroupByItems: [],
    selectedDates: [],
    chartData: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
