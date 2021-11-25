<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { PieChart } from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import dayjs from 'dayjs';

am4core.useTheme(am4themesAnimated);

const categoryKey = 'project_id';
const valueName = 'usd_cost';

const currentDay = dayjs().utc();
const currentMonthPeriod = {
    start: currentDay.startOf('month'),
    end: currentDay,
};

interface ChartData {
    project_id: string;
    usd_cost: number;
}

export default {
    name: 'SpcProjectWiseUsageSummary',
    components: {},

    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as PieChart | null,
            chartRegistry: {},
            loading: true,
            data: [] as ChartData[],
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
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.PieChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.data = state.data;

            const pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = valueName;
            pieSeries.dataFields.category = categoryKey;

            pieSeries.labels.template.disabled = true;
        };

        const getChartData = async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: ['project_id'],
                    start: currentMonthPeriod.start,
                    end: currentMonthPeriod.end,
                    page: {
                        limit: 15,
                    },
                });
                state.data = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        (() => {
            getChartData();
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.chart {
    height: 20rem;
}
</style>
