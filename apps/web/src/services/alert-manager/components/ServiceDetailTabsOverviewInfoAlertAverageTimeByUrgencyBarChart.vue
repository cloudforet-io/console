<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    ref, computed, reactive, watch,
} from 'vue';

import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { reduce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PEmpty } from '@cloudforet/mirinae';

import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { formatDurationWithTimezone } from '@/services/alert-manager/composables/alert-table-data';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';



interface AverageTimeByUrgency {
  alert: string;
  avg_ack_duration: number;
  avg_resolved_duration: number;
  urgency: 'HIGH' | 'LOW'
}

interface AverageTimeByUrgencyState {
  avgDurationGroupByUrgencyList: AverageTimeByUrgency[];
  refinedData: {
    HIGH: AverageTimeByUrgency[];
    LOW: AverageTimeByUrgency[];
  } | Record<string, any>;
  chartData: BarSeriesOption[];
  chart: EChartsType | null;
  acknowledgedHighData: string;
  acknowledgedLowData: string;
  resolvedHighData: string;
  resolvedLowData: string;
  chartOptions: ComputedRef<BarSeriesOption>;
  loading: boolean;
}

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const userStore = useUserStore();
const userState = userStore.state;

const chartContext = ref<HTMLElement | null>(null);

const serviceId = computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id);
const timeZone = computed<string>(() => userState.timezone || '');

const state = reactive<AverageTimeByUrgencyState>({
    avgDurationGroupByUrgencyList: [],
    refinedData: {},
    chartData: [],
    chart: null,
    acknowledgedHighData: '',
    acknowledgedLowData: '',
    resolvedHighData: '',
    resolvedLowData: '',
    chartOptions: computed<BarSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        animation: false,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            formatter: (params) => `
                    <div>${params[0].name}</div>
                    <div>${params[0].marker} ${params[0].seriesName}: ${formatDurationWithTimezone(params[0].value, timeZone.value)}</div>
                    <div>${params[1].marker} ${params[1].seriesName}: ${formatDurationWithTimezone(params[1].value, timeZone.value)}</div>
                    <div>${params[2].marker} ${params[2].seriesName}: ${formatDurationWithTimezone(params[2].value, timeZone.value)}</div>
                    <div>${params[3].marker} ${params[3].seriesName}: ${formatDurationWithTimezone(params[3].value, timeZone.value)}</div>
                `,
        },
        barMaxWidth: 120,
        barGap: 0.2,
        legend: {
            show: true,
            icon: 'circle',
            itemWidth: 5,
            itemHeight: 10,
            left: '3%',
            bottom: '-1%',
            width: '374px',
        },
        label: {
            show: true,
            formatter: (param: any) => (param.value === null ? '' : formatDurationWithTimezone(param.value, timeZone.value)),
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            show: false,
            type: 'value',
            boundaryGap: [0, 0.01],
        },
        yAxis: {
            axisTick: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#DDDDDF',
                    width: 1,
                },
            },
            type: 'category',
            data: [''],
        },
        series: [
            {
                name: 'Acknowledged, High Urgency',
                type: 'bar',
                data: [state.acknowledgedHighData],
            },
            {
                name: 'Acknowledged, Low Urgency',
                type: 'bar',
                data: [state.acknowledgedLowData],
            },
            {
                name: 'Resolved, High Urgency',
                type: 'bar',
                data: [state.resolvedHighData],
            },
            {
                name: 'Resolved, Low Urgency',
                type: 'bar',
                data: [state.resolvedLowData],
            },
        ],
    })),
    loading: false,
});

/* API */
const fetchAnalyzerAvgDurationGroupByUrgency = async (service_id: string) => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.alert.analyze({
            query: {
                filter: [
                    {
                        k: 'service_id',
                        v: service_id,
                        o: 'eq',
                    },
                ],
                fields: {
                    avg_ack_duration: {
                        key: 'acknowledged_duration',
                        operator: 'average',
                    },
                    avg_resolved_duration: {
                        key: 'resolved_duration',
                        operator: 'average',
                    },
                },
                group_by: [
                    {
                        name: 'urgency',
                        key: 'urgency',
                    },
                ],
            },
        });
        state.avgDurationGroupByUrgencyList = results;
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watch(() => state.refinedData, () => {
    if (Object.keys(state.refinedData).includes('HIGH')) {
        state.acknowledgedHighData = state.refinedData?.HIGH[0].avg_ack_duration || 0;
        state.resolvedHighData = state.refinedData?.HIGH[0].avg_resolved_duration || 0;
    }
    if (Object.keys(state.refinedData).includes('LOW')) {
        state.acknowledgedLowData = state.refinedData?.LOW[0].avg_ack_duration || 0;
        state.resolvedLowData = state.refinedData?.LOW[0].avg_resolved_duration || 0;
    }
}, { deep: true, immediate: true });

watch([() => chartContext.value, () => state.acknowledgedHighData, () => state.acknowledgedLowData,
    () => state.acknowledgedHighData, () => state.resolvedLowData, () => state.resolvedHighData], () => {
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
}, { immediate: true, deep: true });

watch(serviceId, async () => {
    if (serviceId.value) {
        await fetchAnalyzerAvgDurationGroupByUrgency(serviceId.value);
    }
}, { immediate: true, deep: true });

watch(() => state.avgDurationGroupByUrgencyList, () => {
    if (state.avgDurationGroupByUrgencyList.length > 0) {
        state.refinedData = reduce(state.avgDurationGroupByUrgencyList, (acc, cur) => {
            const urgency = cur.urgency;
            if (!acc[urgency]) {
                acc[urgency] = [];
            }
            acc[urgency].push(cur);
            return acc;
        }, {});
    }
}, { immediate: true, deep: true });
</script>

<template>
    <div class="service-detail-tabs-overview-info-alert-average-time-by-urgency-bar-chart">
        <div v-if="state.avgDurationGroupByUrgencyList.length > 0"
             ref="chartContext"
             class="chart"
        />
        <p-empty v-else
                 class="mt-52"
        >
            <template #default>
                <span>{{ $t('ALERT_MANAGER.SERVICE.AVERAGE_ACKNOWLEDGED_RESOLVED_TIME_BY_URGENCY_NO_DATA') }}</span>
            </template>
        </p-empty>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-info-alert-average-time-by-urgency-bar-chart {
    height: 100%;
    .chart {
        width: 100%;
        height: 420px;
    }
}
</style>
