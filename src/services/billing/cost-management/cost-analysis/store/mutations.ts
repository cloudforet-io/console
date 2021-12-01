import { Mutation } from 'vuex';
import {
    CostAnalysisStoreState, CostQueryFilters, CostQuerySetModel, GroupByItem, Period,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import { GROUP_BY } from '@/services/billing/cost-management/lib/config';


export const setChartType: Mutation<CostAnalysisStoreState> = (state, chartType: CHART_TYPE) => {
    state.chartType = chartType;
};

export const setGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: string) => {
    state.granularity = granularity;
};

export const setGroupByItems: Mutation<CostAnalysisStoreState> = (state, groupByItems: Array<GroupByItem>) => {
    state.groupByItems = groupByItems;
};

export const setGroupBy: Mutation<CostAnalysisStoreState> = (state, groupBy?: GROUP_BY) => {
    state.groupBy = groupBy;
};

export const setPeriod: Mutation<CostAnalysisStoreState> = (state, period: Period) => {
    state.period = period;
};

export const setFilters: Mutation<CostAnalysisStoreState> = (state, filters: CostQueryFilters) => {
    state.filters = filters;
};

export const setSelectedQueryId: Mutation<CostAnalysisStoreState> = (state, selectedQueryId: string) => {
    state.selectedQueryId = selectedQueryId;
};

export const setCostQueryList: Mutation<CostAnalysisStoreState> = (state, costQueryList: CostQuerySetModel[]) => {
    state.costQueryList = costQueryList;
};
