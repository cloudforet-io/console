import { Mutation } from 'vuex';
import { ChartData, CostAnalysisStoreState, GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';


export const setSelectedGranularity: Mutation<CostAnalysisStoreState> = (state, granularity: string) => {
    state.selectedGranularity = granularity;
};

export const setSelectedGroupByItems: Mutation<CostAnalysisStoreState> = (state, groupByItems: Array<GroupByItem>) => {
    state.selectedGroupByItems = groupByItems;
};

export const setChartData: Mutation<CostAnalysisStoreState> = (state, chartData: Array<ChartData>) => {
    state.chartData = chartData;
};
