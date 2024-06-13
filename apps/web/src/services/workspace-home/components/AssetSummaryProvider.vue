<script setup lang="ts">

import { useElementSize } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { PIconButton } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';
import AssetSummaryProviderItem from '@/services/workspace-home/components/AssetSummaryProviderItem.vue';
import {
    DEFAULT_PADDING,
} from '@/services/workspace-home/types/workspace-home-type';
import type {
    ProviderReferenceDataMap,
    ProviderResourceDataItem,
} from '@/services/workspace-home/types/workspace-home-type';

const PROVIDER_DEFAULT_WIDTH = 184 + 8;

const rowItemsWrapperRef = ref<null | HTMLElement>(null);
const providerEl = ref<null | HTMLElement>(null);

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const { width: rowItemsWrapperWidth } = useElementSize(rowItemsWrapperRef);

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
    providerMap: computed<ProviderReferenceDataMap>(() => allReferenceGetters.provider),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
});
const state = reactive({
    providers: [] as ProviderResourceDataItem[],
    pageStart: 0,
    pageMax: computed(() => {
        const providerCount: number = state.providers.length / Math.floor(rowItemsWrapperWidth.value / (PROVIDER_DEFAULT_WIDTH + DEFAULT_PADDING) - 1);
        return Math.ceil(providerCount);
    }),
});

const handleClickArrowButton = (increment: number) => {
    const element = {
        el: providerEl.value,
        defaultWidth: PROVIDER_DEFAULT_WIDTH,
    };
    if (!element.el) return;

    state.pageStart += increment;

    const marginLeft = increment * state.pageStart * element.defaultWidth;
    element.el.style.marginLeft = increment === 1 ? `-${marginLeft}px` : `${marginLeft}px`;
};

const fetchCloudServiceResources = async () => {
    const labels = ['Server', 'Database', 'Storage'];
    try {
        await Promise.all(labels.map(async (label) => {
            const metricId = `metric-managed-${label.toLowerCase()}-${label !== 'Storage' ? 'count' : 'size'}`;
            const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
            const { status, response } = await fetcher({
                metric_id: metricId,
                query: {
                    granularity: 'DAILY',
                    group_by: ['labels.Provider'],
                    start: dayjs.tz(dayjs.utc(), storeState.timezone).subtract(5, 'days').format('YYYY-MM-DD'),
                    end: dayjs.tz(dayjs.utc(), storeState.timezone).format('YYYY-MM-DD'),
                    fields: {
                        count: {
                            key: 'value',
                            operator: 'sum',
                        },
                    },
                    sort: [{ key: '_total_count', desc: true }],
                    field_group: ['date'],
                },
            });

            if (status === 'succeed') {
                (response?.results || []).forEach((i) => {
                    storeState.providerMap[i.Provider][label.toLowerCase()] = i._total_count;
                });
            }
        }));
        state.providers = Object.keys(storeState.providerMap).map((key) => storeState.providerMap[key]);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.providers = [];
    }
};

watch([() => storeState.currentWorkspaceId, () => storeState.providerMap], async ([currentWorkspaceId]) => {
    if (!currentWorkspaceId) return;
    await fetchCloudServiceResources();
}, { immediate: true });
</script>

<template>
    <div ref="rowItemsWrapperRef"
         class="asset-summary-provider"
    >
        <div ref="providerEl"
             class="row-items-container"
        >
            <asset-summary-provider-item v-for="(item, idx) in state.providers"
                                         :key="`asset-summary-item-${idx}`"
                                         :item="item"
            />
        </div>
        <p-icon-button v-if="state.pageStart !== 0"
                       class="arrow-button left"
                       name="ic_chevron-left"
                       color="inherit transparent"
                       width="1.5rem"
                       height="1.5rem"
                       @click="handleClickArrowButton(-1)"
        />
        <p-icon-button v-if="state.pageStart !== Number(state.pageMax)"
                       class="arrow-button right"
                       name="ic_chevron-right"
                       color="inherit transparent"
                       width="1.5rem"
                       height="1.5rem"
                       @click="handleClickArrowButton(1)"
        />
    </div>
</template>

<style scoped lang="postcss">
.asset-summary-provider {
    @apply relative overflow-hidden;
    .row-items-container {
        @apply flex overflow-hidden;
        gap: 0.5rem;
        padding-left: 1.5rem;
        transition: margin-left 0.3s ease;
    }
    &::after {
        @apply absolute;
        content: '';
        top: 0;
        right: 0;
        width: 2rem;
        height: 100%;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, theme('colors.white') 50%);
    }
    .arrow-button {
        @apply absolute bg-white border border-gray-300 rounded-full;
        top: calc(50% - 1rem);
        width: 2rem;
        height: 2rem;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        z-index: 10;
        &.left {
            margin-right: auto;
            left: 0.5rem;
        }
        &.right {
            margin-left: auto;
            right: 0.75rem;
        }
        &:hover {
            @apply text-gray-900;
        }
    }

    /* custom design-system component - p-empty */
    :deep(.p-empty) {
        .image-wrapper {
            margin-bottom: 0.5rem;
        }
    }
}
</style>
