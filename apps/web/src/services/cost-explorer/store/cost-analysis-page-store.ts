import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CostAnalysisPeriodType } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { convertFiltersInToNewType, getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';
import type {
    CostFiltersMap, CostQuerySetModel, CostQuerySetOption, Granularity, GroupBy, Period,
} from '@/services/cost-explorer/type';


interface CostAnalysisPageState {
    granularity: Granularity;
    groupBy: Array<GroupBy|string>;
    chartGroupBy?: GroupBy|string;
    period: Period;
    periodType?: CostAnalysisPeriodType;
    filters: CostFiltersMap;
}

const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.$state;

export const useCostAnalysisPageStore = defineStore('cost-analysis-page', {
    state: (): CostAnalysisPageState => ({
        granularity: GRANULARITY.MONTHLY,
        groupBy: [],
        chartGroupBy: undefined,
        period: getInitialDates(),
        periodType: undefined,
        filters: {},
    }),
    getters: {
        selectedQueryId: () => costQuerySetState.selectedQuerySetId,
        costQueryList: () => costQuerySetState.costQuerySetList,
        selectedQuerySet: () => costQuerySetStore.selectedQuerySet,
        currentQuerySetOptions: (state): Partial<CostQuerySetOption> => ({
            granularity: state.granularity,
            group_by: state.groupBy,
            period: state.period,
            period_type: state.periodType,
            filters: state.filters,
        }),
    },
    actions: {
        async initState() {
            this.granularity = GRANULARITY.MONTHLY;
            this.groupBy = [];
            this.chartGroupBy = undefined;
            this.period = getInitialDates();
            this.periodType = undefined;
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

            if (options.period_type) {
                this.periodType = options.period_type;
            }
            if (options.period) {
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
                period_type: this.periodType,
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
