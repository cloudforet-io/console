<template>
    <div class="collector-page">
        <p-heading
            :title="$t('PLUGIN.COLLECTOR.MAIN.TITLE')"
            use-total-count
            use-selected-count
            :total-count="state.totalCount"
        >
            <template #extra>
                <router-link
                    :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }"
                >
                    <p-button style-type="tertiary"
                              class="history-button"
                    >
                        {{ $t("MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE") }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>
        <p-data-loader :data="cloudCollectorPageState.collectorList"
                       :loading="state.loading && !cloudCollectorPageState.collectorList"
        >
            <collector-contents />
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PHeading, PButton, PDataLoader } from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorContents from '@/services/asset-inventory/collector/modules/CollectorContents.vue';
import CollectorNoData from '@/services/asset-inventory/collector/modules/CollectorNoData.vue';
import { CollectorQueryHelperSet } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

const queryHelper = new QueryHelper();

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const state = reactive({
    loading: true,
    totalCount: 0,
    pageStart: 1,
    pageLimit: 15,
    sortBy: '',
    plugins: computed<PluginReferenceMap>(
        () => store.getters['reference/pluginItems'],
    ),
});

/* Query Helper */
const collectorApiQueryHelper = new ApiQueryHelper()
    .setOnly(
        CollectorQueryHelperSet.COLLECTOR_ID,
        CollectorQueryHelperSet.NAME,
        CollectorQueryHelperSet.LAST_COLLECTED_AT,
        CollectorQueryHelperSet.PROVIDER,
        CollectorQueryHelperSet.TAGS,
        CollectorQueryHelperSet.PLUGIN_INFO,
        CollectorQueryHelperSet.STATE,
    )
    .setPage(state.pageStart, state.pageLimit)
    .setSort(state.sortBy, true);

/* API */
const listCollectors = async () => {
    state.loading = true;
    const detailLinkQueryHelper = new QueryHelper();
    try {
        collectorApiQueryHelper.setFilters(queryHelper.filters);
        const res = await SpaceConnector.client.inventory.collector.list({
            query: collectorApiQueryHelper.data,
        });
        const items = res.results.map((d) => ({
            plugin_name: state.plugins[d.plugin_info.plugin_id]?.label,
            plugin_icon: state.plugins[d.plugin_info.plugin_id]?.icon,
            detailLink: {
                name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                param: { id: d.collector_id },
                query: {
                    filters: detailLinkQueryHelper.setFilters([
                        {
                            k: CollectorQueryHelperSet.COLLECTOR_ID,
                            v: d.collector_id,
                            o: '=',
                        },
                    ]).rawQueryStrings,
                },
            },
            ...d,
        }));
        state.totalCount = res.total_count || 0;
        await cloudCollectorPageStore.setCollectorList(items);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.totalCount = 0;
        await cloudCollectorPageStore.setCollectorList([]);
    } finally {
        state.loading = false;
    }
};

/* INIT */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await listCollectors();
})();
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-heading */
:deep(.p-heading) {
    @apply items-center;

    .heading-wrapper {
        flex: 1;

        .total-count {
            @apply font-normal;
        }
    }

    .extra {
        flex-grow: initial;

        .history-button {
            @apply bg-white rounded border border-gray-300 text-label-md font-bold;
            width: 100%;
            padding: 0.375rem 0.75rem;
        }
    }
}

/* custom design-system component - p-data-loader */
:deep(.p-data-loader) {
    min-height: 16.875rem;

    .no-data-wrapper {
        @apply bg-white rounded-md border border-gray-200;
        height: auto;
        max-height: initial;
    }

    .loader-wrapper {
        .loader-backdrop {
            @apply hidden;
        }
    }
}
</style>
