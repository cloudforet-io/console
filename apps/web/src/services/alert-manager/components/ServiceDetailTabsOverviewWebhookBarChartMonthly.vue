<script lang="ts" setup>

import type { ComputedRef } from 'vue';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { byteFormatter } from '@cloudforet/utils';

import type { WebhookListParameters } from '@/schema/alert-manager/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';

import type { ListResponse } from '@/schema/_common/api-verbs/list';


const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const serviceId = computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id);

const chartContext = ref<HTMLElement | null>(null);

const WEBHOOK_MONTHLY = 'webhook_monthly';

interface StackedData {
  data: (number | string)[];
  type: 'bar';
  stack: string;
  label: {
    show: true;
    position: 'inside';
  }
  name: string;
}

interface OverviewMonthlyWebhookState {
  webhookList: WebhookModel[];
  refinedItems: Record<string, any>;
  chart: EChartsType | null;
  chartOptions: ComputedRef<BarSeriesOption>;
  chartData: StackedData[]
}

const state = reactive<OverviewMonthlyWebhookState>({
    webhookList: [],
    refinedItems: {},
    chart: null,
    chartOptions: computed<BarSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        legend: {
            type: 'scroll',
            show: true,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 5,
            itemHeight: 10,
        },
        grid: {
            left: 0,
            right: '3%',
            top: '5%',
            bottom: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: Object.keys(state.refinedItems),
            axisLabel: {
                formatter: (value) => dayjs.utc(value).format('MMM YY'),
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (value) => byteFormatter(value),
            },
        },
        animation: false,
        barWidth: '54px',
        series: state.chartData,
    })),
    chartData: [],
});

const initChart = () => {
    const pluginIds: Set<string> = new Set();

    if (Object.values(state.refinedItems).length > 0) {
        Object.values(state.refinedItems).forEach((dateData) => {
            if (dateData instanceof Object) {
                Object.keys(dateData).forEach((pluginId) => pluginIds.add(pluginId));
            }
        });

        pluginIds.forEach((pluginId: string) => {
            const data = Object.keys(state.refinedItems).map((date) => state.refinedItems[date][pluginId] || '-');

            state.chartData.push({
                data,
                type: 'bar',
                stack: WEBHOOK_MONTHLY,
                name: pluginId,
                label: {
                    show: true,
                    position: 'inside',
                    formatter: (params) => byteFormatter(params.value),
                },
            });
        });
    }
};

watch(() => state.refinedItems, () => {
    initChart();
}, { immediate: true, deep: true });

watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartCtx);
        state.chart.setOption(state.chartOptions, true);
    }
}, { immediate: true, deep: true });

watch(
    () => state.webhookList,
    () => {
        const today = dayjs.utc();
        const twelveMonthsAgo = today.subtract(11, 'month').startOf('month');

        const monthlyData = state.webhookList.reduce((acc, cur) => {
            const createdAt = dayjs.utc(cur.created_at);
            const monthKey = createdAt.format('YYYY-MM');

            if (createdAt.isAfter(twelveMonthsAgo) && createdAt.isBefore(today) || createdAt.isSame(today, 'month')) {
                if (!acc[monthKey]) {
                    acc[monthKey] = {};
                }

                const pluginId = cur.plugin_info?.plugin_id;
                const totalRequests = cur.requests && Object.keys(cur.requests).length > 0
                    ? Number(cur.requests.total)
                    : 0;

                if (pluginId) {
                    if (!acc[monthKey][pluginId]) {
                        acc[monthKey][pluginId] = 0;
                    }
                    acc[monthKey][pluginId] += totalRequests;
                }
            }

            return acc;
        }, {});

        const allMonths = Array.from({ length: 12 }, (_, i) => twelveMonthsAgo.add(i, 'month').format('YYYY-MM'));

        const initializedMonthlyData = allMonths.reduce((acc, month) => {
            if (!monthlyData[month]) {
                acc[month] = {};
            } else {
                acc[month] = monthlyData[month];
            }
            return acc;
        }, {});

        state.refinedItems = initializedMonthlyData;
    },
    { immediate: true, deep: true },
);

/* API */
const fetchWebhookList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            query: {
                sort: [{ key: 'created_at', desc: false }],
                filter: [{ k: 'service_id', v: serviceId.value, o: 'eq' }],
            },
        });

        state.webhookList = results || [];
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watch(() => serviceId, async () => {
    await fetchWebhookList();
}, { immediate: true, deep: true });
</script>

<template>
    <div class="service-detail-tabs-overview-webhook-bar-chart-monthly">
        <div ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-webhook-bar-chart-monthly {
    height: 100%;
    .chart {
        width: 100%;
        height: 16rem;
    }
}
</style>
