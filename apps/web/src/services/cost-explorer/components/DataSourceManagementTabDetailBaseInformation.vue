<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PDefinitionTable, PHeading, PLazyImg,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';

import { i18n } from '@/translations';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';


const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedItem),
});

const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'data_source_id', label: 'ID' },
        { name: 'name', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_NAME') },
        { name: 'description', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_DESCRIPTION') },
        { name: 'created_at', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_TIME') },
    ]),
});
</script>

<template>
    <div class="data-source-management-tab-detail-base-information">
        <p-heading heading-type="sub"
                   :title="$t('IAM.USER.MAIN.BASE_INFORMATION')"
                   class="title"
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
    .title {
        margin-top: 2.25rem;
    }
    .data-source-definition-table {
        padding-top: 0.5rem;
        .col-name {
            @apply inline-flex items-center;
            gap: 0.5rem;
        }
    }
}
</style>

