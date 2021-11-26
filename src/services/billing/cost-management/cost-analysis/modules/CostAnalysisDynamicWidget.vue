<template>
    <p-chart-loader :loading="loading" class="cost-analysis-dynamic-widget">
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartRef" class="chart" />
    </p-chart-loader>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import {
    useDynamicChart,
} from '@/services/billing/cost-management/cost-analysis/composables/cost-analysis-dynamic-chart';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { CURRENCY } from '@/store/modules/display/config';


import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';
import { getTimeUnitByPeriod } from '@/services/billing/cost-management/cost-analysis/lib/helper';

import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import {
    getCurrencyAppliedChartData,
    getQueryAppliedChartData,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { ChartData, Legend, WidgetProps } from '@/services/billing/cost-management/widgets/type';


interface Props extends WidgetProps {
    loading: boolean;
    chart: XYChart | PieChart;
    chartType: CHART_TYPE;
    chartData: ChartData[];
    legends: Legend[];
    granularity: GRANULARITY;
    period: Period;
}

export default {
    name: 'CostAnalysisDynamicWidget',
    components: {
        PChartLoader,
        PSkeleton,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        chart: {
            type: Object,
            default: () => ({}),
        },
        chartType: {
            type: String,
            default: CHART_TYPE.STACKED_COLUMN,
            validator(value: any) {
                return Object.values(CHART_TYPE).includes(value);
            },
        },
        chartData: {
            type: Array,
            default: () => ([]),
        },
        legends: {
            type: Array,
            default: () => ([]),
        },
        granularity: {
            type: String,
            default: GRANULARITY.DAILY,
            validator(value: any) {
                return Object.values(GRANULARITY).includes(value);
            },
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
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            proxyChart: makeProxy('chart', props, emit),
            USDChartData: [] as ChartData[],
        });

        const drawChart = (chartContext) => {
            const timeUnit = getTimeUnitByPeriod(props.granularity, dayjs(props.period.start), dayjs(props.period.end));

            state.USDChartData = getQueryAppliedChartData(
                props.chartData,
                props.period,
                props.chartType,
                props.granularity,
                timeUnit,
            );


            const { chart } = useDynamicChart(props.chartType, {
                data: getCurrencyAppliedChartData(
                    state.USDChartData,
                    props.currency,
                    props.currencyRates,
                ),
                valueOptions: {},
                categoryOptions: {
                    legends: computed(() => props.legends),
                    path: 'date',
                    timeUnit,
                },
                chartContainer: chartContext,
            });

            if (props.chartType !== CHART_TYPE.DONUT) {
                const start = dayjs(props.period.start);
                const end = dayjs(props.period.end);
                const diff = end.diff(start, timeUnit);
                if (diff > 31) {
                    (chart as XYChart).scrollbarX = new am4core.Scrollbar();
                }
            }

            return chart;
        };

        watch([() => state.chartRef, () => props.loading], async ([chartContext, loading]) => {
            if (chartContext && !loading) {
                const chart = drawChart(chartContext);
                emit('update:chart', chart);
            }
        }, { immediate: false });

        watch(() => props.currency, (currency) => {
            if (state.proxyChart) {
                state.proxyChart.data = getCurrencyAppliedChartData(state.USDChartData, currency, props.currencyRates);
            }
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.cost-analysis-dynamic-widget {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
