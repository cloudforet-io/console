import { ChartData, CostAnalysisStoreState } from '@/services/billing/cost-management/cost-analysis/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { Action } from 'vuex';
import { random } from 'lodash';


export const getChartData: Action<CostAnalysisStoreState, any> = async ({ commit, state }): Promise<void|Error> => {
    try {
        let chartData: Array<ChartData>;
        if (state.groupByItems.length) {
            chartData = [
                {
                    date: '2021-10-02',
                    seoul: random(10, 100),
                    tokyo: random(10, 100),
                    virginia: random(10, 100),
                    california: random(10, 100),
                    frankfurt: random(10, 100),
                    stockholm: random(10, 100),
                },
                {
                    date: '2021-10-03',
                    seoul: random(10, 100),
                    tokyo: random(10, 100),
                    virginia: random(10, 100),
                    california: random(10, 100),
                    frankfurt: random(10, 100),
                    stockholm: random(10, 100),
                },
                {
                    date: '2021-10-15',
                    seoul: random(10, 100),
                    tokyo: random(10, 100),
                    virginia: random(10, 100),
                    california: random(10, 100),
                    frankfurt: random(10, 100),
                    stockholm: random(10, 100),
                },
            ];
        } else {
            chartData = [
                {
                    date: '2021-10-02',
                    total_cost: random(10, 100),
                },
                {
                    date: '2021-10-03',
                    total_cost: random(10, 100),
                },
                {
                    date: '2021-10-15',
                    total_cost: random(10, 100),
                },
            ];
        }
        commit('setChartData', chartData);
    } catch (e) {
        console.error(e);
        commit('setChartData', []);
    }
};
