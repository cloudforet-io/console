import { Mutation } from 'vuex';
import {
    CostAnalysisStoreState, GroupByItem,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import {
    CHART_TYPE, CURRENCY, FILTER_ITEM, FilterItem,
} from '@/services/billing/cost-management/cost-analysis/lib/config';


export const setChartType: Mutation<CostAnalysisStoreState> = (state, chartType: CHART_TYPE) => {
    state.chartType = chartType;
};

export const setGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: string) => {
    state.granularity = granularity;
};

export const setGroupByItems: Mutation<CostAnalysisStoreState> = (state, groupByItems: Array<GroupByItem>) => {
    state.groupByItems = groupByItems;
};

export const setGroupBy: Mutation<CostAnalysisStoreState> = (state, groupBy?: string) => {
    state.groupBy = groupBy;
};

export const setSelectedDates: Mutation<CostAnalysisStoreState> = (state, selectedDates: Array<string>) => {
    state.selectedDates = selectedDates;
};

export const setCurrency: Mutation<CostAnalysisStoreState> = (state, currency: CURRENCY) => {
    state.currency = currency;
};

export const setFilters: Mutation<CostAnalysisStoreState> = (state, filters: Record<FILTER_ITEM, FilterItem[]>) => {
    state.filters = filters;
};
