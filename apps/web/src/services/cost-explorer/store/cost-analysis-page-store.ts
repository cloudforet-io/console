import { orderBy, union } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY, GROUP_BY, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { convertFiltersInToNewType, getInitialDates, getRefinedCostQueryOptions } from '@/services/cost-explorer/lib/helper';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/store/cost-explorer-settings-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';
import type {
    CostFiltersMap, CostQuerySetModel, CostQuerySetOption, Granularity, GroupBy, MoreGroupByItem, Period,
} from '@/services/cost-explorer/type';


interface CostAnalysisPageState {
    granularity: Granularity;
    groupBy: Array<GroupBy|string>;
    chartGroupBy?: GroupBy|string;
    moreGroupBy: MoreGroupByItem[];
    period: Period;
    filters: CostFiltersMap;
}

const costExplorerSettingsStore = useCostExplorerSettingsStore();
costExplorerSettingsStore.initState();
const costQueryStore = useCostQuerySetStore();
const costQueryState = costQueryStore.$state;

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


export const useCostAnalysisPageStore = defineStore('cost-analysis-page', {
    state: (): CostAnalysisPageState => ({
        granularity: GRANULARITY.MONTHLY,
        groupBy: [],
        chartGroupBy: undefined,
        moreGroupBy: [],
        period: getInitialDates(),
        filters: {},
    }),
    getters: {
        selectedQueryId: () => costQueryState.selectedQuerySetId,
        costQueryList: () => costQueryState.costQuerySetList,
        selectedQuerySet: () => costQueryStore.selectedQuerySet,
        currentQuerySetOptions: (state): Partial<CostQuerySetOption> => getRefinedCostQueryOptions({
            granularity: state.granularity,
            group_by: state.groupBy,
            more_group_by: state.moreGroupBy,
            period: state.period,
            filters: state.filters,
        }),
        orderedMoreGroupByItems: (state) => {
            if (!state.moreGroupBy?.length) return [];
            const tags = state.moreGroupBy.filter((d) => d.category === MORE_GROUP_BY.TAGS);
            const additionalInfo = state.moreGroupBy.filter((d) => d.category === MORE_GROUP_BY.ADDITIONAL_INFO);
            const orderedTags = orderBy(tags, [(d) => d.key]);
            const orderedAdditionalInfo = orderBy(additionalInfo, [(d) => d.key]);
            return [...orderedTags, ...orderedAdditionalInfo];
        },
    },
    actions: {
        async initState() {
            this.granularity = GRANULARITY.MONTHLY;
            this.groupBy = [];
            this.chartGroupBy = undefined;
            this.period = getInitialDates();
            this.filters = {};
            // set more group by items
            const storedMoreGroupByItems: MoreGroupByItem[] = costExplorerSettingsStore.$state.costAnalysisMoreGroupBy;
            this.moreGroupBy = getMergedMoreGroupByItems([], storedMoreGroupByItems);
        },
        async setQueryOptions(options?: CostQuerySetOption) {
            if (!options) {
                await this.initState();
                return;
            }

            const refinedOptions = getRefinedCostQueryOptions(options);

            if (refinedOptions.granularity) this.granularity = refinedOptions.granularity;

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
            this.groupBy = refinedDefaultGroupBy;
            this.chartGroupBy = refinedGroupBy?.[0];

            // set moreGroupByItems
            const storedMoreGroupByItems: MoreGroupByItem[] = costExplorerSettingsStore.$state.costAnalysisMoreGroupBy;
            this.moreGroupBy = getMergedMoreGroupByItems(refinedGroupBy ?? [], storedMoreGroupByItems);

            if (options.period) this.period = { start: options.period.start, end: options.period.end };
            if (options.filters) {
                this.filters = convertFiltersInToNewType(options.filters);
            }
        },
        async saveQuery(name: string): Promise<CostQuerySetModel|undefined> {
            const options = getRefinedCostQueryOptions({
                granularity: this.granularity,
                period: this.period,
                group_by: this.groupBy,
                more_group_by: this.moreGroupBy, // will be deprecated(< v1.10.5)
                filters: this.filters,
            });
            let createdData;
            try {
                createdData = await SpaceConnector.client.costAnalysis.costQuerySet.create({
                    name,
                    options,
                });
                this.selectQueryId(createdData.cost_query_set_id);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
            return createdData;
        },
        async editQuery(querySetId: string, name: string): Promise<CostQuerySetModel> {
            let updatedQueryData;
            if (costQueryStore.selectedQuerySet?.name !== name) {
                try {
                    updatedQueryData = await SpaceConnector.client.costAnalysis.costQuerySet.update({
                        cost_query_set_id: querySetId,
                        name,
                    });
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }
            return updatedQueryData;
        },
        setMoreGroupByWithSettings(moreGroupByItems: MoreGroupByItem[]) {
            this.moreGroupBy = moreGroupByItems;
            costExplorerSettingsStore.setCostAnalysisMoreGroupBy(moreGroupByItems);
        },
        selectQueryId(querySetId: string|undefined) {
            costQueryStore.$patch({ selectedQuerySetId: querySetId });
        },
        async getCostQueryList() {
            await costQueryStore.listCostQuerySets();
        },
    },
});
