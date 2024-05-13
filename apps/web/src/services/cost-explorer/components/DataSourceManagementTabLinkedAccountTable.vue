<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PToolboxTable, PBadge, PSelectDropdown, PI,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceAccountModel } from '@/schema/cost-analysis/data-source-account/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { red } from '@/styles/colors';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    selectedDataSourceItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
    linkedAccounts: computed<CostDataSourceAccountModel[]>(() => dataSourcesPageGetters.linkedAccounts),
    totalCount: computed<number>(() => dataSourcesPageState.linkedAccountsTotalCount),
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
    selectedLinkedAccountsIndices: computed<number[]>(() => dataSourcesPageState.selectedLinkedAccountsIndices),
});
const state = reactive({
    pageStart: 0,
    pageLimit: 15,
    loading: false,
});
const dropdownState = reactive({
    visible: false,
    loading: false,
    searchText: '',
});
const tableState = reactive({
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
        { name: 'workspace_id', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_WORKSPACE'), sortable: false },
        { name: 'is_sync', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_AUTO_MAPPING'), sortable: false },
        { name: 'updated_at', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_UPDATED_AT'), sortable: false },
    ]),
    valueHandlerMap: {},
});

const getWorkspaceInfo = (id: string): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return storeState.workspaceList.find((i) => i.workspace_id === id);
};
const handleSelect = (index: number[]) => {
    dataSourcesPageStore.selectedLinkedAccountsIndices(index);
};
const handleChangeToolbox = (options: ToolboxOptions) => {
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    fetchLinkedAccountList();
};

const listApiQueryHelper = new ApiQueryHelper();
const workspaceListApiQueryHelper = new ApiQueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const fetchLinkedAccountList = async () => {
    state.loading = true;
    try {
        listApiQueryHelper.setPage(state.pageStart, state.pageLimit);
        await dataSourcesPageStore.fetchLinkedAccount({
            data_source_id: storeState.selectedDataSourceItem?.data_source_id || '',
            query: listApiQueryHelper.data,
        });
    } finally {
        state.loading = false;
    }
};
const handleSelectDropdownItem = async (workspaceId: string, idx: number, menuItem: SelectDropdownMenuItem) => {
    const accountItem = storeState.linkedAccounts[idx];
    await dataSourcesPageStore.updateLinkedAccount({
        data_source_id: accountItem.data_source_id,
        account_id: accountItem.account_id,
        workspace_id: menuItem.name,
    }, idx);
};
const workspaceMenuHandler: AutocompleteHandler = async (inputText: string, pageStart, pageLimit = 10) => {
    dropdownState.loading = true;

    workspaceListApiQueryHelper.setFilters([
        { k: 'name', v: inputText, o: '' },
    ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        const refinedMenuItems = (results ?? []).map((i) => ({
            label: i.name,
            name: i.workspace_id,
        }));
        const slicedResults = refinedMenuItems?.slice((pageStart ?? 1) - 1, pageLimit);

        return {
            results: slicedResults,
            more: pageLimit < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
        };
    } finally {
        dropdownState.loading = false;
    }
};

watch([() => storeState.activeTab, () => storeState.selectedDataSourceItem], async () => {
    await fetchLinkedAccountList();
}, { immediate: true });
</script>

<template>
    <p-toolbox-table search-type="query"
                     class="data-source-management-tab-linked-account-table"
                     searchable
                     selectable
                     sortable
                     :placeholder="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SELECT')"
                     :loading="state.loading"
                     :items="storeState.linkedAccounts"
                     :select-index="storeState.selectedLinkedAccountsIndices"
                     :fields="tableState.fields"
                     sort-by="name"
                     :sort-desc="true"
                     :total-count="storeState.totalCount"
                     :key-item-sets="tableState.keyItemSets"
                     :value-handler-map="tableState.valueHandlerMap"
                     :query-tags="queryTags"
                     @select="handleSelect"
                     @change="handleChangeToolbox"
                     @refresh="fetchLinkedAccountList()"
    >
        <template #col-workspace_id-format="{ value, rowIndex }">
            <p-select-dropdown use-fixed-menu-style
                               style-type="transparent"
                               :visible-menu="dropdownState.visible"
                               :loading="dropdownState.loading"
                               :search-text.sync="dropdownState.searchText"
                               show-select-marker
                               is-filterable
                               :selected="value ? [{ name: value, label: getWorkspaceInfo(value)?.name}] : undefined"
                               show-select-header
                               :handler="workspaceMenuHandler"
                               class="col-workspace-select-dropdown"
                               @select="handleSelectDropdownItem(value, rowIndex, $event)"
            >
                <template #dropdown-button>
                    <div v-if="!!value"
                         class="workspace-wrapper"
                    >
                        <workspace-logo-icon :text="getWorkspaceInfo(value)?.name || ''"
                                             :theme="getWorkspaceInfo(value)?.tags?.theme"
                                             size="xs"
                        />
                        <span>{{ getWorkspaceInfo(value)?.name || '' }}</span>
                    </div>
                    <div v-else
                         class="select-wrapper"
                    >
                        <span class="select">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SELECT') }}</span>
                        <p-i class="menu-button"
                             :name="'ic_error-filled'"
                             height="0.875rem"
                             width="0.875rem"
                             :color="red[300]"
                        />
                    </div>
                </template>
                <template #menu-item--format="{item}">
                    <div class="workspace-menu-item">
                        <workspace-logo-icon :text="getWorkspaceInfo(item.name)?.name || ''"
                                             :theme="getWorkspaceInfo(item.name)?.tags?.theme"
                                             size="xs"
                        />
                        <span>{{ item.label }}</span>
                        <span class="state"
                              :class="[getWorkspaceInfo(item.name)?.state.toLowerCase()]"
                        />
                        <span class="description">{{ getWorkspaceInfo(item.name)?.tags?.description }}</span>
                    </div>
                </template>
            </p-select-dropdown>
        </template>
        <template #col-is_sync-format="{ value }">
            <p-badge badge-type="subtle"
                     :class="{'is-true': value}"
                     class="col-sync"
                     :style-type="!value ? 'gray100' : 'blue300'"
            >
                {{ value.toString().replace(/^\w/, (c) => c.toUpperCase()) }}
            </p-badge>
        </template>
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.data-source-management-tab-linked-account-table {
    border: none;
    .col-workspace-select-dropdown {
        .workspace-wrapper, .select-wrapper {
            @apply flex items-center;
            gap: 0.25rem;
        }
        .select-wrapper {
            .select {
                @apply text-gray-600;
            }
        }
        .workspace-menu-item {
            @apply flex items-center;
            gap: 0.375rem;
            .state {
                @apply rounded-full;
                width: 0.5rem;
                height: 0.5rem;
                &.enabled {
                    @apply bg-green-600;
                }
                &.disabled {
                    @apply bg-gray-300;
                }
            }
            .description {
                @apply text-label-md text-gray-500;
            }
        }
    }
    .col-sync {
        &.is-true {
            @apply text-blue-700 text-blue;
        }
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        width: auto;
        .no-data {
            position: initial;
        }
    }
}
</style>
