<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { PHeading, PLink } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DataSourceManagementTable from '@/services/cost-explorer/components/DataSourceManagementTable.vue';
import DataSourceManagementTabs from '@/services/cost-explorer/components/DataSourceManagementTabs.vue';

const storeState = reactive({
    language: computed(() => store.state.user.language),
});
const state = reactive({
    dataSourceList: [] as DataSourceModel[],
    totalCount: 0,
    selectedIndices: [] as number[],
    selectedItem: computed(() => state.dataSourceList[state.selectedIndices[0]]),
});

const fetchDataSourceList = async () => {
    try {
        const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>();
        state.dataSourceList = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.dataSourceList = [];
        state.totalCount = 0;
    }
};

onMounted(() => {
    fetchDataSourceList();
});
</script>

<template>
    <div class="admin-data-source-page">
        <p-heading :title="$t('MENU.COST_EXPLORER_DATA_SOURCES')"
                   use-total-count
                   use-selected-count
                   :total-count="state.totalCount"
                   :selected-count="state.selectedIndices.length"
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
            <data-source-management-table :data-source-list="state.dataSourceList"
                                          :selected-indices.sync="state.selectedIndices"
            />
            <data-source-management-tabs v-if="state.selectedIndices.length > 0" />
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
}
</style>
