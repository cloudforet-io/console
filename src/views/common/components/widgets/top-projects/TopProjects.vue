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
            <template v-else></template>
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
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { SpaceConnector } from '@/lib/space-connector';
import {
    gray, primary, primary1, primary2, primary3,
} from '@/styles/colors';

am4core.useTheme(am4themes_animated);


interface ChartData {
    project: string;
    server: number;
    cloud_service: number;
}
interface ProjectData {
    project_id: string;
    project: string;
    project_group: string;
    project_group_id: string;
    servers?: number;
    cloud_services?: number;
    total?: number;
}

const SERVER_COLOR = primary;
const DATABASE_COLOR = primary1;
const STORAGE_COLOR = primary2;
const CLOUD_SERVICE_COLOR = primary3;


export default {
    name: 'TopProjects',
    components: {
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
            chartRef: null as HTMLElement | null,
            chart: null as HTMLElement | null,
            chartData: [] as ChartData[],
            colors: {
                server: SERVER_COLOR,
                database: DATABASE_COLOR,
                storage: STORAGE_COLOR,
                cloud_service: CLOUD_SERVICE_COLOR,
            },
            fields: computed(() => [
                { name: 'rank', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_RANK') },
                { name: 'project_group', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_PROJECT_GROUP') },
                { name: 'project', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_PROJECT') },
                { name: 'servers', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_SERVER') },
                { name: 'cloud_services', label: vm.$t('COMMON.WIDGETS.TOP_PROJECT_CLOUD_SERVICE') },
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
            projectAxis.dataFields.category = 'project';

            projectAxis.renderer.grid.template.location = 0;
            projectAxis.renderer.grid.template.strokeOpacity = 1;
            projectAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            projectAxis.renderer.labels.template.fill = am4core.color(gray[500]);
            projectAxis.renderer.labels.template.fontSize = 12;
            projectAxis.renderer.cellStartLocation = 0.3;
            projectAxis.renderer.cellEndLocation = 0.7;

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
            valueAxis.fontSize = 12;

            const createSeries = (field, name) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.name = name;
                series.dataFields.categoryY = 'project';
                series.dataFields.valueX = field;
                series.fill = am4core.color(state.colors[field]);
                series.strokeWidth = 0;
                series.stacked = true;
            };

            chart.data = state.chartData;
            createSeries('server', 'Server');
            createSeries('database', 'Database');
            createSeries('storage', 'Storage');
            createSeries('cloud_service', 'Cloud Service');

            chart.legend = new am4charts.Legend();
            chart.legend.position = 'bottom';
            chart.legend.contentAlign = 'left';
            chart.legend.paddingTop = -10;
            chart.legend.paddingLeft = 20;
            chart.legend.fontSize = 12;
            chart.legend.labels.template.fill = am4core.color(gray[500]);
            chart.legend.markers.template.width = 8;
            chart.legend.markers.template.height = 8;
        };

        const getData = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.topProject();
                const data = res.results;
                const orderedData = orderBy(data, ['total'], ['desc']);
                const chartData = [] as ChartData[];
                range(1, 6).forEach((idx) => {
                    chartData.push({
                        project: `#${idx}`,
                        server: 0,
                        cloud_service: 0,
                    });
                });
                orderedData.forEach((d, idx) => {
                    chartData.splice(idx, 1, {
                        project: `#${idx + 1}`,
                        server: d.servers,
                        cloud_service: d.cloud_services,
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
.get-started {
    padding-left: 1.2rem;
    width: 100%;
    max-width: 12rem;
}
</style>
