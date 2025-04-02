<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    ref, watch, computed, reactive,
} from 'vue';


import type { PieSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { reduce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PProgressBar } from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import type { AlertModel } from '@/schema/alert-manager/alert/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface ChartState {
  alertList: AlertModel[];
  labelInfoList: {label: string; count: number;}[];
  totalCount: ComputedRef<number>;
  chartData: PieSeriesOption[];
  chartDataReady: boolean;
  chart: EChartsType | null;
  chartOptions: ComputedRef<PieSeriesOption>;
  loading: boolean;
}

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const chartContext = ref<HTMLElement | null>(null);

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id),
});

const state = reactive<ChartState>({
    alertList: [],
    labelInfoList: [],
    totalCount: computed<number>(() => {
        if (state.labelInfoList.length > 0) {
            return reduce(state.labelInfoList, (acc, cur) => acc + cur.count, 0);
        }
        return 0;
    }),
    chartData: [],
    chartDataReady: true,
    chart: null,
    chartOptions: computed<PieSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            containLabel: true,
        },
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                const _name = params.name;
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        legend: {
            show: false,
        },
        series: [
            {
                type: 'pie',
                radius: ['30%', '70%'],
                center: ['30%', '50%'],
                data: state.chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
            },
        ],
    })),
    loading: false,
});

const initChart = () => {
    state.chartData = state.labelInfoList.map((labelInfo, idx) => ({
        name: labelInfo.label,
        value: labelInfo.count,
        itemStyle: {
            color: MASSIVE_CHART_COLORS[idx],
        },
    }));

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

watch(() => chartContext, () => {
    if (chartContext.value) {
        state.loading = true;
    }
}, { immediate: true });

const fetchAlertList = async (params: AlertListParameters) => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>(params);
        state.alertList = results;
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

const getLabelInfoList = () => {
    const labelList = [] as string[];
    state.alertList.filter((alert) => alert.labels !== undefined).forEach((_alert) => {
        labelList.push(..._alert.labels);
    });
    state.labelInfoList = Object.entries(reduce(labelList, (acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
    }, {})).map(([label, count]) => ({ label, count }));
};

watch(() => storeState.serviceId, async (serviceId) => {
    await fetchAlertList({
        query: {
            filter: [{ k: 'service_id', v: serviceId, o: 'eq' }],
        },
    });
}, { immediate: true });

watch(() => state.alertList, (alertList) => {
    if (alertList && alertList.length > 0) {
        getLabelInfoList();
    }
}, { immediate: true, deep: true });

watch(() => state.labelInfoList, (labelInfoList) => {
    if (labelInfoList && labelInfoList.length > 0) {
        state.chartDataReady = true;
        initChart();
    } else if (labelInfoList.length === 0) {
        state.chartDataReady = false;
    }
}, { immediate: true });
</script>

<template>
    <div class="alert-chart">
        <div
            ref="chartContext"
            class="chart"
        />
        <div class="label-info">
            <div v-for="(labelInfo, idx) in state.labelInfoList"
                 :key="`label-${idx}`"
                 class="mb-5"
            >
                <p-progress-bar class="progress-bar"
                                :percentage="(labelInfo.count / state.totalCount) * 100"
                                :color="MASSIVE_CHART_COLORS[idx]"
                >
                    <template #label>
                        <div class="progress-bar-info">
                            <p class="progress-bar-label mb-1.5">
                                {{ labelInfo.label }}
                            </p>
                            <p class="progress-bar-per">
                                <span class="font-medium">{{ (labelInfo.count / state.totalCount) * 100 }}% </span>
                                <span class="text-gray-700">({{ labelInfo.count }})</span>
                            </p>
                        </div>
                    </template>
                </p-progress-bar>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.alert-chart {
    @apply flex;
    .chart {
        width: 50%;
        height: 16.5rem;
    }

    .progress-bar {
        min-width: 16.5rem;
    }
    .progress-bar-info {
        @apply font-normal flex justify-between;
    }
}
</style>
