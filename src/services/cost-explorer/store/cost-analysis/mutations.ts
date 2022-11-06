import type { Mutation } from 'vuex';

import type {
    CostAnalysisStoreState,
} from '@/services/cost-explorer/store/cost-analysis/type';
import type {
    CostQuerySetModel, GroupBy, Period,
    Granularity, MoreGroupByItem, CostFiltersMap,
} from '@/services/cost-explorer/type';

export const setGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: Granularity) => {
    state.granularity = granularity;
};

export const setStack: Mutation<CostAnalysisStoreState> = (state, stack: boolean) => {
    state.stack = stack;
};

export const setGroupBy: Mutation<CostAnalysisStoreState> = (state, groupBy: GroupBy[]) => {
    state.groupBy = groupBy;
};

export const setPrimaryGroupBy: Mutation<CostAnalysisStoreState> = (state, primaryGroupBy?: GroupBy | string) => {
    state.primaryGroupBy = primaryGroupBy;
};

export const setMoreGroupBy: Mutation<CostAnalysisStoreState> = (state, moreGroupBy: MoreGroupByItem[]) => {
    state.moreGroupBy = moreGroupBy;
};

export const setPeriod: Mutation<CostAnalysisStoreState> = (state, period: Period) => {
    state.period = period;
};

export const setFilters: Mutation<CostAnalysisStoreState> = (state, filters: CostFiltersMap) => {
    state.filters = filters;
};

export const setSelectedQueryId: Mutation<CostAnalysisStoreState> = (state, selectedQueryId?: string) => {
    state.selectedQueryId = selectedQueryId;
};

export const setCostQueryList: Mutation<CostAnalysisStoreState> = (state, costQueryList: CostQuerySetModel[]) => {
    state.costQueryList = costQueryList;
};
