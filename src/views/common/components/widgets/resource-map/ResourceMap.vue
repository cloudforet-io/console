<template>
    <p-pane-layout class="resource-map">
        <p class="title">
            Region
        </p>
        <div class="chart-wrapper">
            <div class="chart-loader">
                <div id="chartRef" ref="chartRef" />
            </div>
            <div v-if="!loading" class="resource-info-wrapper">
                <div class="resource-info-title">
                    <span class="resource-info-provider"
                          :style="{ color: providerColor }"
                    >
                        {{ selectedProvider }}  </span>
                    <span class="resource-info-region">{{ selectedRegion }}</span> <br>
                    Resources
                </div>
                <div v-if="Object.keys(filteredData).length > 10">
                    <div v-for="i in 10" :key="i" class="progress-bar">
                        <div class="progress-bar-label">
                            <span class="label-text">{{ Object.keys(filteredData)[i] }}</span>
                            <span class="label-number">{{ Object.values(filteredData)[i] }}</span>
                        </div>
                        <p-progress-bar :percentage="(Object.values(filteredData)[i] / maxValue) * 100"
                                        class="progress-bar" :class="selectedProvider.toLowerCase()"
                        />
                    </div>
                </div>
                <div v-else-if="0 < Object.keys(filteredData).length && Object.keys(filteredData).length < 10">
                    <div v-for="i in (Object.keys(filteredData).length)" :key="i" class="progress-bar">
                        <div class="progress-bar-label">
                            <span class="label-text">{{ Object.keys(filteredData)[i-1] }}</span>
                            <span class="label-number">{{ Object.values(filteredData)[i-1] }}</span>
                        </div>
                        <p-progress-bar :percentage="(Object.values(filteredData)[i-1] / maxValue) * 100" :class="selectedProvider.toLowerCase()" />
                    </div>
                </div>
            </div>
            <div v-else class="w-full flex items-center justify-center">
                <p-lottie name="thin-spinner"
                          auto
                          :size="1.5"
                />
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import PProgressBar from '@/components/molecules/progress-bar/PProgressBar.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { store } from '@/store';

am4core.useTheme(am4themes_animated);
const colorSet = new am4core.ColorSet();

export default {
    name: 'ResourceMap',
    components: {
        PLottie,
        PPaneLayout,
        PProgressBar,
    },
    setup() {
        const state = reactive({
            chartRef: null as HTMLElement|null,
            data: [] as any,
            filteredData: [] as any,
            selectedProvider: 'AWS',
            selectedRegion: 'Asia Pacific (Seoul)',
            providerColor: '#FF9900',
            loading: true,
            maxValue: 0,
            providers: computed(() => store.state.resource.provider.items),
        });
        /* Create map instance */

        const getFilteredData = async (regionCode) => {
            state.loading = true;
            try {
                const resp = await SpaceConnector.client.inventory.cloudService.list({
                    query: new QueryHelper()
                        .setFilter({ k: 'region_code', v: regionCode, o: 'eq' })
                        .setOnly('cloud_service_group', 'cloud_service_type', 'provider')
                        .data,
                });
                state.filteredData = resp.results.map(d => d.cloud_service_group).reduce((x, y) => {
                    x[y] = ++x[y] || 1;
                    return x;
                }, {});
                if (state.filteredData) {
                    const countArray = Object.values(state.filteredData) as number[];
                    state.maxValue = Math.max(...countArray);
                } else state.maxValue = 0;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const animateBullet = (circle) => {
            const animation = circle.animate([{ property: 'scale', from: 1, to: 5 }, { property: 'opacity', from: 1, to: 0 }],
                1000, am4core.ease.circleOut);
            animation.events.on('animationended', (event) => {
                animateBullet(event.target.object);
            });
        };

        const drawMarker = (coords, chart) => {
            const mapImageSeries = chart.series.push(new am4maps.MapImageSeries());
            const mapImage = mapImageSeries.mapImages;
            const mapImageTemplate = mapImage.template;
            const mapMarker = mapImageTemplate.createChild(am4core.Sprite);
            mapMarker.path = 'M4 12 A12 12 0 0 1 28 12 C28 20, 16 32, 16 32 C16 32, 4 20 4 12 M11 12 A5 5 0 0 0 21 12 A5 5 0 0 0 11 12 Z';
            mapMarker.width = 32;
            mapMarker.height = 32;
            mapMarker.scale = 0.7;
            mapMarker.fill = am4core.color('#F55A2F');
            mapMarker.fillOpacity = 0.8;
            mapMarker.horizontalCenter = 'middle';
            mapMarker.verticalCenter = 'bottom';

            const marker = mapImage.create();
            marker.latitude = coords.latitude;
            marker.longitude = coords.longitude;
        };


        const drawChart = async () => {
            const chart = am4core.create('chartRef', am4maps.MapChart);
            chart.geodata = am4geodata_worldLow;
            chart.projection = new am4maps.projections.Miller();
            chart.responsive.enabled = true;
            chart.logo.disabled = true;
            chart.chartContainer.wheelable = true;
            chart.zoomControl = new am4maps.ZoomControl();

            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['AQ'];
            polygonSeries.mapPolygons.template.fill = am4core.color('#E5E5E8');
            polygonSeries.calculateVisualCenter = true;

            const resp = await SpaceConnector.client.inventory.region.list();
            state.data = [
                ...resp.results.map(d => ({
                    title: d.name,
                    latitude: parseInt(d.tags.latitude),
                    longitude: parseInt(d.tags.longitude),
                    color: state.providers[d.region_type.toLowerCase()].color as string,
                    ...d,
                })),
            ];

            const imageSeries = chart.series.push(new am4maps.MapImageSeries());
            imageSeries.mapImages.template.propertyFields.longitude = 'longitude';
            imageSeries.mapImages.template.propertyFields.latitude = 'latitude';
            imageSeries.mapImages.template.tooltipText = '{title}';
            const circle = imageSeries.mapImages.template.createChild(am4core.Circle);
            circle.radius = 3;
            circle.propertyFields.fill = 'color';
            const circle2 = imageSeries.mapImages.template.createChild(am4core.Circle);
            circle2.radius = 3;
            circle2.propertyFields.fill = 'color';
            circle2.events.on('inited', (event) => {
                animateBullet(event.target);
            });

            const originCoords = { longitude: 126.871867, latitude: 37.528547 };

            circle2.events.on('hit', async (event) => {
                const originTarget = state.selectedRegion;
                const target = event.target.dataItem?.dataContext as any;
                console.log(event.target.dataItem?.sprites);
                state.selectedProvider = target.region_type;
                state.selectedRegion = target.name;
                state.providerColor = state.providers[state.selectedProvider.toLowerCase()].color as string;
                await getFilteredData(target.region_code);
                const coords = chart.svgPointToGeo(event.svgPoint);
                if (originTarget !== state.selectedRegion) {
                    drawMarker(coords, chart);
                }
            });

            drawMarker(originCoords, chart);
            imageSeries.data = state.data;
        };

        const init = async () => {
            state.loading = true;
            await store.dispatch('resource/provider/load');
            await getFilteredData('ap-northeast-2');
            await drawChart();
            state.loading = false;
        };

        init();

        watch(() => state.chartRef, (chartCtx) => {
            if (chartCtx && !state.loading) {
                drawChart();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),

        };
    },
};
</script>

<style lang="postcss" scoped>
.resource-map {
    @apply border border-gray-100;
    border-radius: 0.375rem;
    height: 30rem;
}
.title {
    @apply text-gray-900;
    font-size: 1rem;
    font-weight: bold;
    line-height: 120%;
    margin-top: 1rem;
    margin-left: 1.5rem;
}
.chart-wrapper {
    height: 90%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 1.5rem;
    margin-top: 1.1875rem;
    padding-bottom: 2rem;
    .chart-loader {
        flex-shrink: 0;
        width: 70%;
        #chartRef {
            @apply w-full h-full;
        }
    }
}
.resource-info-wrapper {
    margin-right: 1.5rem;
    margin-left: 1.5rem;
    width: 100%;
    height: 100%;
    .resource-info-title {
        @apply font-bold;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    .progress-bar-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
    }

    .progress-bar {
        margin-bottom: 0.5rem;
        &.aws {
            >>> .tracker-bar {
                background-color: #f90;
            }
        }
        &.google_cloud {
            >>> .tracker-bar {
                background-color: #4285f4;
            }
        }
        &.azure {
            >>> .tracker-bar {
                background-color: #00bcf2;
            }
        }

        &:hover {
            @apply bg-blue-100;
            border-radius: 0.125rem;
        }
    }
}
</style>
