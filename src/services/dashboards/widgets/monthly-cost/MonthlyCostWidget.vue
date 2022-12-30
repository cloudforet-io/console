<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
                  :edit-mode="props.editMode"
    >
        <div class="monthly-cost">
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
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.data"
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

<script setup lang="ts">
import {
    computed,
    defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import {
    PDivider, PDataLoader, PBadge, PI,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import { GRANULARITY } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
import type { XYChartData, HistoryDataModel } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { getRefinedXYChartData } from '@/services/dashboards/widgets/widget-chart-helper';

const chartContext = ref<HTMLElement | null>(null);
const {
    createXYDateChart, createXYColumnSeries,
    createTooltip, createDataProcessor, setChartColors, setXYSingleTooltipText,
    disposeRoot, refreshRoot,
} = useAmcharts5(chartContext);

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const state = reactive({
    ...toRefs(useWidgetState<HistoryDataModel['results']>(props)),
    chartData: computed(() => getRefinedXYChartData(state.data)),
    dateRange: computed<DateRange>(() => {
        const end = state.settings?.date_range?.end ?? dayjs.utc().format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    selectedMonth: computed(() => (dayjs.utc(state.dateRange.end))),
    previousMonth: computed(() => (dayjs.utc(state.dateRange.end).subtract(1, 'month'))),
    currentMonthlyCost: computed(() => getMonthlyCost(state.selectedMonth)),
    previousMonthlyCost: computed(() => getMonthlyCost(state.previousMonth)),
    differenceCost: computed(() => {
        const cost = state.currentMonthlyCost - state.previousMonthlyCost;
        if (cost === 0 || Number.isNaN(cost)) return '--';
        return cost;
    }),
    differenceCostRate: computed(() => {
        if (state.differenceCost === 0 || Number.isNaN(state.differenceCost)) return '--';
        return (state.differenceCost / state.currentMonthlyCost * 100).toFixed(2);
    }),
    isDecreased: computed<boolean>(() => (state.differenceCost < 0)),
});

/* Api */
const fetchData = async () => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            // TODO: inherit from dashboard variables
            query: {
                granularity: GRANULARITY.MONTHLY,
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                },
                field_group: ['date'],
                // filter: [{ k: 'project_id', v: 'project-18655561c535', o: 'eq' }],
            },
        });
        state.data = results;
    } catch (e) {
        state.date = [];
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Util */
const getMonthlyCost = (month) => {
    if (!state.data) return '--';
    const monthlyCost = state.data[0].usd_cost_sum.find((costData) => costData.date === month.format(DATE_FORMAT))?.value;
    return monthlyCost;
};

const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis, yAxis } = createXYDateChart();
    xAxis.get('baseInterval').timeUnit = 'month';
    const yRendered = yAxis.get('renderer');
    yRendered.grid.template.setAll({ strokeOpacity: 0 });
    yRendered.labels.template.setAll({ visible: false });
    const seriesSettings = {
        valueYField: 'value',
    };
    const series = createXYColumnSeries(chart, seriesSettings);
    chart.series.push(series);
    series.columns.template.setAll({
        fillOpacity: 0.5,
        strokeOpacity: 0,
    });
    setChartColors(chart, state.colorSet);
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

    const tooltip = createTooltip();
    setXYSingleTooltipText(chart, tooltip, state.currency, props.currencyRates);
    series.set('tooltip', tooltip);
    series.data.processor = createDataProcessor({
        dateFormat: DATE_FORMAT,
    });
    series.data.setAll(chartData);
};

const initWidget = async () => {
    await fetchData();
    await nextTick();
    drawChart(state.chartData);
};

const refreshWidget = async () => {
    await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
};

useWidgetLifecycle({
    disposeWidget: disposeRoot,
});

defineExpose({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.monthly-cost {
    display: flex;
    flex-direction: column;
    padding: 0 1.5rem;
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
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
