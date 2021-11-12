<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { MapChart } from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodataContinentsLow from '@amcharts/amcharts4-geodata/continentsLow';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import config from '@/lib/config';
import { gray } from '@/styles/colors';

am4core.useTheme(am4themesAnimated);

const tempPieChartData = [{
    title: 'North America',
    latitude: 39.563353,
    longitude: -99.316406,
    width: 100,
    height: 100,
    pieData: [{
        category: 'AWS',
        value: 1200,
    }, {
        category: 'Azure',
        value: 500,
    }, {
        category: 'Google',
        value: 765,
    }],
}, {
    title: 'Europe',
    latitude: 50.896104,
    longitude: 19.160156,
    width: 50,
    height: 50,
    pieData: [{
        category: 'AWS',
        value: 200,
    }, {
        category: 'Azure',
        value: 600,
    }, {
        category: 'Google Cloud',
        value: 350,
    }],
}, {
    title: 'Asia',
    latitude: 47.212106,
    longitude: 103.183594,
    width: 80,
    height: 80,
    pieData: [{
        category: 'AWS',
        value: 352,
    }, {
        category: 'Azure',
        value: 266,
    }, {
        category: 'Google Cloud',
        value: 512,
    }],
}, {
    title: 'Africa',
    latitude: 11.081385,
    longitude: 21.621094,
    width: 50,
    height: 50,
    pieData: [{
        category: 'AWS',
        value: 200,
    }, {
        category: 'Azure',
        value: 300,
    }, {
        category: 'Google Cloud',
        value: 599,
    }],
}];

const categoryKey = 'title';
const valueName = 'value';

export default {
    name: 'CostByRegion',
    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as MapChart | null,
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

            pieSeries.data = tempPieChartData;
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
