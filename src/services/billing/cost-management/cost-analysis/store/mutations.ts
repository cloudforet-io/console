import { Mutation } from 'vuex';
import {
    ChartData, ChartType, CostAnalysisStoreState, GroupByItem,
} from '@/services/billing/cost-management/cost-analysis/store/type';

export const setSelectedChartType: Mutation<CostAnalysisStoreState> = (state, chartType: ChartType) => {
    state.selectedChartType = chartType;
};

export const setSelectedGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: string) => {
    state.selectedGranularity = granularity;
};

export const setSelectedGroupByItems: Mutation<CostAnalysisStoreState> = (state, groupByItems: Array<GroupByItem>) => {
    state.selectedGroupByItems = groupByItems;
};

export const setSelectedDates: Mutation<CostAnalysisStoreState> = (state, selectedDates: Array<string>) => {
    state.selectedDates = selectedDates;
};

export const setChartData: Mutation<CostAnalysisStoreState> = (state, chartData: Array<ChartData>) => {
    state.chartData = chartData;
};
