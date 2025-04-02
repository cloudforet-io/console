<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, reactive, ref, watch,

} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { reduce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { byteFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookListParameters } from '@/schema/alert-manager/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';


const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const chartContext = ref<HTMLElement | null>(null);
const serviceId = computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id);

const WEBHOOK_DAILY = 'webhook_daily';

interface StackedData {
  data: (number | string)[];
  type: 'bar';
  stack: typeof WEBHOOK_DAILY;
  label: {
    show: true;
    position: 'inside';
  };
  name: string;
}

interface OverviewWebhookState {
  webhookList: WebhookModel[];
  refinedItems: Record<string, any>;
  chart: EChartsType | null;
  chartOptions: ComputedRef<BarSeriesOption>;
  chartData: StackedData[];
}

const state = reactive<OverviewWebhookState>({
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
                formatter: (val) => val,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => byteFormatter(val),
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
    Object.values(state.refinedItems).forEach((dateData) => {
        if (dateData instanceof Object) {
            Object.keys(dateData)
                .forEach((pluginId) => pluginIds.add(pluginId));
        }
    });

    pluginIds.forEach((pluginId: string) => {
        const data = Object.keys(state.refinedItems).map((date) => state.refinedItems[date][pluginId] || '-');

        state.chartData.push({
            data,
            type: 'bar',
            stack: WEBHOOK_DAILY,
            name: pluginId,
            label: {
                show: true,
                position: 'inside',
                formatter: (params) => byteFormatter(params.value),
            },
        });
    });
};

watch(
    () => state.webhookList,
    () => {
        const today = dayjs.utc();
        const fourteenDaysAgo = today.subtract(13, 'day');

        const allDates: string[] = Array.from({ length: 14 }, (_, i) => fourteenDaysAgo.add(i, 'day').format('YYYY-MM-DD'));

        state.refinedItems = reduce(allDates, (acc, date) => {
            acc[date] = {};
            return acc;
        }, {});

        state.refinedItems = reduce(state.webhookList, (acc, cur) => {
            const key = dayjs.utc(cur.created_at).format('YYYY-MM-DD');
            const curDate = dayjs(key);

            if (
                curDate.isAfter(fourteenDaysAgo.subtract(1, 'day'))
            && (curDate.isBefore(today) || curDate.isSame(today))
            ) {
                if (!acc[key]) {
                    acc[key] = {};
                }

                const pluginId = cur.plugin_info?.plugin_id;
                const totalRequests = cur.requests && Object.keys(cur.requests).length > 0
                    ? Number(cur.requests.total)
                    : 0;

                if (pluginId) {
                    if (!acc[key][pluginId]) {
                        acc[key][pluginId] = 0;
                    }
                    acc[key][pluginId] += totalRequests;
                }
            }

            return acc;
        }, state.refinedItems);

        Object.keys(state.refinedItems).forEach((date) => {
            const plugins: Set<string> = new Set(
                state.webhookList.map((item) => item.plugin_info?.plugin_id),
            );

            plugins.forEach((pluginId: string) => {
                if (!state.refinedItems[date][pluginId]) {
                    state.refinedItems[date][pluginId] = 0;
                }
            });
        });
    },
    { immediate: true, deep: true },
);

watch(() => state.refinedItems, () => {
    initChart();
});

watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
}, { immediate: true, deep: true });

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
    <div class="service-detail-tabs-overview-webhook-chart-daily">
        <div ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-webhook-chart-daily {
    height: 100%;
    .chart {
        width: 100%;
        height: 16rem;
    }
}
</style>
