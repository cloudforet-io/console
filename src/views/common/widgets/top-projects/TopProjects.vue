<template>
    <p-widget-layout title="Top 5 Resource Managing Projects" :help="$t('DASHBOARD.ACTION.TOP_PROJECTS')"
                     class="top-projects"
    >
        <div class="flex flex-col h-full">
            <p-chart-loader :loading="loading" class="chart">
                <template #loader>
                    <p-skeleton width="100%" height="100%" />
                </template>
                <canvas ref="chartRef" />
            </p-chart-loader>
            <div v-if="!loading && data.length === 0"
                 class="flex flex-col h-full justify-center items-center pt-16 pb-10"
            >
                <p class="text-2xl font-bold capitalize mb-4 text-primary text-center leading-tight">
                    {{ $t('DASHBOARD.ACTION.CRT_DBD') }}
                </p>
                <p class="text-primary1 text-sm capitalize mb-4 text-center leading-normal">
                    {{ $t('DASHBOARD.ACTION.CRT_GUIDE') }}
                </p>
                <router-link to="/project" tag="div" class="">
                    <p-icon-text-button name="ic_back" icon-direction="right"
                                        size="lg" dir="down"
                                        style-type="primary" icon-color="transparent inherit"
                                        width="1.5rem" height="1.5rem"
                                        class="getstarted"
                    >
                        {{ $t('DASHBOARD.BTN.GET_START') }}
                    </p-icon-text-button>
                </router-link>
            </div>
            <p-data-table v-else
                          :fields="fields"
                          :sortable="false"
                          :selectable="false"
                          :loading="loading"
                          :items="data"
                          :bordered="false"
                          :style="{marginTop: '1rem'}"
            >
                <template #skeleton-rank>
                    <p-skeleton width="1.5rem" height="1.5rem" />
                </template>

                <!-- th -->
                <template #th-rank="{field}">
                    <div class="text-center text-gray">
                        {{ field.label }}
                    </div>
                </template>
                <template #th-servers="{field}">
                    <div class="custom-th"
                         :style="{color: colors.servers}"
                    >
                        <span class="color" />
                        {{ field.label }}
                    </div>
                </template>
                <template #th-cloud_services="{field}">
                    <div class="custom-th"
                         :style="{color: colors.cloud_services}"
                    >
                        <span class="color" />
                        {{ field.label }}
                    </div>
                </template>

                <!-- top 1 row -->
                <template #row-0="{index, fields, item}">
                    <tr>
                        <td class="text-center">
                            <p-i name="ic_top1" />
                        </td>

                        <td class="project-field">
                            <router-link :to="`/project?select_pg=${item.project_group_id}`">
                                {{ item.project_group }}
                            </router-link>
                        </td>
                        <td class="project-field">
                            <router-link :to="`/project/${item.project_id}?st=summary`">
                                {{ item.project }}
                            </router-link>
                        </td>
                        <td class="text-center">
                            <p-badge :background-color="colors.servers">
                                <router-link :to="`/inventory/server?p=1&ps=15&f=project_id%3A%3D${item.project_id}`">
                                    {{ item.servers || 0 }}
                                </router-link>
                            </p-badge>
                        </td>
                        <td class="text-center">
                            <p-badge :background-color="colors.cloud_services">
                                <router-link :to="`/inventory/cloud-service?f=project_id%3A%3D${item.project_id}`">
                                    {{ item.cloud_services || 0 }}
                                </router-link>
                            </p-badge>
                        </td>
                    </tr>
                </template>

                <!-- others -->
                <template #col-project_group="{index, field, item}">
                    <td>
                        <router-link :to="`/project?select_pg=${item.project_group_id}`">
                            {{ item.project_group }}
                        </router-link>
                    </td>
                </template>
                <template #col-project="{index, field, item}">
                    <td>
                        <router-link :to="`/project/${item.project_id}?st=summary`">
                            {{ item.project }}
                        </router-link>
                    </td>
                </template>
                <template #col-rank-format="{index}">
                    <div class="text-center">
                        {{ index + 1 }}
                    </div>
                </template>
                <template #col-servers-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.servers}">
                        <router-link :to="`/inventory/server?p=1&ps=15&f=project_id%3A%3D${item.project_id}`">
                            {{ item.servers || 0 }}
                        </router-link>
                    </div>
                </template>
                <template #col-cloud_services-format="{index, field, item}">
                    <div class="text-center font-bold" :style="{color: colors.cloud_services}">
                        <router-link :to="`/inventory/cloud-service?f=project_id%3A%3D${item.project_id}`">
                            {{ item.cloud_services || 0 }}
                        </router-link>
                    </div>
                </template>
            </p-data-table>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import { makeTrItems } from '@/lib/view-helper';
import {
    black, gray, secondary, secondary1,
} from '@/styles/colors';
import PI from '@/components/atoms/icons/PI.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { NSChart, tooltips } from '@/lib/chart/s-chart';
import Chart, { ChartDataSets } from 'chart.js';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

const DATA_COUNT = 5;
const DEFAULT_MAX = 1000;

export default {
    name: 'TopProjects',
    components: {
        PIconTextButton,
        PWidgetLayout,
        PBadge,
        PDataTable,
        PI,
        PChartLoader,
        PSkeleton,
    },
    setup() {
        const vm: any = getCurrentInstance();
        interface Value {
            project_id: string;
            project: string;
            project_group: string;
            project_group_id: string;
            servers?: number;
            cloud_services?: number;
            total?: number;
        }

        interface InitDataType {
            chartRef: HTMLCanvasElement|null;
            chart: Chart|null;
            data: Value[];
            loading: boolean;
            colors: {
                servers: string;
                cloud_services: string;
            };
            fields: Ref<Readonly<string[]>>;
        }

        const state: UnwrapRef<InitDataType> = reactive({
            chartRef: null,
            chart: null,
            data: [],
            loading: true,
            colors: {
                servers: secondary,
                cloud_services: secondary1,
            },
            fields: computed(() => makeTrItems([['rank', 'FIELD.RANK'],
                ['project_group', 'FIELD.PROJECT_GRP'],
                ['project', 'FIELD.PROJECT'],
                ['servers', 'FIELD.SERVER'],
                ['cloud_services', 'FIELD.CLOUD_SERVICE'],
            ])),
        });

        const drawChart = (canvas) => {
            let data;

            if (state.data.length > 0) {
                data = state.data;
            } else {
                data = new Array(DATA_COUNT).fill({ cloud_services: 0, servers: 0 });
            }

            const datasets: ChartDataSets[] = [{
                label: 'Server',
                data: data.map(d => d.servers) as number[],
                backgroundColor: state.colors.servers,
                borderColor: state.colors.servers,
            }, {
                label: 'Cloud Service',
                data: data.map(d => d.cloud_services) as number[],
                backgroundColor: state.colors.cloud_services,
                borderColor: state.colors.cloud_services,
            }];

            state.chart = new NSChart(canvas,
                {
                    type: 'horizontalBar',
                    data: {
                        labels: data.map((d, i) => `Top ${i + 1}`),
                        datasets,
                    },
                    options: {
                        maintainAspectRatio: false,
                        legend: {
                            display: false,
                        },
                        responsive: true,
                        tooltips,
                        scales: {
                            yAxes: [{
                                stacked: true,
                                gridLines: {
                                    drawTicks: false,
                                    drawBorder: false,
                                    color: gray[200],
                                    zeroLineColor: gray[200],
                                },
                                ticks: {
                                    display: true,
                                    beginAtZero: true,
                                    padding: 10,
                                },
                            }],
                            xAxes: [{
                                stacked: true,
                                gridLines: {
                                    drawTicks: false,
                                    drawBorder: false,
                                    color: gray[200],
                                    zeroLineColor: gray[200],
                                },
                                ticks: {
                                    padding: 10,
                                    fontColor: black,
                                    max: state.data.length === 0 ? DEFAULT_MAX : undefined,
                                },
                                afterTickToLabelConversion(scaleInstance): void {
                                    scaleInstance.ticks[0] = null;
                                    scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
                                },
                            }],
                        },
                    },
                    plugins: [{
                        beforeDraw(chart: NSChart): void {
                            const ctx: CanvasRenderingContext2D | null = chart.ctx;
                            if (!ctx) return;

                            ctx.save();

                            ctx.strokeStyle = gray[200];
                            ctx.lineWidth = 1;

                            ctx.beginPath();
                            ctx.moveTo(chart.chartArea.left, chart.chartArea.bottom);
                            ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
                            ctx.moveTo(chart.chartArea.right, chart.chartArea.top);
                            ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
                            ctx.moveTo(chart.chartArea.left, chart.chartArea.top);
                            ctx.lineTo(chart.chartArea.left, chart.chartArea.bottom);
                            ctx.stroke();

                            ctx.restore();
                        },
                    }],
                }, {
                    borderWidth: 0,
                    categoryPercentage: 0.75,
                    barPercentage: 0.5,
                });
        };

        watch([() => state.chartRef, () => state.loading], ([ctx, loading]) => {
            if (ctx && !loading) {
                drawChart(ctx);
            }
        }, {
            lazy: true,
        });


        const api = fluentApi.statisticsTest().resource().stat<Value>()
            .setResourceType('identity.Project')
            .addGroupKey('project_id', 'project_id')
            .addGroupKey('name', 'project')
            .addGroupKey('project_group.project_group_id', 'project_group_id')
            .addGroupKey('project_group.name', 'project_group')
            .setJoinResourceType('inventory.Server')
            .addJoinKey('project_id')
            .addJoinGroupKey('project_id', 'project_id')
            .addJoinGroupField('servers', STAT_OPERATORS.count)
            .setJoinResourceType('inventory.CloudService', 1)
            .addJoinKey('project_id', 1)
            .addJoinGroupKey('project_id', 'project_id', 1)
            .addJoinGroupField('cloud_services', STAT_OPERATORS.count, undefined, 1)
            .addFormula('total', 'cloud_services + servers')
            .setSort('total')
            .setLimit(5);


        const getData = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await api.execute();
                state.data = res.data.results;
            } catch (e) {
                console.error(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(state),
            onRowClick(item) {
                vm.$router.push(`/project/${item.project_id}`);
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.top-projects::v-deep .widget-contents {
    padding-bottom: 1.5rem;
}
.chart {
    height: 180px;
    width: 100%;
    flex-shrink: 0;
}
.color {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.5rem;
    border-radius: 2px;
    background-color: currentColor;
}
.custom-th {
    @apply flex items-center justify-center font-bold px-1;
    font-size: 0.875rem;
}
.project-field {
    @apply truncate font-bold;
}
.p-badge {
    @apply font-bold;
}
.p-data-table::v-deep {
    table-layout: fixed;
    font-size: 0.875rem;
    tbody {
        tr {
            &:nth-child(2n+1) {
                @apply bg-primary4;
            }
        }
    }
    td {
        @apply truncate cursor-pointer;
        &:first-child {
            padding: 0;
        }
    }
    th {
        @apply relative border-0;
        .th-contents {
            @apply text-gray;
        }
        &:first-child {
            width: 2.75rem;
        }
        &:nth-child(2) {
            width: 8.875rem;
        }
        &:nth-child(3) {
            width: 6.25rem;
        }
        &:nth-child(4) {
            width: 6rem;
        }
        &:last-child {
            width: 9rem;
        }
    }
}
.getstarted {
    padding-left: 1.2rem;
    width: 100%;
    max-width: 12rem;
}
</style>
