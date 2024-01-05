<script lang="ts" setup>
import {
    computed, onBeforeUnmount, reactive, ref, watch,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PButton, PDataLoader, PDataTable, PI, PSkeleton, PEmpty,
} from '@spaceone/design-system';
import bytes from 'bytes';
import { cloneDeep, range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { arrayToQueryString } from '@/lib/router-query-string';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, peacock, secondary, white,
} from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { HOME_DASHBOARD_DATA_TYPE } from '@/services/home-dashboard/constants/home-dashboard-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';


interface Data {
    server_count: number;
    database_count: number;
    storage_size: number;
    //
    project_group: string;
    project_group_id: string;
    project: string;
    project_id: string;
}
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
interface TableData {
    [key: string]: TableColumnData;
}
interface Props {
    extraParams?: object;
}

const props = withDefaults(defineProps<Props>(), {
    extraParams: () => ({}),
});

const DATA_COUNT = 5;
const SERVER_COLOR = secondary;
const DATABASE_COLOR = peacock[200];
const CATEGORY_KEY = 'rank';

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const userWorkspaceStore = useUserWorkspaceStore();
const storeState = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
});
const allReferenceStore = useAllReferenceStore();
const state = reactive({
    loading: true,
    data: [] as Data[],
    tableData: computed(() => getRefinedTableData(state.data)),
    chartData: computed(() => getRefinedChartData(state.tableData)),
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
const drawChart = () => {
    // refresh root for deleting previous chart
    chartHelper.refreshRoot();

    // create chart and axis
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    yAxis.set('categoryField', CATEGORY_KEY);
    yAxis.data.setAll(cloneDeep(state.chartData));

    // yAxis
    yAxis.get('renderer').setAll({
        minGridDistance: 0,
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
    });
    yAxis.get('renderer').grid.template.setAll({
        location: 0,
        strokeOpacity: 1,
        stroke: chartHelper.color(gray[200]),
    });
    yAxis.get('renderer').labels.template.setAll({
        fill: chartHelper.color(gray[400]),
    });

    // xAxis
    xAxis.get('renderer').setAll({
        minGridDistance: 60,
    });
    xAxis.get('renderer').grid.template.setAll({
        strokeOpacity: 1,
        stroke: chartHelper.color(gray[200]),
    });
    xAxis.get('renderer').labels.template.setAll({
        fill: chartHelper.color(gray[500]),
    });

    // create legend
    const legend = chartHelper.createLegend({
    });
    chart.children.push(legend);

    // create series
    const createSeries = (field, name) => {
        const series = chartHelper.createXYColumnSeries(chart, {
            name,
            valueXField: field,
            categoryYField: CATEGORY_KEY,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
            fill: chartHelper.color(state.colors[field]),
            stroke: chartHelper.color(white),
            opacity: 1,
        });
        series.data.setAll(cloneDeep(state.chartData));

        // add series to chart
        chart.series.push(series);
    };
    createSeries('server', i18n.t('COMMON.WIDGETS.TOP_PROJECT_SERVER'));
    createSeries('database', i18n.t('COMMON.WIDGETS.TOP_PROJECT_DATABASE'));

    // set legend data
    legend.data.setAll(chart.series.values);
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
const getRefinedTableData = (rawData: Data[]): TableData[] => rawData.map((d) => ({
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
        to: getLocation(HOME_DASHBOARD_DATA_TYPE.SERVER, d.project_id),
    },
    database: {
        count: d.database_count,
        to: getLocation(HOME_DASHBOARD_DATA_TYPE.DATABASE, d.project_id),
    },
    storage: {
        label: bytes(d.storage_size, { unitSeparator: ' ' }),
        to: getLocation(HOME_DASHBOARD_DATA_TYPE.STORAGE, d.project_id),
    },
}));
const getRefinedChartData = (tableData: TableData[]): ChartData[] => {
    const chartData = [] as ChartData[];
    range(0, DATA_COUNT).forEach((idx) => {
        chartData.push({
            rank: `#${idx + 1}`,
            server: 0,
            database: 0,
        });
    });
    tableData.forEach((d, idx) => {
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
        const { results } = await SpaceConnector.client.statistics.topic.topProject({
            ...props.extraParams,
            workspace_id: storeState.currentWorkspaceId,
        });
        state.data = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = [];
    } finally {
        state.loading = false;
    }
};

const init = async () => {
    await getData();
};
init();

watch([() => chartContext.value, () => state.chartData], ([_chartContext, chartData]) => {
    if (_chartContext && chartData) drawChart();
});

onBeforeUnmount(() => {
    chartHelper.disposeRoot();
});
</script>

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
            <p-data-loader :loading="state.loading"
                           class="chart"
            >
                <template #loader>
                    <p-skeleton width="100%"
                                height="100%"
                    />
                </template>
                <div ref="chartContext"
                     class="chart"
                />
            </p-data-loader>
            <p-empty v-if="!state.loading && state.tableData.length === 0 && storeState.projects.length === 0"
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
            <p-empty v-else-if="!state.loading && state.tableData.length === 0 && storeState.projects.length !== 0"
                     show-image
            >
                {{ $t('COMMON.COMPONENTS.METRIC_CHART.NO_DATA') }}
            </p-empty>
            <template v-else>
                <p-data-table
                    :loading="state.loading"
                    :fields="state.fields"
                    :items="state.tableData"
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
