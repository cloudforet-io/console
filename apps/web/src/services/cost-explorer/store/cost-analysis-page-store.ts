import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { convertRelativePeriodToPeriod } from '@/services/cost-explorer/cost-analysis/lib/period-helper';
import type { RelativePeriod } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';
import type {
    CostQuerySetModel, Granularity, GroupBy, Period,
} from '@/services/cost-explorer/type';


interface CostAnalysisPageState {
    granularity: Granularity;
    groupBy: Array<GroupBy|string>;
    chartGroupBy?: GroupBy|string;
    period?: Period;
    relativePeriod?: RelativePeriod;
    filters?: Record<string, string[]> // {provider: ['aws', 'gcp'], product: ['AmazonEC2']}
    enabledFiltersProperties?: string[];
}

interface GroupByItem {
    name: GroupBy|string;
    label: string;
}

const allReferenceStore = useAllReferenceStore();
const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.$state;

const getRefinedFilters = (consoleFilters?: ConsoleFilter[]): Record<string, string[]> => {
    if (!consoleFilters || isEmpty(consoleFilters)) return {};
    const result: Record<string, string[]> = {};
    consoleFilters.forEach((d) => {
        result[d.k as string] = d.v as string[];
    });
    return result;
};

export const useCostAnalysisPageStore = defineStore('cost-analysis-page', {
    state: (): CostAnalysisPageState => ({
        granularity: GRANULARITY.MONTHLY,
        groupBy: [],
        chartGroupBy: undefined,
        period: undefined,
        relativePeriod: undefined,
        filters: {},
        enabledFiltersProperties: undefined,
    }),
    getters: {
        selectedQueryId: () => costQuerySetState.selectedQuerySetId,
        costQueryList: () => costQuerySetState.costQuerySetList,
        selectedQuerySet: () => costQuerySetStore.selectedQuerySet,
        selectedDataSourceId: () => costQuerySetState.selectedDataSourceId,
        defaultGroupByItems: () => {
            let additionalInfoGroupBy: GroupByItem[] = [];
            if (costQuerySetState.selectedDataSourceId) {
                const targetDataSource = allReferenceStore.getters.costDataSource[costQuerySetState.selectedDataSourceId];
                const additionalInfoKeys = targetDataSource?.data?.cost_additional_info_keys;
                if (targetDataSource && additionalInfoKeys?.length) {
                    additionalInfoGroupBy = additionalInfoKeys.map((d) => ({
                        name: `additional_info.${d}`,
                        label: d,
                    }));
                }
            }
            return [...Object.values(GROUP_BY_ITEM_MAP), ...additionalInfoGroupBy];
        },
        consoleFilters: (state): ConsoleFilter[] => {
            const results: ConsoleFilter[] = [];
            Object.entries(state.filters ?? {}).forEach(([category, filterItems]) => {
                if (filterItems.length) {
                    results.push({
                        k: category,
                        v: filterItems,
                        o: '=',
                    });
                }
            });
            return results;
        },
    },
    actions: {
        async initState() {
            this.granularity = GRANULARITY.MONTHLY;
            this.groupBy = [];
            this.chartGroupBy = undefined;
            this.period = undefined;
            this.relativePeriod = undefined;
            this.filters = {};
            this.enabledFiltersProperties = undefined;
        },
        async setQueryOptions(options?: CostQuerySetModel['options']) {
            if (!options) {
                await this.initState();
                return;
            }

            if (options.granularity) this.granularity = options.granularity;

            this.groupBy = options.group_by ?? [];
            this.chartGroupBy = options.group_by?.[0];

            if (options.relative_period) {
                this.relativePeriod = options.relative_period;
                this.period = convertRelativePeriodToPeriod({
                    relativePeriod: options.relative_period,
                    granularity: options.granularity,
                });
            } else if (options.period) {
                this.period = { start: options.period.start, end: options.period.end };
            }
            this.filters = getRefinedFilters(options.filters);
            if (options.metadata?.filters_schema?.enabled_properties?.length) {
                this.enabledFiltersProperties = options.metadata.filters_schema.enabled_properties;
            }
        },
        async saveQuery(name: string): Promise<CostQuerySetModel|undefined> {
            const options: CostQuerySetModel['options'] = {
                granularity: this.granularity,
                period: this.period,
                relative_period: this.relativePeriod,
                group_by: this.groupBy,
                filters: this.consoleFilters,
                metadata: { filters_schema: { enabled_properties: this.enabledFiltersProperties ?? [] } },
            };
            let createdData;
            try {
                createdData = await SpaceConnector.client.costAnalysis.costQuerySet.create({
                    name,
                    data_source_id: costQuerySetState.selectedDataSourceId,
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
            if (costQuerySetStore.selectedQuerySet?.name !== name) {
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
        selectQueryId(querySetId: string|undefined) {
            costQuerySetStore.$patch({ selectedQuerySetId: querySetId });
        },
        async getCostQueryList() {
            await costQuerySetStore.listCostQuerySets();
        },
    },
});
