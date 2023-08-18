<script setup lang="ts">
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDivider, PDataLoader, PBadge, PI, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';
import type { ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { useDateRangeFormatter } from '@/common/composables/date-range-formatter';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { getDateAxisSettings, getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { XYChartData, CostAnalyzeDataModel } from '@/services/dashboards/widgets/type';


const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();
const { t } = useI18n();

type Data = CostAnalyzeDataModel['results'];
const state = reactive({
    ...toRefs(useWidgetState<Data>(props)),
    skeletons: [1, 2],
    chartData: computed(() => getRefinedXYChartData(state.data)),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    settingsDateRange: computed<DateRange>(() => {
        if (!state.settings?.date_range) return {};
        return state.settings.date_range;
    }),
    selectedMonth: computed(() => (dayjs.utc(state.dateRange.end))),
    previousMonth: computed(() => (dayjs.utc(state.dateRange.end).subtract(1, 'month'))),
    currentMonthlyCost: computed(() => getMonthlyCost(state.selectedMonth)),
    previousMonthlyCost: computed(() => getMonthlyCost(state.previousMonth)),
    differenceCost: computed(() => {
        const cost = state.currentMonthlyCost - state.previousMonthlyCost;
        if (Number.isNaN(cost)) return '--';
        return cost;
    }),
    differenceCostRate: computed(() => {
        let previousMonthlyCost = state.previousMonthlyCost;
        if (typeof state.differenceCost !== 'number') return '--';
        if (state.currentMonthlyCost === 0) previousMonthlyCost = 1;
        return (state.differenceCost / previousMonthlyCost * 100).toFixed(2);
    }),
    isDecreased: computed<boolean|undefined>(() => {
        if (typeof state.differenceCost === 'number') {
            if (state.differenceCost === 0) return undefined;
            return state.differenceCost < 0;
        }
        return undefined;
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const [formattedCurrentMonth] = useDateRangeFormatter({
    start: computed(() => state.dateRange.end),
    end: computed(() => state.dateRange.end),
});

const [formattedPreviousMonth] = useDateRangeFormatter({
    start: computed(() => dayjs.utc(state.dateRange.end).subtract(1, 'month').format(DATE_FORMAT)),
    end: computed(() => dayjs.utc(state.dateRange.end).subtract(1, 'month').format(DATE_FORMAT)),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<CostAnalyzeDataModel>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Data> => {
    apiQueryHelper.setFilters(state.consoleFilters);
    try {
        const { status, response } = await fetchCostAnalyze({
            query: {
                granularity: state.options.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                },
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response.results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return [];
};

/* Util */
const getMonthlyCost = (month) => {
    if (!state.data?.length) return '--';
    const monthlyCost = state.data[0].usd_cost_sum.find((costData) => costData.date === month.format(DATE_FORMAT))?.value || 0;
    return monthlyCost;
};

const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(state.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    const yRendered = yAxis.get('renderer');
    yRendered.grid.template.setAll({ strokeOpacity: 0 });
    yRendered.labels.template.setAll({ visible: false });
    const seriesSettings = {
        valueYField: 'value',
    };
    const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
    chart.series.push(series);
    series.columns.template.setAll({
        fillOpacity: 0.5,
        strokeOpacity: 0,
    });
    chartHelper.setChartColors(chart, colorSet.value);
    chart.setAll({
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: -10,
    });

    series.columns.template.adapters.add('fillOpacity', (fillOpacity, target) => {
        const targetMonth = dayjs.utc(target.dataItem?.dataContext?.[DATE_FIELD_NAME]).format(DATE_FORMAT);
        if (targetMonth === state.previousMonth.format(DATE_FORMAT)) return 1;
        if (targetMonth === state.selectedMonth.format(DATE_FORMAT)) return 0.2;
        return fillOpacity;
    });

    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip, state.currency, props.currencyRates);
    series.set('tooltip', tooltip);
    series.data.processor = chartHelper.createDataProcessor({
        dateFormat: DATE_FORMAT,
    });
    series.data.setAll(chartData);
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<Data>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  @refresh="handleRefresh"
    >
        <div class="monthly-cost">
            <div class="cost">
                <p class="cost-label">
                    {{ t('DASHBOARDS.WIDGET.MONTHLY_COST.TOTAL_SPENT_IN', {period: formattedCurrentMonth}) }}
                </p>
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="state.data"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="cost-value">
                        {{ currencyMoneyFormatter(state.currentMonthlyCost, state.currency, props.currencyRates) }}
                    </div>
                    <div class="cost-info">
                        <p-i v-if="typeof state.isDecreased === 'boolean'"
                             :name="state.isDecreased ? 'ic_caret-down-filled-alt' : 'ic_caret-up-filled-alt'"
                             fill
                             width="1rem"
                             height="1rem"
                             :color="state.isDecreased ? green[700] : red[500]"
                             original
                        />
                        {{ currencyMoneyFormatter(state.differenceCost, state.currency, props.currencyRates) }}
                        <p-badge :style-type="state.isDecreased === undefined ? 'gray200' : state.isDecreased ? 'green200' : 'alert'"
                                 :badge-type="state.isDecreased ? 'subtle' : 'solid'"
                                 shape="square"
                        >
                            {{ state.differenceCostRate }} %
                        </p-badge>
                    </div>
                    <template #loader>
                        <div class="skeleton-wrapper">
                            <p-skeleton class="skeleton"
                                        width="10rem"
                                        height="1.875rem"
                            />
                            <p-skeleton class="skeleton"
                                        width="7.5rem"
                                        height="1.5rem"
                            />
                        </div>
                    </template>
                </p-data-loader>
            </div>
            <p-divider />
            <div class="cost">
                <p class="cost-label">
                    {{ t('DASHBOARDS.WIDGET.MONTHLY_COST.TOTAL_SPENT_IN', {period: formattedPreviousMonth}) }}
                </p>
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="state.data"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="cost-value">
                        {{ currencyMoneyFormatter(state.previousMonthlyCost, state.currency, props.currencyRates) }}
                    </div>
                    <div class="cost-info">
                        {{ state.previousMonth.format('MMM YYYY') }}
                    </div>
                    <template #loader>
                        <div class="skeleton-wrapper">
                            <p-skeleton class="skeleton"
                                        width="10rem"
                                        height="1.875rem"
                            />
                            <p-skeleton class="skeleton"
                                        width="7.5rem"
                                        height="1.5rem"
                            />
                        </div>
                    </template>
                </p-data-loader>
            </div>
            <div class="chart-wrapper">
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="state.data"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.monthly-cost {
    display: flex;
    flex-direction: column;
    height: 100%;
    .cost {
        @apply text-gray-900;
        line-height: 1.25;
        height: 5.75rem;
        .cost-label {
            font-size: 1rem;
        }
        .cost-value {
            margin: 0.25rem 0;
            font-size: 1.5rem;
        }
        .cost-info {
            @apply flex items-center text-gray-700 font-medium;
        }
        .p-badge {
            margin-left: 0.5rem;
        }
    }

    .p-divider {
        display: block;
        margin: 1.5rem 0;
    }

    .chart-wrapper {
        flex-grow: 1;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        width: 100%;
        .chart {
            height: 100%;
        }
    }
    .data-loader {
        display: flex;
        width: 100%;
        height: 100%;
        .skeleton-wrapper {
            width: 100%;
            height: 100%;
            .skeleton {
                display: block;
                margin-top: 0.25rem;
            }
        }
    }
}
</style>
