<template>
    <div class="collector-contents">
        <collector-provider-list />
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
        <div class="collector-lists">
            <p-card
                v-for="item in cloudCollectorPageState.filteredList"
                :key="item.collector_id"
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
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PToolbox, PButton, PCard } from '@spaceone/design-system';

import type { QueryTag } from '@cloudforet/core-lib/component-util/query-search/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import CollectorItemInfo from '@/services/asset-inventory/collector/modules/CollectorItemInfo.vue';
import CollectorProviderList from '@/services/asset-inventory/collector/modules/CollectorProviderList.vue';
import { CollectorItemInfoType } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

interface Props {
    totalCount?: number
    pageStart?: number
    pageLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
    totalCount: 0,
    pageStart: 1,
    pageLimit: 15,
});

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const state = reactive({
    searchTags: [] as QueryTag[],
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
const collectorApiQueryHelper = new ApiQueryHelper()
    .setOnly('collector_id', 'name', 'last_collected_at', 'provider', 'tags', 'plugin_info', 'state')
    .setPage(props.pageStart, props.pageLimit);
const handleCreate = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
const handleExport = async () => {
    await store.dispatch('file/downloadExcel', {
        url: '/inventory/collector/list',
        param: { query: collectorApiQueryHelper.data },
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
</script>

<style scoped lang="postcss">
.collector-contents {
    @apply flex flex-col;
    gap: 1.5rem;

    .p-button {
        padding-right: 0.75rem;
        padding-left: 0.75rem;
    }

    :deep(.p-toolbox) {
        .left-area-wrapper, .search-wrapper, .tool {
            margin-bottom: 0;
        }
    }

    .collector-lists {
        @apply grid grid-cols-2 gap-4;

        /* custom design-system component - p-card */

        :deep(.p-card) {
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
}
</style>
