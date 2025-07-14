<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';


import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import { i18n } from '@/translations';

import { hideLoadingMessage, showLoadingMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DataSourceManagementModal from '@/services/cost-explorer/components/DataSourceManagementModal.vue';
import DataSourceManagementTabLinkedAccountTable
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccountTable.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { CostLinkedAccountModalType } from '@/services/cost-explorer/types/data-sources-type';

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

let linkedAccountListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
let linkedAccountListApiQuery = linkedAccountListApiQueryHelper.data;

const storeState = reactive({
    modalVisible: computed<boolean>(() => dataSourcesPageState.modal.visible),
    type: computed<CostLinkedAccountModalType|undefined>(() => dataSourcesPageState.modal.type),

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
    selectedStatusFilter: 'all',
});

const handleClickAction = (action: CostLinkedAccountModalType) => {
    dataSourcesPageStore.setModal(true, action);
};
const handleChangedSelectFilter = (filters: string) => {
    state.selectedStatusFilter = filters;
};
const handleChangeLinkedAccountToolbox = (options: ToolboxOptions) => {
    if (options) {
        linkedAccountListApiQuery = getApiQueryWithToolboxOptions(linkedAccountListApiQueryHelper, options) ?? linkedAccountListApiQuery;

        if (options.sortBy !== undefined) {
            linkedAccountListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
        }
        if (options.queryTags !== undefined) {
            dataSourcesPageStore.setLinkedAccountsSearchFilters(linkedAccountListApiQueryHelper.filters);
        }
        if (options.pageStart !== undefined) dataSourcesPageStore.setLinkedAccountsPageStart(options.pageStart);
        if (options.pageLimit !== undefined) dataSourcesPageStore.setLinkedAccountsPageLimit(options.pageLimit);
    }

    fetchLinkedAccountList();
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
    await dataSourcesPageStore.setSelectedLinkedAccountsIndices([]);
};

const fetchLinkedAccountList = async () => {
    dataSourcesPageStore.setLinkedAccountsLoading(true);
    linkedAccountListApiQueryHelper.setPage(storeState.linkedAccountsPageStart, storeState.linkedAccountsPageLimit)
        .addFilter(...storeState.linkedAccountsSearchFilters);

    if (dataSourcesPageState.selectedDataSourceId === undefined) return;

    try {
        await dataSourcesPageStore.fetchLinkedAccount({
            data_source_id: dataSourcesPageState.selectedDataSourceId,
            query: linkedAccountListApiQueryHelper.data,
        });
    } finally {
        dataSourcesPageStore.setLinkedAccountsLoading(false);
        // await fetchDataSourceList();
    }
};

watch([() => state.selectedStatusFilter, () => dataSourcesPageState.selectedDataSourceId], async ([selectedStatusFilter]) => {
    if (selectedStatusFilter === 'all') {
        linkedAccountListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
    } else {
        linkedAccountListApiQueryHelper.setOrFilters([{ k: 'is_linked', v: selectedStatusFilter === 'linked', o: '=' }]);
    }

    await fetchLinkedAccountList();
}, { immediate: true });
watch(() => dataSourcesPageState.selectedDataSourceId, async () => {
    await dataSourcesPageStore.setSelectedLinkedAccountsIndices([]);
}, { immediate: true });

onUnmounted(() => {
    dataSourcesPageStore.linkedAccountsReset();
});
</script>

<template>
    <div class="data-source-management-tab-linked-account">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           use-total-count
                           use-selected-count
                           :selected-count="storeState.selectedLinkedAccountsIndices.length"
                           :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE')"
                           :total-count="storeState.linkedAccountsTotalCount"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
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
        </p-heading-layout>
        <data-source-management-tab-linked-account-table :has-read-write-access="props.hasReadWriteAccess"
                                                         @confirm="handleChangeLinkedAccountToolbox"
                                                         @select-filter="handleChangedSelectFilter"
        />
        <data-source-management-modal v-if="storeState.modalVisible"
                                      @confirm="handleConfirmModal"
        />
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-linked-account {
    .extra-wrapper {
        @apply flex;
        gap: 0.5rem;
    }
}
</style>

