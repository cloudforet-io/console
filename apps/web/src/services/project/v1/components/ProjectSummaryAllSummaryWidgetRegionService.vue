<script lang="ts" setup>
import {
    reactive, watch, computed, ref,
} from 'vue';
import type { Location } from 'vue-router';

import type { PieSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { range, orderBy, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSkeleton, PDataLoader,
} from '@cloudforet/mirinae';
import { byteFormatter } from '@cloudforet/utils';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { arrayToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, coral, yellow, secondary1,
} from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { CloudServiceMainPageUrlQuery } from '@/services/asset-inventory/types/cloud-service-page-type';


interface Data {
    provider: string;
    region_code: string;
    total: number;
}
interface Props {
    projectId: string;
    label?: string;
    count?: number;
    visibleContents: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    count: undefined,
    visibleContents: true,
});
const allReferenceStore = useAllReferenceStore();

const chartContext = ref<HTMLElement|null>(null);
const userWorkspaceStore = useUserWorkspaceStore();
const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});
const state = reactive({
    loading: true,
    skeletons: range(3),
    data: [] as Data[],
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<PieSeriesOption>(() => ({
        tooltip: {
            show: false,
        },
        grid: {
            containLabel: true,
        },
        legend: {
            show: false,
        },
        series: [
            {
                type: 'pie',
                radius: ['20%', '50%'],
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
});

/* Util */
const getLocation = (provider: string, region: string, projectId: string, label: string) => {
    const query: CloudServiceMainPageUrlQuery = {
        provider: primitiveToQueryString(provider),
        region: arrayToQueryString([region]),
        project: arrayToQueryString([projectId]),
    };
    if (label !== 'All') query.service = arrayToQueryString([label]);

    const location: Location = {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        query,
    };
    return location;
};
const drawChart = (rawData) => {
    if (isEmpty(rawData)) return;

    state.chartData = rawData?.map((d) => ({
        name: d.region,
        value: d.count,
        itemStyle: {
            color: d.color,
        },
    })) || [];
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

/* Api */
const getData = async () => {
    try {
        state.loading = true;
        state.data = [];
        const param: any = {
            project_id: props.projectId,
            aggregation: 'inventory.Region',
            labels: [props.label],
        };
        const res = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
            ...param,
            workspace_id: storeState.currentWorkspaceId,
        });
        const colors = [coral[500], yellow[400], secondary1];
        let data = orderBy(res.results, ['total'], ['desc']);
        data = data.map((d, idx) => ({
            provider: storeState.providers[d.provider]?.label,
            region: d.region_code,
            total: d.total,
            count: d.label === 'Storage' ? byteFormatter(d.total) : d.total,
            providerColor: storeState.providers[d.provider]?.color,
            color: colors[idx] || gray[400],
            to: getLocation(d.provider, d.region_code, props.projectId, props.label),
        }));
        state.data = data;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => props.label, async () => {
    await getData();
}, { immediate: false });
watch([() => state.loading, () => chartContext.value], ([loading, chartCtx]) => {
    if (!loading && chartCtx) {
        drawChart(state.data);
    }
});

(async () => {
    await getData();
})();
</script>

<template>
    <div class="project-summary-all-summary-widget-region-service">
        <div v-if="!state.loading && state.data.length === 0"
             class="no-data-wrapper grid"
        >
            <div class="m-auto">
                <img src="@/assets/images/illust_cloud.svg"
                     class="empty-image hidden lg:block"
                >
                <p class="text">
                    {{ $t('COMMON.WIDGETS.ALL_SUMMARY.NO_SERVICE', { service: $t('COMMON.WIDGETS.ALL_SUMMARY.REGION_SERVICE') }) }}
                </p>
            </div>
        </div>
        <div v-else
             class="grid grid-cols-12"
        >
            <div class="col-span-3 chart-wrapper">
                <p-data-loader :loading="state.loading">
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
            <div class="col-span-9 summary-content-wrapper">
                <template v-if="state.loading">
                    <div v-for="v in state.skeletons"
                         :key="v"
                         class="flex items-center p-2 col-span-3"
                    >
                        <p-skeleton class="flex-grow" />
                    </div>
                </template>
                <template v-else>
                    <component :is="props.visibleContents ? 'router-link' : 'div'"
                               v-for="(d, idx) of state.data"
                               :key="idx"
                               :to="d.to"
                               class="summary-row col-span-3 md:col-span-1 lg:col-span-3"
                               :class="{ 'text-only': !visibleContents }"
                    >
                        <span class="circle"
                              :style="{ 'background-color': d.color }"
                        />
                        <div class="text-group">
                            <span :style="{ color: d.providerColor }">{{ d.provider }}</span>
                            <span class="type truncate">{{ d.region }}</span>
                        </div>
                        <span class="count">{{ d.count }}</span>
                    </component>
                </template>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.project-summary-all-summary-widget-region-service {
    .no-data-wrapper {
        height: 13rem;
        .empty-image {
            margin: 0 auto 0.5rem auto;
        }

        .text {
            @apply text-primary2;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.5;
            text-align: center;
            opacity: 0.7;
            margin-bottom: 0.625rem;
        }
    }
    .chart-wrapper {
        .chart {
            width: 100%;
            height: 100%;
            max-width: 6rem;
            max-height: 6rem;
            margin: auto;

            @screen md {
                position: absolute;
                top: -1rem;
            }
        }
    }
    .summary-content-wrapper {
        overflow-y: auto;
        height: 13rem;
    }
    .summary-row {
        position: relative;
        display: block;
        font-size: 0.875rem;
        line-height: 1.2;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        margin: auto 0;

        &.text-only {
            cursor: default;
        }

        &:not(.text-only) {
            &:hover {
                @apply bg-secondary2;
                .provider {
                    text-decoration: underline;
                }
                .type {
                    text-decoration: underline;
                }
                .count {
                    text-decoration: underline;
                }
            }
        }

        .circle {
            @apply rounded-full;
            display: inline-block;
            width: 0.5rem;
            height: 0.5rem;
            margin-bottom: 0.25rem;
            margin-right: 0.25rem;
        }

        .text-group {
            display: inline-block;
            width: 75%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .type {
                padding-left: 0.5rem;
            }
        }

        .count {
            @apply text-gray-600;
            position: absolute;
            right: 0.5rem;
        }
    }

    .p-data-loader {
        height: 100%;
    }

    @screen mobile {
        .summary-content-wrapper {
            height: auto;
        }
    }
}
</style>
