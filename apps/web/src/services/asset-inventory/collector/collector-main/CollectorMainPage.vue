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
            <div v-if="state.hasCollectorList"
                 class="collector-contents-wrapper"
            >
                <provider-list
                    :provider-list="state.providerList"
                    :selected-provider="collectorPageState.selectedProvider"
                    @change-provider="handleSelectedProvider"
                />
                <collector-contents />
            </div>
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import { watchDebounced } from '@vueuse/core';
import {
    computed, reactive, onMounted,
} from 'vue';


import { PButton, PHeading, PDataLoader } from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { primitiveToQueryString, queryStringToString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorContents from '@/services/asset-inventory/collector/collector-main/modules/CollectorContents.vue';
import CollectorNoData from '@/services/asset-inventory/collector/collector-main/modules/CollectorNoData.vue';
import type {
    CollectorMainPageQuery,
    CollectorMainPageQueryValue,
} from '@/services/asset-inventory/collector/collector-main/type';
import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    initLoading: true,
    hasCollectorList: false,
    providerList: computed(() => ([{ key: 'all', name: 'All Providers' }, ...Object.values(storeState.providers)])),
});

/* Url Query String */
const urlFilterConverter = new QueryHelper();

const setValuesFromUrlQueryString = () => {
    const currentRoute = SpaceRouter.router.currentRoute;
    const query: CollectorMainPageQuery = currentRoute.query;
    // set provider
    collectorPageStore.$patch({
        selectedProvider: queryStringToString(query.provider) ?? 'all',
    });
    // set search filters
    if (query.filters) {
        const filters: ConsoleFilter[] = urlFilterConverter.setFiltersAsRawQueryString(query.filters).filters;
        collectorPageStore.$patch({
            searchFilters: filters,
        });
    }
};

const collectorMainPageQueryValue = computed<Required<CollectorMainPageQueryValue>>(() => ({
    provider: collectorPageState.selectedProvider,
    filters: collectorPageState.searchFilters,
}));

watchDebounced(collectorMainPageQueryValue, async (queryValue) => {
    const newQuery: CollectorMainPageQuery = {
        provider: primitiveToQueryString(queryValue.provider),
        filters: urlFilterConverter.setFilters(queryValue.filters ?? []).rawQueryStrings,
    };
    SpaceRouter.router.replace({ query: newQuery }).catch((e) => {
        if (e.name !== 'NavigationDuplicated') console.error(e);
    });
}, { debounce: 300 });


/* Event Listeners */
const handleSelectedProvider = (providerName: string) => {
    collectorPageStore.$patch({
        selectedProvider: providerName,
    });
};


/* API */
const collectorCountApiQueryHelper = new ApiQueryHelper().setCountOnly();
const fetchCollectorCount = async (): Promise<number> => {
    try {
        const { total_count } = await SpaceConnector.client.inventory.collector.list({
            query: collectorCountApiQueryHelper.data,
        });
        return total_count;
    } catch (e) {
        ErrorHandler.handleError(e);
        return 0;
    }
};

/* INIT */
onMounted(async () => {
    state.initLoading = true;
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await collectorPageStore.$reset();
    setValuesFromUrlQueryString();
    const count = await fetchCollectorCount();
    state.hasCollectorList = count > 0;
    state.initLoading = false;
});
</script>

<style lang="postcss" scoped>
.history-button {
    @apply bg-white rounded border border-gray-300 text-label-md font-bold;
    width: 100%;
    padding: 0.375rem 0.75rem;
}
.collector-loader-wrapper {
    min-height: 16.875rem;
    .collector-contents-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
    }
}
</style>
