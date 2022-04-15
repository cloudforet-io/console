import { Mutation } from 'vuex';
import {
    CostAnalysisStoreState,
} from '@/services/cost-explorer/store/cost-analysis/type';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import { CostQueryFilters, CostQuerySetModel, Period } from '@/services/cost-explorer/type';


export const setGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: string) => {
    state.granularity = granularity;
};

export const setStack: Mutation<CostAnalysisStoreState> = (state, stack: boolean) => {
    state.stack = stack;
};

export const setGroupBy: Mutation<CostAnalysisStoreState> = (state, groupBy: GROUP_BY[]) => {
    state.groupBy = groupBy;
};

export const setPrimaryGroupBy: Mutation<CostAnalysisStoreState> = (state, primaryGroupBy?: GROUP_BY) => {
    state.primaryGroupBy = primaryGroupBy;
};

export const setPeriod: Mutation<CostAnalysisStoreState> = (state, period: Period) => {
    state.period = period;
};

export const setFilters: Mutation<CostAnalysisStoreState> = (state, filters: CostQueryFilters) => {
    state.filters = filters;
};

export const setSelectedQueryId: Mutation<CostAnalysisStoreState> = (state, selectedQueryId?: string) => {
    state.selectedQueryId = selectedQueryId;
};

export const setCostQueryList: Mutation<CostAnalysisStoreState> = (state, costQueryList: CostQuerySetModel[]) => {
    state.costQueryList = costQueryList;
};
