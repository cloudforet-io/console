import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { CostAnalysisStoreState } from '@/services/cost-explorer/cost-analysis/store/type';
import { getInitialDates } from '@/services/cost-explorer/cost-analysis/lib/helper';
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';


const state: CostAnalysisStoreState = {
    granularity: GRANULARITY.ACCUMULATED,
    stack: false,
    groupBy: [],
    primaryGroupBy: undefined,
    period: getInitialDates(),
    filters: {},
    selectedQueryId: undefined,
    costQueryList: [],
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    actions,
    mutations,
    getters,
};
