import { Mutation } from 'vuex';
import {
    ChartData, ChartType, CostAnalysisStoreState, Currency, GroupByItem,
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

export const setGroupByItem: Mutation<CostAnalysisStoreState> = (state, groupByItem: GroupByItem) => {
    state.groupByItem = groupByItem;
};

export const setSelectedDates: Mutation<CostAnalysisStoreState> = (state, selectedDates: Array<string>) => {
    state.selectedDates = selectedDates;
};

export const setCurrency: Mutation<CostAnalysisStoreState> = (state, currency: Currency) => {
    state.currency = currency;
};

export const setChartData: Mutation<CostAnalysisStoreState> = (state, chartData: Array<ChartData>) => {
    state.chartData = chartData;
};
