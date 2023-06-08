<template>
    <div class="collector-page">
        <p-heading
            use-total-count
            use-selected-count
            :title="$t('INVENTORY.COLLECTOR.MAIN.TITLE')"
            :total-count="collectorPageState.totalCount"
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
            :data="state.hasCollectorList"
            :loading="state.initLoading"
            loader-backdrop-color="gray.100"
            class="collector-loader-wrapper"
        >
            <div class="collector-contents-wrapper">
                <provider-list
                    :provider-list="state.providerList"
                    :selected-provider="collectorPageState.selectedProvider"
                    is-scrollable
                    @change-provider="handleSelectedProvider"
                />
                <collector-contents
                    :key-item-sets="handlerState.keyItemSets"
                    @change-toolbox="handleChangeToolbox"
                    @export-excel="handleExportExcel"
                />
            </div>
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, reactive } from 'vue';

import { PButton, PHeading, PDataLoader } from '@spaceone/design-system';

import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorContents from '@/services/asset-inventory/collector/collector-main/modules/CollectorContents.vue';
import CollectorNoData from '@/services/asset-inventory/collector/collector-main/modules/CollectorNoData.vue';
import { COLLECTOR_QUERY_HELPER_SET } from '@/services/asset-inventory/collector/type';
import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'collector_id', label: 'Collector Id' },
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
            { name: 'plugin_info.version', label: 'Version' },
            { name: 'provider', label: 'Provider', valueSet: storeState.providers },
            { name: 'supported_resource_type', label: 'Resource Type' },
            { name: 'created_at', label: 'Created' },
            { name: 'last_collected_at', label: 'Last Collected' },
        ],
    }]),
});

const state = reactive({
    initLoading: true,
    hasCollectorList: false,
    providerList: computed(() => ([{ key: 'all', name: 'All Providers' }, ...Object.values(storeState.providers)])),
});

/* Query Helper */
const collectorApiQueryHelper = new ApiQueryHelper()
    .setOnly(
        COLLECTOR_QUERY_HELPER_SET.COLLECTOR_ID,
        COLLECTOR_QUERY_HELPER_SET.NAME,
        COLLECTOR_QUERY_HELPER_SET.LAST_COLLECTED_AT,
        COLLECTOR_QUERY_HELPER_SET.PROVIDER,
        COLLECTOR_QUERY_HELPER_SET.TAGS,
        COLLECTOR_QUERY_HELPER_SET.PLUGIN_INFO,
        COLLECTOR_QUERY_HELPER_SET.STATE,
    )
    .setPage(collectorPageState.pageStart, collectorPageState.pageLimit)
    .setSort(collectorPageState.sortBy, true);

/* Components */
const handleSelectedProvider = (providerName: string) => {
    collectorPageStore.setSelectedProvider(providerName);
    refreshCollectorList();
};
const handleChangeToolbox = (options) => {
    setApiQueryWithToolboxOptions(collectorApiQueryHelper, options);
    refreshCollectorList();
};
const handleExportExcel = async (excelFields) => {
    await store.dispatch('file/downloadExcel', {
        url: '/inventory/collector/list',
        param: { query: collectorApiQueryHelper.data },
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.collector,
    });
};

/* API */
const initCollectorList = async () => {
    state.initLoading = true;
    try {
        await collectorPageStore.getCollectorList();
        if (collectorPageState.totalCount > 0) {
            state.hasCollectorList = true;
        }
    } catch (e) {
        await collectorPageStore.$reset();
    } finally {
        state.initLoading = false;
    }
};
const refreshCollectorList = async () => {
    collectorApiQueryHelper.setFilters(collectorPageStore.allFilters);
    try {
        await collectorPageStore.getCollectorList(collectorApiQueryHelper.data);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Unmounted */
onUnmounted(() => {
    // TODO: Need to discuss for provider state at create collector page.
    collectorPageStore.$reset();
    collectorPageStore.$dispose();
});

/* INIT */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await initCollectorList();
})();
</script>

<style lang="postcss" scoped>
/* FIXME: Reducing dependencies on the design system */

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

.collector-loader-wrapper {
    min-height: 16.875rem;

    .collector-contents-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
    }
}
</style>
