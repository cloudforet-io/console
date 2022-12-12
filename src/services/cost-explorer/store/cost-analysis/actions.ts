import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY, GROUP_BY, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import {
    convertFiltersInToNewType,
    getInitialDates,
    getRefinedCostQueryOptions,
} from '@/services/cost-explorer/lib/helper';
import type { CostAnalysisStoreState } from '@/services/cost-explorer/store/cost-analysis/type';
import type { CostQuerySetModel, CostQuerySetOption, MoreGroupByItem } from '@/services/cost-explorer/type';

export const initCostAnalysisStoreState: Action<CostAnalysisStoreState, any> = ({ commit }): void => {
    commit('setGranularity', GRANULARITY.ACCUMULATED);
    commit('setStack', false);
    commit('setGroupBy', []);
    commit('setPrimaryGroupBy', undefined);
    commit('setMoreGroupBy', []);
    commit('setPeriod', getInitialDates());
    commit('setFilters', {});
};

const defaultGroupBySet = new Set<string>(Object.values(GROUP_BY));
const moreGroupByCategorySet = new Set(Object.values(MORE_GROUP_BY));
/**
 * @description Set store states from saved query or from url query
 */
export const setQueryOptions: Action<CostAnalysisStoreState, any> = ({ commit }, options: CostQuerySetOption): void => {
    const refinedOptions = getRefinedCostQueryOptions(options);

    if (refinedOptions.granularity) commit('setGranularity', refinedOptions.granularity);
    if (typeof refinedOptions.stack === 'boolean') commit('setStack', refinedOptions.stack);

    const refinedDefaultGroupBy: string[] = [];
    const moreGroupByItems: MoreGroupByItem[] = [];
    const refinedGroupBy = refinedOptions.group_by?.filter((d) => {
        // Get only what belongs to the default groupBy
        if (defaultGroupBySet.has(d)) {
            refinedDefaultGroupBy.push(d);
            return true;
        }

        // moreGroupBy is saved as a string in the form of 'category.key' when stored in group_by of the query option.
        // So to convert back to moreGroupByItem, separate category and key.
        // In this process, get only items belonging to the given moreGroupBy category.
        const dotIndex = d.indexOf('.');
        if (dotIndex > 0) {
            const category = d.slice(0, dotIndex);
            if (category && moreGroupByCategorySet.has(category)) {
                moreGroupByItems.push({ category, key: d.slice(dotIndex + 1), selected: true });
                return true;
            }
        }

        return false;
    });
    commit('setGroupBy', refinedDefaultGroupBy);
    commit('setPrimaryGroupBy', refinedGroupBy?.[0]); // The first item of group_by is primaryGroupBy
    commit('setMoreGroupBy', moreGroupByItems);

    if (options.period) commit('setPeriod', { start: options.period.start, end: options.period.end });
    if (options.filters) {
        commit('setFilters', convertFiltersInToNewType(options.filters));
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
        const options = getRefinedCostQueryOptions({
            granularity,
            stack,
            period,
            group_by: groupBy,
            primary_group_by: primaryGroupBy, // will be deprecated(< v1.10.5)
            more_group_by: moreGroupBy, // will be deprecated(< v1.10.5)
            filters,
        });
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
