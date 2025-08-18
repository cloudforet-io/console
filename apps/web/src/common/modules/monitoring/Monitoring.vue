<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import {
    debounce, capitalize, range, sortBy,
} from 'lodash';

import {
    PSelectDropdown, PIconButton, PButton, PLink, PSpinner,
} from '@cloudforet/mirinae';


import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useMonitoringMetricGetDataFetcher } from '@/common/modules/monitoring/composables/use-monitoring-metric-get-data-fetcher';
import { useMonitoringMetricListQuery } from '@/common/modules/monitoring/composables/use-monitoring-metric-list-query';
import {
    COLORS, STATISTICS_TYPE, TIME_RANGE,
} from '@/common/modules/monitoring/config';
import MetricChart from '@/common/modules/monitoring/MetricChart.vue';
import type {
    AvailableResource,
    Metric, MetricChartData, StatItem,
} from '@/common/modules/monitoring/type';

const LOAD_LIMIT = 12;

interface Props {
    resources: AvailableResource[];
}

const props = withDefaults(defineProps<Props>(), {
    resources: () => [],
});

const router = useRouter();
const userStore = useUserStore();
const { getReferenceLocation } = useReferenceRouter();


const state = reactive({
    showLoader: computed(() => isLoadingMetrics.value),
    timezone: computed(() => userStore.state.timezone),
    selectedTimeRange: '1h',
    selectedToolId: '',
    statisticsTypes: computed(() => [STATISTICS_TYPE.AVERAGE]),
    statItems: computed<StatItem[]>(() => state.statisticsTypes.map((d) => ({
        type: 'item', label: capitalize(d), name: d,
    }))),
    selectedStat: STATISTICS_TYPE.AVERAGE,
    metrics: [] as Metric[],
    metricChartDataList: [] as MetricChartData[],
    availableResources: [] as AvailableResource[],
    noData: false,
});

const metrics = computed(() => sortBy(metricList.value?.metrics, (m) => m.name));

/* api */
const setAvailableResources = () => {
    let resources = props.resources.slice(0, 16);
    resources = resources.map((resource, idx) => ({
        ...resource,
        color: COLORS[idx],
        link: router.resolve(getReferenceLocation(resource.id, { resource_type: 'inventory.Server' })).href,
    }));
    state.availableResources = sortBy(resources, (m) => m.name);
};


const { data: metricList, isFetching: isLoadingMetrics } = useMonitoringMetricListQuery({
    params: computed(() => ({
        data_source_id: state.selectedToolId,
        resources: props.resources.map((d) => d.id),
    })),
    enabled: computed(() => !!state.selectedToolId && !!props.resources),
});




// list metric chart data
const { getMetricData } = useMonitoringMetricGetDataFetcher();
const getMetricChartData = async (data: MetricChartData) => {
    try {
        data.loading = true;
        const res = await getMetricData({
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

const listAll = debounce(async (): Promise<void> => {
    state.metricChartDataList = [];
    setAvailableResources();
    if (metrics.value.length === 0) return;

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

watch([() => state.selectedTimeRange, () => state.selectedStat], ([timeRange, stat]) => {
    if (timeRange && stat) listMetricCharts();
}, { immediate: false });

watch([() => state.selectedToolId, () => props.resources], async () => {
    if (props.resources) {
        await listAll();
    }
}, { immediate: false });

</script>

<template>
    <div class="monitoring">
        <section class="resource-section">
            <span class="title">
                {{ $t('COMMON.MONITORING.RESOURCE') }}
            </span>
            <span class="ml-4 text-gray-default text-sm">
                * {{ $t('COMMON.MONITORING.LIMIT_OF_RESOURCE', {
                    limitCount: 16,
                }) }}
            </span>
            <div>
                <p-link v-for="resource in state.availableResources"
                        :key="resource.id"
                        action-icon="external-link"
                        class="legend"
                        :href="resource.link"
                >
                    <template #left-extra>
                        <span class="circle"
                              :style="{ backgroundColor: resource.color }"
                        />
                    </template>
                    {{ resource.name || resource.id }}
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
                          :class="{selected: timeRange === state.selectedTimeRange}"
                          @click="state.selectedTimeRange = timeRange"
                    >
                        {{ timeRange }}
                    </span>
                </div>
            </div>
            <div class="inline-flex items-center">
                <span class="title mr-4 flex-shrink-0">{{ $t('COMMON.MONITORING.STATISTICS') }}</span>
                <p-select-dropdown :selected.sync="state.selectedStat"
                                   :menu="state.statItems"
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
                  class="text-sm text-gray-default mb-12"
            >
                <template #timezone>
                    <strong>{{ $t('COMMON.MONITORING.LOCAL_TIME') }}</strong>
                </template>
            </i18n>
            <p-spinner v-if="state.showLoader"
                       size="xl"
            />
            <div v-else-if="state.metrics.length === 0"
                 class="text-center text-gray"
            >
                {{ $t('COMMON.MONITORING.NO_METRICS') }}
            </div>
            <template v-else>
                <div class="metric-chart-wrapper grid grid-cols-12">
                    <metric-chart v-for="(item, idx) in state.metricChartDataList"
                                  :key="`${item.metric.key}-${idx}`"
                                  :loading="item.loading"
                                  :labels="item.labels"
                                  :dataset="item.dataset"
                                  :unit="item.metric.unit"
                                  :timezone="state.timezone"
                                  :resources="state.availableResources"
                                  :title="item.metric.name"
                                  :error="item.error"
                    />
                </div>
                <p-button v-if="state.metricChartDataList.length !== state.metrics.length"
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
    :deep(.p-link) {
        @apply text-label-md text-gray-900;
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
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
    }
    .p-metric-chart {
        @apply col-span-3;
        @apply laptop:col-span-4;
        @apply tablet:col-span-12;
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
