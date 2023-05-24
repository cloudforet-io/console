<template>
    <div class="collector-page">
        <p-heading
            :title="$t('INVENTORY.COLLECTOR.MAIN.TITLE')"
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
                        {{ $t("INVENTORY.COLLECTOR.MAIN.HISTORY") }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>
        <p-data-loader
            :data="cloudCollectorPageState.collectorList"
            :loading="state.loading && !cloudCollectorPageState.collectorList"
        >
            <collector-contents
                :query-helper="collectorApiQueryHelper"
                :total-count="state.totalCount"
                :page-limit="state.pageLimit"
            />
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

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

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const state = reactive({
    loading: true,
    totalCount: 0,
    pageStart: 1,
    pageLimit: 15,
    sortBy: '',
    items: {},
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});

/* Components */
const initCollectorList = async () => {
    state.loading = true;
    try {
        await getCollectorList();
        if (Object.keys(state.items).length > 0) {
            await cloudCollectorPageStore.setCollectorList(state.items);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.totalCount = 0;
        await cloudCollectorPageStore.setCollectorList([]);
    } finally {
        state.loading = false;
    }
};
const filterByProvider = async () => {
    await getCollectorList();
    await cloudCollectorPageStore.setFilteredCollectorList(state.items);
};
const setCollectorList = (result) => {
    const detailLinkQueryHelper = new QueryHelper();
    state.items = computed(() => result.results.map((d) => ({
        collectorId: d.collector_id,
        name: d.name,
        pluginName: state.plugins[d.plugin_info.plugin_id]?.label,
        pluginIcon: state.plugins[d.plugin_info.plugin_id]?.icon,
        pluginInfo: d.plugin_info,
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
    })));
    state.totalCount = result.total_count || 0;
};

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
const getCollectorList = async () => {
    collectorApiQueryHelper.setFilters(cloudCollectorPageStore.allFilters);
    const res = await SpaceConnector.client.inventory.collector.list({
        query: collectorApiQueryHelper.data,
    });
    await setCollectorList(res);
};

/* Watcher */
watch(() => cloudCollectorPageState.selectedProvider, async () => {
    await filterByProvider();
});

/* INIT */
(async () => {
    await cloudCollectorPageStore.initState();
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await initCollectorList();
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
