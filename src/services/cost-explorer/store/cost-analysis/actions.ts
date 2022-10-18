import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import type { CostAnalysisStoreState } from '@/services/cost-explorer/store/cost-analysis/type';
import type {
    CostQuerySetModel, CostQuerySetOption, CostQueryFilterItem, CostQueryFilters,
} from '@/services/cost-explorer/type';


export const initCostAnalysisStoreState: Action<CostAnalysisStoreState, any> = ({ commit }): void => {
    commit('setGranularity', GRANULARITY.ACCUMULATED);
    commit('setStack', false);
    commit('setGroupBy', []);
    commit('setPrimaryGroupBy', undefined);
    commit('setMoreGroupBy', []);
    commit('setPeriod', getInitialDates());
    commit('setFilters', []);
};


const convertFilterFromObjectToArray = (filters: CostQueryFilters) => {
    const results: CostQueryFilterItem[] = [];
    Object.entries(filters).forEach(([category, values]) => {
        if (values) {
            values.forEach((v) => {
                results.push({
                    category,
                    value: v as string,
                });
            });
        }
    });
    return results;
};

export const setQueryOptions: Action<CostAnalysisStoreState, any> = ({ commit }, options: Partial<CostQuerySetOption>): void => {
    if (options.granularity) commit('setGranularity', options.granularity);
    if (typeof options.stack === 'boolean') commit('setStack', options.stack);
    if (options.group_by?.length) {
        commit('setGroupBy', options.group_by);
        commit('setPrimaryGroupBy', options.primary_group_by);
    } else commit('setPrimaryGroupBy', undefined);
    if (options.more_group_by?.length) commit('setMoreGroupBy', options.more_group_by);
    if (options.period) commit('setPeriod', { start: options.period.start, end: options.period.end });
    if (options.filters) {
        let filters = options.filters;
        // TODO: will be deprecated someday
        if (!Array.isArray(options.filters)) {
            filters = convertFilterFromObjectToArray(options.filters);
        }
        commit('setFilters', filters);
    }
};

export const listCostQueryList: Action<CostAnalysisStoreState, any> = async ({ commit }): Promise<void|Error> => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
            query: {
                filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
            },
        });
        commit('setCostQueryList', results);
    } catch (e) {
        ErrorHandler.handleError(e);
        commit('setCostQueryList', []);
    }
};

export const saveQuery: Action<CostAnalysisStoreState, any> = async ({ state, commit }, name): Promise<CostQuerySetModel|Error> => {
    try {
        const {
            granularity, stack, period,
            groupBy, filters, primaryGroupBy, moreGroupBy,
        } = state;
        const options: CostQuerySetOption = {
            granularity,
            stack,
            period,
            group_by: groupBy,
            primary_group_by: groupBy?.length ? (primaryGroupBy || groupBy[0]) : undefined,
            filters,
            more_group_by: moreGroupBy,
        };
        const updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.create({
            name,
            options,
        });
        commit('setSelectedQueryId', updatedQueryData.cost_query_set_id);
        return updatedQueryData;
    } catch (e) {
        throw e;
    }
};

export const editQuery: Action<CostAnalysisStoreState, any> = async (_, { selectedQuery, formState }): Promise<CostQuerySetModel|Error> => {
    try {
        const { queryName } = formState;
        let updatedQueryData;
        if (selectedQuery.name !== queryName) {
            updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.update({
                cost_query_set_id: selectedQuery.cost_query_set_id,
                name: queryName,
            });
        }
        return updatedQueryData;
    } catch (e) {
        throw e;
    }
};
