import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import type { CostAnalysisStoreState } from '@/services/cost-explorer/store/cost-analysis/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: CostAnalysisStoreState = {
    granularity: GRANULARITY.ACCUMULATED,
    stack: false,
    groupBy: [],
    primaryGroupBy: undefined,
    moreGroupBy: [],
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
