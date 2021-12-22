import { Mutation } from 'vuex';
import {
    CostAnalysisStoreState, CostQuerySetModel,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import { GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilters, Period } from '@/services/billing/cost-management/type';


export const setGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: string) => {
    state.granularity = granularity;
};

export const setStack: Mutation<CostAnalysisStoreState> = (state, stack: boolean) => {
    state.stack = stack;
};

export const setGroupBy: Mutation<CostAnalysisStoreState> = (state, groupBy: GROUP_BY[]) => {
    state.groupBy = groupBy;
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
