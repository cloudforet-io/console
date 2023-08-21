<template>
    <div class="monitoring">
        <section v-if="!dataSourceId && dataTools.length > 1"
                 class="data-source-section"
        >
            <p-select-button-group class="data-source-wrapper"
                                   :buttons="tools"
                                   :selected.sync="selectedToolId"
            />
        </section>
        <section class="resource-section">
            <span class="title">
                {{ $t('COMMON.MONITORING.RESOURCE') }}
            </span>
            <span class="ml-4 text-gray text-sm">
                * {{ $t('COMMON.MONITORING.LIMIT_OF_RESOURCE', {
                    limitCount: 16,
                }) }}
            </span>
            <div>
                <p-link v-for="resource in availableResources"
                        :key="resource.id"
                        class="legend"
                        :href="resource.link"
                >
                    <template #left-extra>
                        <span class="circle"
                              :style="{ backgroundColor: resource.color }"
                        />
                    </template>
                    {{ legendFormatter(resource) }}
                </p-link>
            </div>
        </section>
        <section class="toolbox-section">
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('COMMON.MONITORING.TIME_RANGE') }}</span>
                <div class="time-range-wrapper">
                    <span v-for="timeRange in Object.keys(TIME_RANGE)"
                          :key="timeRange"
                          :title="timeRange"
                          class="button"
                          :class="{selected: timeRange === selectedTimeRange}"
                          @click="selectedTimeRange = timeRange"
                    >
                        {{ timeRange }}
                    </span>
                </div>
            </div>
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('COMMON.MONITORING.STATISTICS') }}</span>
                <p-select-dropdown v-model="selectedStat"
                                   :items="statItems"
                />
                <p-icon-button class="ml-4 flex-shrink-0"
                               name="ic_refresh"
                               @click="listMetricCharts"
                />
            </div>
        </section>
        <section class="chart-section">
            <i18n path="COMMON.MONITORING.DISPLAY_TIMEZONE"
                  tag="p"
                  class="text-sm text-gray mb-12"
            >
                <template #timezone>
                    <strong>{{ $t('COMMON.MONITORING.LOCAL_TIME') }}</strong>
                </template>
            </i18n>
            <p-spinner v-if="showLoader"
                       size="xl"
            />
            <div v-else-if="metrics.length === 0"
                 class="text-center text-gray"
            >
                {{ $t('COMMON.MONITORING.NO_METRICS') }}
            </div>
            <template v-else>
                <div class="metric-chart-wrapper grid grid-cols-12">
                    <metric-chart v-for="(item, index) in metricChartDataList"
                                  :key="index"
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
                          style-type="tertiary"
                          class="more-btn"
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
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PSelectButtonGroup, PSelectDropdown, PIconButton, PButton, PLink, PSpinner,
} from '@spaceone/design-system';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    debounce, find, capitalize, chain, range, sortBy, get,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import MetricChart from '@/common/components/charts/metric-chart/MetricChart.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import type { StatisticsType } from '@/common/modules/monitoring/config';
import {
    COLORS, MONITORING_TYPE, STATISTICS_TYPE, TIME_RANGE,
} from '@/common/modules/monitoring/config';
import type {
    AvailableResource,
    Metric, MetricChartData, StatItem,
} from '@/common/modules/monitoring/type';

interface DataToolType {
    id: string;
    name: string;
    statisticsTypes: StatisticsType[];
}

const LOAD_LIMIT = 12;

export default {
    name: 'Monitoring',
    components: {
        PButton,
        PSelectDropdown,
        PSelectButtonGroup,
        PIconButton,
        PLink,
        MetricChart,
        PSpinner,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        resources: {
            type: Array,
            default: () => [],
            validator(resources) {
                return resources.every((resource) => resource.id);
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
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            showLoader: computed(() => props.loading || state.metricsLoading),
            timezone: computed(() => store.state.user.timezone),
            dataTools: [],
            selectedToolId: '',
            tools: computed<DataToolType[]>(() => state.dataTools.map((d) => ({
                name: d.id,
                label: d.name,
            }))),
            selectedTimeRange: '1h',
            statisticsTypes: computed(() => {
                const tool = find(state.dataTools, { id: state.selectedToolId });
                return tool ? tool.statisticsTypes : [STATISTICS_TYPE.AVERAGE];
            }),
            statItems: computed<StatItem[]>(() => state.statisticsTypes.map((d) => ({
                type: 'item', label: capitalize(d), name: d,
            }))),
            selectedStat: STATISTICS_TYPE.AVERAGE,
            metricsLoading: true,
            metrics: [] as Metric[],
            metricChartDataList: [] as MetricChartData[],
            availableResources: [] as AvailableResource[],
            noData: false,
        });

        /* api */
        const setAvailableResources = () => {
            let resources = props.resources.slice(0, 16);
            resources = resources.map((resource, idx) => ({
                ...resource,
                color: COLORS[idx],
                link: vm.$router.resolve(referenceRouter(resource.id, { resource_type: 'inventory.Server' })).href,
            }));
            state.availableResources = sortBy(resources, (m) => m.name);
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
                    statisticsTypes: get(res, 'plugin_info.metadata.supported_stat', [STATISTICS_TYPE.AVERAGE]),
                }];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataTools = [];
                state.selectedToolId = '';
            }
        };

        const apiQuery = new ApiQueryHelper();
        const listDataSources = async () => {
            try {
                apiQuery.setFilters([{ k: 'provider', o: '=', v: props.resources.map((d) => d.provider) }]);
                const res = await SpaceConnector.client.monitoring.dataSource.list({
                    monitoring_type: MONITORING_TYPE.METRIC,
                    query: apiQuery.data,
                });
                state.dataTools = chain(res.results)
                    .map((d) => ({
                        id: d.data_source_id,
                        name: d.name,
                        statisticsTypes: get(d, 'plugin_info.metadata.supported_stat', [STATISTICS_TYPE.AVERAGE]),
                    })).compact().uniqBy('id')
                    .value();
                if (state.dataTools.length > 0) {
                    state.selectedToolId = state.dataTools[0].id;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataTools = [];
            }
        };
        let resourceToken: CancelTokenSource | undefined;
        const listMetrics = async () => {
            if (!state.selectedToolId) return;
            if (resourceToken) {
                resourceToken.cancel('Next request has been called.');
                resourceToken = undefined;
            }
            resourceToken = axios.CancelToken.source();
            try {
                state.metrics = [];

                const res = await SpaceConnector.client.monitoring.metric.list({
                    data_source_id: state.selectedToolId,
                    resources: props.resources.map((d) => d.id),
                }, {
                    cancelToken: resourceToken.token,
                });
                resourceToken = undefined;
                state.metrics = sortBy(res.metrics, (m) => m.name);
            } catch (e: any) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                    state.metrics = [];
                }
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
                    metric_query: data.metric.metric_query,
                    stat: state.selectedStat,
                    end: dayjs.utc().toISOString(),
                    start: dayjs.utc().subtract(TIME_RANGE[state.selectedTimeRange], 'hour').toISOString(),
                    metric: data.metric.key,
                });
                data.labels = res.labels;
                data.dataset = res.values;
                data.error = false;
                data.resources = state.availableResources;
            } catch (e) {
                ErrorHandler.handleError(e);
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
                    range(start, state.metricChartDataList.length).map((i) => getMetricChartData(state.metricChartDataList[i])),
                );
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        }, 300);

        const listAll = debounce(async (): Promise<void> => {
            state.metricChartDataList = [];

            setAvailableResources();

            state.metricsLoading = true;
            if (props.selectedMetrics && props.selectedMetrics.length > 0) {
                state.metrics = sortBy(props.selectedMetrics, (m) => m.name);
            } else {
                await listMetrics();
            }
            state.metricsLoading = false;

            if (state.metrics.length === 0) return;

            initMetricChartData();
            await listMetricCharts();
        }, 300);

        /* event */
        const loadMoreMetricCharts = async () => {
            const start = state.metricChartDataList.length;
            initMetricChartData(start);
            await listMetricCharts(start);
        };

        watch(() => state.statisticsTypes, (types) => {
            if (types) state.selectedStat = types[0] || STATISTICS_TYPE.AVERAGE;
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
            TIME_RANGE,
            legendFormatter(resource): string {
                return resource.name ? `${resource.name} (${resource.id})` : `(${resource.id})`;
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

.monitoring {
    padding-bottom: 4rem;
}

.title {
    font-size: 0.875rem;
    font-weight: bold;
    text-transform: capitalize;
}

.data-source-section {
    @apply bg-white;
    .data-source-wrapper {
        padding-right: 1rem;
        padding-top: 2rem;
    }
}

.resource-section {
    @apply bg-white;
    padding-top: 2rem;
    padding-bottom: 2rem;

    /* custom design-system component - p-link */
    :deep(.legend.p-link) {
        @apply text-gray-900;
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        font-size: 0.875rem;
        line-height: 1.5;
        vertical-align: text-bottom;
        margin-top: 0.625rem;
        margin-right: 1rem;
        .circle {
            @apply rounded-full;
            display: inline-block;
            height: 0.625rem;
            width: 0.625rem;
            margin-right: 0.25rem;
        }
    }
}

.toolbox-section {
    @apply bg-white border-t border-b border-gray-200;
    display: flex;
    justify-content: space-between;
    padding-top: 1rem;
    padding-bottom: 1rem;

    .time-range-wrapper {
        .button {
            @apply text-gray-900;
            display: inline-block;
            font-size: 0.875rem;
            line-height: 1.5;
            cursor: pointer;
            margin-right: 1.5rem;

            &:last-child {
                margin-right: 0;
            }

            &.selected {
                @apply text-secondary;
                font-weight: bold;
            }
        }
    }
}

.chart-section {
    padding-top: 1rem;
    padding-bottom: 1rem;

    .metric-chart-wrapper {
        display: grid;
        grid-auto-rows: auto;
        row-gap: 3rem;
        column-gap: 1rem;

        .p-metric-chart {
            @apply col-span-3;

            @screen laptop {
                @apply col-span-4;
            }

            @screen tablet {
                @apply col-span-12;
            }
        }
    }

    /* custom design-system component - p-button */
    :deep(.more-btn) {
        display: block;
        width: 40%;
        max-width: 38rem;
        text-transform: uppercase;
        margin-top: 3rem;
        margin-left: auto;
        margin-right: auto;
    }

    .p-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
