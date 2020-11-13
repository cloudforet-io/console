<template>
    <p-pane-layout class="resource-map">
        <div class="title">
            Regions
        </div>
        <div class="chart-wrapper">
<!--                <template #loader>-->
<!--                    <p-skeleton width="100%" height="80%" />-->
<!--                </template>-->
            <div class="chart-loader">
                <div id="chartRef" ref="chartRef" />
            </div>
            <div v-if="!loading" class="resource-info-wrapper">
                <div class="resource-info-title">
                    <span class="resource-info-provider">{{ selectedProvider }}  </span>
                    <span class="resource-info-region">{{ selectedRegion }}</span> <br>
                    Resources
                </div>
                <div v-if="Object.keys(filteredData).length > 10">
                    <div v-for="i in 10" class="progress-bar" :key="i">
                        <div class="progress-bar-label">
                            <span class="label-text">{{ Object.keys(filteredData)[i] }}</span>
                            <span class="label-number">{{ Object.values(filteredData)[i] }}</span>
                        </div>
                        <p-progress-bar :percentage="(Object.values(filteredData)[i] / maxValue) * 100"
                                        class="progress-bar"
                        />
                    </div>
                </div>
                <div v-else-if="0 < Object.keys(filteredData).length && Object.keys(filteredData).length < 10">
                    <div v-for="i in (Object.keys(filteredData).length)" class="progress-bar" :key="i">
                        <div class="progress-bar-label">
                            <span class="label-text">{{ Object.keys(filteredData)[i-1] }}</span>
                            <span class="label-number">{{ Object.values(filteredData)[i-1] }}</span>
                        </div>
                        <p-progress-bar :percentage="(Object.values(filteredData)[i-1] / maxValue) * 100"
                        />
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
import { reactive, toRefs, watch } from '@vue/composition-api';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import PProgressBar from '@/components/molecules/progress-bar/PProgressBar.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PLottie from "@/components/molecules/lottie/PLottie.vue";

am4core.useTheme(am4themes_animated);
const colorSet = new am4core.ColorSet();

export default {
    name: 'ResourceMap',
    components: {
        PLottie,
        PChartLoader,
        PSkeleton,
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
            loading: true,
            maxValue: 0,
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
            // forEach(resp2, (value, key) => {
            //     state.filteredData.push({ name: key, count: value });
            // });
        };

        const animateBullet = (circle) => {
            const animation = circle.animate([{ property: 'scale', from: 1, to: 5 }, { property: 'opacity', from: 1, to: 0 }], 1000, am4core.ease.circleOut);
            animation.events.on('animationended', (event) => {
                animateBullet(event.target.object);
            });
        };

        const drawChart = async () => {
            const chart = am4core.create('chartRef', am4maps.MapChart);
            chart.geodata = am4geodata_worldLow;
            chart.projection = new am4maps.projections.Miller();
            chart.responsive.enabled = true;
            chart.logo.disabled = true;
            chart.chartContainer.wheelable = true;

            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['AQ'];
            polygonSeries.calculateVisualCenter = true;

            const resp = await SpaceConnector.client.inventory.region.list();
            state.data = [
                ...resp.results.map(d => ({
                    title: d.name,
                    latitude: parseInt(d.tags.latitude),
                    longitude: parseInt(d.tags.longitude),
                    color: colorSet.next(),
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

            circle2.events.on('hit', async (event) => {
                const target = event.target.dataItem?.dataContext as any;
                state.selectedProvider = target.region_type;
                state.selectedRegion = target.name;
                await getFilteredData(target.region_code);
            });

            imageSeries.data = state.data;
        };

        const init = async () => {
            state.loading = true;
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
}
.title {
    @apply text-gray-900;
    font-size: 1rem;
    font-weight: bold;
    line-height: 120%;
    margin-top: 1rem;
    margin-left: 1rem;
}
.chart-wrapper {
    height: 90%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 1rem;
    margin-top: 1.125rem;
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
    margin-left: 1rem;
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

        &:hover {
            @apply bg-blue-100;
            border-radius: 0.125rem;
        }
    }
}
</style>
