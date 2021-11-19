<template>
    <cost-dashboard-card-widget-layout
        title="Service Account Cost Insight"
        :data-range="15"
        :widget-link="widgetLink"
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
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import config from '@/lib/config';
import { TreeMap } from '@amcharts/amcharts4/charts';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/cost-dashboard/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { IDENTITY_ROUTE } from '@/services/identity/routes';

am4core.useTheme(am4themesAnimated);

const tempMapData = [{
    name: 'Service Account1',
    value: 190,
}, {
    name: 'Service Account2',
    value: 289,
}, {
    name: 'Service Account3',
    value: 635,
}, {
    name: 'Service Account4',
    value: 732,
}, {
    name: 'Service Account5',
    value: 835,
}];

const categoryKey = 'name';
const valueName = 'value';

const widgetLink = {
    name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME,
    params: {},
    query: {},
};

export default {
    name: 'ServiceAccountCostInsight',
    components: { CostDashboardCardWidgetLayout },
    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as TreeMap | null,
            chartRegistry: {},
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

            chart.data = tempMapData;
            chart.dataFields.value = valueName;
            chart.dataFields.name = categoryKey;
        };

        watch(() => state.chartRef, (chartContext) => {
            if (chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            widgetLink,
        };
    },
};
</script>

<style lang="postcss" scoped>
.chart {
    @apply flex;
    height: 20rem;
}
</style>
