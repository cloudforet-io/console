<template>
    <p-chart-loader :loading="loading" class="cost-analysis-dynamic-widget">
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartRef" class="chart" />
    </p-chart-loader>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash';
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
    getAccumulatedChartData, getCurrencyAppliedChartData,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import {
    Legend, PieChartData, XYChartData, WidgetProps,
} from '@/services/billing/cost-management/widgets/type';
import { TimeUnit } from '@amcharts/amcharts4/core';


interface Props extends WidgetProps {
    loading: boolean;
    chart: XYChart | PieChart;
    chartType: CHART_TYPE;
    chartData: Array<XYChartData|PieChartData>;
    legends: Legend[];
    granularity: GRANULARITY;
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
            USDChartData: [] as Array<XYChartData|PieChartData>,
        });

        /* util */
        const fillDefaultDataOfLastDay = (chartData: XYChartData[], period: Period, timeUnit: TimeUnit): XYChartData[] => {
            const convertedChartData = [...chartData];
            const dataOfLastDate = chartData.find(d => dayjs(period.end).isSame(d.date, timeUnit));
            if (!dataOfLastDate) {
                convertedChartData.push({
                    date: dayjs(period.end).format(),
                });
            }
            return convertedChartData;
        };

        const drawChart = (chartContext) => {
            const timeUnit = getTimeUnitByPeriod(props.granularity, dayjs(props.period.start), dayjs(props.period.end));

            let USDChartData = cloneDeep(props.chartData);
            if (props.chartType !== CHART_TYPE.DONUT) {
                if (props.granularity === GRANULARITY.ACCUMULATED) {
                    USDChartData = getAccumulatedChartData(props.chartData as XYChartData[], props.period, timeUnit);
                } else {
                    USDChartData = fillDefaultDataOfLastDay(props.chartData as XYChartData[], props.period, timeUnit);
                }
            }
            state.USDChartData = USDChartData;

            const { chart } = useDynamicChart(props.chartType, {
                data: getCurrencyAppliedChartData(
                    USDChartData,
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
