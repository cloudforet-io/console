<template>
    <cost-dashboard-simple-card-widget
        class="last-month-total-spend"
        title="Last Month Total Spend"
        unit-type="CURRENCY"
        :loading="loading"
        :value="lastMonthCost"
        :currency-symbol="currencySymbol"
        :description="description"
        :show-divider="false"
    >
        <template #default>
            <div ref="chartRef" class="chart" />
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import CostDashboardSimpleCardWidget
    from '@/services/billing/cost-management/widgets/modules/CostDashboardSimpleCardWidget.vue';
import {
    onUnmounted, computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import { gray, violet } from '@/styles/colors';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { WidgetProps, XYChartData } from '@/services/billing/cost-management/widgets/type';
import { getXYChartData } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { convertUSDToCurrency, currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { numberFormatter } from '@spaceone/console-core-lib';


const categoryKey = 'date';
const valueName = 'totalCost';

export default {
    name: 'LastMonthTotalSpend',
    components: { CostDashboardSimpleCardWidget },
    props: {
        chartData: {
            type: Array,
            default: () => ([]),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
            validator(value: CURRENCY) {
                return Object.values(CURRENCY).includes(value);
            },
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: WidgetProps) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as XYChart | null,
            chartRegistry: {},
            loading: true,
            data: [] as XYChartData[],
            firstMonth: dayjs.utc().subtract(11, 'month'),
            lastMonth: dayjs.utc().subtract(1, 'month'),
            thisMonth: dayjs.utc(),
            lastMonthCost: computed(() => {
                const cost = state.data.find(d => d.date === state.lastMonth.format('YYYY-MM'))?.totalCost || 0;
                return numberFormatter(convertUSDToCurrency(cost, props.currency, props.currencyRates));
            }),
            description: computed(() => state.lastMonth.format('MMM YYYY')),
            currencySymbol: computed(() => CURRENCY_SYMBOL[props.currency]),
        });

        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                state.chartRegistry[chartContext] = undefined;
            }
        };

        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            state.chart = chart;
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;

            chart.paddingTop = -5;
            chart.paddingBottom = 0;

            const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = categoryKey;
            categoryAxis.renderer.minGridDistance = 1;
            categoryAxis.renderer.grid.template.strokeOpacity = 0;
            categoryAxis.renderer.grid.template.disabled = true;
            categoryAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            categoryAxis.fontSize = 12;

            categoryAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem.category === state.firstMonth.format('YYYY-MM')) {
                    return state.firstMonth.format('MMM');
                }
                if (target.dataItem.category === state.lastMonth.format('YYYY-MM')) {
                    return state.lastMonth.format('MMM');
                }
                return '';
            });

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.labels.template.disabled = true;
            valueAxis.renderer.grid.template.strokeOpacity = 0;
            valueAxis.renderer.baseGrid.disabled = true;
            valueAxis.min = 0;

            const series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = valueName;
            series.dataFields.categoryX = categoryKey;
            series.columns.template.propertyFields.fill = 'color';
            series.columns.template.strokeOpacity = 0;
            series.columns.template.column.cornerRadiusTopLeft = 6;
            series.columns.template.column.cornerRadiusTopRight = 6;
            series.columns.template.width = am4core.percent(45);

            series.columns.template.adapter.add('fill', (fill, target) => {
                if (target.dataItem?.dataContext?.date === state.thisMonth.format('YYYY-MM')) {
                    return am4core.color(violet[200]);
                }
                if (target.dataItem?.dataContext?.date === state.lastMonth.format('YYYY-MM')) {
                    return am4core.color(violet[500]);
                }
                return fill;
            });
            chart.data = state.data;
        };

        const getChartData = async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: 'MONTHLY',
                    filter: [],
                    pivot_type: 'CHART',
                    start: state.firstMonth.format('YYYY-MM'),
                    end: state.thisMonth.add(1, 'month').format('YYYY-MM'),
                    page: {
                        limit: 12,
                    },
                });
                state.data = getXYChartData(results);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        (() => {
            getChartData();
        })();

        watch([() => state.chartRef, () => state.loading], ([chartContext, loading]) => {
            if (chartContext && !loading) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.last-month-total-spend {
    .chart {
        height: 8rem;
    }
}
</style>
