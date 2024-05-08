<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PHeading, PToolboxTable,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { CostDataSourceAccountModel } from '@/schema/cost-analysis/data-source-account/model';
import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedItem),
    linkedAccounts: computed<CostDataSourceAccountModel[]>(() => dataSourcesPageState.linkedAccounts),
    totalCount: computed<number>(() => dataSourcesPageState.linkedAccountsTotalCount),
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
});
const state = reactive({
    loading: false,
});
const tableState = reactive({
    selectedIndices: [] as number[],
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Account ID' },
            { name: 'tags.description', label: 'Workspace' },
            { name: 'role_type', label: 'Auto Mapping' },
        ],
    }]),
    fields: computed<DefinitionField[]>(() => [
        { name: 'account_id', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_ACCOUNT_ID') },
        { name: 'workspace', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_WORKSPACE') },
        { name: 'auto_mapping', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_AUTO_MAPPING') },
        { name: 'updated_at', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_UPDATED_AT') },
    ]),
    valueHandlerMap: {},
});

const handleSelect = (index: number[]) => {
    tableState.selectedIndices = index;
};

const listApiQueryHelper = new ApiQueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleChangeToolbox = (options: ToolboxOptions) => {
    if (options.pageStart !== undefined) listApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) listApiQueryHelper.setPageLimit(options.pageLimit);
    fetchLinkedAccountList();
};
const fetchLinkedAccountList = () => {
    state.loading = true;
    try {
        dataSourcesPageStore.fetchLinkedAccount({
            data_source_id: storeState.selectedItem?.data_source_id || '',
            query: listApiQueryHelper.data,
        });
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.activeTab, () => {
    fetchLinkedAccountList();
}, { immediate: true });
</script>

<template>
    <div class="data-source-management-tab-linked-account">
        <p-heading heading-type="sub"
                   use-total-count
                   use-selected-count
                   :selected-count="tableState.selectedIndices.length"
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE')"
                   :total-count="storeState.totalCount"
                   class="title"
        >
            <template #extra>
                <div class="extra-wrapper">
                    <p-button style-type="tertiary">
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET') }}
                    </p-button>
                    <p-button style-type="tertiary">
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-toolbox-table search-type="query"
                         class="linked-account-table"
                         searchable
                         selectable
                         :loading="false"
                         disabled
                         :items="storeState.linkedAccounts"
                         :select-index="tableState.selectedIndices"
                         :fields="tableState.fields"
                         sort-by="name"
                         :sort-desc="true"
                         :total-count="storeState.linkedAccounts.length"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         @select="handleSelect"
                         @change="handleChangeToolbox"
                         @refresh="fetchLinkedAccountList()"
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
    .linked-account-table {
        border: none;
    }
}
</style>

