<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
    >
        <div class="monthly-cost">
            <div class="cost">
                <p class="cost-label">
                    <!-- song-lang -->
                    Current month
                </p>
                <div class="cost-value">
                    {{ currencyMoneyFormatter(state.currentMonthlyCost, state.options.currency) }}
                </div>
                <div class="cost-info">
                    <p-i
                        :name="state.isDecrease ? 'ic_decrease' : 'ic_increase'"
                        fill
                        width="1rem"
                        height="1rem"
                        :color="state.isDecrease ? green[700] : red[500]"
                        original
                    />
                    {{ currencyMoneyFormatter(state.differenceCost, state.options.currency) }}
                    <p-badge :style-type="state.isDecrease ? 'green200' : 'alert'"
                             shape="square"
                    >
                        {{ state.differenceCostRate }} %
                    </p-badge>
                </div>
            </div>
            <p-divider />
            <div class="cost">
                <p class="cost-label">
                    <!-- song-lang -->
                    Previous month
                </p>
                <div class="cost-value">
                    {{ currencyMoneyFormatter(state.previousMonthlyCost, state.options.currency) }}
                </div>
                <div class="cost-info">
                    {{ state.previousMonth.format(DATE_FORMAT) }}
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
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { random } from 'lodash';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { green, red } from '@/styles/colors';

import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
import type { XYChartData, HistoryDataModel } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
// eslint-disable-next-line import/no-cycle
import { getRefinedXYChartData } from '@/services/dashboards/widgets/widget-helper';

const SAMPLE_RAW_DATA = {
    more: false,
    results: [
        {
            usd_cost_sum: [
                { date: '2022-01', value: random(100, 5000) },
                { date: '2022-02', value: random(100, 5000) },
                { date: '2022-03', value: random(100, 5000) },
                { date: '2022-04', value: random(100, 5000) },
                { date: '2022-05', value: random(100, 5000) },
                { date: '2022-06', value: random(100, 5000) },
                { date: '2022-07', value: random(100, 5000) },
                { date: '2022-08', value: random(100, 5000) },
                { date: '2022-09', value: 0 },
                { date: '2022-10', value: random(100, 5000) },
                { date: '2022-11', value: random(100, 5000) },
                { date: '2022-12', value: random(100, 5000) },
            ],
        },
    ],
};

const chartContext = ref<HTMLElement | null>(null);
const {
    createXYDateChart, createXYColumnSeries,
    createTooltip, createDataProcessor, setChartColors, setXYSingleTooltipText,
    disposeRoot, refreshRoot,
} = useAmcharts5(chartContext);

const DATE_FORMAT = 'MMM YYYY';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const state = reactive({
    ...toRefs(useWidgetState<HistoryDataModel['results']>(props)),
    chartData: computed(() => getRefinedXYChartData(state.data)),
    currentMonthlyCost: 0,
    previousMonthlyCost: 0,
    differenceCost: computed<number>(() => state.currentMonthlyCost - state.previousMonthlyCost),
    differenceCostRate: computed<number>(() => (state.differenceCost !== 0 ? state.differenceCost / state.currentMonthlyCost * 100 : 0)),
    isDecrease: computed<boolean>(() => (state.differenceCost < 0)),
    previousMonth: computed<Dayjs>(() => (dayjs.utc(state.options.date_range?.start).subtract(1, 'month'))),
});

// TODO: api binding
const fetchData = async () => new Promise((resolve) => {
    setTimeout(() => {
        resolve(SAMPLE_RAW_DATA.results);
    }, 2000);
});

/* Util */
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis, yAxis } = createXYDateChart();
    setChartColors(chart, state.colorSet);

    xAxis.get('baseInterval').timeUnit = 'month';
    const yRendered = yAxis.get('renderer');
    yRendered.grid.template.setAll({ strokeOpacity: 0 });
    yRendered.labels.template.setAll({ visible: false });

    chart.setAll({
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: -10,
    });


    const seriesSettings = {
        valueYField: 'value',
    };
    const series = createXYColumnSeries(chart, seriesSettings);
    chart.series.push(series);
    series.columns.template.setAll({
        fillOpacity: 0.5,
        strokeOpacity: 0,
    });
    series.columns.template.adapters.add('fillOpacity', (fillOpacity, target) => {
        const selectedMonth = dayjs.utc(state.options.date_range?.start).format(DATE_FORMAT);
        const previousMonth = dayjs.utc(state.options.date_range?.start).subtract(1, 'month').format(DATE_FORMAT);
        const targetMonth = dayjs.utc(target.dataItem?.dataContext?.[DATE_FIELD_NAME]).format(DATE_FORMAT);
        if (targetMonth === previousMonth) {
            return 1;
        }
        if (targetMonth === selectedMonth) {
            return 0.2;
        }
        return fillOpacity;
    });

    const tooltip = createTooltip();
    setXYSingleTooltipText(chart, tooltip, state.options.currency, props.currencyRates);
    tooltip.label.adapters.add('text', (_, target) => {
        let value = target.dataItem?.dataContext?.[DATE_FIELD_NAME];
        if (state.options.currency) value = currencyMoneyFormatter(value, state.options.currency, props.currencyRates);
        return `{valueX.formatDate('MMM')}: [bold]${value}[/]`;
    });
    series.set('tooltip', tooltip);

    series.data.processor = createDataProcessor({
        dateFormat: DATE_FORMAT,
    });
    series.data.setAll(chartData);
};

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
};

useWidgetLifecycle({
    initWidget, disposeWidget: disposeRoot,
});

defineExpose({
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
