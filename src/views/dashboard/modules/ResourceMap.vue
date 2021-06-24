<template>
    <widget-layout class="resource-map">
        <template #title>
            <p class="title">
                {{ $t('COMMON.WIDGETS.RESOURCE_BY_REGION_REGIONS') }} <span class="count">({{ data.length }})</span>
            </p>
        </template>
        <div class="contents-wrapper">
            <div class="col-span-12 lg:col-span-9 chart-wrapper">
                <p-chart-loader :loading="loading">
                    <template #loader>
                        <p-skeleton width="100%" height="100%" />
                    </template>
                    <div id="chartRef" ref="chartRef" class="chart" />
                </p-chart-loader>
                <div v-if="!loading" class="circle-wrapper">
                    <p class="circle" :style="{background: providers['aws'].color }" /><span>AWS</span>
                    <p class="circle" :style="{background: providers['google_cloud'].color }" /><span>Google</span>
                    <p class="circle" :style="{background: providers['azure'].color }" /><span>Azure</span>
                    <!--                    <div v-for="(item) in chartState.providerList" :key="item.name">-->
                    <!--                        <p class="circle" :style="{background: item.color}" /><span>{{ item.name }}</span>-->
                    <!--                    </div>-->
                </div>
            </div>
            <div v-if="!loading && filteredData.length > 0" class="col-span-12 lg:col-span-3 resource-info-wrapper">
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
                            <span class="label-text text-xs">{{ item.display_name || item.cloud_service_group }}</span>
                            <span class="label-number text-xs text-gray-600">{{ item.count }}</span>
                        </div>
                        <p-progress-bar :percentage="(item.count / maxValue) * 100"
                                        class="progress-bar" :class="selectedProvider"
                                        :color="providers[selectedProvider] ? providers[selectedProvider].color : undefined"
                        />
                    </router-link>
                </div>
            </div>
            <div v-else-if="!loading && filteredData.length === 0" class="no-data-wrapper">
                <img src="@/assets/images/illust_microscope.svg" class="no-data-img">
                <p class="no-data-text">
                    {{ $t('COMMON.WIDGETS.RESOURCE_MAP.NO_REGION') }}
                </p>
            </div>
            <div v-else class="col-span-12 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                <div v-for="v in chartState.skeletons" :key="v" class="flex p-2">
                    <p-skeleton width="flex-grow" />
                </div>
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
    ComponentRenderProxy,
    computed, getCurrentInstance, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { PChartLoader, PSkeleton, PProgressBar } from '@spaceone/design-system';

import { range } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { store } from '@/store';
import { coral, gray } from '@/styles/colors';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import WidgetLayout from '@/common/components/WidgetLayout.vue';
import { Location } from 'vue-router';
import { QueryHelper } from '@/lib/query';
import config from '@/lib/config';
import { INVENTORY_ROUTE } from '@/routes/inventory/inventory-route';

am4core.useTheme(am4themesAnimated);

export default {
    name: 'ResourceMap',
    components: {
        PSkeleton,
        PChartLoader,
        WidgetLayout,
        PProgressBar,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();
        const apiQuery = new ApiQueryHelper();

        const state = reactive({
            chartRef: null as HTMLElement | null,
            chartRegistry: {},
            chart: null as null|any,
            data: [] as any,
            filteredData: [] as any,
            selectedProvider: '', // aws
            selectedRegion: '', // Asia Pacific (Seoul)
            selectedRegionCode: '', // ap-northeast-2
            providers: computed(() => store.state.resource.provider.items),
            loading: true,
            maxValue: 0,
            initialRegion: {} as any,
        });

        const chartState = reactive({
            registry: {},
            chartData: [] as object[],
            skeletons: range(5),
            // providerList: [
            //     {
            //         name: 'aws',
            //         color: props.providers.aws.color,
            //     },
            //     {
            //         name: 'google_cloud',
            //         color: props.providers.google_cloud.color,
            //     },
            //     {
            //         name: 'azure',
            //         color: props.providers.azure.color,
            //     },
            // ],
            marker: null,
        });

        /* Create map instance */
        const getFilteredData = async (regionCode, provider) => {
            state.selectedRegionCode = regionCode;
            try {
                const res = await SpaceConnector.client.statistics.topic.cloudServiceResources({
                    query: apiQuery.setFilters([
                        { k: 'region_code', v: regionCode, o: '=' },
                        { k: 'provider', v: provider, o: '=' },
                    ]).setPageLimit(10)
                        .setSort('count', true)
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
                    latitude: parseFloat(d.tags.latitude),
                    longitude: parseFloat(d.tags.longitude),
                    color: state.providers[d.provider]?.color as string,
                    ...d,
                })),
            ];
        };

        const setInitialRegionSetting = async () => {
            const initialRegionFromLocalStorage = store.getters['settings/getItem']('initial_region', '/dashboard');
            if (initialRegionFromLocalStorage) {
                state.initialRegion = initialRegionFromLocalStorage;
                // eslint-disable-next-line max-len
                [state.selectedProvider, state.selectedRegion, state.selectedRegionCode] = [initialRegionFromLocalStorage.provider, initialRegionFromLocalStorage.region_name, initialRegionFromLocalStorage.region_code];
            }

            if (!initialRegionFromLocalStorage) {
                let regionWithTheMostService = '';
                const resp = await SpaceConnector.client.statistics.topic.cloudServiceByRegion({
                    query: {
                        sort: {
                            name: 'count',
                            desc: true,
                        },
                        only: ['count', 'region_name'],
                    },
                });
                if (resp.results.length > 0) {
                    regionWithTheMostService = resp.results[0].region_name;
                    if (regionWithTheMostService === 'global') regionWithTheMostService = 'ap-northeast-2';
                    const allInitialRegionInfo = state.data.find(data => data.region_code === regionWithTheMostService);
                    const initialRegion = {
                        longitude: allInitialRegionInfo.longitude,
                        latitude: allInitialRegionInfo.latitude,
                        // eslint-disable-next-line camelcase
                        region_code: allInitialRegionInfo.region_code,
                        name: allInitialRegionInfo.name,
                        provider: allInitialRegionInfo.provider,
                    };
                    state.initialRegion = initialRegion;
                    [state.selectedProvider, state.selectedRegion, state.selectedRegionCode] = [initialRegion.provider, initialRegion.name, initialRegion.region_code];
                }
            }
        };

        const animateBullet = (circle) => {
            const animation = circle.animate([{ property: 'scale', from: 1, to: 5 }, { property: 'opacity', from: 1, to: 0 }],
                1000, am4core.ease.circleOut);
            animation.events.on('animationended', (event) => {
                animateBullet(event.target.object);
            });
        };

        const moveMarker = (coords, marker) => {
            marker.latitude = coords.latitude;
            marker.longitude = coords.longitude;
        };

        const drawMarker = (chart) => {
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
            chartState.marker = mapImage.create();
        };

        const hitCircle = async (event) => {
            const originTarget = state.selectedRegion;
            const target = event.target.dataItem?.dataContext;
            state.selectedProvider = target.provider;
            state.selectedRegion = target.name;
            await getFilteredData(target.region_code, state.selectedProvider);
            if (originTarget !== state.selectedRegion) {
                moveMarker({ latitude: target.latitude, longitude: target.longitude }, chartState.marker);
            }
            await store.dispatch('settings/setItem', {
                key: 'initial_region',
                value: {
                    latitude: target.latitude,
                    longitude: target.longitude,
                    // eslint-disable-next-line camelcase
                    region_code: state.selectedRegionCode,
                    // eslint-disable-next-line camelcase
                    region_name: state.selectedRegion,
                    provider: state.selectedProvider,
                },
                path: '/dashboard',
            });
        };

        const disposeChart = (element) => {
            if (state.chartRegistry[element]) {
                state.chartRegistry[element].dispose();
                delete state.chartRegistry[element];
            }
        };
        const drawChart = async (chartContext) => {
            /* draw map */
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4maps.MapChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            chart.geodata = am4geodataWorldLow;
            chart.projection = new am4maps.projections.Miller();
            chart.responsive.enabled = true;
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.chartContainer.wheelable = true;
            chart.zoomControl = new am4maps.ZoomControl();
            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['AQ'];
            polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
            polygonSeries.calculateVisualCenter = true;

            /* draw circles */
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

            /* make marker */
            drawMarker(chart);

            /* click circle to move marker and get filtered data */
            circle2.events.on('hit', async (event) => {
                await hitCircle(event);
            });

            /* draw circles with region data */
            imageSeries.data = state.data;

            /* draw initial marker with initial coords */
            moveMarker({ longitude: state.initialRegion.longitude, latitude: state.initialRegion.latitude }, chartState.marker);

            state.chart = chart;
        };

        const goToCloudService = (item) => {
            const res: Location = {
                name: INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: item.provider,
                    group: item.cloud_service_group,
                    name: item.cloud_service_type,
                },
                query: {
                    filters: queryHelper.setFilters([
                        { k: 'region_code', v: state.selectedRegionCode, o: '=' },
                    ]).rawQueryStrings,
                },
            };
            return res;
        };

        const init = async () => {
            state.loading = true;
            await store.dispatch('resource/provider/load', true);
            await getRegionList();
            if (state.data.length > 0) {
                await setInitialRegionSetting();
                await getFilteredData(state.initialRegion.region_code, state.initialRegion.provider);
            }
            state.loading = false;
        };
        init();

        watch([() => state.chartRef, () => state.loading], ([chartCtx, loading]) => {
            if (chartCtx && !loading) {
                drawChart(chartCtx);
            }
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            chartState,
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
        .chart {
            @apply w-full h-full;
            height: 21.625rem;
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
    .no-data-wrapper {
        @apply col-span-12;
        justify-self: center;
        opacity: 0.7;
        .no-data-img {
            @apply mx-auto;
        }
        .no-data-text {
            @apply text-primary2;
            font-size: 0.875rem;
            line-height: 140%;
            text-align: center;
            margin-top: 0.5rem;
        }

        @screen lg {
            @apply col-span-3;
            padding-top: 50%;
        }

        @screen xl {
            @apply col-span-3;
            padding-top: 50%;
        }

        @screen 2xl {
            @apply col-span-3;
            padding-top: 50%;
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
