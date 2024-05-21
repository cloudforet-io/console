<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PHeading,
} from '@spaceone/design-system';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { hideLoadingMessage, showLoadingMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DataSourceManagementModal from '@/services/cost-explorer/components/DataSourceManagementModal.vue';
import DataSourceManagementTabLinkedAccountTable
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccountTable.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { CostLinkedAccountModalType, DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const listApiQueryHelper = new ApiQueryHelper();
const datasourceListApiQueryHelper = new ApiQueryHelper();

const storeState = reactive({
    modalVisible: computed<boolean>(() => dataSourcesPageState.modal.visible),
    type: computed<CostLinkedAccountModalType|undefined>(() => dataSourcesPageState.modal.type),

    dataSourceListPageStart: computed<number>(() => dataSourcesPageState.dataSourceListPageStart),
    dataSourceListPageLimit: computed<number>(() => dataSourcesPageState.dataSourceListPageLimit),
    dataSourceListSearchFilters: computed<ConsoleFilter[]>(() => dataSourcesPageState.dataSourceListSearchFilters),
    selectedDataSourceIndices: computed<number|undefined>(() => dataSourcesPageState.selectedDataSourceIndices),
    selectedDataSourceItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),

    selectedLinkedAccountsIndices: computed<number[]>(() => dataSourcesPageState.selectedLinkedAccountsIndices),
    linkedAccountsTotalCount: computed<number>(() => dataSourcesPageState.linkedAccountsTotalCount),
    linkedAccountsPageStart: computed<number>(() => dataSourcesPageState.linkedAccountsPageStart),
    linkedAccountsPageLimit: computed<number>(() => dataSourcesPageState.linkedAccountsPageLimit),
    linkedAccountsSearchFilters: computed<ConsoleFilter[]>(() => dataSourcesPageState.linkedAccountsSearchFilters),
});
const state = reactive({
    loadingMessage: computed<TranslateResult>(() => {
        if (storeState.type === 'RESET') {
            return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESETTING');
        }
        return i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATING');
    }),
});

const handleClickAction = (action: CostLinkedAccountModalType) => {
    dataSourcesPageStore.setModal(true, action);
};
const handleConfirmModal = async (promises: Promise<void>[]) => {
    const loadingMessageId = showLoadingMessage(state.loadingMessage, '');

    const delayHideLoadingMessage = new Promise((resolve) => {
        setTimeout(resolve, 1500);
    });

    await Promise.all([Promise.allSettled(promises), delayHideLoadingMessage]);

    hideLoadingMessage(loadingMessageId);

    if (storeState.type === 'RESET') {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_RESET'), '');
    } else {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALT_S_UPDATE'), '');
    }

    await fetchLinkedAccountList();
};

const fetchLinkedAccountList = async () => {
    dataSourcesPageStore.setLinkedAccountsLoading(true);
    try {
        listApiQueryHelper.setPage(storeState.linkedAccountsPageStart, storeState.linkedAccountsPageLimit)
            .setFilters(storeState.linkedAccountsSearchFilters);
        await dataSourcesPageStore.fetchLinkedAccount({
            data_source_id: storeState.selectedDataSourceItem?.data_source_id || '',
            query: listApiQueryHelper.data,
        });
    } finally {
        dataSourcesPageStore.setLinkedAccountsLoading(false);
        await fetchDataSourceList();
    }
};
const fetchDataSourceList = async () => {
    datasourceListApiQueryHelper.setPage(storeState.dataSourceListPageStart, storeState.dataSourceListPageLimit)
        .setFilters(storeState.dataSourceListSearchFilters);
    await dataSourcesPageStore.fetchDataSourceList({
        query: datasourceListApiQueryHelper.data,
    });
};

onMounted(async () => {
    await fetchLinkedAccountList();
});

watch(() => storeState.selectedDataSourceIndices, async () => {
    await dataSourcesPageStore.setSelectedLinkedAccountsIndices([]);
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
                   :total-count="storeState.linkedAccountsTotalCount"
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
                                      @confirm="handleConfirmModal"
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

