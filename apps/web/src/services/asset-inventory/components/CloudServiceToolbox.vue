<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { PToolbox } from '@cloudforet/mirinae';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';


import CloudServiceExcelExportOptionModal from '@/services/asset-inventory/components/CloudServiceExcelExportOptionModal.vue';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import type { Period } from '@/services/asset-inventory/types/type';

interface Handlers { keyItemSets?: KeyItemSet[]; valueHandlerMap?: ValueHandlerMap }

interface Props {
    hasNextPage: boolean;
    handlers: Handlers;
    queryTags?: QueryTag[];
    period?: Period;
    pageSize?: number;
}

interface Emits {
    (event: 'update-pagination', value: ToolboxOptions): void;
    (event: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
    hasNextPage: false,
    handlers: () => ({}),
    queryTags: () => [],
    period: undefined,
    pageSize: undefined,
});

const emit = defineEmits<Emits>();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageGetters = cloudServicePageStore.getters;
const cloudServicePageState = cloudServicePageStore.state;
const cloudServiceLSBStore = useCloudServiceLSBStore();

const searchQueryHelper = new QueryHelper().setKeyItemSets(props.handlers.keyItemSets ?? []);
const state = reactive({
    queryTags: computed(() => searchQueryHelper.setFilters(cloudServicePageState.searchFilters).queryTags),
    cloudServiceFilters: computed<ConsoleFilter[]>(() => [...cloudServicePageGetters.allFilters, ...cloudServiceLSBStore.getters.allFilters]
        .filter((f: any) => ![
            'labels',
            'service_code',
        ].includes(f.k))),
    keyItemSets: computed(() => props.handlers?.keyItemSets ?? []),
});

const excelState = reactive({
    visible: false,
});


/* Event Handlers */
const handleChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        cloudServicePageStore.setSearchFilters(searchQueryHelper.filters);
    }
    if (options.pageStart !== undefined || options.pageLimit !== undefined) {
        emit('update-pagination', options);
    }
};
const handleRefresh = () => {
    emit('refresh');
};

const handleClickExcelDownload = (visible:boolean) => {
    excelState.visible = visible;
};

</script>

<template>
    <div>
        <p-toolbox filters-visible
                   exportable
                   search-type="query"
                   :has-next-page="props.hasNextPage"
                   :query-tags="state.queryTags"
                   :key-item-sets="state.keyItemSets"
                   :value-handler-map="props.handlers?.valueHandlerMap ?? {}"
                   :page-size="props.pageSize"
                   @change="handleChange"
                   @refresh="handleRefresh"
                   @export="handleClickExcelDownload(true)"
        />
        <cloud-service-excel-export-option-modal :visible="excelState.visible"
                                                 :peroid="props.period"
                                                 @update:visible="handleClickExcelDownload"
        />
    </div>
</template>
