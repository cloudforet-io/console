<template>
    <p-widget-layout title="Service Accounts">
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
            <p-grid-layout v-else :items="data" row-gap="0.5rem"
                           column-gap="0" :fix-column="1" card-min-width="0"
                           card-height="auto" :card-class="() => []"
            >
                <template #card="{item, index}">
                    <router-link :to="item.href">
                        <p-selectable-item :icon-url="item.icon" theme="card"
                                           default-icon="ic_provider_other"
                        >
                            <template #contents>
                                {{ item.name }}
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
    </p-widget-layout>
</template>

<script lang="ts">
import { map, forEach, range } from 'lodash';
import Chart, { ChartDataSets, ChartOptions } from 'chart.js';
import Color from 'color';

import {
    reactive, toRefs, watch,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';

import {
    black, violet, white, yellow,
} from '@/styles/colors';
import { SpaceChart, tooltips } from '@/lib/chart/space-chart';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';


const DEFAULT_COUNT = 4;
const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];

interface Data {
    provider?: string;
    name: string;
    icon: string;
    color: string;
    count: number;
    href: string;
}

export default {
    name: 'ServiceAccounts',
    components: {
        PWidgetLayout,
        PBadge,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
        PChartLoader,
    },
    setup() {
        const state = reactive({
            skeletons: range(4),
            loading: true,
            //
            loaderRef: null,
            chartRef: null,
            data: [] as Data[],
            chart: null as null|Chart,
        });

        const drawChart = (canvas, isLoading = false) => {
            const colors = map(state.data, d => d.color);
            let labels = map(state.data, d => d.name);
            let totalCount = 0;
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

        const getData = async () => {
            state.loading = true;
            state.data = [];
            await store.dispatch('resource/provider/load');
            try {
                const res = await SpaceConnector.client.statistics.topic.serviceAccountByProvider();
                const others: Data = {
                    name: 'Others',
                    icon: 'ic_provider_other',
                    color: yellow[500],
                    count: 0,
                    provider: '',
                    href: '/identity/service-account',
                };
                const providers = store.state.resource.provider.items;

                if (res.results.length > 0) {
                    forEach(res.results, (d) => {
                        if (providers[d.provider]) {
                            state.data.push({
                                name: providers[d.provider].label || d.provider,
                                icon: providers[d.provider].icon || '',
                                color: providers[d.provider].color || '',
                                href: `/identity/service-account?p=1&ps=15&provider=${d.provider}`,
                                count: d.count,
                            });
                        } else others.count += d.count;
                    });
                } else {
                    state.data = map(providers, p => ({
                        name: p.label || '', icon: p.icon || '', color: p.color || '', count: 0, href: '',
                    }));
                }
                state.data.push(others);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
            await getData();
        };
        init();

        // draw loader chart or data chart
        watch([() => state.loaderRef, () => state.chartRef], ([loaderCtx, chartCtx]) => {
            if (loaderCtx) {
                drawChart(loaderCtx, true);
            } else if (chartCtx) drawChart(chartCtx, false);
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
    .chart {
        height: 11.25rem;
        width: 100%;
    }
    .count {
        font-size: 0.875rem;
        font-weight: bold;
    }
    .legends {
        @apply w-full flex-grow justify-center items-center m-auto overflow-y-auto;
    }
    .chart-container {
        @apply flex justify-center items-center mb-4;
    }
</style>
