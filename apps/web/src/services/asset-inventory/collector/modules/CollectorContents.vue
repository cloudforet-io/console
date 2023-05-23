<template>
    <div class="collector-contents">
        <provider-list
            :provider-list="state.providerList"
            :selected-provider="state.selectedProvider"
            @handle-selected-provider="handleSelectedProvider"
        />
        <p-toolbox
            search-type="query"
            :total-count="props.totalCount"
            :page-size="props.pageLimit"
            :query-tags="state.searchTags"
            exportable
            @change="handleChange"
            @refresh="handleChange"
            @export="handleExport"
        >
            <template #left-area>
                <p-button
                    icon-left="ic_plus_bold"
                    @click="handleCreate"
                >
                    Create
                </p-button>
            </template>
        </p-toolbox>
        <p-data-loader
            class="collector-lists"
            :data="cloudCollectorPageState.filteredList"
            :loading="false"
        >
            <p-card
                v-for="item in cloudCollectorPageState.filteredList"
                :key="item.collectorId"
                :header="item.name"
                style-type="white"
            >
                <div class="collector-info-wrapper">
                    <collector-item-info
                        v-for="info in handlerState.infoItems"
                        :key="info.key"
                        :label="info.label"
                        :type="info.key"
                        :item="item"
                    />
                </div>
            </p-card>
            <template #no-data>
                <collector-list-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PToolbox, PButton, PCard, PDataLoader,
} from '@spaceone/design-system';

import type { QueryTag } from '@cloudforet/core-lib/component-util/query-search/type';
import type { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ReferenceItem } from '@/store/modules/reference/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import CollectorItemInfo from '@/services/asset-inventory/collector/modules/CollectorItemInfo.vue';
import CollectorListNoData from '@/services/asset-inventory/collector/modules/CollectorListNoData.vue';
import { CollectorItemInfoType } from '@/services/asset-inventory/collector/type';
import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

interface Props {
    queryHelper?: ApiQueryHelper
    totalCount?: number
    pageLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
    queryHelper: undefined,
    totalCount: 0,
    pageLimit: 15,
});

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const state = reactive({
    providerList: [] as ReferenceItem[],
    searchTags: [] as QueryTag[],
    selectedProvider: computed(() => cloudCollectorPageState.selectedProvider),
});

const handlerState = reactive({
    infoItems: [
        { key: CollectorItemInfoType.PLUGIN, label: 'Plugin' },
        { key: CollectorItemInfoType.STATUS, label: 'Current Status' },
        { key: CollectorItemInfoType.JOBS, label: 'Recent Collector Jobs' },
        { key: CollectorItemInfoType.SCHEDULE, label: 'Schedule' },
    ],
    excelFields: [
        { key: 'name', name: 'Name' },
        { key: 'state', name: 'State' },
        { key: 'plugin_info.plugin_id', name: 'Plugin' },
        { key: 'plugin_info.version', name: 'Version' },
        { key: 'last_collected_at', name: 'Last Collected', type: 'datetime' },
    ],
});

/* Components */
const handleSelectedProvider = (providerName: string) => {
    cloudCollectorPageStore.setSelectedProvider(providerName);
};
const handleCreate = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
const handleExport = async () => {
    await store.dispatch('file/downloadExcel', {
        url: '/inventory/collector/list',
        param: { query: props.queryHelper.data },
        fields: handlerState.excelFields,
        file_name_prefix: FILE_NAME_PREFIX.collector,
    });
};
const handleChange = async () => {
    // setApiQueryWithToolboxOptions(collectorApiQueryHelper, options);
    // if (options.queryTags !== undefined) {
    //     state.searchTags = options.queryTags;
    //     queryHelper.setFiltersAsQueryTag(options.queryTags);
    //     await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
    // }
    // await listCollectors();
};

/* Watcher */
watch(() => store.state.reference.provider.items, (value: ReferenceItem) => {
    state.providerList = [
        { key: 'all', name: 'All Providers' },
        ...Object.values(value),
    ];
}, { immediate: true });
</script>

<style scoped lang="postcss">
.collector-contents {
    @apply flex flex-col;
    gap: 1.5rem;

    .p-button {
        padding-right: 0.75rem;
        padding-left: 0.75rem;
    }

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

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        .data-wrapper {
            @apply grid grid-cols-2 gap-4;

            .p-card {
                header {
                    @apply text-label-xl font-bold;
                    padding: 1.5rem 1.5rem 0.5rem;
                }

                .body {
                    padding: 0.5rem 1.5rem 1.5rem;

                    .collector-info-wrapper {
                        @apply grid grid-cols-2 gap-6;
                    }
                }
            }
        }
        .no-data-wrapper {
            background-color: initial;
            border: none;
        }
    }
}
</style>
