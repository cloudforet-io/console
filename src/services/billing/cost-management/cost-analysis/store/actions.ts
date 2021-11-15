import { Action } from 'vuex';

import {
    CHART_TYPE, CostQuerySetModel, CURRENCY, GRANULARITY,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { CostAnalysisStoreState } from '@/services/billing/cost-management/cost-analysis/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { getInitialDates } from '@/services/billing/cost-management/cost-analysis/lib/helper';


export const getSelectedQueryItem: Action<CostAnalysisStoreState, any> = async ({ commit }, queryItemId): Promise<void|Error> => {
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

export const initCostAnalysisStoreState: Action<CostAnalysisStoreState, any> = ({ commit }): void => {
    commit('setChartType', CHART_TYPE.STACKED_COLUMN);
    commit('setGranularity', GRANULARITY.ACCUMULATED);
    commit('setGroupByItems', []);
    commit('setGroupBy', undefined);
    commit('setSelectedDates', getInitialDates());
    commit('setCurrency', CURRENCY.USD);
    commit('setFilters', []);
    commit('setSelectedQueryId', undefined);
};

export const listCostQueryList: Action<CostAnalysisStoreState, any> = async ({ commit }): Promise<void|Error> => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list();
        commit('setCostQueryList', results);
    } catch (e) {
        ErrorHandler.handleError(e);
        commit('setCostQueryList', []);
    }
};

export const saveQuery: Action<CostAnalysisStoreState, any> = async ({ state, commit }, name): Promise<CostQuerySetModel|Error> => {
    try {
        const {
            granularity, chartType, selectedDates,
            currency, groupByItems, filters,
        } = state;
        const updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.create({
            name,
            options: {
                granularity,
                chart_type: chartType,
                start: selectedDates[0],
                end: selectedDates[1],
                currency,
                group_by: groupByItems,
                filter: filters,
            },
        });
        commit('setSelectedQueryId', updatedQueryData.cost_query_set_id);
        return updatedQueryData;
    } catch (e) {
        throw e;
    }
};

export const editQuery: Action<CostAnalysisStoreState, any> = async (_, { selectedQuery, formState }): Promise<CostQuerySetModel|Error> => {
    try {
        const { cost_query_set_id, name, scope } = selectedQuery;
        const { selectedVisibility, queryName } = formState;
        let updatedQueryData;
        if (name !== queryName) {
            updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.update({
                cost_query_set_id,
                name: queryName,
            });
        }
        if (scope !== selectedVisibility) {
            updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.changeScope({
                cost_query_set_id,
                scope: selectedVisibility,
            });
        }
        return updatedQueryData;
    } catch (e) {
        throw e;
    }
};
