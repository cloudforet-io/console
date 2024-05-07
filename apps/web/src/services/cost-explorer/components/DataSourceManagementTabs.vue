<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@spaceone/design-system';

import { i18n } from '@/translations';

import DataSourceManagementTabDetailBaseInformation
    from '@/services/cost-explorer/components/DataSourceManagementTabDetailBaseInformation.vue';
import DataSourceManagementTabDetailJob from '@/services/cost-explorer/components/DataSourceManagementTabDetailJob.vue';
import DataSourceManagementTabLinkedAccount
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccount.vue';


const tabState = reactive({
    tabs: computed(() => [
        { name: 'detail', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_TITLE') },
        { name: 'linked_account', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE') },
    ]),
    activeTab: 'detail',
});
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
           :class="tabState.activeTab"
           class="data-source-management-tabs"
    >
        <template #detail>
            <div class="data-source-management-tab-detail">
                <data-source-management-tab-detail-base-information />
                <data-source-management-tab-detail-job />
            </div>
        </template>
        <template #linked_account>
            <data-source-management-tab-linked-account />
        </template>
    </p-tab>
</template>

<style lang="postcss" scoped>
.data-source-management-tabs {
    .data-source-management-tab-detail {
        @apply flex flex-col;
        gap: 0.25rem;
    }
}
</style>
