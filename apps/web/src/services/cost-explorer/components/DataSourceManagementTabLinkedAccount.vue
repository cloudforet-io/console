<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PHeading,
} from '@spaceone/design-system';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import DataSourceManagementModal from '@/services/cost-explorer/components/DataSourceManagementModal.vue';
import DataSourceManagementTabLinkedAccountTable
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccountTable.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { CostLinkedAccountModalType, DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const listApiQueryHelper = new ApiQueryHelper();

const storeState = reactive({
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
    selectedDataSourceItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
    totalCount: computed<number>(() => dataSourcesPageState.linkedAccountsTotalCount),
    selectedLinkedAccountsIndices: computed<number[]>(() => dataSourcesPageState.selectedLinkedAccountsIndices),
    modalVisible: computed<boolean>(() => dataSourcesPageState.modal.visible),
    linkedAccountsPageStart: computed<number>(() => dataSourcesPageState.linkedAccountsPageStart),
    linkedAccountsPageLimit: computed<number>(() => dataSourcesPageState.linkedAccountsPageLimit),
});

const handleClickAction = (action: CostLinkedAccountModalType) => {
    dataSourcesPageStore.setModal(true, action);
};

const fetchLinkedAccountList = async () => {
    dataSourcesPageStore.setLinkedAccountsLoading(true);
    try {
        listApiQueryHelper.setPage(storeState.linkedAccountsPageStart, storeState.linkedAccountsPageLimit);
        await dataSourcesPageStore.fetchLinkedAccount({
            data_source_id: storeState.selectedDataSourceItem?.data_source_id || '',
            query: listApiQueryHelper.data,
        });
    } finally {
        dataSourcesPageStore.setLinkedAccountsLoading(false);
    }
};

watch([() => storeState.activeTab, () => storeState.selectedDataSourceItem], async () => {
    await fetchLinkedAccountList();
}, { immediate: true });
</script>

<template>
    <div class="data-source-management-tab-linked-account">
        <p-heading heading-type="sub"
                   use-total-count
                   use-selected-count
                   :selected-count="storeState.selectedLinkedAccountsIndices.length"
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE')"
                   :total-count="storeState.totalCount"
                   class="title"
        >
            <template #extra>
                <div class="extra-wrapper">
                    <p-button style-type="tertiary"
                              :disabled="storeState.selectedLinkedAccountsIndices.length === 0"
                              @click="handleClickAction('RESET')"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              :disabled="storeState.selectedLinkedAccountsIndices.length === 0"
                              @click="handleClickAction('UPDATE')"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <data-source-management-tab-linked-account-table @confirm="fetchLinkedAccountList" />
        <data-source-management-modal v-if="storeState.modalVisible"
                                      @confirm="fetchLinkedAccountList"
        />
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-linked-account {
    .title {
        @apply items-center;
        margin-top: 2.25rem;
        margin-bottom: 0;
        .extra-wrapper {
            @apply flex;
            gap: 0.5rem;
        }
    }
}
</style>

