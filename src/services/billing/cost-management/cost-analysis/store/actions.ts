import { CostAnalysisStoreState, GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { Action } from 'vuex';


export const getChartData: Action<CostAnalysisStoreState, any> = async ({ commit }): Promise<void|Error> => {
    try {
        const chartData = []; // todo: get new chart data
        console.log('get chart data!');
        commit('setChartData', chartData);
    } catch (e) {
        console.error(e);
        commit('setChartData', []);
    }
};

export const updateSelectedGranularity: Action<CostAnalysisStoreState, any> = async ({ commit }, granularity: string): Promise<void|Error> => {
    try {
        const chartData = []; // todo: get new chart data
        console.log('update selectedGranularity', granularity);
        commit('setSelectedGranularity', granularity);
        commit('setChartData', chartData);
    } catch (e) {
        console.error(e);
        commit('setChartData', []);
    }
};

export const updateSelectedGroupByItems: Action<CostAnalysisStoreState, any> = async ({ commit }, groupByItems: Array<GroupByItem>): Promise<void|Error> => {
    try {
        const chartData = []; // todo: get new chart data
        console.log('update selectedGroupByItems', groupByItems);
        commit('setSelectedGroupByItems', groupByItems);
        commit('setChartData', chartData);
    } catch (e) {
        console.error(e);
        commit('setChartData', []);
    }
};

// export const updateGroupBy
// export const update filter
// export const updateDate
// export const updateCurrency
