<template>
    <div class="pt-8 pb-16">
        <section v-if="!dataSourceId">
            <p-select-btn-group class="pr-4 mb-8" :buttons="tools" :selected.sync="selectedToolId" />
        </section>
        <section class="mb-8">
            <span class="title">
                {{ $t('COMMON.MONITORING.RESOURCE') }}
            </span>
            <span class="ml-4 text-gray text-sm">
                * {{ $t('COMMON.MONITORING.LIMIT_OF_RESOURCE', {
                    limitCount: 10,
                }) }}
            </span>
            <div>
                <div v-for="resource in availableResources" :key="resource.id" class="legend">
                    <span class="flex-shrink-0 rounded-sm h-3 w-3 mr-2"
                          :style="{ backgroundColor: resource.color }"
                    />
                    <p-anchor :href="resource.link"
                              :show-icon="true"
                              highlight
                    >
                        {{ legendFormatter(resource) }}
                    </p-anchor>
                </div>
            </div>
        </section>
        <section class="toolbox-section">
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('COMMON.MONITORING.TIME_RANGE') }}</span>
                <p-select-btn-group class="time-range" :buttons="Object.keys(TIME_RANGE)" :selected.sync="selectedTimeRange" />
            </div>
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('COMMON.MONITORING.STATISTICS') }}</span>
                <p-select-dropdown v-model="selectedStat" :items="statItems" />
                <p-icon-button class="ml-4 flex-shrink-0" name="ic_refresh" @click="listMetricCharts" />
            </div>
        </section>
        <section class="py-4">
            <i18n path="COMMON.MONITORING.DISPLAY_TIMEZONE" tag="p" class="text-sm text-gray mb-12">
                <template #timezone>
                    <strong>{{ $t('COMMON.MONITORING.LOCAL_TIME') }}</strong>
                </template>
            </i18n>
            <div v-if="showLoader">
                <p-lottie class="loader" name="thin-spinner" auto
                          :size="2"
                />
            </div>
            <div v-else-if="metrics.length === 0" class="text-center text-gray">
                {{ $t('COMMON.MONITORING.NO_METRICS') }}
            </div>
            <template v-else>
                <div class="metric-chart-wrapper" :class="responsive ? 'responsive' : 'static'">
                    <metric-chart v-for="(item, index) in metricChartDataList" :key="index"
                                  :loading="item.loading"
                                  :labels="item.labels"
                                  :dataset="item.dataset"
                                  :unit="item.metric.unit"
                                  :timezone="timezone"
                                  :resources="availableResources"
                                  :title="item.metric.name"
                                  :error="item.error"
                    />
                </div>
                <p-button v-if="metricChartDataList.length !== metrics.length"
                          :outline="true"
                          style-type="black" class="more-btn"
                          @click="loadMoreMetricCharts"
                >
                    {{ $t('COMMON.MONITORING.MORE') }}
                </p-button>
            </template>
        </section>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    debounce, find, capitalize, chain, range, sortBy, get,
} from 'lodash';
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import MetricChart from '@/common/components/metric-chart/MetricChart.vue';
import {
    PSelectBtnGroup, PSelectDropdown, PIconButton, PLottie, PButton, PAnchor,
} from '@spaceone/design-system';

import {
    blue, coral, green, peacock, violet, yellow, indigo,
} from '@/styles/colors';
import { Metric, MonitoringProps } from '@/common/modules/monitoring/type';
import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import router from '@/routes';


enum MONITORING_TYPE {
    metric = 'METRIC',
    log = 'LOG',
}

enum STATISTICS_TYPE {
    average = 'AVERAGE',
    maximum = 'MAXIMUM',
    minimum = 'MINIMUM'
}

interface MetricChartData {
    loading: boolean;
    labels: string[];
    dataset: {[resourceKey: string]: number[]};
    metric: Metric;
    error?: boolean;
    resources: object[];
}

interface DataToolType {
    id: string;
    name: string;
    statisticsTypes: STATISTICS_TYPE[];
}

interface AvailableResource {
    id: string;
    name: string;
    color: string;
    link: string;
}

interface StatItem {
    type: string;
    label: string;
    name: string;
}


const colors = [
    coral[500], blue[500], violet[500], yellow[600], green[400], coral[400], peacock[600], coral[700],
    peacock[400], green[700], green[500], blue[400], indigo[700], violet[400], indigo[400], blue[700],
];
const TIME_RANGE = {
    '1h': 1,
    '3h': 3,
    '6h': 6,
    '12h': 12,
    '1d': 24,
    '3d': 24 * 3,
    '1w': 24 * 7,
    '2w': 24 * 14,
};

const LOAD_LIMIT = 12;

export default {
    name: 'Monitoring',
    components: {
        PButton,
        PLottie,
        PSelectDropdown,
        PSelectBtnGroup,
        PIconButton,
        PAnchor,
        MetricChart,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        resourceType: {
            type: String,
            default: null,
        },
        resources: {
            type: Array,
            default: () => [],
            validator(resources) {
                return resources.every(resource => resource.id);
            },
        },
        selectedMetrics: {
            type: Array,
            default: () => ([]),
        },
        dataSourceId: {
            type: String,
            default: undefined,
        },
        responsive: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: MonitoringProps) {
        const state = reactive({
            showLoader: computed(() => props.loading || state.metricsLoading),
            timezone: computed(() => store.state.user.timezone),
            dataTools: [],
            selectedToolId: '',
            tools: computed<DataToolType[]>(() => state.dataTools.map(d => ({
                name: d.id,
                label: d.name,
            }))),
            selectedTimeRange: '1h',
            statisticsTypes: computed(() => {
                const tool = find(state.dataTools, { id: state.selectedToolId });
                return tool ? tool.statisticsTypes : [STATISTICS_TYPE.average];
            }),
            statItems: computed<StatItem[]>(() => state.statisticsTypes.map(d => ({
                type: 'item', label: capitalize(d), name: d,
            }))),
            selectedStat: STATISTICS_TYPE.average,
            metricsLoading: true,
            metrics: [] as Metric[],
            metricChartDataList: [] as MetricChartData[],
            availableResources: [] as AvailableResource[],
            noData: false,
        });

        /* api */
        const setAvailableResources = () => {
            state.availableResources = props.resources.map((resource, idx) => ({
                ...resource,
                color: colors[idx],
                link: router.resolve(referenceRouter(resource.id, { resource_type: 'inventory.Server' })).href,
            }));
        };
        const getDataSource = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.dataSource.get({
                    data_source_id: props.dataSourceId,
                });
                state.selectedToolId = props.dataSourceId;
                state.dataTools = [{
                    id: props.dataSourceId,
                    name: res.name,
                    statisticsTypes: get(res, 'plugin_info.metadata.supported_stat', [STATISTICS_TYPE.average]),
                }];
            } catch (e) {
                console.error(e);
            }
        };
        const listDataSources = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.dataSource.list({
                    monitoring_type: MONITORING_TYPE.metric,
                });
                state.dataTools = chain(res.results)
                    .map((d) => {
                        if (d.plugin_info.metadata.supported_resource_type.some(t => props.resourceType === t)) {
                            return {
                                id: d.data_source_id,
                                name: d.name,
                                statisticsTypes: get(d, 'plugin_info.metadata.supported_stat', [STATISTICS_TYPE.average]),
                            };
                        }
                        return undefined;
                    }).compact().uniqBy('id')
                    .value();
                state.selectedToolId = state.dataTools[0].id;
            } catch (e) {
                console.error(e);
            }
        };
        const listMetrics = async () => {
            try {
                state.metrics = [];

                const res = await SpaceConnector.client.monitoring.metric.list({
                    resource_type: props.resourceType,
                    data_source_id: state.selectedToolId,
                    resources: props.resources.map(d => d.id),
                });
                state.metrics = sortBy(res.metrics, m => m.name);
            } catch (e) {
                console.error(e);
            }
        };

        const initMetricChartData = (start = 0): void => {
            let endIdx = start + LOAD_LIMIT;
            if (endIdx > state.metrics.length) endIdx = state.metrics.length;

            range(start, endIdx).forEach((current) => {
                state.metricChartDataList[current] = {
                    dataset: {},
                    labels: [],
                    loading: true,
                    metric: state.metrics[current],
                };
            });
            state.metricChartDataList = [...state.metricChartDataList];
        };
        const getMetricChartData = async (data: MetricChartData) => {
            try {
                data.loading = true;
                const res = await SpaceConnector.client.monitoring.metric.getData({
                    data_source_id: state.selectedToolId,
                    resource_type: props.resourceType,
                    stat: state.selectedStat,
                    end: dayjs.utc().toISOString(),
                    start: dayjs.utc().subtract(TIME_RANGE[state.selectedTimeRange], 'hour').toISOString(),
                    resources: state.availableResources.map(d => d.id),
                    metric: data.metric.key,
                });
                data.labels = res.labels;
                data.dataset = res.resource_values;
                data.error = false;
                data.resources = state.availableResources;
            } catch (e) {
                console.error(e);
                data.error = true;
            } finally {
                data.loading = false;
            }

            return data;
        };
        const listMetricCharts = debounce(async (start = 0): Promise<void> => {
            if (state.availableResources.length === 0) return;
            try {
                await Promise.all(
                    range(start, state.metricChartDataList.length).map(i => getMetricChartData(state.metricChartDataList[i])),
                );
            } catch (e) {
                console.error(e);
            }
        }, 300);

        const listAll = debounce(async (): Promise<void> => {
            state.metricChartDataList = [];

            await setAvailableResources();

            state.metricsLoading = true;
            if (props.selectedMetrics && props.selectedMetrics.length > 0) {
                state.metrics = sortBy(props.selectedMetrics, m => m.name);
            } else {
                await listMetrics();
            }
            state.metricsLoading = false;

            if (state.metrics.length === 0) return;

            await initMetricChartData();
            await listMetricCharts();
        }, 300);


        /* event */
        const loadMoreMetricCharts = async () => {
            const start = state.metricChartDataList.length;
            await initMetricChartData(start);
            await listMetricCharts(start);
        };

        watch(() => state.statisticsTypes, (types) => {
            if (types) state.selectedStat = types[0] || STATISTICS_TYPE.average;
        }, { immediate: true });

        watch(() => props.resources, async () => {
            if (props.resources) {
                if (props.dataSourceId) await getDataSource();
                else await listDataSources();
                await listAll();
            }
        }, { immediate: true });

        watch([() => state.selectedTimeRange, () => state.selectedStat], ([timeRange, stat]) => {
            if (timeRange && stat) listMetricCharts();
        }, { immediate: false });

        watch([() => state.selectedToolId, () => props.selectedMetrics], async () => {
            if (props.resources) {
                await listAll();
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
            colors,
            TIME_RANGE,
            legendFormatter(resource): string {
                return resource.name ? `${resource.id} (${resource.name})` : resource.id;
            },
            listMetricCharts,
            loadMoreMetricCharts,
        };
    },
};
</script>

<style lang="postcss" scoped>
section {
    padding-left: 1rem;
    padding-right: 1rem;
}
.toolbox-section {
    @apply justify-between border-t border-b border-gray-200;
    display: flex;
    padding-top: 1rem;
    padding-bottom: 1rem;
}
.title {
    font-size: 0.875rem;
    font-weight: bold;
    text-transform: capitalize;
}
.legend {
    @apply items-center;
    display: inline-flex;
    font-size: 0.875rem;
    line-height: 1.5;
    vertical-align: text-bottom;
    margin-top: 0.625rem;
    margin-right: 1rem;
    .p-anchor {
        @apply text-gray-900;
    }
}
.time-range::v-deep {
    &.p-select-btn-group .select-btn {
        margin-right: 0;
        padding: 0 0.75rem;
        font-weight: normal;
        font-size: 0.875rem;
        &.active {
            @apply text-secondary;
            font-weight: bold;
        }
    }
}

.metric-chart-wrapper {
    display: grid;
    grid-auto-rows: auto;
    row-gap: 3rem;
    column-gap: 1rem;

    &.responsive {
        grid-template-columns: repeat(auto-fill, minmax(49%, 49%));
    }
    &.static {
        grid-template-columns: repeat(auto-fill, minmax(23.125rem, 23.125rem));
    }
}
.more-btn::v-deep {
    @apply border-gray-300 mx-auto;
    display: block;
    max-width: 38rem;
    width: 40%;
    margin-top: 3rem;
}
.loader {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
