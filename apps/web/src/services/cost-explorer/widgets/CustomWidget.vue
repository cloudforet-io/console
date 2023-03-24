<template>
    <cost-dashboard-card-widget-layout :title="name"
                                       :widget-link="widgetLink"
                                       :print-mode="printMode"
                                       class="custom-widget"
    >
        <div class="applied-filter-wrapper">
            <div>
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.MAIN.APPLIED_FILTER') }}: </span>
                <span class="text">{{ filterLabel }}</span>
            </div>
            <p-button v-if="!printMode"
                      style-type="tertiary"
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
                                     @rendered="$emit('rendered')"
            />
            <cost-analysis-stacked-column-chart v-else
                                                :loading="loading"
                                                :chart-data="chartData"
                                                :legends="legends"
                                                :granularity="options.granularity"
                                                :stack="options.stack"
                                                :period="convertedPeriod"
                                                :currency="currency"
                                                :currency-rates="currencyRates"
                                                :print-mode="printMode"
                                                @rendered="$emit('rendered')"
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
                           is-custom
        />
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PButton } from '@spaceone/design-system';
import type {
    DataTableFieldType,
} from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/modules/display/config';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getCostDashboardFilterLabel } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import ViewFilterModal from '@/services/cost-explorer/cost-dashboard/modules/ViewFilterModal.vue';
import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import {
    convertFiltersInToNewType,
    getConvertedFilter, getDataTableCostFields, getInitialDates,
} from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type {
    CostQuerySetOption, Period, Granularity, GroupBy, CostFiltersMap,
} from '@/services/cost-explorer/type';
import {
    getLegends,
    getPieChartData,
    getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type {
    CostAnalyzeModel,
    Legend, PieChartData, WidgetProps, XYChartData,
} from '@/services/cost-explorer/widgets/type';

const CostAnalysisStackedColumnChart = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisStackedColumnChart.vue');
const CostAnalysisPieChart = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisPieChart.vue');

const PAGE_SIZE = 5;
const DAILY_CHART_COUNT = 14;
const MONTHLY_CHART_COUNT = 6;

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
            type: Object as () => CostQuerySetOption,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
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
    setup(props: WidgetProps<WidgetOptions>) {
        const state = reactive({
            loading: false,
            chartData: [] as Array<XYChartData | PieChartData>,
            legends: [] as Legend[],
            title: '',
            convertedPeriod: computed<Period>(() => {
                let period = props.period;
                if (!props.period || !Object.keys(props.period).length) {
                    period = getInitialDates();
                }
                if (props.options?.granularity === GRANULARITY.DAILY) {
                    return {
                        start: dayjs.utc(period.end).subtract(DAILY_CHART_COUNT - 1, 'day').format('YYYY-MM-DD'),
                        end: dayjs.utc(period.end).format('YYYY-MM-DD'),
                    };
                }
                if (props.options?.granularity === GRANULARITY.MONTHLY) {
                    return {
                        start: dayjs.utc(period.end).subtract(MONTHLY_CHART_COUNT - 1, 'month').format('YYYY-MM'),
                        end: dayjs.utc(period.end).format('YYYY-MM'),
                    };
                }
                return {
                    start: dayjs.utc(period.start).format('YYYY-MM'),
                    end: dayjs.utc(period.end).format('YYYY-MM'),
                };
            }),
            filters: computed<CostFiltersMap>(() => convertFiltersInToNewType(props.options?.filters ?? {})),
            filterLabel: computed(() => {
                const label = getCostDashboardFilterLabel(state.filters);
                return label ?? i18n.t('BILLING.COST_MANAGEMENT.MAIN.FILTER_NONE');
            }),
            widgetLink: computed(() => ({
                name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    granularity: primitiveToQueryString(props.options?.granularity),
                    group_by: arrayToQueryString([props.options?.group_by]),
                    period: objectToQueryString(state.convertedPeriod),
                    filters: objectToQueryString(state.filters),
                    stack: primitiveToQueryString(props.options?.stack),
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
        const getFields = (granularity: Granularity, period: Period, groupBy?: GroupBy) => {
            let groupByFields: DataTableFieldType[] = [];
            if (groupBy) groupByFields = [GROUP_BY_ITEM_MAP[groupBy]];
            const costFields: DataTableFieldType[] = getDataTableCostFields(granularity, period, !!groupBy);
            return groupByFields.concat(costFields);
        };

        /* Api */
        const costQueryHelper = new QueryHelper();
        const listCostAnalysisData = async () => {
            try {
                tableState.loading = true;
                costQueryHelper.setFilters(getConvertedFilter(state.filters));
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: props.options?.granularity,
                    group_by: [props.options?.group_by],
                    start: state.convertedPeriod.start,
                    end: state.convertedPeriod.end,
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            } finally {
                tableState.loading = false;
            }
        };
        const setChartData = async (granularity: Granularity, period: Period, groupBy?: GroupBy) => {
            state.loading = true;

            const rawData = await listCostAnalysisData();
            tableState.items = rawData;
            state.legends = getLegends(rawData, granularity, groupBy);
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

        /* Init */
        const refreshAll = (options, period) => {
            if (!options || !options?.granularity) return;
            setChartData(options.granularity, period, options.group_by);
            tableState.fields = getFields(options.granularity, period, options.group_by);
        };

        watch([() => props.options, () => state.convertedPeriod], (after, before) => {
            if (isEqual(after, before)) return;
            const options = after[0];
            const convertedPeriod = after[1];
            refreshAll(options, convertedPeriod);
        }, { immediate: true });

        return {
            ...toRefs(state),
            tableState,
            GRANULARITY,
            PAGE_SIZE,
            handleClickViewFilter,
        };
    },
};
</script>

<style lang="postcss">
.custom-widget {
    .applied-filter-wrapper {
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
