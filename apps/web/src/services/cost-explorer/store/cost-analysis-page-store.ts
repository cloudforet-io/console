import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { convertFiltersInToNewType, getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisLNBStore } from '@/services/cost-explorer/store/cost-query-store';
import type {
    CostFiltersMap, CostQuerySetModel, CostQuerySetOption, Granularity, GroupBy, Period,
} from '@/services/cost-explorer/type';


interface CostAnalysisPageState {
    granularity: Granularity;
    groupBy: Array<GroupBy|string>;
    chartGroupBy?: GroupBy|string;
    period: Period;
    filters: CostFiltersMap;
}

const costQueryStore = useCostAnalysisLNBStore();
const costQueryState = costQueryStore.$state;

export const useCostAnalysisPageStore = defineStore('cost-analysis-page', {
    state: (): CostAnalysisPageState => ({
        granularity: GRANULARITY.MONTHLY,
        groupBy: [],
        chartGroupBy: undefined,
        period: getInitialDates(),
        filters: {},
    }),
    getters: {
        selectedQueryId: () => costQueryState.selectedQuerySetId,
        costQueryList: () => costQueryState.costQuerySetList,
        selectedQuerySet: () => costQueryStore.selectedQuerySet,
        currentQuerySetOptions: (state): Partial<CostQuerySetOption> => ({
            granularity: state.granularity,
            group_by: state.groupBy,
            period: state.period,
            filters: state.filters,
        }),
    },
    actions: {
        async initState() {
            this.granularity = GRANULARITY.MONTHLY;
            this.groupBy = [];
            this.chartGroupBy = undefined;
            this.period = getInitialDates();
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

            if (options.period) this.period = { start: options.period.start, end: options.period.end };
            if (options.filters) {
                this.filters = convertFiltersInToNewType(options.filters);
            }
        },
        async saveQuery(name: string): Promise<CostQuerySetModel|undefined> {
            const options: CostQuerySetOption = {
                granularity: this.granularity,
                period: this.period,
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
        selectQueryId(querySetId: string|undefined) {
            costQueryStore.$patch({ selectedQuerySetId: querySetId });
        },
        async getCostQueryList() {
            await costQueryStore.listCostQuerySets();
        },
    },
});
