import type { Action } from 'vuex';

import { union } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';


import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY, GROUP_BY, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import {
    convertFiltersInToNewType,
    getInitialDates,
    getRefinedCostQueryOptions,
} from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { CostAnalysisStoreState } from '@/services/cost-explorer/store/cost-analysis/type';
import type {
    CostQuerySetModel, CostQuerySetOption, MoreGroupByItem,
} from '@/services/cost-explorer/type';

const moreGroupByCategorySet = new Set(Object.values(MORE_GROUP_BY));
const convertGroupByStringToMoreGroupByItem = (moreGroupBy: string, selected?: boolean, disabled?: boolean) => {
    // moreGroupBy is saved as a string in the form of 'category.key'.
    // So to convert back to moreGroupByItem, separate category and key.
    // In this process, get only items belonging to the given moreGroupBy category.
    const dotIndex = moreGroupBy.indexOf('.');
    if (dotIndex > 0) {
        const category = moreGroupBy.slice(0, dotIndex);
        if (category && moreGroupByCategorySet.has(category)) {
            return {
                category, key: moreGroupBy.slice(dotIndex + 1), selected, disabled,
            };
        }
    }
    return undefined;
};
const getMergedMoreGroupByItems = (selectedGroupBy: string[], storedMoreGroupByItems?: MoreGroupByItem[]): MoreGroupByItem[] => {
    const moreGroupByItems: MoreGroupByItem[] = [];

    const selectedGroupByMap = {};
    selectedGroupBy.forEach((d) => {
        selectedGroupByMap[d] = true;
    });

    const disabledGroupByMap = {};
    let allGroupBy = selectedGroupBy;
    if (Array.isArray(storedMoreGroupByItems)) {
        allGroupBy = union(selectedGroupBy, storedMoreGroupByItems.map((item) => {
            const itemKey = `${item.category}.${item.key}`;
            if (item.disabled) disabledGroupByMap[itemKey] = true;
            return itemKey;
        }));
    }

    allGroupBy.forEach((d) => {
        const item = convertGroupByStringToMoreGroupByItem(d, selectedGroupByMap[d], disabledGroupByMap[d] && !selectedGroupByMap[d]);
        if (item) moreGroupByItems.push(item);
    });

    return moreGroupByItems;
};

export const initCostAnalysisStoreState: Action<CostAnalysisStoreState, any> = ({ commit, rootGetters }): void => {
    commit('setGranularity', GRANULARITY.ACCUMULATED);
    commit('setStack', false);
    commit('setGroupBy', []);
    commit('setPrimaryGroupBy', undefined);
    commit('setPeriod', getInitialDates());
    commit('setFilters', {});
    // set more group by items
    const storedMoreGroupByItems: MoreGroupByItem[] = rootGetters['settings/getItem']('more_group_by', COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME);
    const moreGroupByItems = getMergedMoreGroupByItems([], storedMoreGroupByItems);
    commit('setMoreGroupBy', moreGroupByItems);
};

const defaultGroupBySet = new Set<string>(Object.values(GROUP_BY));

/**
 * @description Set store states from saved query or from url query
 */
export const setQueryOptions: Action<CostAnalysisStoreState, any> = ({ commit, rootGetters }, options: CostQuerySetOption): void => {
    const refinedOptions = getRefinedCostQueryOptions(options);

    if (refinedOptions.granularity) commit('setGranularity', refinedOptions.granularity);
    if (typeof refinedOptions.stack === 'boolean') commit('setStack', refinedOptions.stack);

    const refinedDefaultGroupBy: string[] = [];
    const refinedGroupBy = refinedOptions.group_by?.filter((d) => {
        // Get only what belongs to the default groupBy
        if (defaultGroupBySet.has(d)) {
            refinedDefaultGroupBy.push(d);
            return true;
        }
        // Get only what is convertable to moreGroupByItem
        return !!convertGroupByStringToMoreGroupByItem(d);
    });
    commit('setGroupBy', refinedDefaultGroupBy);
    commit('setPrimaryGroupBy', refinedGroupBy?.[0]); // The first item of group_by is primaryGroupBy

    // set moreGroupByItems
    const storedMoreGroupByItems: MoreGroupByItem[] = rootGetters['settings/getItem']('more_group_by', COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME);
    const moreGroupByItems = getMergedMoreGroupByItems(refinedGroupBy ?? [], storedMoreGroupByItems);
    commit('setMoreGroupBy', moreGroupByItems);

    if (options.period) commit('setPeriod', { start: options.period.start, end: options.period.end });
    if (options.filters) {
        commit('setFilters', convertFiltersInToNewType(options.filters));
    }
};

export const setMoreGroupBy: Action<CostAnalysisStoreState, any> = ({ commit, dispatch }, moreGroupByItems: MoreGroupByItem[]) => {
    commit('setMoreGroupBy', moreGroupByItems);

    dispatch('settings/setItem', {
        key: 'more_group_by',
        value: moreGroupByItems,
        path: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
    }, { root: true });
};

export const listCostQueryList: Action<CostAnalysisStoreState, any> = async ({ commit, rootState }): Promise<void|Error> => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
            query: {
                filter: [{ k: 'user_id', v: rootState.user.userId, o: 'eq' }],
            },
        });
        commit('setCostQueryList', results);
    } catch (e) {
        ErrorHandler.handleError(e);
        commit('setCostQueryList', []);
    }
};

export const saveQuery: Action<CostAnalysisStoreState, any> = async ({ state, commit }, name): Promise<CostQuerySetModel|Error> => {
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
};

export const editQuery: Action<CostAnalysisStoreState, any> = async (_, { selectedQuery, formState }): Promise<CostQuerySetModel|Error> => {
    const { queryName } = formState;
    let updatedQueryData;
    if (selectedQuery.name !== queryName) {
        updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.update({
            cost_query_set_id: selectedQuery.cost_query_set_id,
            name: queryName,
        });
    }
    return updatedQueryData;
};
