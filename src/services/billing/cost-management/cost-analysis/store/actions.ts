import dayjs from 'dayjs';
import { Action } from 'vuex';

import {
    ChartData, CostAnalysisStoreState, Granularity,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import { GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { Legend } from '@/common/composables/dynamic-chart/type';


interface Value {
    usd_cost: number;
    [key: string]: any;
}
interface RawData {
    date: string;
    values: Array<Value>;
}


const convertGranularity = (selectedDates: Array<string>, granularity: Granularity): Granularity => {
    const start = dayjs(selectedDates[0]);
    const end = dayjs(selectedDates[1]);

    if (granularity === GRANULARITY.ACCUMULATED) {
        if (end.diff(start, 'month') < 2) {
            return GRANULARITY.DAILY;
        } if (end.diff(start, 'year') < 2) {
            return GRANULARITY.MONTHLY;
        }
        return GRANULARITY.YEARLY;
    }
    return granularity;
};

const getLegendsFromGroupByValues = (groupByValues: Set<string>, groupBy?: string): Array<Legend> => {
    let legends: Array<Legend>;
    if (groupBy) {
        legends = [...groupByValues].map(d => ({
            name: d as string,
            label: d as string,
            disabled: false,
        }));
    } else {
        legends = [{ name: 'total_cost', label: 'Total Cost', disabled: false }];
    }
    return legends;
};
const convertChartDataAndLegends = (rawData: Array<RawData>, groupBy?: string): { chartData: Array<ChartData>; legends: Array<Legend> } => {
    const chartData: Array<ChartData> = [];
    const groupByValues = new Set<string>();

    rawData.forEach((d) => {
        const dateData: ChartData = { date: d.date }; // todo: timezone 으로 바꿔야 하나?
        if (groupBy) {
            d.values.forEach((value) => {
                dateData[value[groupBy]] = value.usd_cost;
                if (value[groupBy]) groupByValues.add(value[groupBy]);
            });
        } else {
            d.values.forEach((value) => {
                dateData.total_cost = value.usd_cost;
            });
        }
        chartData.push(dateData);
    });

    const legends = getLegendsFromGroupByValues(groupByValues, groupBy);
    return { chartData, legends };
};

export const listChartData: Action<CostAnalysisStoreState, any> = async ({ commit, state }): Promise<void|Error> => {
    try {
        const granularity = convertGranularity(state.selectedDates, state.granularity);
        const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
            granularity,
            group_by: state.groupByItems.map(d => d.name),
            filter: [],
            start: state.selectedDates[0],
            end: state.selectedDates[1],
            pivot_type: 'CHART',
        });
        const { chartData, legends } = convertChartDataAndLegends(results, state.groupBy);
        commit('setChartData', chartData);
        commit('setLegends', legends);
    } catch (e) {
        console.error(e);
        commit('setChartData', []);
        commit('setLegends', []);
    }
};

export const getTableData: Action<CostAnalysisStoreState, any> = async ({ commit, state }): Promise<void|Error> => {
    try {
        // const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
        //     granularity: state.granularity,
        //     groups: state.groupByItems,
        //     filter: [],
        //     start: state.selectedDates[0],
        //     end: state.selectedDates[1],
        //     pivot_type: 'TABLE'
        // });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const getSelectedQueryItem: Action<CostAnalysisStoreState, any> = async ({ commit, state }, queryItemId): Promise<void|Error> => {
    try {
        const { options } = await SpaceConnector.client.costAnalysis.costQuerySet.get({ cost_query_set_id: queryItemId });
        commit('setChartType', options.chart_type);
        commit('setGranularity', options.granularity);
        commit('setGroupByItems', options.group_by);
        commit('setSelectedDates', [options.start, options.end]);
        commit('setCurrency', options.currency);
        commit('setFilters', options.filter);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
