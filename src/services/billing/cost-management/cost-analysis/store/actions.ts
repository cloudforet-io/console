import { Action } from 'vuex';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { CostAnalysisStoreState, CostQuerySetModel, CostQuerySetOption } from '@/services/billing/cost-management/cost-analysis/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { getInitialDates } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';


export const initCostAnalysisStoreState: Action<CostAnalysisStoreState, any> = ({ commit }): void => {
    commit('setChartType', CHART_TYPE.STACKED_COLUMN);
    commit('setGranularity', GRANULARITY.ACCUMULATED);
    commit('setGroupByItems', []);
    commit('setGroupBy', undefined);
    commit('setPeriod', getInitialDates());
    commit('setFilters', []);
    commit('setSelectedQueryId', undefined);
};

interface SetQueryOptionsParam {
    queryId: string;
    options: CostQuerySetOption;
}

export const setQueryOptions: Action<CostAnalysisStoreState, any> = ({ commit }, { queryId, options }: SetQueryOptionsParam): void => {
    commit('setChartType', options.chart_type);
    commit('setGranularity', options.granularity);
    commit('setGroupByItems', options.group_by);
    commit('setPeriod', { start: options.period.start, end: options.period.end });
    commit('setFilters', options.filter);
    commit('setSelectedQueryId', queryId);
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
            granularity, chartType, period,
            groupByItems, filters,
        } = state;
        const updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.create({
            name,
            options: {
                granularity,
                chart_type: chartType,
                period,
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
