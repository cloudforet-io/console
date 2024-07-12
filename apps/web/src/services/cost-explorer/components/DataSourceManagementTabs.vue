<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import DataSourceManagementTabAccessRestriction
    from '@/services/cost-explorer/components/DataSourceManagementTabAccessRestriction.vue';
import DataSourceManagementTabDetailBaseInformation
    from '@/services/cost-explorer/components/DataSourceManagementTabDetailBaseInformation.vue';
import DataSourceManagementTabDetailJob from '@/services/cost-explorer/components/DataSourceManagementTabDetailJob.vue';
import DataSourceManagementTabLinkedAccount
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccount.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const storeState = reactive({
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
});
const tabState = reactive({
    tabs: computed(() => [
        { name: 'detail', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_TITLE') },
        { name: 'linked_account', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE') },
        { name: 'data_collection_job', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_COLLECTION_JOB') },
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
            <data-source-management-tab-linked-account />
        </template>
        <template v-else-if="storeState.activeTab === 'data_collection_job'"
                  #data_collection_job
        >
            <data-source-management-tab-detail-job />
        </template>
        <template v-else-if="storeState.activeTab === 'access_restriction'"
                  #access_restriction
        >
            <data-source-management-tab-access-restriction />
        </template>
    </p-tab>
</template>
