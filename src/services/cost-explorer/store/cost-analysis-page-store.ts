import { computed, reactive } from 'vue';

import { orderBy, union } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY, GROUP_BY, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { convertFiltersInToNewType, getInitialDates, getRefinedCostQueryOptions } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type {
    CostFiltersMap, CostQuerySetModel, CostQuerySetOption, Granularity, GroupBy, MoreGroupByItem, Period,
} from '@/services/cost-explorer/type';


interface CostAnalysisPageState {
    granularity: Granularity;
    stack: boolean;
    groupBy: Array<GroupBy|string>;
    primaryGroupBy?: GroupBy|string;
    moreGroupBy: MoreGroupByItem[];
    period: Period;
    filters: CostFiltersMap;
    selectedQueryId?: string;
    costQueryList: CostQuerySetModel[];
}

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
const defaultGroupBySet = new Set<string>(Object.values(GROUP_BY));
//
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


export const useCostAnalysisPageStore = defineStore('cost-analysis-page', () => {
    const state = reactive<CostAnalysisPageState>({
        granularity: GRANULARITY.ACCUMULATED,
        stack: false,
        groupBy: [],
        primaryGroupBy: undefined,
        moreGroupBy: [],
        period: getInitialDates(),
        filters: {},
        selectedQueryId: undefined,
        costQueryList: [],
    });
    const getters = reactive({
        selectedQuerySet: computed<CostQuerySetModel|undefined>(() => {
            if (!state.selectedQueryId) return undefined;
            return state.costQueryList.find((item) => item.cost_query_set_id === state.selectedQueryId);
        }),
        currentQuerySetOptions: computed<Partial<CostQuerySetOption>>(() => getRefinedCostQueryOptions({
            stack: state.stack,
            granularity: state.granularity,
            group_by: state.groupBy,
            primary_group_by: state.primaryGroupBy,
            more_group_by: state.moreGroupBy,
            period: state.period,
            filters: state.filters,
        })),
        orderedMoreGroupByItems: computed(() => {
            if (!state.moreGroupBy?.length) return [];
            const tags = state.moreGroupBy.filter((d) => d.category === MORE_GROUP_BY.TAGS);
            const additionalInfo = state.moreGroupBy.filter((d) => d.category === MORE_GROUP_BY.ADDITIONAL_INFO);
            const orderedTags = orderBy(tags, [(d) => d.key]);
            const orderedAdditionalInfo = orderBy(additionalInfo, [(d) => d.key]);
            return [...orderedTags, ...orderedAdditionalInfo];
        }),
    });

    /* Actions */
    const initState = (): void => {
        state.granularity = GRANULARITY.ACCUMULATED;
        state.stack = false;
        state.groupBy = [];
        state.primaryGroupBy = undefined;
        state.period = getInitialDates();
        state.filters = {};
        // set more group by items
        const storedMoreGroupByItems: MoreGroupByItem[] = store.getters['settings/getItem']('more_group_by', COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME);
        state.moreGroupBy = getMergedMoreGroupByItems([], storedMoreGroupByItems);
    };
    const setQueryOptions = (options?: CostQuerySetOption): void => {
        if (!options) {
            initState();
            return;
        }

        const refinedOptions = getRefinedCostQueryOptions(options);

        if (refinedOptions.granularity) state.granularity = refinedOptions.granularity;
        if (typeof refinedOptions.stack === 'boolean') state.stack = refinedOptions.stack;

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
        state.groupBy = refinedDefaultGroupBy;
        state.primaryGroupBy = refinedGroupBy?.[0];

        // set moreGroupByItems
        const storedMoreGroupByItems: MoreGroupByItem[] = store.getters['settings/getItem']('more_group_by', COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME);
        state.moreGroupBy = getMergedMoreGroupByItems(refinedGroupBy ?? [], storedMoreGroupByItems);

        if (options.period) state.period = { start: options.period.start, end: options.period.end };
        if (options.filters) {
            state.filters = convertFiltersInToNewType(options.filters);
        }
    };
    const listCostQueryList = async (): Promise<void|Error> => {
        try {
            const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
                query: {
                    filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                },
            });
            state.costQueryList = results;
        } catch (e) {
            ErrorHandler.handleError(e);
            state.costQueryList = [];
        }
    };
    const saveQuery = async (name): Promise<CostQuerySetModel|undefined> => {
        const options = getRefinedCostQueryOptions({
            granularity: state.granularity,
            stack: state.stack,
            period: state.period,
            group_by: state.groupBy,
            primary_group_by: state.primaryGroupBy, // will be deprecated(< v1.10.5)
            more_group_by: state.moreGroupBy, // will be deprecated(< v1.10.5)
            filters: state.filters,
        });
        let createdData;
        try {
            createdData = await SpaceConnector.client.costAnalysis.costQuerySet.create({
                name,
                options,
            });
            state.selectedQueryId = createdData.cost_query_set_id;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
        return createdData;
    };
    const editQuery = async ({ selectedQuery, formState }): Promise<CostQuerySetModel|Error> => {
        const { queryName } = formState;
        let updatedQueryData;
        if (selectedQuery.name !== queryName) {
            try {
                updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.update({
                    cost_query_set_id: selectedQuery.cost_query_set_id,
                    name: queryName,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }
        return updatedQueryData;
    };
    const setMoreGroupByWithSettings = (moreGroupByItems: MoreGroupByItem[]) => {
        state.moreGroupBy = moreGroupByItems;
        store.dispatch('settings/setItem', {
            key: 'more_group_by',
            value: moreGroupByItems,
            path: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        }, { root: true });
    };

    return {
        state,
        getters,
        setQueryOptions,
        initState,
        listCostQueryList,
        saveQuery,
        editQuery,
        setMoreGroupByWithSettings,
    };
});
