<template>
    <widget-layout class="top-projects">
        <template #title>
            <div class="top grid grid-cols-12">
                <span class="title col-span-8 md:col-span-10">{{ $t('COMMON.WIDGETS.TOP_PROJECT_TITLE') }}</span>
                <router-link :to="{ name: PROJECT_ROUTE._NAME }"
                             class="create-project-button"
                >
                    <p-i name="ic_plus"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                         class="add-icon"
                    />
                    <span class="hidden sm:block">{{ $t('COMMON.WIDGETS.TOP_PROJECT_CREATE_PROJECT') }}</span>
                    <span class="block sm:hidden">{{ $t('COMMON.WIDGETS.TOP_PROJECT_PROJECT') }}</span>
                </router-link>
            </div>
        </template>
        <div class="contents-container">
            <p-data-loader :loading="loading"
                           class="chart"
            >
                <template #loader>
                    <p-skeleton width="100%"
                                height="100%"
                    />
                </template>
                <div ref="chartRef"
                     class="chart"
                />
            </p-data-loader>
            <p-empty v-if="!loading && items.length === 0"
                     :title="$t('COMMON.WIDGETS.TOP_PROJECTS.NO_PROJECT')"
                     show-button
            >
                {{ $t('COMMON.WIDGETS.TOP_PROJECTS.RESOURCE_MAP') }}
                <template #button>
                    <router-link :to="{ name: PROJECT_ROUTE._NAME }">
                        <p-button style-type="substitutive"
                                  icon-left="ic_plus"
                        >
                            <span>{{ $t('COMMON.WIDGETS.TOP_PROJECTS.CREATE_PROJECT') }}</span>
                        </p-button>
                    </router-link>
                </template>
            </p-empty>
            <template v-else>
                <p-data-table
                    :loading="loading"
                    :fields="fields"
                    :items="items"
                    :bordered="false"
                >
                    <template #col-rank-format="{ index }">
                        <span class="col-rank">{{ `# ${index + 1}` }}</span>
                    </template>
                    <template #col-project_group-format="{ value }">
                        <router-link class="link-text"
                                     :to="value.to"
                        >
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                    <template #col-project-format="{ value }">
                        <router-link class="link-text"
                                     :to="value.to"
                        >
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                    <template #col-server-format="{ value }">
                        <router-link class="link-text"
                                     :to="value.to"
                        >
                            <span>{{ value.count }}</span>
                        </router-link>
                    </template>
                    <template #col-database-format="{ value }">
                        <router-link class="link-text"
                                     :to="value.to"
                        >
                            <span>{{ value.count }}</span>
                        </router-link>
                    </template>
                    <template #col-storage-format="{ value }">
                        <router-link class="link-text"
                                     :to="value.to"
                        >
                            <span>{{ value.label }}</span>
                        </router-link>
                    </template>
                </p-data-table>
            </template>
        </div>
    </widget-layout>
</template>

<script lang="ts">

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PButton, PDataLoader, PDataTable, PI, PSkeleton, PEmpty,
} from '@spaceone/design-system';
import bytes from 'bytes';
import { range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import config from '@/lib/config';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { arrayToQueryString } from '@/lib/router-query-string';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, peacock, secondary } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { DATA_TYPE } from '@/services/home-dashboard/modules/type';
import { PROJECT_ROUTE } from '@/services/project/route-config';

interface ChartData {
    rank: string;
    server: number;
    database: number;
}
interface TableColumnData {
    label?: string;
    count?: number;
    to: Location;
}
interface TableItem {
    [key: string]: TableColumnData;
}

const DATA_COUNT = 5;
const SERVER_COLOR = secondary;
const DATABASE_COLOR = peacock[200];

export default {
    name: 'TopProjects',
    components: {
        WidgetLayout,
        PDataTable,
        PButton,
        PDataLoader,
        PSkeleton,
        PI,
        PEmpty,
    },
    props: {
        extraParams: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            items: [] as TableItem[],
            chartData: [] as ChartData[],
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            colors: {
                server: SERVER_COLOR,
                database: DATABASE_COLOR,
            },
            fields: computed(() => [
                { name: 'rank', label: i18n.t('COMMON.WIDGETS.TOP_PROJECT_RANK'), width: 3 },
                { name: 'project_group', label: i18n.t('COMMON.WIDGETS.TOP_PROJECT_PROJECT_GROUP') },
                { name: 'project', label: i18n.t('COMMON.WIDGETS.TOP_PROJECT_PROJECT') },
                { name: 'server', label: i18n.t('COMMON.WIDGETS.TOP_PROJECT_SERVER') },
                { name: 'database', label: i18n.t('COMMON.WIDGETS.TOP_PROJECT_DATABASE') },
                { name: 'storage', label: i18n.t('COMMON.WIDGETS.TOP_PROJECT_STORAGE') },
            ]),
        });

        /* Util */
        const drawChart = (chartContext) => {
            const chart = am4core.create(chartContext, am4charts.XYChart);
            chart.paddingRight = 10;
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
            valueAxis.renderer.grid.template.adapter.add('strokeOpacity', (opacity, target: any) => {
                if (target.dataItem && (target.dataItem.value === 0)) return 0;
                return opacity;
            });
            valueAxis.renderer.labels.template.adapter.add('text', (label, target: any) => {
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

            if (!state.chartData.length) {
                const emptyChartData = [] as ChartData[];
                range(0, 5).forEach((d) => {
                    emptyChartData.unshift({
                        rank: `#${d + 1}`,
                        server: 0,
                        database: 0,
                    });
                });
                chart.data = emptyChartData;
                valueAxis.min = 1;
            } else {
                chart.data = state.chartData;
            }
            createSeries('server', i18n.t('COMMON.WIDGETS.TOP_PROJECT_SERVER'));
            createSeries('database', i18n.t('COMMON.WIDGETS.TOP_PROJECT_DATABASE'));

            chart.legend = new am4charts.Legend();
            chart.legend.position = 'bottom';
            chart.legend.contentAlign = 'left';
            chart.legend.paddingTop = -10;
            chart.legend.paddingLeft = 20;
            chart.legend.fontSize = 12;
            chart.legend.labels.template.fill = am4core.color(gray[400]);
            chart.legend.markers.template.width = 8;
            chart.legend.markers.template.height = 8;

            state.chart = chart;
        };
        //
        const queryHelper = new QueryHelper();
        const getLocation = (type: string, projectId: string) => {
            const query: Location['query'] = {};
            query.service = arrayToQueryString([type]);

            const location: Location = {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                query: {
                    filters: queryHelper.setFilters([
                        { k: 'project_id', v: projectId, o: '=' },
                    ]).rawQueryStrings,
                    ...query,
                },
            };
            return location;
        };
        //
        const getConvertedData = (rawData): TableItem[] => rawData.map((d) => ({
            project_group: {
                label: d.project_group,
                to: referenceRouter(d.project_group_id, { resource_type: 'identity.ProjectGroup' }),
            },
            project: {
                label: d.project,
                to: referenceRouter(d.project_id, { resource_type: 'identity.Project' }),
            },
            server: {
                count: d.server_count,
                to: getLocation(DATA_TYPE.SERVER, d.project_id),
            },
            database: {
                count: d.database_count,
                to: getLocation(DATA_TYPE.DATABASE, d.project_id),
            },
            storage: {
                label: bytes(d.storage_size, { unitSeparator: ' ' }),
                to: getLocation(DATA_TYPE.STORAGE, d.project_id),
            },
        }));
        const getConvertedChartData = (orderedData: TableItem[]): ChartData[] => {
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
                    server: d.server.count as number,
                    database: d.database.count as number,
                });
            });
            return chartData.reverse();
        };

        /* Api */
        const getData = async () => {
            state.loading = true;
            try {
                const { results } = await SpaceConnector.client.statistics.topic.topProject(props.extraParams);
                const orderedData = getConvertedData(results);
                state.items = orderedData;
                state.chartData = getConvertedChartData(orderedData);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
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

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            PROJECT_ROUTE,
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
    min-height: 13rem;
}

/* custom design-system component - p-data-table */
:deep(.p-data-table) {
    @apply rounded-xs;
    margin-top: 0.5rem;
    th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
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

/* custom design-system component - p-empty */
:deep(.p-empty) {
    padding: 1.25rem 0;
}
</style>
