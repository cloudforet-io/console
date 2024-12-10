<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import DataSourceManagementTabAccessRestriction
    from '@/services/cost-explorer/components/DataSourceManagementTabAccessRestriction.vue';
import DataSourceManagementTabDataCollectionHistory from '@/services/cost-explorer/components/DataSourceManagementTabDataCollectionHistory.vue';
import DataSourceManagementTabDetailBaseInformation
    from '@/services/cost-explorer/components/DataSourceManagementTabDetailBaseInformation.vue';
import DataSourceManagementTabLinkedAccount
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccount.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const storeState = reactive({
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
});
const state = reactive({
    hasReadWriteAccess: computed<boolean|undefined>(() => usePageEditableStatus()),
});
const tabState = reactive({
    tabs: computed(() => [
        { name: 'detail', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_TITLE') },
        { name: 'linked_account', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE') },
        { name: 'data_collection_history', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_COLLECTION_HISTORY') },
        { name: 'access_restriction', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_RESTRICTION') },
    ]),
});

const handleChangeTab = (tab: string) => {
    dataSourcesPageStore.setActiveTab(tab);
};
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab="storeState.activeTab"
           :class="storeState.activeTab"
           class="data-source-management-tabs"
           @change="handleChangeTab"
    >
        <template v-if="storeState.activeTab === 'detail'"
                  #detail
        >
            <data-source-management-tab-detail-base-information />
        </template>
        <template v-else-if="storeState.activeTab === 'linked_account'"
                  #linked_account
        >
            <data-source-management-tab-linked-account :has-read-write-access="state.hasReadWriteAccess" />
        </template>
        <template v-else-if="storeState.activeTab === 'data_collection_history'"
                  #data_collection_history
        >
            <data-source-management-tab-data-collection-history />
        </template>
        <template v-else-if="storeState.activeTab === 'access_restriction'"
                  #access_restriction
        >
            <data-source-management-tab-access-restriction :has-read-write-access="state.hasReadWriteAccess" />
        </template>
    </p-tab>
</template>
