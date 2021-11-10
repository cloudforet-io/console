import { Mutation } from 'vuex';
import {
    ChartType, CostAnalysisStoreState, Currency, GroupByItem,
} from '@/services/billing/cost-management/cost-analysis/store/type';


export const setChartType: Mutation<CostAnalysisStoreState> = (state, chartType: ChartType) => {
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

export const setCurrency: Mutation<CostAnalysisStoreState> = (state, currency: Currency) => {
    state.currency = currency;
};

export const setFilters: Mutation<CostAnalysisStoreState> = (state, filters: Array<any>) => {
    state.filters = filters;
};
