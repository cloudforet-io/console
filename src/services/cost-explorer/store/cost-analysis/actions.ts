import type { Action } from 'vuex';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getInitialDates } from '@/services/cost-explorer/cost-analysis/lib/helper';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { CostAnalysisStoreState } from '@/services/cost-explorer/store/cost-analysis/type';
import type { CostFiltersMap, CostQuerySetModel, CostQuerySetOption } from '@/services/cost-explorer/type';


export const initCostAnalysisStoreState: Action<CostAnalysisStoreState, any> = ({ commit }): void => {
    commit('setGranularity', GRANULARITY.ACCUMULATED);
    commit('setStack', false);
    commit('setGroupBy', []);
    commit('setPrimaryGroupBy', undefined);
    commit('setMoreGroupBy', []);
    commit('setPeriod', getInitialDates());
    commit('setFilters', {});
};

// TODO: will be deprecated someday
interface OldType {
    [key: string]: string[];
}
const getChangedFiltersWithNewType = (filters: OldType | CostFiltersMap): CostFiltersMap => {
    const _filters: OldType | CostFiltersMap = cloneDeep(filters);
    Object.entries(_filters).forEach(([category, values]) => {
        if (values?.length && typeof values[0] === 'string') {
            _filters[category] = values.map(d => ({
                k: category, v: d as string, o: '=',
            }));
        }
    });
    return _filters as CostFiltersMap;
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
        commit('setFilters', getChangedFiltersWithNewType(options.filters));
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
            more_group_by: moreGroupBy,
            filters,
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
