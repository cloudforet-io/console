<template>
    <p-pane-layout class="resource-map">
        <p class="title">
            {{$t('COMMON.WIDGETS.RESOURCE_BY_REGION_REGIONS')}}
        </p>
        <div class="flex-wrap sm:flex-wrap md:flex-wrap lg:flex-no-wrap xl:flex-no-wrap chart-wrapper">
            <div class="chart-loader">
                <div id="chartRef" ref="chartRef" />
            </div>
            <div v-if="!loading" class="resource-info-wrapper">
                <div class="resource-info-title">
                    <span class="resource-info-provider"
                          :style="{color: providers[selectedProvider] ? providers[selectedProvider].color : undefined }"
                    >
                        {{ providers[selectedProvider].label }} </span>
                    <span class="resource-info-region">{{ selectedRegion }}</span>
                </div>
                <div class="grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 progress-bar-wrapper">
                    <div v-for="(item, index) in filteredData" :key="index" class="progress-bar">
                        <div class="progress-bar-label">
                            <span class="label-text">{{ item.cloud_service_group }}</span>
                            <span class="label-number">{{ item.count }}</span>
                        </div>
                        <p-progress-bar :percentage="(item.count / maxValue) * 100"
                                        class="progress-bar" :class="selectedProvider"
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
import { coral, gray } from '@/components/styles/colors';

am4core.useTheme(am4themes_animated);

export default {
    name: 'ResourceMap',
    components: {
        PLottie,
        PPaneLayout,
        PProgressBar,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            chartRef: null as HTMLElement|null,
            data: [] as any,
            filteredData: [] as any,
            selectedProvider: 'aws',
            selectedRegion: 'Asia Pacific (Seoul)',
            loading: true,
            maxValue: 0,
        });
        /* Create map instance */

        const getFilteredData = async (regionCode) => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                    query: new QueryHelper()
                        .setFilter({ k: 'region_code', v: regionCode, o: 'eq' }, { k: 'provider', v: state.selectedProvider, o: 'eq' })

                        .setPageLimit(10)
                        .setSort('count', true, 'name')
                        .data,
                    is_major: true,
                    is_primary: true,
                });
                state.filteredData = res.results;
                if (state.filteredData) {
                    const countArray = state.filteredData.map(d => d.count) as number[];
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

        const drawMarker = (coords, marker, mapLabel) => {
            marker.latitude = coords.latitude;
            marker.longitude = coords.longitude;
            mapLabel.text = state.selectedRegion;
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
            polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
            polygonSeries.calculateVisualCenter = true;

            const resp = await SpaceConnector.client.inventory.region.list({
                query: {
                    filter: [
                        {
                            k: 'region_code',
                            v: 'global',
                            o: 'not',
                        },
                    ],
                },
            });
            state.data = [
                ...resp.results.map(d => ({
                    title: d.name,
                    latitude: parseInt(d.tags.latitude),
                    longitude: parseInt(d.tags.longitude),
                    color: props.providers[d.provider].color as string,
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

            const mapImageSeries = chart.series.push(new am4maps.MapImageSeries());
            const mapImage = mapImageSeries.mapImages;
            const mapImageTemplate = mapImage.template;

            const mapMarker = mapImageTemplate.createChild(am4core.Sprite);
            mapMarker.path = 'M4 12 A12 12 0 0 1 28 12 C28 20, 16 32, 16 32 C16 32, 4 20 4 12 M11 12 A5 5 0 0 0 21 12 A5 5 0 0 0 11 12 Z';
            mapMarker.width = 24;
            mapMarker.height = 34;
            mapMarker.scale = 0.7;
            mapMarker.fill = am4core.color(coral[600]);
            mapMarker.fillOpacity = 1;
            mapMarker.horizontalCenter = 'middle';
            mapMarker.verticalCenter = 'bottom';

            const mapLabel = mapImageTemplate.createChild(am4core.Label);

            mapLabel.horizontalCenter = 'middle';

            const marker = mapImage.create();

            circle2.events.on('hit', async (event) => {
                const originTarget = state.selectedRegion;
                const target = event.target.dataItem?.dataContext as any;
                state.selectedProvider = target.provider;
                state.selectedRegion = target.name;
                await getFilteredData(target.region_code);
                const coords = chart.svgPointToGeo(event.svgPoint);
                if (originTarget !== state.selectedRegion) {
                    drawMarker(coords, marker, mapLabel);
                }
            });

            const originCoords = { longitude: 126.871867, latitude: 37.528547 };
            drawMarker(originCoords, marker, mapLabel);
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
    height: 40rem;

    @screen 2xs {
        height: 52rem;
    }
    @screen xs {
        height: 52rem;
    }
    @screen sm {
        height: 52rem;
    }
    @screen md {
        height: 42rem;
    }
    @screen lg {
        height: 34rem;
    }
    @screen xl {
        height: 34rem;
    }

    @screen 2xl {
        height: 34rem;
    }
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
        width: 72%;
        flex-grow: 1;
        margin-right: 1rem;
        height: 21rem;
        #chartRef {
            @apply w-full h-full;
        }
        @screen 2xs {
            height: 18.75rem;
        }
        @screen xs {
            height: 18.75rem;
        }
        @screen sm {
            height: 18.75rem;
        }
        @screen md {
            height: 21.625rem;
        }
        @screen lg {
            height: 28rem;
        }
        @screen xl {
            height: 28rem;
        }
        @screen 2xl {
            height: 28rem;
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
    .progress-bar-wrapper {
        display: grid;
        column-gap: 2rem;
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
}
</style>
