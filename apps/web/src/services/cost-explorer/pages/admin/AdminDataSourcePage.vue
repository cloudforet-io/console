<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { PHeading, PHorizontalLayout, PLink } from '@spaceone/design-system';

import { store } from '@/store';

import DataSourceManagementTable from '@/services/cost-explorer/components/DataSourceManagementTable.vue';
import DataSourceManagementTabs from '@/services/cost-explorer/components/DataSourceManagementTabs.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const storeState = reactive({
    language: computed<string>(() => store.state.user.language),
    totalCount: computed<number>(() => dataSourcesPageState.dataSourceListTotalCount),
    selectedIndices: computed<number[]>(() => dataSourcesPageState.selectedDataSourceIndices),
});

onMounted(() => {
    dataSourcesPageStore.fetchDataSourceList();
});
</script>

<template>
    <div class="admin-data-source-page">
        <p-heading :title="$t('MENU.COST_EXPLORER_DATA_SOURCES')"
                   use-total-count
                   use-selected-count
                   :total-count="storeState.totalCount"
                   :selected-count="storeState.selectedIndices.length"
                   class="title"
        >
            <template #extra>
                <p-link :text="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.GUIDE')"
                        :href="`https://cloudforet.io/${storeState.language}/docs/guides/admin-mode/data-sources`"
                        size="sm"
                        icon-left="ic_info-circle"
                        action-icon="external-link"
                        new-tab
                        class="guide-link"
                />
            </template>
        </p-heading>
        <div class="contents">
            <p-horizontal-layout class="data-source-table">
                <template #container="{ height }">
                    <data-source-management-table :table-height="height" />
                </template>
            </p-horizontal-layout>
            <data-source-management-tabs v-if="storeState.selectedIndices.length > 0" />
            <span v-else
                  class="no-data"
            >
                {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_NO_DATA') }}
            </span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.admin-data-source-page {
    .title {
        @apply items-center;
    }

    /* custom design-system component - p-link */
    :deep(.p-link) {
        @apply flex items-center;
        gap: 0.125rem;
    }
    .contents {
        @apply flex flex-col;
        gap: 0.75rem;
        .no-data {
            @apply text-paragraph-md text-gray-300 text-center;
            padding-top: 3rem;
        }
    }


    /* custom design-system component - p-horizontal-layout */
    :deep(.data-source-table) {
        .horizontal-contents {
            overflow: unset;
        }
    }
}
</style>
