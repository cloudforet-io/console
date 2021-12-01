<template>
    <cost-dashboard-card-widget-layout
        title="Cost By Project"
        :data-range="15"
        :widget-link="widgetLink"
        :no-data="data.length === 0"
        class="cost-by-project"
    >
        <template #default>
            <div ref="chartRef" class="chart" />
        </template>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import {
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import { TreeMap } from '@amcharts/amcharts4/charts';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { IDENTITY_ROUTE } from '@/services/identity/routes';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import dayjs from 'dayjs';
import ErrorHandler from '@/common/composables/error/errorHandler';


const categoryKey = 'project_id';
const valueName = 'usd_cost';

const widgetLink = {
    name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME,
    params: {},
    query: {},
};

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
    name: 'CostByProject',
    components: { CostDashboardCardWidgetLayout },
    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as TreeMap | null,
            chartRegistry: {},
            loading: true,
            data: [] as ChartData[],
        });

        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
        };

        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.TreeMap);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.colors.step = 2;

            chart.data = state.data;
            chart.dataFields.value = valueName;
            chart.dataFields.name = categoryKey;
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
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext && state.data.length > 0) {
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
            widgetLink,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-by-project {
    height: 20rem;
}
</style>
