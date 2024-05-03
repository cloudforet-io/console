<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@spaceone/design-system';

import { i18n } from '@/translations';

import DataSourceManagementTabDetail from '@/services/cost-explorer/components/DataSourceManagementTabDetail.vue';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

interface Props {
    selectedItem?: DataSourceItem;
}

const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
});

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
    >
        <template #detail>
            <data-source-management-tab-detail :selected-item="props.selectedItem" />
        </template>
    </p-tab>
</template>
