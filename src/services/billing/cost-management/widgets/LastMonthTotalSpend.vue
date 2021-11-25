<template>
    <cost-dashboard-simple-card-widget
        v-if="!loading"
        title="Last Month Total Spend"
        unit-type="CURRENCY"
        unit="USD"
        :value="lastMonth.usd_cost"
        :description="lastMonth.date"
    >
        <template #default>
            <div ref="chartRef" class="chart" />
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">
import CostDashboardSimpleCardWidget
    from '@/services/billing/cost-management/widgets/modules/CostDashboardSimpleCardWidget.vue';
import {
    computed,
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import { violet } from '@/styles/colors';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

am4core.useTheme(am4themesAnimated);

const categoryKey = 'date';
const valueName = 'usd_cost';

interface ChartData {
    date: string;
    usd_cost: number;
}

export default {
    name: 'LastMonthTotalSpend',
    components: { CostDashboardSimpleCardWidget },
    props: {
        chartData: {
            type: Array,
            default: () => ([]),
        },
    },
    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as XYChart | null,
            chartRegistry: {},
            loading: true,
            data: [] as ChartData[],
            firstMonth: computed(() => state.data[0]),
            lastMonth: computed(() => state.data[state.data.length - 2]),
            thisMonth: computed(() => state.data[state.data.length - 1]),
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

            chart.paddingBottom = 0;

            const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = categoryKey;
            categoryAxis.renderer.minGridDistance = 1;
            categoryAxis.renderer.grid.template.strokeOpacity = 0;
            categoryAxis.renderer.grid.template.disabled = true;

            categoryAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem.category === state.firstMonth.date) return state.firstMonth.date;
                if (target.dataItem.category === state.lastMonth.date) return state.lastMonth.date;
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
            series.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/b]';

            series.columns.template.adapter.add('fill', (fill, target) => {
                if (target.dataItem?.dataContext?.date === state.thisMonth.date) {
                    return am4core.color(violet[200]);
                }
                if (target.dataItem?.dataContext?.date === state.lastMonth.date) {
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
                    start: '2020-11-01T00:00:00Z',
                    end: '2021-10-16T00:00:00Z',
                    page: {
                        limit: 12,
                    },
                });
                state.data = results.map(d => ({
                    date: d.date,
                    usd_cost: d.values[0].usd_cost,
                }));
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

        return { ...toRefs(state) };
    },
};
</script>
