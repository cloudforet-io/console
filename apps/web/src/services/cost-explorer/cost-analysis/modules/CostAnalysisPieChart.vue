<template>
    <p-data-loader :loading="loading"
                   class="cost-analysis-pie-chart"
    >
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartRef"
             class="chart"
        />
    </p-data-loader>
</template>

<script lang="ts">

import {
    getCurrentInstance,
    reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import type { PieChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';

import { CURRENCY } from '@/store/modules/settings/config';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { gray } from '@/styles/colors';

import type {
    Legend, PieChartData, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

interface Props extends WidgetProps {
    loading: boolean;
    chart: PieChart;
    chartData: PieChartData[];
    legends: Legend[];
}

const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';

export default {
    name: 'CostAnalysisPieChart',
    components: {
        PDataLoader,
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
        chartData: {
            type: Array,
            default: () => ([]),
        },
        legends: {
            type: Array,
            default: () => ([]),
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
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            chartRef: null as HTMLElement | null,
            isChartDrawn: false,
        });

        /* util */
        const _createDummySeries = (chart) => {
            const series = chart.series.push(new am4charts.PieSeries());
            series.showOnInit = true;
            series.dataFields.category = CATEGORY_KEY;
            series.dataFields.value = VALUE_KEY;
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.slices.template.propertyFields.fill = 'color';
            series.tooltip.disabled = true;
            series.ticks.template.disabled = true;
            series.labels.template.text = '';
            const slice = series.slices.template;
            slice.states.getKey('hover').properties.scale = 1;
        };
        const _createSeries = (chart) => {
            const series = chart.series.push(new am4charts.PieSeries());
            series.showOnInit = true;
            series.dataFields.category = CATEGORY_KEY;
            series.dataFields.value = VALUE_KEY;
            series.slices.template.stroke = am4core.color('white');
            series.slices.template.strokeOpacity = 1;
            series.labels.template.fontSize = 12;
            series.labels.template.fill = am4core.color(gray[900]);
            series.labels.template.bent = true;

            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.slices.template.propertyFields.fill = 'color';
            series.tooltip.label.fontSize = 14;

            series.slices.template.adapter.add('tooltipText', (tooltipText, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const currencyMoney = currencyMoneyFormatter(target.dataItem.value, props.currency, props.currencyRates, true);
                    return `{${CATEGORY_KEY}}: [bold]${currencyMoney}[/] ({${VALUE_KEY}.percent.formatNumber('#.00')}%)`;
                }
                return tooltipText;
            });

            const slice = series.slices.template;
            slice.states.getKey('hover').properties.scale = 1;
        };
        const drawChart = (chartContainer) => {
            state.isChartDrawn = false;
            const chart = am4core.create(chartContainer, am4charts.PieChart);
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.events.on('ready', () => {
                state.isChartDrawn = true;
            });
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;

            if (props.chartData.length) {
                chart.data = props.chartData;
                _createSeries(chart);
            } else {
                chart.data = [{
                    category: 'Dummy',
                    value: 1000,
                    color: gray[200],
                }];
                _createDummySeries(chart);
            }

            chart.responsive.enabled = true;
            chart.innerRadius = am4core.percent(57);
            return chart;
        };

        watch([() => state.chartRef, () => props.loading], async ([chartContext, loading]) => {
            if (chartContext && !loading) {
                const chart = drawChart(chartContext);
                emit('update:chart', chart);
            }
        }, { immediate: false });

        watch([() => state.isChartDrawn, () => props.loading], async ([isChartDrawn, loading]) => {
            if (isChartDrawn && !loading) {
                await vm.$nextTick();
                setTimeout(() => {
                    emit('rendered');
                }, 500);
            }
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.cost-analysis-pie-chart {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
