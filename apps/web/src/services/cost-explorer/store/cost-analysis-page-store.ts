import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { convertRelativePeriodToPeriod } from '@/services/cost-explorer/cost-analysis/lib/period-helper';
import type { RelativePeriod } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { convertFiltersInToNewType } from '@/services/cost-explorer/lib/helper';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';
import type {
    CostFiltersMap, CostQuerySetModel, CostQuerySetOption, Granularity, GroupBy, Period,
} from '@/services/cost-explorer/type';


interface CostAnalysisPageState {
    granularity: Granularity;
    groupBy: Array<GroupBy|string>;
    chartGroupBy?: GroupBy|string;
    period?: Period;
    relativePeriod?: RelativePeriod;
    filters: CostFiltersMap;
}

interface GroupByItem {
    name: GroupBy|string;
    label: string;
}

const allReferenceStore = useAllReferenceStore();
const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.$state;

export const useCostAnalysisPageStore = defineStore('cost-analysis-page', {
    state: (): CostAnalysisPageState => ({
        granularity: GRANULARITY.MONTHLY,
        groupBy: [],
        chartGroupBy: undefined,
        period: undefined,
        relativePeriod: undefined,
        filters: {},
    }),
    getters: {
        selectedQueryId: () => costQuerySetState.selectedQuerySetId,
        costQueryList: () => costQuerySetState.costQuerySetList,
        selectedQuerySet: () => costQuerySetStore.selectedQuerySet,
        selectedDataSourceId: () => costQuerySetState.selectedDataSourceId,
        defaultGroupByItems: (): GroupByItem[] => {
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
    },
    actions: {
        async initState() {
            this.granularity = GRANULARITY.MONTHLY;
            this.groupBy = [];
            this.chartGroupBy = undefined;
            this.period = undefined;
            this.relativePeriod = undefined;
            this.filters = {};
        },
        async setQueryOptions(options?: CostQuerySetOption) {
            if (!options) {
                await this.initState();
                return;
            }

            if (options.granularity) this.granularity = options.granularity;

            this.groupBy = options.group_by ?? [];
            this.chartGroupBy = options.group_by?.[0];

            if (options.relative_period) {
                this.relativePeriod = options.relative_period;
                this.period = convertRelativePeriodToPeriod(options.relative_period);
            } else if (options.period) {
                this.period = { start: options.period.start, end: options.period.end };
            }
            if (options.filters) {
                this.filters = convertFiltersInToNewType(options.filters);
            }
        },
        async saveQuery(name: string): Promise<CostQuerySetModel|undefined> {
            const options: CostQuerySetOption = {
                granularity: this.granularity,
                period: this.period,
                relative_period: this.relativePeriod,
                group_by: this.groupBy,
                filters: this.filters,
            };
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
