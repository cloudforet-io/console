<template>
    <widget-layout class="top-projects">
        <template #title>
            <div class="top grid grid-cols-12">
                <span class="title col-span-8 md:col-span-10">{{ $t('COMMON.WIDGETS.TOP_PROJECT_TITLE') }}</span>
                <router-link :to="'/project'" class="create-project-button">
                    <p-i name="ic_plus" width="1rem" height="1rem"
                         color="transparent inherit"
                         class="add-icon"
                    />
                    <span class="hidden sm:block">{{ $t('COMMON.WIDGETS.TOP_PROJECT_CREATE_PROJECT') }}</span>
                    <span class="block sm:hidden">{{ $t('COMMON.WIDGETS.TOP_PROJECT_PROJECT') }}</span>
                </router-link>
            </div>
        </template>
        <div class="contents-container">
            <p-chart-loader :loading="loading" class="chart">
                <template #loader>
                    <p-skeleton width="100%" height="100%" />
                </template>
                <div ref="chartRef" class="chart" />
            </p-chart-loader>
            <div v-if="!loading && chartData.length === 0"
                 class="flex flex-col h-full justify-center items-center pt-16 pb-10"
            >
                <p class="text-2xl font-bold capitalize mb-4 text-primary text-center leading-tight">
                    {{ $t('COMMON.WIDGETS.TOP_PROJECT_CREATE_DASHBOARD') }}
                </p>
                <p class="text-primary1 text-sm capitalize mb-4 text-center leading-normal">
                    {{ $t('COMMON.WIDGETS.TOP_PROJECT_CREATE_GUIDE') }}
                </p>
                <router-link to="/project" tag="div" class="">
                    <p-icon-text-button name="ic_back" icon-direction="right"
                                        size="lg" dir="down"
                                        style-type="primary" icon-color="transparent inherit"
                                        width="1.5rem" height="1.5rem"
                                        class="get-started"
                    >
                        <span>{{ $t('COMMON.WIDGETS.TOP_PROJECT_GET_START') }}</span>
                    </p-icon-text-button>
                </router-link>
            </div>
            <template v-else>
                <p-data-table
                    :loading="loading"
                    :fields="fields"
                    :items="data"
                    :bordered="false"
                >
                    <template #col-rank-format="{ index }">
                        <span class="col-rank">{{ `# ${index + 1}` }}</span>
                    </template>
                    <template #col-project_group-format="{ value }">
                        <router-link class="link-text" :to="value.to">
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                    <template #col-project-format="{ value }">
                        <router-link class="link-text" :to="value.to">
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                    <template #col-server-format="{ value }">
                        <router-link class="link-text" :to="value.to">
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                    <template #col-database-format="{ value }">
                        <router-link class="link-text" :to="value.to">
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                    <template #col-storage-format="{ value }">
                        <router-link class="link-text" :to="value.to">
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                </p-data-table>
            </template>
        </div>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { orderBy, range } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Location } from 'vue-router';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { queryTagsToQueryString } from '@/lib/router-query-string';
import { SpaceConnector } from '@/lib/space-connector';
import {
    gray, peacock, secondary,
} from '@/styles/colors';

am4core.useTheme(am4themes_animated);

enum CLOUD_SERVICE_LABEL {
    compute = 'Compute',
    database = 'Database',
    storage = 'Storage',
}

interface ChartData {
    rank: string;
    server: number;
    database: number;
}
interface ProjectData {
    project_id: string;
    project: string;
    project_group: string;
    project_group_id: string;
    servers?: number;
    total?: number;
}

const DATA_COUNT = 5;
const COMPUTE_COLOR = secondary;
const DATABASE_COLOR = peacock[200];


export default {
    name: 'TopProjects',
    components: {
        WidgetLayout,
        PDataTable,
        PIconTextButton,
        PChartLoader,
        PSkeleton,
        PI,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: true,
            data: [] as ProjectData[],
            chartData: [] as ChartData[],
            chartRef: null as HTMLElement | null,
            chart: null as HTMLElement | null,
            colors: {
                server: COMPUTE_COLOR,
                database: DATABASE_COLOR,
            },
            fields: computed(() => [
                { name: 'rank', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_RANK'), width: 3 },
                { name: 'project_group', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_PROJECT_GROUP') },
                { name: 'project', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_PROJECT') },
                { name: 'server', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_COMPUTE') },
                { name: 'database', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_DATABASE') },
                { name: 'storage', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_STORAGE') },
            ]),
        });

        /* util */
        const formatBytes = (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
        };
        const drawChart = (chartContext) => {
            const chart = am4core.create(chartContext, am4charts.XYChart);
            chart.logo.disabled = true;
            chart.paddingRight = 20;
            chart.paddingLeft = -5;
            chart.paddingTop = 5;
            chart.paddingBottom = 0;

            const projectAxis = chart.yAxes.push(new am4charts.CategoryAxis());
            projectAxis.renderer.minGridDistance = 0;
            projectAxis.dataFields.category = 'rank';

            projectAxis.renderer.grid.template.location = 0;
            projectAxis.renderer.grid.template.strokeOpacity = 1;
            projectAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            projectAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            projectAxis.renderer.cellStartLocation = 0.3;
            projectAxis.renderer.cellEndLocation = 0.7;
            projectAxis.fontSize = 11;

            const valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minGridDistance = 60;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.adapter.add('strokeOpacity', (opacity, target) => {
                // @ts-ignore
                if (target.dataItem && (target.dataItem.value === 0)) return 0;
                return opacity;
            });
            valueAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                // @ts-ignore
                if (target.dataItem && (target.dataItem.value === 0)) return '';
                return label;
            });
            valueAxis.renderer.labels.template.fill = am4core.color(gray[500]);
            valueAxis.renderer.baseGrid.disabled = true;
            valueAxis.fontSize = 11;

            const createSeries = (field, name) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.name = name;
                series.dataFields.categoryY = 'rank';
                series.dataFields.valueX = field;
                series.fill = am4core.color(state.colors[field]);
                series.stacked = true;
                series.stroke = am4core.color('white');
                series.strokeWidth = 1;
                series.strokeOpacity = 0;
            };

            chart.data = state.chartData;
            createSeries('server', 'Server');
            createSeries('database', 'Database');

            chart.legend = new am4charts.Legend();
            chart.legend.position = 'bottom';
            chart.legend.contentAlign = 'left';
            chart.legend.paddingTop = -10;
            chart.legend.paddingLeft = 20;
            chart.legend.fontSize = 12;
            chart.legend.labels.template.fill = am4core.color(gray[400]);
            chart.legend.markers.template.width = 8;
            chart.legend.markers.template.height = 8;
        };
        const getLocation = (type, projectId) => {
            const filters: QueryTag[] = [
                {
                    key: { label: 'Project Id', name: 'project_id' },
                    operator: '=',
                    value: { label: projectId, name: projectId },
                },
            ];
            const query: Location['query'] = {};
            let name: string;

            // set query
            if (type === 'compute') {
                name = 'server';
            } else {
                name = 'cloudServiceMain';
                query.provider = 'all';
                query.service = CLOUD_SERVICE_LABEL[type];
                if (type === 'storage') query.primary = 'false';
            }

            const location: Location = {
                name,
                query: {
                    filters: queryTagsToQueryString(filters),
                    ...query,
                },
            };
            return location;
        };

        /* api */
        const getData = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.topProject();
                const data = res.results.map(d => ({
                    rank: d.rank,
                    project_group: {
                        label: d.project_group,
                        to: referenceRouter(d.project_group_id, { resource_type: 'identity.ProjectGroup' }),
                    },
                    project: {
                        label: d.project,
                        to: referenceRouter(d.project_id, { resource_type: 'identity.Project' }),
                    },
                    server: {
                        label: d.server_count,
                        to: getLocation('compute', d.project_id),
                    },
                    database: {
                        label: d.database_count,
                        to: getLocation('database', d.project_id),
                    },
                    storage: {
                        label: formatBytes(d.storage_size, 2),
                        to: getLocation('storage', d.project_id),
                    },
                }));
                const orderedData = orderBy(data, ['total'], ['desc']);
                state.data = orderedData;

                const chartData = [] as ChartData[];
                range(0, DATA_COUNT).forEach((idx) => {
                    chartData.push({
                        rank: `#${idx + 1}`,
                        server: 0,
                        database: 0,
                    });
                });
                orderedData.forEach((d, idx) => {
                    chartData.splice(idx, 1, {
                        rank: `#${idx + 1}`,
                        server: d.server.label,
                        database: d.database.label,
                    });
                });
                state.chartData = chartData.reverse();
            } catch (e) {
                console.error(e);
                state.chartData = [];
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
            await getData();
        };
        init();

        watch([() => state.chartRef, () => state.chartData], ([chartContext, data]) => {
            if (chartContext && data) {
                drawChart(chartContext);
            }
        });

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
.top-projects {
    .top {
        position: relative;
    }
    .title {
        @apply text-gray-900;
        font-size: 1.125rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .create-project-button {
        @apply text-secondary;
        position: absolute;
        display: inline-flex;
        right: 1.25rem;
        top: 0.25rem;
        font-size: 0.75rem;
        &:hover {
            @apply text-blue-800;
        }

        .add-icon {
            margin-right: 0.25rem;
        }
    }
}
.contents-container {
    @apply pt-4 flex flex-col h-full;
}
.chart {
    height: 13rem;
}
.p-data-table::v-deep {
    margin-top: 0.5rem;
    th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
        font-weight: normal;
    }
    td {
        height: 2rem;
        .col-rank {
            @apply text-gray-600;
        }
        .link-text {
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
.get-started {
    padding-left: 1.2rem;
    width: 100%;
    max-width: 12rem;
}
</style>
