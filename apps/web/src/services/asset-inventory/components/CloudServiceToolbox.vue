<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PDivider, PButton, PToolbox,
} from '@spaceone/design-system';
import type { QueryTag } from '@spaceone/design-system/types/inputs/search/query-search-tags/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';

import { store } from '@/store';

import CloudServiceExcelExportOptionModal from '@/services/asset-inventory/components/CloudServiceExcelExportOptionModal.vue';
import CloudServiceFilterModal from '@/services/asset-inventory/components/CloudServiceFilterModal.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/components/CloudServicePeriodFilter.vue';
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


const props = withDefaults(defineProps<Props>(), {
    hasNextPage: false,
    handlers: () => ({}),
    queryTags: () => [],
    period: undefined,
    pageSize: undefined,
});

const emit = defineEmits<{(event: 'update-pagination', value: ToolboxOptions): void;
    (event: 'refresh'): void;
}>();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;

const searchQueryHelper = new QueryHelper().setKeyItemSets(props.handlers.keyItemSets ?? []);
const state = reactive({
    // providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    queryTags: computed(() => searchQueryHelper.setFilters(cloudServicePageState.searchFilters).queryTags),
    cloudServiceFilters: computed(() => cloudServicePageStore.allFilters.filter((f: any) => ![
        'labels',
        'service_code',
    ].includes(f.k))),
    visibleSetFilterModal: false,
    selectedFiltersCount: computed<string>(() => {
        const countLabels: string[] = [];
        if (cloudServicePageStore.selectedCategories.length) {
            countLabels.push(`${cloudServicePageStore.selectedCategories.length} Service Categories`);
        }
        if (cloudServicePageStore.selectedRegions.length) {
            countLabels.push(`${cloudServicePageStore.selectedRegions.length} Regions`);
        }
        return countLabels.join(', ');
    }),
    keyItemSets: computed(() => props.handlers?.keyItemSets ?? []),
});

const excelState = reactive({
    visible: false,
});


/* Event Handlers */
const handleChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        cloudServicePageStore.$patch((_state) => {
            _state.searchFilters = searchQueryHelper.filters;
        });
    }
    if (options.pageStart !== undefined || options.pageLimit !== undefined) {
        emit('update-pagination', options);
    }
};
const handleRefresh = () => {
    emit('refresh');
};
const handleClickSet = () => {
    state.visibleSetFilterModal = true;
};

const handleDeletePeriodFilter = () => {
    cloudServicePageStore.$patch({ period: undefined });
};

const handleClickExcelDownload = (visible:boolean) => {
    excelState.visible = visible;
};

/* Init */
(async () => {
    // LOAD REFERENCE STORE
    await store.dispatch('reference/provider/load');
})();

</script>

<template>
    <div>
        <div class="toolbox-top-wrapper">
            <span class="title">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FILTER') }}</span>
            <div v-if="cloudServicePageState.period"
                 class="period-wrapper"
            >
                <cloud-service-period-filter :period="cloudServicePageState.period"
                                             @delete-period="handleDeletePeriodFilter"
                />
                <p-divider vertical />
            </div>
            <div class="filter-wrapper">
                <span class="filters-count">{{ state.selectedFiltersCount }}</span>
                <p-button style-type="tertiary"
                          icon-left="ic_settings-filled"
                          size="sm"
                          @click="handleClickSet"
                >
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.SET') }}
                </p-button>
            </div>
        </div>
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
        <cloud-service-filter-modal :visible.sync="state.visibleSetFilterModal" />
        <cloud-service-excel-export-option-modal :visible="excelState.visible"
                                                 :peroid="props.period"
                                                 @update:visible="handleClickExcelDownload"
        />
    </div>
</template>

<style lang="postcss" scoped>
.toolbox-top-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 1.125rem;
}
.title {
    @apply text-gray-600;
    font-size: 0.875rem;
    margin-right: 0.5rem;
}
.period-wrapper {
    display: inline-flex;
    flex-shrink: 0;
    margin-right: 1rem;
    > .p-divider {
        margin-left: 0.5rem;
    }
}
.filter-wrapper {
    flex-grow: 1;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    .filters-count {
        margin-right: 0.5rem;
        font-size: 0.875rem;
    }
}
</style>
