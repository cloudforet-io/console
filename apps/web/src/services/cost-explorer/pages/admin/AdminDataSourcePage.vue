<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PHeading, PHorizontalLayout, PLink, PI, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useUserStore } from '@/store/user/user-store';

import { gray } from '@/styles/colors';

import DataSourceManagementTable from '@/services/cost-explorer/components/DataSourceManagementTable.vue';
import DataSourceManagementTabs from '@/services/cost-explorer/components/DataSourceManagementTabs.vue';
import { useDataSourceListQuery } from '@/services/cost-explorer/composables/use-data-source-list-query';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const userStore = useUserStore();

const storeState = reactive({
    language: computed<string|undefined>(() => userStore.state.language),
});

/* Query */
const { totalCount } = useDataSourceListQuery({
    thisPage: computed(() => 1),
    pageSize: computed(() => 15),
});
</script>

<template>
    <div class="admin-data-source-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('MENU.COST_EXPLORER_DATA_SOURCES')"
                           use-total-count
                           :total-count="totalCount"
                           :selected-count="dataSourcesPageState.selectedDataSourceId !== undefined ? 1 : undefined"
                />
            </template>
            <template #extra>
                <span class="right-info-link">
                    <p-i name="ic_info-circle"
                         height="0.75rem"
                         width="0.75rem"
                         class="icon"
                         :color="gray[900]"
                    />
                    <p-link :text="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.GUIDE')"
                            :href="storeState.language
                                ? 'https://cloudforet.io/docs/guides/admin-mode/data-sources'
                                : `https://cloudforet.io/${storeState.language}/docs/guides/admin-mode/data-sources`"
                            size="sm"
                            action-icon="external-link"
                            new-tab
                            class="guide-link"
                    />
                </span>
            </template>
        </p-heading-layout>
        <div class="contents">
            <p-horizontal-layout class="data-source-table">
                <template #container="{ height }">
                    <data-source-management-table :table-height="height" />
                </template>
            </p-horizontal-layout>
            <data-source-management-tabs v-if="dataSourcesPageState.selectedDataSourceId !== undefined" />
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
    .right-info-link {
        @apply flex items-center;
        gap: 0.125rem;
        height: 2rem;
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
