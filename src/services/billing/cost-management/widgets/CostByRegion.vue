<template>
    <cost-dashboard-card-widget-layout
        title="Cost By Region"
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
    computed,
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { cloneDeep } from 'lodash';
import { MapChart } from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodataContinentsLow from '@amcharts/amcharts4-geodata/continentsLow';
import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { continentData } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';


const categoryKey = 'title';
const valueName = 'value';

const widgetLink = {
    name: INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
    params: {},
    query: {},
};

export default {
    name: 'CostByRegion',
    components: { CostDashboardCardWidgetLayout },
    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as MapChart | null,
            chartRegistry: {},
            regions: computed(() => store.state.resource.region.items),
            loading: true,
            data: [] as any,
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
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4maps.MapChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.chartContainer.wheelable = true;
            chart.zoomControl = new am4maps.ZoomControl();

            chart.geodata = am4geodataContinentsLow;
            chart.projection = new am4maps.projections.Miller();
            chart.responsive.enabled = true;

            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['antarctica'];
            polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
            polygonSeries.calculateVisualCenter = true;

            const pieSeries = chart.series.push(new am4maps.MapImageSeries());
            const pieTemplate = pieSeries.mapImages.template;
            pieTemplate.propertyFields.latitude = 'latitude';
            pieTemplate.propertyFields.longitude = 'longitude';

            const pieChartTemplate = pieTemplate.createChild(am4charts.PieChart);
            pieChartTemplate.adapter.add('data', (data, target) => {
                if (target.dataItem) return target.dataItem.dataContext.pieData;
                return [];
            });
            pieChartTemplate.propertyFields.width = 'width';
            pieChartTemplate.propertyFields.height = 'height';
            pieChartTemplate.horizontalCenter = 'middle';
            pieChartTemplate.verticalCenter = 'middle';

            const pieSeriesTemplate = pieChartTemplate.series.push(new am4charts.PieSeries());
            pieSeriesTemplate.dataFields.category = categoryKey;
            pieSeriesTemplate.dataFields.value = valueName;
            pieSeriesTemplate.labels.template.disabled = true;
            pieSeriesTemplate.ticks.template.disabled = true;

            pieSeries.data = state.data;
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        const setPieChartData = (chartData) => {
            const _continentData = cloneDeep(continentData);
            chartData.forEach((d) => {
                const target = _continentData.find(continent => continent.continent_code === (state.regions[d.region_code]?.continent?.continent_code));
                if (target) {
                    target.pieData.push({
                        category: `${d.provider}:${d.region_code}`,
                        value: d.usd_cost,
                    });
                }
            });
            return _continentData;
        };

        const getChartData = async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: 'ACCUMULATED',
                    group_by: ['provider', 'region_code'],
                    start: '2021-10-01T00:00:00Z',
                    end: '2021-10-16T00:00:00Z',
                    page: {
                        limit: 15,
                    },
                });
                state.data = setPieChartData(results);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await store.dispatch('resource/region/load');
            await getChartData();
        })();

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
