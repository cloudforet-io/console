<template>
    <widget-frame v-bind="widgetFrameProps"
                  @refresh="handleRefresh"
    >
        <p-data-loader class="monthly-cost"
                       :loading="state.loading"
                       :data="state.data"
                       :loader-backdrop-opacity="1"
                       loader-type="skeleton"
        >
            <div class="cost">
                <p class="cost-label">
                    {{ $t('DASHBOARDS.WIDGET.MONTHLY_COST.CURRENT_MONTH') }}
                </p>
                <div class="cost-value">
                    {{ currencyMoneyFormatter(state.currentMonthlyCost, state.currency) }}
                </div>
                <div class="cost-info">
                    <p-i
                        :name="state.isDecreased ? 'ic_decrease' : 'ic_increase'"
                        fill
                        width="1rem"
                        height="1rem"
                        :color="state.isDecreased ? green[700] : red[500]"
                        original
                    />
                    {{ currencyMoneyFormatter(state.differenceCost, state.currency) }}
                    <p-badge :style-type="state.isDecreased ? 'green200' : 'alert'"
                             shape="square"
                    >
                        {{ state.differenceCostRate }} %
                    </p-badge>
                </div>
            </div>
            <p-divider />
            <div class="cost">
                <p class="cost-label">
                    {{ $t('DASHBOARDS.WIDGET.MONTHLY_COST.PREVIOUS_MONTH') }}
                </p>
                <div class="cost-value">
                    {{ currencyMoneyFormatter(state.previousMonthlyCost, state.currency) }}
                </div>
                <div class="cost-info">
                    {{ state.previousMonth.format('MMM YYYY') }}
                </div>
            </div>
            <div class="chart-wrapper">
                <div ref="chartContext"
                     class="chart"
                />
            </div>
            <template #loader>
                <div v-for="(_, idx) in state.skeletons"
                     :key="`skeleton-${idx}`"
                     class="skeleton-wrapper mt-4"
                >
                    <p-skeleton width="10rem"
                                height="1.875rem"
                                class="mb-1"
                    />
                    <p-skeleton width="7.5rem"
                                height="1.5rem"
                    />
                </div>
                <p-skeleton width="100%"
                            height="100%"
                />
            </template>
        </p-data-loader>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';

import {
    PDivider, PDataLoader, PBadge, PI, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { getDateAxisSettings, getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { XYChartData, CostAnalyzeDataModel } from '@/services/dashboards/widgets/type';

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

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
        if (Number.isNaN(state.differenceCost)) return '--';
        if (state.currentMonthlyCost === 0) previousMonthlyCost = 1;
        return (state.differenceCost / previousMonthlyCost * 100).toFixed(2);
    }),
    isDecreased: computed<boolean>(() => (state.differenceCost < 0)),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<Data> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.consoleFilters);
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
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
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
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
});

defineExpose<WidgetExpose<Data>>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.monthly-cost {
    display: flex;
    flex-direction: column;
    .cost {
        @apply text-gray-900;
        line-height: 1.25;
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
        height: 6.25rem;
        margin-top: 1.5rem;
        width: 100%;
        .chart {
            height: 100%;
        }
    }
}
:deep(.data-loader-container) {
    > .loader-wrapper > .loader {
        @apply flex-col items-start justify-start;
    }
    .skeleton-wrapper {
        @apply flex flex-col;
        &:last-of-type {
            margin-top: 3.8125rem;
            margin-bottom: 1.875rem;
        }
    }
}
</style>
