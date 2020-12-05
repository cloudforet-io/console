<template>
    <widget-layout class="resource-map">
        <template #title>
            <p class="title">
                {{ $t('COMMON.WIDGETS.RESOURCE_BY_REGION_REGIONS') }} <span class="count">({{ data.length }})</span>
            </p>
        </template>
        <div class="contents-wrapper">
            <div class="col-span-12 lg:col-span-9 chart-wrapper">
                <div class="chart-loader">
                    <div id="chartRef" ref="chartRef" />
                </div>
                <div v-if="!loading" class="circle-wrapper">
                    <p class="circle" :style="{background: providers['aws'].color }" /><span>AWS</span>
                    <p class="circle" :style="{background: providers['google_cloud'].color }" /><span>Google</span>
                    <p class="circle" :style="{background: providers['azure'].color }" /><span>Azure</span>
                </div>
            </div>
            <div v-if="!loading" class="col-span-12 lg:col-span-3 resource-info-wrapper">
                <div class="resource-info-title">
                    <span class="resource-info-provider"
                          :style="{color: providers[selectedProvider] ? providers[selectedProvider].color : undefined }"
                    >
                        {{ providers[selectedProvider].label }} </span>
                    <span class="resource-info-region">{{ selectedRegion }}</span>
                </div>
                <div class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-1
                            progress-bar-wrapper"
                >
                    <router-link v-for="(item, index) in filteredData" :key="index" class="progress-bar-link"
                                 :to="goToCloudService(item)"
                    >
                        <div class="progress-bar-label">
                            <span class="label-text text-xs">{{ item.cloud_service_group }}</span>
                            <span class="label-number text-xs text-gray-600">{{ item.count }}</span>
                        </div>
                        <p-progress-bar :percentage="(item.count / maxValue) * 100"
                                        class="progress-bar" :class="selectedProvider"
                        />
                    </router-link>
                </div>
            </div>
            <div v-else class="w-full flex items-center justify-center">
                <p-lottie name="thin-spinner"
                          auto
                          :size="1.5"
                />
            </div>
        </div>
    </widget-layout>
</template>

<script lang="ts">
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodataWorldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import {
    onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import PProgressBar from '@/components/molecules/progress-bar/PProgressBar.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { store } from '@/store';
import { coral, gray } from '@/components/styles/colors';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import { Location } from 'vue-router';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import { queryTagsToQueryString } from '@/lib/router-query-string';

am4core.useTheme(am4themesAnimated);

export default {
    name: 'ResourceMap',
    components: {
        WidgetLayout,
        PLottie,
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
            chart: null as null|any,
            data: [] as any,
            filteredData: [] as any,
            selectedProvider: 'aws',
            selectedRegion: 'Asia Pacific (Seoul)',
            selectedRegionCode: 'ap-northeast-2',
            loading: true,
            maxValue: 0,
        });
        /* Create map instance */

        const getFilteredData = async (regionCode) => {
            // state.loading = true;
            state.selectedRegionCode = regionCode;
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                    query: new QueryHelper()
                        .setFilter({ k: 'region_code', v: regionCode, o: 'eq' }, { k: 'provider', v: state.selectedProvider, o: 'eq' })
                        .setPageLimit(10)
                        .setSort('count', true, 'name')
                        .data,
                    // eslint-disable-next-line camelcase
                    is_major: true,
                    // eslint-disable-next-line camelcase
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
                // state.loading = false;
            }
        };

        const getRegionList = async () => {
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
                    latitude: parseFloat(d.tags.find(tag => tag.key === 'latitude').value),
                    longitude: parseFloat(d.tags.find(tag => tag.key === 'longitude').value),
                    color: props.providers[d.provider].color as string,
                    ...d,
                })),
            ];
        };

        const animateBullet = (circle) => {
            const animation = circle.animate([{ property: 'scale', from: 1, to: 5 }, { property: 'opacity', from: 1, to: 0 }],
                1000, am4core.ease.circleOut);
            animation.events.on('animationended', (event) => {
                animateBullet(event.target.object);
            });
        };

        const drawMarker = (coords, marker) => {
            marker.latitude = coords.latitude;
            marker.longitude = coords.longitude;
        };

        const drawChart = async () => {
            const chart = am4core.create('chartRef', am4maps.MapChart);
            chart.geodata = am4geodataWorldLow;
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

            const imageSeries = chart.series.push(new am4maps.MapImageSeries());
            imageSeries.mapImages.template.propertyFields.longitude = 'longitude';
            imageSeries.mapImages.template.propertyFields.latitude = 'latitude';
            imageSeries.mapImages.template.tooltipText = '{title}';
            imageSeries.mapImages.template.nonScaling = true;
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
            mapMarker.nonScaling = true;

            const marker = mapImage.create();

            circle2.events.on('hit', async (event) => {
                const originTarget = state.selectedRegion;
                const target = event.target.dataItem?.dataContext as any;
                state.selectedProvider = target.provider;
                state.selectedRegion = target.name;
                await getFilteredData(target.region_code);
                if (originTarget !== state.selectedRegion) {
                    drawMarker({ latitude: target.latitude, longitude: target.longitude }, marker);
                }
            });
            const originCoords = { longitude: 126.871867 , latitude: 37.528547 };
            await getRegionList();
            imageSeries.data = state.data;
            drawMarker(originCoords, marker);
            state.chart = chart;
        };

        const goToCloudService = (item) => {
            let res: Location;
            const filters: QueryTag[] = [];
            filters.push({
                key: { label: 'Region', name: 'region_code' },
                operator: '=',
                value: { label: state.selectedRegion, name: state.selectedRegionCode },
            });
            if (item.resource_type === 'inventory.Server') {
                filters.push({
                    key: { label: 'Provider', name: 'provider' },
                    operator: '=',
                    value: { label: item.provider, name: item.provider },
                },
                {
                    key: { label: 'Cloud Service Type', name: 'cloud_service_type' },
                    operator: '=',
                    value: { label: item.cloud_service_type, name: item.cloud_service_type },
                });
                res = {
                    name: 'server',
                    query: {
                        filters: queryTagsToQueryString(filters),
                    },
                };
            } else {
                res = {
                    name: 'cloudServicePage',
                    params: {
                        provider: item.provider,
                        group: item.cloud_service_group,
                        name: item.cloud_service_type,
                    },
                    query: {
                        filters: queryTagsToQueryString(filters),
                    },
                };
            }
            return res;
        };


        const init = async () => {
            state.loading = true;
            await store.dispatch('resource/provider/load');
            await Promise.all([getRegionList(), getFilteredData('ap-northeast-2'), drawChart()]);
            state.loading = false;
        };

        init();

        watch(() => state.chartRef, (chartCtx) => {
            if (chartCtx && !state.loading) {
                drawChart();
            }
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            referenceRouter,
            goToCloudService,
        };
    },
};
</script>

<style lang="postcss" scoped>
.resource-map {
    @apply flex flex-col;
    height: 53rem;

    @screen sm {
        height: 41rem;
    }

    @screen lg {
        height: 28.625rem;
    }
}
.title {
    @apply text-gray-900;
    margin-bottom: 0.875rem;
    font-size: 1.125rem;
    font-weight: bold;
    line-height: 120%;
    .count {
        font-weight: normal;
    }
}
.contents-wrapper {
    @apply grid grid-cols-12 grid-flow-row gap-4 h-full;

    .chart-wrapper {
        @apply flex flex-col justify-between;
        flex-shrink: 0;
        flex-grow: 1;
        margin-right: 1rem;
        .chart-loader {
            @apply w-full h-full;
            height: 21.625rem;
        }
        #chartRef {
            @apply w-full h-full;
        }
        .circle-wrapper {
            margin-top: 0.625rem;
            .circle {
                @apply inline-block;
                margin-right: 0.25rem;
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 50%;
            }
            span {
                @apply mr-4 text-gray-500;
                font-size: 0.75rem;
                line-height: 1.5;
            }
        }
    }
}
.resource-info-wrapper {
    width: 100%;
    height: 100%;
    .resource-info-title {
        @apply truncate;
        margin-bottom: 0.625rem;
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.5;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        white-space: normal;

        @screen sm {
            white-space: nowrap;
        }

        @screen lg {
            @apply px-2;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            white-space: normal;
        }
    }
    .progress-bar-wrapper {
        @apply grid;
        grid-column-gap: 0.5rem;

        @screen lg {
            grid-column-gap: 0;
        }
    }
}
.progress-bar-link {
    @apply py-1;

    @screen lg {
        @apply px-2;
    }

    .progress-bar-label {
        @apply mb-1 flex justify-between;
        font-size: 0.75rem;
        line-height: 1.2;
    }
    &:hover {
        @apply bg-blue-100 cursor-pointer underline;
        border-radius: 0.125rem;
    }
    .progress-bar {
        padding: 0;
        >>> .background-bar {
            height: 0.25rem;
        }
        >>> .tracker-bar {
            height: 0.25rem;
            margin-top: -0.25rem;
        }
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
    }
}
</style>
