<template>
    <p-widget-layout :title="$t('COMMON.WIDGETS.TOP_PROJECT_TITLE')"
                     class="top-projects"
    >
        <div class="flex flex-col h-full">
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
                        {{ $t('COMMON.WIDGETS.TOP_PROJECT_GET_START') }}
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
                        {{ `# ${index + 1}` }}
                    </template>
                </p-data-table>
            </template>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { orderBy, range } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { SpaceConnector } from '@/lib/space-connector';
import {
    gray, indigo, coral,
} from '@/styles/colors';

am4core.useTheme(am4themes_animated);


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
const COMPUTE_COLOR = indigo[600];
const DATABASE_COLOR = coral[500];


export default {
    name: 'TopProjects',
    components: {
        PDataTable,
        PIconTextButton,
        PWidgetLayout,
        PChartLoader,
        PSkeleton,
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
                { name: 'server_count', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_SERVER') },
                { name: 'database_count', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_DATABASE') },
                { name: 'storage_size', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_STORAGE') },
            ]),
        });

        const drawChart = (chartContext) => {
            const chart = am4core.create(chartContext, am4charts.XYChart);
            chart.responsive.enabled = true;
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
            projectAxis.renderer.baseGrid.disabled = true;
            projectAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            projectAxis.renderer.cellStartLocation = 0.3;
            projectAxis.renderer.cellEndLocation = 0.7;
            projectAxis.fontSize = 11;

            const valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minGridDistance = 60;
            valueAxis.renderer.baseGrid.strokeOpacity = 0;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                // @ts-ignore
                if (target.dataItem && (target.dataItem.value === 0)) return '';
                return label;
            });
            valueAxis.renderer.labels.template.fill = am4core.color(gray[500]);
            valueAxis.fontSize = 11;

            const createSeries = (field, name) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.name = name;
                series.dataFields.categoryY = 'rank';
                series.dataFields.valueX = field;
                series.fill = am4core.color(state.colors[field]);
                series.strokeWidth = 0;
                series.stacked = true;
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

        const formatBytes = (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
        };

        const getData = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.topProject();
                const data = res.results.map(d => ({
                    storage_size: formatBytes(d.storage_size, 2),
                    rank: d.rank,
                    project_group: d.project_group,
                    project: d.project,
                    server_count: d.server_count,
                    database_count: d.database_count,
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
                        server: d.server_count,
                        database: d.database_count,
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
.top-projects::v-deep .widget-contents {
    padding-bottom: 1.5rem;
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
    }
    td {
        height: 2rem;
    }
}
.get-started {
    padding-left: 1.2rem;
    width: 100%;
    max-width: 12rem;
}
</style>
