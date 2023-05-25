<template>
    <div class="collector-contents">
        <provider-list
            :provider-list="state.providerList"
            :selected-provider="state.selectedProvider"
            @change-provider="handleSelectedProvider"
        />
        <p-toolbox
            exportable
            filters-visible
            search-type="query"
            :query-tags="state.searchTags"
            :key-item-sets="props.keyItemSets"
            :value-handler-map="props.valueHandlerMap"
            :total-count="props.totalCount"
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
        >
            <template #left-area>
                <p-button
                    icon-left="ic_plus_bold"
                    @click="handleCreate"
                >
                    {{ $t('INVENTORY.COLLECTOR.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-toolbox>
        <!-- FIXME: apply loading data -->
        <p-data-loader
            class="collector-lists-wrapper"
            :data="cloudCollectorPageState.filteredList"
            :loading="false"
        >
            <div class="collector-lists">
                <p-card
                    v-for="item in cloudCollectorPageState.filteredList"
                    :key="item.collector_id"
                    :header="false"
                    style-type="white"
                >
                    <div class="collector-item">
                        <span class="collector-item-name">{{ item.name }}</span>
                        <div class="collector-info-wrapper">
                            <collector-item-info
                                v-for="info in handlerState.infoItems"
                                :key="info.key"
                                :label="info.label"
                                :type="info.key"
                                :item="item"
                            />
                        </div>
                    </div>
                </p-card>
            </div>
            <template #no-data>
                <collector-list-no-data class="collector-no-data" />
            </template>
        </p-data-loader>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PToolbox, PButton, PCard, PDataLoader,
} from '@spaceone/design-system';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import CollectorItemInfo from '@/services/asset-inventory/collector/modules/CollectorItemInfo.vue';
import CollectorListNoData from '@/services/asset-inventory/collector/modules/CollectorListNoData.vue';
import { COLLECTOR_ITEM_INFO_TYPE } from '@/services/asset-inventory/collector/type';
import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

interface Props {
    totalCount?: number
    pageLimit?: number
    keyItemSets?: KeyItemSet[]
    valueHandlerMap?: ValueHandlerMap
}

const props = withDefaults(defineProps<Props>(), {
    totalCount: 0,
    pageLimit: 15,
    keyItemSets: undefined,
    valueHandlerMap: undefined,
});

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

const handlerState = reactive({
    infoItems: [
        { key: COLLECTOR_ITEM_INFO_TYPE.PLUGIN, label: 'Plugin' },
        { key: COLLECTOR_ITEM_INFO_TYPE.STATUS, label: 'Current Status' },
        { key: COLLECTOR_ITEM_INFO_TYPE.JOBS, label: 'Recent Collector Jobs' },
        { key: COLLECTOR_ITEM_INFO_TYPE.SCHEDULE, label: 'Schedule' },
    ],
});

const state = reactive({
    providerList: computed(() => ([{ key: 'all', name: 'All Providers' }, ...Object.values(storeState.providers)])),
    selectedProvider: computed(() => cloudCollectorPageState.selectedProvider),
});

const emit = defineEmits(['export-excel', 'change-toolbox']);

/* Components */
const handleSelectedProvider = (providerName: string) => {
    cloudCollectorPageStore.setSelectedProvider(providerName);
};
const handleCreate = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
const handleExport = async () => {
    emit('export-excel');
};
const handleChange = async (options) => {
    emit('change-toolbox', options);
};
</script>

<style scoped lang="postcss">
.collector-contents {
    @apply flex flex-col;
    gap: 1.5rem;

    .p-button {
        padding-right: 0.75rem;
        padding-left: 0.75rem;
    }

    /* FIXME: Reducing dependencies on the design system */

    /* custom design-system component - p-toolbox */
    :deep(.p-toolbox) {
        .left-area-wrapper, .search-wrapper, .tool {
            margin-bottom: 0;
        }

        @screen tablet {
            .left-area-wrapper, .search-wrapper, .tool {
                margin-bottom: 1rem;
            }
        }
    }

    .collector-lists-wrapper {
        .collector-lists {
            @apply grid grid-cols-2 gap-4;

            .collector-item {
                @apply flex flex-col;
                gap: 1.25rem;
                padding: 0.5rem 0.625rem;

                .collector-item-name {
                    @apply text-label-xl font-bold;
                }
                .collector-info-wrapper {
                    @apply grid grid-cols-2 gap-6;
                }
            }
        }
    }
}
</style>
