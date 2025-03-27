<script lang="ts" setup>
import { watchDebounced } from '@vueuse/core';
import {
    computed, reactive, onMounted,
} from 'vue';


import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading, PDataLoader, PHeadingLayout,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { SpaceRouter } from '@/router';
import type { CollectorListParameters } from '@/schema/inventory/collector/api-verbs/list';
import type { CollectorModel } from '@/schema/inventory/collector/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { primitiveToQueryString, queryStringToString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorContents from '@/services/asset-inventory/components/CollectorMainContents.vue';
import CollectorNoData from '@/services/asset-inventory/components/CollectorMainNoData.vue';
import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { useCollectorPageStore } from '@/services/asset-inventory/stores/collector-page-store';
import type {
    CollectorMainPageQuery,
    CollectorMainPageQueryValue,
} from '@/services/asset-inventory/types/collector-main-page-type';


const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.state;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
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
    collectorPageState.selectedProvider = queryStringToString(query.provider) ?? 'all';
    // set search filters
    if (query.filters) {
        const filters: ConsoleFilter[] = urlFilterConverter.setFiltersAsRawQueryString(query.filters).filters;
        collectorPageState.searchFilters = filters;
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
    collectorPageState.selectedProvider = providerName;
};


/* API */
const collectorCountApiQueryHelper = new ApiQueryHelper().setCountOnly();
const fetchCollectorCount = async () => {
    try {
        const { total_count } = await SpaceConnector.clientV2.inventory.collector.list<CollectorListParameters, ListResponse<CollectorModel>>({
            query: collectorCountApiQueryHelper.data,
        });
        state.hasCollectorList = (total_count ?? 0) > 0;
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.initLoading = false;
    }
};

/* INIT */
onMounted(async () => {
    collectorPageStore.reset();
    setValuesFromUrlQueryString();
    await fetchCollectorCount();
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
                    :total-count="collectorPageState.totalCount"
                />
            </template>
            <template #extra>
                <router-link
                    :to="{ name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }"
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
            :data="state.hasCollectorList"
            :loading="state.initLoading"
            loader-backdrop-color="gray.100"
            class="collector-loader-wrapper"
        >
            <div v-if="state.hasCollectorList && state.providerList.length > 1"
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
