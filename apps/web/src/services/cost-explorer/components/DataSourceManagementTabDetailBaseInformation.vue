<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PDefinitionTable, PHeading, PLazyImg,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
});

const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'data_source_id', label: 'ID' },
        { name: 'name', label: 'Name' },
        { name: 'description', label: 'Description' },
        { name: 'created_at', label: 'Registered Time' },
    ]),
});
</script>

<template>
    <div class="data-source-management-tab-detail-base-information">
        <p-heading heading-type="sub"
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAIL_BASE_INFORMATION')"
                   class="pt-8 px-4 pb-4"
        />
        <p-definition-table :fields="tableState.fields"
                            :data="storeState.selectedItem"
                            :skeleton-rows="4"
                            style-type="white"
                            class="data-source-definition-table"
                            v-on="$listeners"
        >
            <template #data-name>
                <div class="col-name">
                    <p-lazy-img class="left-icon"
                                :src="storeState.selectedItem?.icon"
                                width="1.5rem"
                                height="1.5rem"
                    />
                    <span>{{ storeState.selectedItem?.name }}</span>
                </div>
            </template>
        </p-definition-table>
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-detail-base-information {
    .data-source-definition-table {
        min-height: unset;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        .col-name {
            @apply inline-flex items-center;
            gap: 0.5rem;
        }
    }
}
</style>

