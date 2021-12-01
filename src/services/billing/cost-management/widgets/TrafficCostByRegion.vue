<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { MapChart } from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodataWorldLow from '@amcharts/amcharts4-geodata/worldLow';
import config from '@/lib/config';
import {
    gray, red, yellow, green, violet,
} from '@/styles/colors';


const tempMapData = [
    {
        latitude: 11.081385,
        longitude: 21.621094,
        value: 32358260,
        color: am4core.color(red[200]),
    },
    {
        latitude: 47.212106,
        longitude: 103.183594,
        value: 35980193,
        color: am4core.color(yellow[300]),
    },
    {
        latitude: 50.896104,
        longitude: 19.160156,
        value: 19618432,
        color: am4core.color(violet[400]),
    },
    {
        latitude: 39.563353,
        longitude: -99.316406,
        value: 40764561,
        color: am4core.color(green[500]),
    },
];

const valueName = 'value';

export default {
    name: 'TrafficCostByRegion',
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

            chart.geodata = am4geodataWorldLow;
            chart.projection = new am4maps.projections.Miller();
            chart.responsive.enabled = true;

            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['AQ'];
            polygonSeries.nonScalingStroke = true;
            polygonSeries.strokeWidth = 0.5;
            polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
            polygonSeries.calculateVisualCenter = true;

            const imageSeries = chart.series.push(new am4maps.MapImageSeries());
            imageSeries.data = tempMapData;
            imageSeries.dataFields.value = valueName;
            polygonSeries.events.on('validated', () => {
                imageSeries.invalidate();
            });

            const imageTemplate = imageSeries.mapImages.template;
            imageTemplate.nonScaling = true;
            imageTemplate.propertyFields.longitude = 'longitude';
            imageTemplate.propertyFields.latitude = 'latitude';

            const circle = imageTemplate.createChild(am4core.Circle);
            circle.fillOpacity = 0.7;
            circle.propertyFields.fill = 'color';
            circle.tooltipText = '{name}: [bold]{value}[/]';

            imageSeries.heatRules.push({
                target: circle,
                property: 'radius',
                min: 4,
                max: 30,
                dataField: valueName,
            });
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
