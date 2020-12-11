<template>
    <widget-layout :title="$t('COMMON.WIDGETS.RESOURCE_BY_REGION_TITLE')" class="resources-by-region">
        <div class="reverse">
            <div class="chart-container">
                <p-chart-loader :loading="loading" class="chart">
                    <template #loader>
                        <canvas ref="loaderRef" />
                    </template>
                    <canvas ref="chartRef" />
                </p-chart-loader>
            </div>
            <div class="legends">
                <template v-if="loading">
                    <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                        <p-skeleton width="1.5rem" height="1.5rem" class="mr-4 flex-shrink-0" />
                        <p-skeleton class="flex-grow" />
                    </div>
                </template>
                <p-grid-layout v-else :items="isNoData ? defaultItems : data" row-gap="0.5rem"
                               column-gap="0" :fix-column="1" card-min-width="0"
                               card-height="auto" :card-class="() => []"
                >
                    <template #card="{item, index}">
                        <router-link :to="getLink(item)">
                            <p-selectable-item :icon-url="item.icon" theme="card"
                                               default-icon="ic_provider_other"
                            >
                                <!--                            @click="onSelected(item, index)"-->
                                <template #contents>
                                    <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}"
                                         class="mx-2 text-base truncate leading-tight"
                                    >
                                        {{ item.name }}
                                    </div>
                                </template>
                                <template #extra>
                                    <p-badge :background-color="item.color" class="count">
                                        {{ item.count }}
                                    </p-badge>
                                </template>
                            </p-selectable-item>
                        </router-link>
                    </template>
                </p-grid-layout>
            </div>
        </div>
    </widget-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed,
    getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import {
    black,
    blue, coral, green, peacock, violet, white, yellow,
} from '@/styles/colors';
import {
    map, range,
} from 'lodash';
import Color from 'color';
import { store } from '@/store';
import { SpaceChart, tooltips } from '@/lib/chart/space-chart';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { SpaceConnector } from '@/lib/space-connector';
import { QueryHelper } from '@/lib/query';
import { Location } from 'vue-router';

interface Value {
    provider: string;
    count: number;
    // eslint-disable-next-line camelcase
    region_name: string;
}
interface Item {
    name: string;
    icon: string;
    color: string;
    count: number;
}
const colors = [coral[500], blue[500], violet[500], yellow[500], green[400],
    coral[400], peacock[600], coral[200], peacock[400], green[200],
    coral[300], peacock[700], coral[300], peacock[300], green[300],
];
const DEFAULT_COUNT = 4;
const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];

const resourceByRegionProps = {
    projectFilter: {
        type: String,
        default: '',
    },
    isServer: {
        type: Boolean,
        default: true,
    },
    projectId: {
        type: String,
        default: '',
    },
};

interface ResourcesByRegionProps {
    projectFilter: string;
    projectId: string;
    isServer: boolean;
}

export default {
    name: 'ResourcesByRegion',
    components: {
        WidgetLayout,
        PBadge,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
        PChartLoader,
    },
    props: resourceByRegionProps,
    setup(props: ResourcesByRegionProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

        const state = reactive({
            chartRef: null,
            loaderRef: null,
            data: [],
            loading: true,
            isNoData: computed(() => state.data.length === 0),
        });

        const drawChart = (canvas, isLoading = false) => {
            let totalCount = 0;
            let labels = map(state.data, d => d.name);
            const data = map(state.data, (d) => {
                totalCount += d.count;
                return d.count;
            });
            let datasets: ChartDataSets[] = [{
                label: 'Account',
                data,
                backgroundColor: colors,
                borderColor: white,
                borderWidth: 2,
            }];
            let options: ChartOptions = {
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: -10,
                        bottom: -10,
                    },
                },
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            display: false,
                        },
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            display: false,
                        },
                    }],
                },
                elements: {
                    arc: {
                        borderWidth: 0,
                    },
                },
                responsive: true,
                cutoutPercentage: 70,
                aspectRatio: 1,
                tooltips,
            };

            // if it's loading, set configs for loading pie chart.
            if (isLoading) {
                labels = [];
                datasets = [{
                    data: [8, 2],
                    backgroundColor: DEFAULT_COLORS,
                    borderWidth: 0,
                }];
                options = {
                    ...options,
                    animation: {
                        duration: 0,
                    },
                    tooltips: { enabled: false },
                };
            // if all total count of data is 0, set configs for default pie chart.
            } else if (!totalCount) {
                datasets = [{
                    data: range(DEFAULT_COUNT).fill(1),
                    backgroundColor: colors,
                    borderWidth: 0,
                }];
                options = {
                    ...options,
                    animation: {
                        duration: 0,
                    },
                    tooltips: { enabled: false },
                };
            }

            state.chart = new SpaceChart(canvas, {
                type: 'pie',
                data: {
                    labels,
                    datasets,
                },
                options,
                plugins: [{
                    beforeDraw(chart): void {
                        const ctx: CanvasRenderingContext2D = chart.ctx as CanvasRenderingContext2D;
                        if (isLoading || !ctx) return;

                        const txt = `${totalCount}`;
                        ctx.font = '2rem Roboto';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                        const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
                        ctx.fillStyle = black;

                        ctx.fillText(txt, centerX, centerY);
                    },
                }],
            });
        };

        watch([() => state.loaderRef, () => state.chartRef], ([loaderCtx, chartCtx]) => {
            if (loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (chartCtx) drawChart(chartCtx, false);
        }, { immediate: true });

        const defaultItems = range(DEFAULT_COUNT).map((d, index) => ({
            name: computed(() => vm.$t('COMMON.WIDGETS.RESOURCE_BY_REGION_DEFAULT_ITEM')).value,
            color: colors[index],
            count: 0,
            icon: 'ic_provider_other',
        }));

        const getServerData = async () => {
            let result;
            if (props.projectId) {
                result = await SpaceConnector.client.statistics.topic.serverByRegion({
                    project_id: props.projectId,
                });
            } else {
                result = await SpaceConnector.client.statistics.topic.serverByRegion({
                    project_id: props.projectId,
                });
            }
            return result;
        };

        const getCloudServiceData = async () => {
            let result;
            if (props.projectId) {
                result = await SpaceConnector.client.statistics.topic.cloudServiceByRegion({
                    project_id: props.projectId,
                });
            } else {
                result = await SpaceConnector.client.statistics.topic.serverByRegion({
                    project_id: props.projectId,
                });
            }
            return result;
        };


        const getData = async (): Promise<void> => {
            state.loading = true;
            state.data = [];
            let res;
            await store.dispatch('resource/provider/load');
            const providers = store.state.resource.provider.items;
            try {
                if (props.isServer) res = await getServerData();
                else res = await getCloudServiceData();
                state.data = res.results.map((item, index) => ({
                    name: item.region_name,
                    count: item.count,
                    provider: item.provider,
                    icon: providers[item.provider].icon,
                    color: colors[index],
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const getLink = (item) => {
            let res: Location;
            if (props.projectId && props.isServer) {
                res = {
                    name: 'server',
                    query: {
                        filters: queryHelper.setFilters([
                            { k: 'region_code', v: item.name, o: '=' },
                            { k: 'project_id', v: props.projectId, o: '=' },
                        ]).rawQueryStrings,
                    },
                };
            } else {
                res = {
                    name: 'cloudServiceMain',
                    query: {
                        provider: item.provider || 'all',
                        filters: queryHelper.setFilters([
                            { k: 'region_code', v: item.name, o: '=' },
                            { k: 'project_id', v: props.projectId, o: '=' },
                        ]).rawQueryStrings,
                    },
                };
            }
            return res;
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(state),
            skeletons: range(4),
            defaultItems,
            getLink,
            onSelected(item) {
                if (props.projectFilter && props.isServer) {
                    vm.$router.push({
                        path: `/inventory/server?&filters=region_code%3A%3D${item.name}&filters=project_id%3A%3D${props.projectId}`,
                    });
                }
                if (props.projectFilter && !props.isServer) {
                    vm.$router.push({
                        path: `/inventory/cloud-service?provider=${item.provider || 'all'}${props.projectFilter}&region=${item.name}`,
                    });
                }
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.resources-by-region::v-deep {
    height: 27.1rem;
    .title {
        margin-bottom: 1.25rem;
    }
    .widget-contents {
        overflow-y: auto;
        margin-bottom: 2rem;
    }
}
.chart {
    height: 11.25rem;
}
.count {
    font-size: 0.875rem;
    font-weight: bold;
}
.legends {
    @apply w-full flex-grow justify-center items-center m-auto;
}
.chart-container {
    @apply flex justify-center items-center mb-4;
}
.reverse {
    @apply block mb-0;
}

@screen md {
    .reverse {
        @apply flex flex-row-reverse;
        .chart-container {
            min-width: 40%;
            .chart {
                height: 13.3rem;
                width: 100%;
            }
        }
    }
}
</style>
