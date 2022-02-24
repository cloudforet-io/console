<template>
    <cost-dashboard-card-widget-layout :title="name"
                                       :widget-link="widgetLink"
                                       :print-mode="printMode"
                                       class="custom-widget"
    >
        <div class="filter-wrapper">
            <div>
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER') }}: </span>
                <span class="text">{{ getFiltersText(filters) }}</span>
            </div>
            <p-button style-type="gray-border"
                      size="sm"
                      @click.stop="handleClickViewFilter"
            >
                {{ $t('BILLING.COST_MANAGEMENT.MAIN.VIEW_FILTER') }}
            </p-button>
        </div>
        <div class="chart-wrapper">
            <cost-analysis-pie-chart v-if="options && options.granularity === GRANULARITY.ACCUMULATED"
                                     :loading="loading"
                                     :chart-data="chartData"
                                     :legends="legends"
                                     :currency="currency"
                                     :currency-rates="currencyRates"
                                     :print-mode="printMode"
            />
            <cost-analysis-stacked-column-chart v-else
                                                :loading="loading"
                                                :chart-data="chartData"
                                                :legends="legends"
                                                :granularity="options.granularity"
                                                :stack="options.stack"
                                                :period="options.period"
                                                :currency="currency"
                                                :currency-rates="currencyRates"
                                                :print-mode="printMode"
            />
        </div>
        <cost-dashboard-data-table :fields="tableState.fields"
                                   :items="tableState.items"
                                   :loading="tableState.loading"
                                   :this-page.sync="tableState.thisPage"
                                   :page-size="PAGE_SIZE"
                                   :legends="legends"
                                   :currency-rates="currencyRates"
                                   :currency="currency"
                                   :pagination-visible="!printMode"
        />
        <view-filter-modal :visible.sync="viewFilterModalVisible"
                           :selected-filters="filters"
        />
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';
import ViewFilterModal from '@/services/billing/cost-management/cost-dashboard/modules/ViewFilterModal.vue';

import { CURRENCY } from '@/store/modules/display/config';
import {
    CostAnalyzeModel,
    Legend, PieChartData, WidgetProps, XYChartData,
} from '@/services/billing/cost-management/widgets/type';
import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import {
    getConvertedFilter, getDataTableCostFields,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { CostQuerySetOption, Period } from '@/services/billing/cost-management/type';
import {
    getLegends,
    getPieChartData,
    getXYChartData,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import {
    DataTableFieldType,
} from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { getFiltersText } from '@/services/billing/cost-management/cost-dashboard/lib/helper';

const CostAnalysisStackedColumnChart = () => import('@/services/billing/cost-management/cost-analysis/modules/CostAnalysisStackedColumnChart.vue');
const CostAnalysisPieChart = () => import('@/services/billing/cost-management/cost-analysis/modules/CostAnalysisPieChart.vue');

const PAGE_SIZE = 5;

export default {
    name: 'CustomWidget',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        ViewFilterModal,
        CostAnalysisStackedColumnChart,
        CostAnalysisPieChart,
        PButton,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object,
            default: () => ({}) as CostQuerySetOption,
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps<CostQuerySetOption>) {
        const state = reactive({
            loading: false,
            chartData: [] as Array<XYChartData | PieChartData>,
            legends: [] as Legend[],
            title: '',
            filters: computed(() => props.options?.filters),
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    granularity: primitiveToQueryString(props.options?.granularity),
                    groupBy: arrayToQueryString(props.options?.group_by),
                    period: objectToQueryString(props.options?.period),
                    filters: objectToQueryString(props.options?.filters),
                },
            })),
            viewFilterModalVisible: false,
        });
        const tableState = reactive({
            loading: true,
            totalCount: 15,
            thisPage: 1,
            items: [] as CostAnalyzeModel[],
            fields: [] as DataTableFieldType[],
        });

        /* Util */
        const getFields = (granularity: GRANULARITY, period: Period, groupBy?: GROUP_BY[]) => {
            let groupByFields: DataTableFieldType[] = [];
            if (groupBy?.length) {
                groupByFields = groupBy.map(d => ({
                    ...GROUP_BY_ITEM_MAP[d],
                }));
            }
            const costFields: DataTableFieldType[] = getDataTableCostFields(granularity, period, !!groupBy?.length);
            return groupByFields.concat(costFields);
        };

        /* Api */
        const costQueryHelper = new QueryHelper();
        const listCostAnalysisData = async () => {
            try {
                tableState.loading = true;
                costQueryHelper.setFilters(getConvertedFilter(props.options?.filters ?? {}));
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: props.options?.granularity,
                    group_by: props.options?.group_by ?? [],
                    start: dayjs.utc(props.options?.period?.start).format('YYYY-MM-DD'),
                    end: dayjs.utc(props.options?.period?.end).format('YYYY-MM-DD'),
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            } finally {
                tableState.loading = false;
            }
        };
        const setChartData = async (granularity: GRANULARITY, period: Period, groupBy?: GROUP_BY) => {
            state.loading = true;

            const rawData = await listCostAnalysisData();
            tableState.items = rawData;
            state.legends = getLegends(rawData, groupBy);
            if (props.options?.granularity === GRANULARITY.ACCUMULATED) {
                state.chartData = getPieChartData(rawData, groupBy);
            } else {
                state.chartData = getXYChartData(rawData, granularity, period, groupBy);
            }
            state.loading = false;
        };

        /* Event */
        const handleClickViewFilter = () => {
            state.viewFilterModalVisible = true;
        };

        (() => {
            setChartData(props.options?.granularity, props.options?.period, props.options?.primary_group_by);
            tableState.fields = getFields(props.options?.granularity, props.options?.period, props.options?.group_by);
        })();

        return {
            ...toRefs(state),
            tableState,
            GRANULARITY,
            PAGE_SIZE,
            getFiltersText,
            handleClickViewFilter,
        };
    },
};
</script>

<style lang="postcss">
.custom-widget {
    .filter-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;

        .label {
            font-size: 1rem;
        }
        .text {
            @apply text-gray-800;
        }
    }

    .chart-wrapper {
        height: 22.5rem;
    }
}
</style>
