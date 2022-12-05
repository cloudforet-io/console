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
import { cloneDeep, random } from 'lodash';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import {
    green, red, violet,
} from '@/styles/colors';

import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
import type { XYChartData } from '@/services/dashboards/widgets/type';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';

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
    ...toRefs(useWidgetState(props)),
    chartData: computed(() => {
        if (!state.data) return [];
        return state.data;
    }),
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
        resolve([{
            date: '2022-01',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-02',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-03',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-04',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-05',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-06',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-07',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-08',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-09',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-10',
            usd_cost: random(1000, 5000),
        }, {
            date: '2022-11',
            usd_cost: random(1000, 5000),
        }]);
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
        name: 'usd_cost',
        valueYField: 'usd_cost',
        valueXField: 'date',
    };
    const series = createXYColumnSeries(chart, seriesSettings);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    series.columns.template.adapters.add('fill', (fill, target) => {
        const thisMonth = dayjs.utc(state.options.date_range?.start).format(DATE_FORMAT);
        const previousMonth = dayjs.utc(state.options.date_range?.start).subtract(1, 'month').format(DATE_FORMAT);

        if (dayjs.utc(target.dataItem?.dataContext?.date).format(DATE_FORMAT) === thisMonth) {
            return violet[200];
        }
        if (dayjs.utc(target.dataItem?.dataContext?.date).format(DATE_FORMAT) === previousMonth) {
            return violet[600];
        }
        return fill;
    });
    series.data.processor = createDataProcessor({
        dateFormat: DATE_FORMAT,
        dateFields: [DATE_FIELD_NAME],
    });
    series.data.setAll(cloneDeep(chartData));

    const tooltip = createTooltip();
    setXYSingleTooltipText(chart, tooltip, state.options.currency, props.currencyRates);
    series.set('tooltip', tooltip);
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
            @apply text-gray-700 font-medium;
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
