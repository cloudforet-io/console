<script lang="ts" setup>
import { watchDebounced } from '@vueuse/core';
import {
    computed, onMounted,
} from 'vue';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading, PDataLoader, PHeadingLayout,
} from '@cloudforet/mirinae';

import { SpaceRouter } from '@/router';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { primitiveToQueryString, queryStringToString } from '@/lib/router-query-string';

import CollectorContents from '@/services/asset-inventory/components/CollectorMainContents.vue';
import CollectorNoData from '@/services/asset-inventory/components/CollectorMainNoData.vue';
import CollectorProviderList from '@/services/asset-inventory/components/CollectorProviderList.vue';
import { useCollectorListQuery } from '@/services/asset-inventory/composables/use-collector-list-query';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCollectorPageStore } from '@/services/asset-inventory/stores/collector-page-store';
import type {
    CollectorMainPageQuery,
    CollectorMainPageQueryValue,
} from '@/services/asset-inventory/types/collector-main-page-type';

const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.state;

const isAdminMode = computed(() => appContextGetters.isAdminMode);

/* Url Query String */
const urlFilterConverter = new QueryHelper();
const setValuesFromUrlQueryString = () => {
    const currentRoute = SpaceRouter.router.currentRoute;
    const query: CollectorMainPageQuery = currentRoute.query;
    // set provider
    collectorPageStore.setSelectedProvider(queryStringToString(query.provider) ?? 'all');
    // set search filters
    if (query.filters) {
        const filters: ConsoleFilter[] = urlFilterConverter.setFiltersAsRawQueryString(query.filters).filters;
        collectorPageStore.setSearchFilters(filters);
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
    collectorPageStore.setSelectedProvider(providerName);
};

/* API */
const collectorCountApiQueryHelper = new ApiQueryHelper().setCountOnly();
const { isLoading, totalCount } = useCollectorListQuery({
    params: computed(() => {
        if (isAdminMode.value) {
            collectorCountApiQueryHelper.setFilters([{ k: 'workspace_id', v: '*', o: '=' }]);
        }
        return {
            query: collectorCountApiQueryHelper.data,
        };
    }),
    thisPage: computed(() => 1),
    pageSize: computed(() => 10),
});

/* INIT */
onMounted(() => {
    collectorPageStore.reset();
    setValuesFromUrlQueryString();
});
</script>

<template>
    <div class="collector-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading
                    use-total-count
                    use-selected-count
                    :title="$t('INVENTORY.COLLECTOR.MAIN.TITLE')"
                    :total-count="totalCount"
                />
            </template>
            <template #extra>
                <router-link
                    :to="{ name: isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }"
                >
                    <p-button style-type="tertiary"
                              class="history-button"
                              icon-left="ic_history"
                    >
                        {{ $t("INVENTORY.COLLECTOR.MAIN.HISTORY") }}
                    </p-button>
                </router-link>
            </template>
        </p-heading-layout>
        <p-data-loader
            :data="totalCount > 0"
            :loading="isLoading"
            loader-backdrop-color="gray.100"
            class="collector-loader-wrapper"
        >
            <div v-if="totalCount > 0"
                 class="collector-contents-wrapper"
            >
                <collector-provider-list :selected-provider="collectorPageState.selectedProvider"
                                         @update:selected-provider="handleSelectedProvider"
                />
                <collector-contents />
            </div>
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

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
