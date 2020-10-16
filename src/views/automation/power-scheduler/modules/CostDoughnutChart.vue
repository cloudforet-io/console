<template>
    <p-widget-layout title="프로젝트별 비용 절감 비율" class="cost-doughnut-chart">
        <div class="chart-wrapper">
            <div class="chart-container">
                <p-chart-loader :loading="loading" class="chart">
                    <template #loader>
                        <canvas ref="loaderRef" />
                    </template>
                    <canvas ref="chartRef" />
                </p-chart-loader>
            </div>
            <div class="legend-lap">
                <span v-for="(legend) in legends" :key="legend.name" class="legend">
                    <span class="color" :style="{color: legend.color}" />
                    {{ legend.name }} <br>
                </span>
            </div>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed,
    getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import {
    black, coral, primary2, violet, white, yellow,
} from '@/styles/colors';
import _, { map, forEach, range } from 'lodash';
import Color from 'color';
import { fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import {
    serviceAccountsProps,
    ServiceAccountsPropsType,
} from '@/views/common/widgets/service-accounts/ServiceAccounts.toolset';
import { store } from '@/store';
import Chart, { ChartDataSets, ChartOptions } from 'chart.js';
import { SpaceChart, tooltips } from '@/lib/chart/space-chart';

interface Value {
    provider: string;
    count: number;
}

const DEFAULT_COUNT = 4;
const DEFAULT_COLORS = [violet[200], Color(violet[200]).alpha(0.5).toString()];


export default {
    name: 'CostDoughnutChart',
    components: {
        PWidgetLayout,
        PChartLoader,
    },
    props: serviceAccountsProps,
    setup(props: ServiceAccountsPropsType) {
        const api = fluentApi.statisticsTest().resource().stat<Value>()
            .addGroupKey('provider', 'provider')
            .addGroupField('count', STAT_OPERATORS.count)
            .setSort('count');

            interface Item {
                provider: string;
                name: string;
                icon: string;
                color: string;
                count: number;
                href: string;
            }

            const state = reactive({
                loaderRef: null,
                chartRef: null,
                data: [] as Array<{
                    name: string;
                    icon: string;
                    color: string;
                    count: number;
                    href: string;
                }>,
                loading: true,
                chart: null as null|Chart,
            });

            const drawChart = (canvas, isLoading = false) => {
                const colors = map(state.data, d => d.color);
                let labels = map(state.data, d => d.name);
                // const labels = ['test1', 'test2', 'test3', 'test4'];
                let totalCount = 0;
                const data = map(state.data, (d) => {
                    totalCount += d.count;
                    return d.count;
                });
                let datasets: ChartDataSets[] = [{
                    data,
                    backgroundColor: colors,
                    borderColor: white,
                    borderWidth: 1,
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
                    cutoutPercentage: 80,
                    aspectRatio: 1,
                    tooltips,
                };

                // if it's loading, set configs for loading pie chart.
                if (isLoading) {
                    // labels = [];
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
                });
            };

            // draw loader chart or data chart
            watch([() => state.loaderRef, () => state.chartRef], ([loaderCtx, chartCtx]) => {
                if (loaderCtx) {
                    drawChart(loaderCtx, true);
                } else if (chartCtx) drawChart(chartCtx, false);
            }, { immediate: true });


            const getData = async (): Promise<void> => {
                state.loading = true;
                state.data = [];
                await store.dispatch('resource/provider/load');
                try {
                    const res = await props.getAction(api).execute();
                    const providers = store.state.resource.provider.items;

                    if (res.data.results.length > 0) {
                        forEach(res.data.results, (d: Value, i) => {
                            if (providers[d.provider]) {
                                state.data.push({
                                    name: providers[d.provider].label || d.provider,
                                    icon: providers[d.provider].icon || '',
                                    color: providers[d.provider].color || '',
                                    href: `/identity/service-account?p=1&ps=15&provider=${d.provider}`,
                                    count: d.count,
                                });
                            }
                        });
                    } else {
                        state.data = map(providers, p => ({
                            name: p.label || '', icon: p.icon || '', color: p.color || '', count: 0, href: '',
                        }));
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    state.loading = false;
                }
            };

            getData();

            return {
                ...toRefs(state),
                legends: computed(() => state.data.map(v => ({ name: v.name, color: v.color }))),
            };
    },
};
</script>

<style lang="postcss" scoped>
    .cost-doughnut-chart {
        height: 17rem;
        .chart {
            width: 7.5rem;
            height: 7.5rem;
        }
        .chart-wrapper {
            @apply block mb-0 flex flex-row;
            margin-left: 1.5rem;
            margin-top: 0.75rem;
        }

        .legend-lap {
            width: 100%;
            text-align: left;
            text-transform: capitalize;
            padding-top: 0.5rem;
            margin-left: 3rem;
            align-self: center;
            .legend {
                font-size: 0.875rem;
                padding: 0 1rem 0.625rem;
                line-height: 1.5;
            }

            .color {
                display: inline-block;
                width: 0.75rem;
                height: 0.75rem;
                margin-right: 0.5rem;
                border-radius: 2px;
                background-color: currentColor;
            }
        }
    }
</style>
