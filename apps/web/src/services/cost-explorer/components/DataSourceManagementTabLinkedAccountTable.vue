<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { isObject } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PBadge, PSelectDropdown, PI, PTooltip, PSelectStatus, PStatus,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler, SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceAccountModel } from '@/api-clients/cost-analysis/data-source-account/schema/model';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray, red } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import {
    convertWorkspaceSearchValue,
    makeDataSourceDistinctValueHandler, makeDataSourceSyncValueHandler,
} from '@/services/cost-explorer/composables/data-source-handler';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const emit = defineEmits<{(e: 'confirm', options?: ToolboxOptions): void;
    (e: 'select-filter', filter?: string): void;
}>();

const workspaceListApiQueryHelper = new ApiQueryHelper();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    totalCount: computed<number>(() => dataSourcesPageState.linkedAccountsTotalCount),
    linkedAccounts: computed<CostDataSourceAccountModel[]>(() => dataSourcesPageGetters.linkedAccounts),
    selectedLinkedAccountsIndices: computed<number[]>(() => dataSourcesPageState.selectedLinkedAccountsIndices),
    linkedAccountsLoading: computed<boolean>(() => dataSourcesPageState.linkedAccountsLoading),
    selectedDataSourceItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
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
            { name: 'name', label: 'Name' },
            { name: 'account_id', label: 'Account ID' },
            { name: 'workspace_id', label: 'Workspace' },
            { name: 'is_linked', label: 'Status' },
            { name: 'is_sync', label: 'Sync' },
        ],
    }]),
    fields: computed<DefinitionField[]>(() => [
        { name: 'name', label: 'Name' },
        { name: 'account_id', label: 'Account ID' },
        { name: 'workspace_id', label: 'Workspace' },
        { name: 'is_linked', label: 'Status' },
        { name: 'is_sync', label: 'Sync' },
        { name: 'updated_at', label: 'Updated', sortable: false },
    ]),
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeDistinctValueHandler('cost_analysis.DataSourceAccount', 'name', 'string', [{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }]),
        account_id: makeDistinctValueHandler('cost_analysis.DataSourceAccount', 'account_id', 'string', [{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }]),
        workspace_id: makeDataSourceDistinctValueHandler([{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }], storeState.workspaceList),
        is_linked: makeDataSourceSyncValueHandler('is_linked', [{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }]),
        is_sync: makeDataSourceSyncValueHandler('is_sync', [{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }]),
    })),
    filterFields: computed(() => [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALL') },
        { name: 'linked', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.LINKED') },
        { name: 'notLinked', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.NOT_LINKED') },
    ]),
    selectedFilter: ['all'] as string[],
});

const getWorkspaceInfo = (id: string): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return storeState.workspaceList.find((i) => i.workspace_id === id);
};
const handleSelect = (index: number[]) => {
    dataSourcesPageStore.setSelectedLinkedAccountsIndices(index);
};
const handleSelectStatus = (selected: string[]) => {
    tableState.selectedFilter = selected;
};
const handleChangeToolbox = (options: ToolboxOptions = {}) => {
    emit('confirm', convertWorkspaceSearchValue(options, storeState.workspaceList));
};

const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleSelectDropdownItem = async (idx: number, menuItem: SelectDropdownMenuItem|string) => {
    const accountItem = storeState.linkedAccounts[idx];
    await dataSourcesPageStore.updateLinkedAccount({
        data_source_id: accountItem.data_source_id,
        account_id: accountItem.account_id,
        workspace_id: isObject(menuItem) ? menuItem?.name : menuItem,
    });
    await emit('confirm');
    await dataSourcesPageStore.setSelectedLinkedAccountsIndices([]);
};
const workspaceMenuHandler: AutocompleteHandler = async (inputText: string, pageStart = 1, pageLimit = 10) => {
    dropdownState.loading = true;

    workspaceListApiQueryHelper.setFilters([
        { k: 'name', v: inputText, o: '' },
        { k: 'state', v: 'ENABLED', o: '=' },
        { k: 'is_dormant', v: false, o: '' },
    ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        const refinedMenuItems = (results ?? []).map((i) => ({
            label: i.name,
            name: i.workspace_id,
            is_dormant: i.is_dormant,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);

        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    } finally {
        dropdownState.loading = false;
    }
};

watch(() => tableState.selectedFilter, (selectedFilter) => {
    emit('select-filter', selectedFilter[0]);
});
</script>

<template>
    <p-toolbox-table search-type="query"
                     class="data-source-management-tab-linked-account-table"
                     searchable
                     :selectable="props.hasReadWriteAccess"
                     sortable
                     disabled
                     :placeholder="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SELECT')"
                     :loading="storeState.linkedAccountsLoading"
                     :items="storeState.linkedAccounts"
                     :select-index="storeState.selectedLinkedAccountsIndices"
                     :fields="tableState.fields"
                     sort-by="created_at"
                     :sort-desc="false"
                     :total-count="storeState.totalCount"
                     :key-item-sets="tableState.keyItemSets"
                     :value-handler-map="tableState.valueHandlerMap"
                     :query-tags="queryTags"
                     @select="handleSelect"
                     @change="handleChangeToolbox"
                     @refresh="handleChangeToolbox()"
    >
        <template #toolbox-bottom>
            <div class="status-box">
                <span class="label">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.STATUS') }}</span>
                <p-select-status v-for="(status, idx) in tableState.filterFields"
                                 :key="idx"
                                 :selected="tableState.selectedFilter"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectStatus"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
        </template>
        <template #col-workspace_id-format="{ value, rowIndex }">
            <p-select-dropdown use-fixed-menu-style
                               style-type="transparent"
                               page-size="10"
                               :visible-menu="dropdownState.visible"
                               :loading="dropdownState.loading"
                               :search-text.sync="dropdownState.searchText"
                               :disabled="!props.hasReadWriteAccess"
                               show-select-marker
                               is-filterable
                               :selected="value ? [{ name: value, label: getWorkspaceInfo(value)?.name}] : undefined"
                               show-select-header
                               :handler="workspaceMenuHandler"
                               class="col-workspace-select-dropdown"
                               @select="handleSelectDropdownItem(rowIndex, $event)"
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
                        <p class="workspace-info">
                            <span>{{ item.label }}</span>
                            <span v-if="getWorkspaceInfo(item.name)?.tags?.description"
                                  class="description"
                            >
                                - {{ getWorkspaceInfo(item.name)?.tags?.description }}
                            </span>
                        </p>
                        <p-status v-if="item?.is_dormant"
                                  v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                  class="capitalize state"
                        />
                    </div>
                </template>
            </p-select-dropdown>
        </template>
        <template #th-is_sync-format="{ field }">
            <div class="th-tooltip">
                <span>{{ field.label }}</span>
                <p-tooltip
                    :contents="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SYNC_TOOLTIP')"
                    position="bottom-end"
                    class="tooltip"
                >
                    <p-i name="ic_info-circle"
                         class="title-tooltip"
                         height="1rem"
                         width="1rem"
                         :color="gray[500]"
                    />
                </p-tooltip>
            </div>
        </template>
        <template #col-is_linked-format="{ value }">
            <p-badge badge-type="subtle"
                     :style-type="!value ? 'red100' : 'green200'"
            >
                {{ value ? 'Linked' : 'Not Linked' }}
            </p-badge>
        </template>
        <template #col-is_sync-format="{ value }">
            <p-badge badge-type="subtle"
                     :style-type="!value ? 'gray100' : 'blue300'"
            >
                {{ value ? value.toString().replace(/^\w/, (c) => c.toUpperCase()) : 'False' }}
            </p-badge>
        </template>
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.data-source-management-tab-linked-account-table {
    border: none;
    .status-box {
        @apply relative inline-flex gap-4 items-center;
        height: 1.25rem;
        font-size: 0.875rem;
        margin-top: -0.5rem;
        margin-bottom: 1rem;
        padding-left: 1rem;

        .label {
            @apply text-gray-500;
            font-size: 0.875rem;
        }
    }
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
            .workspace-info {
                @apply truncate;
                max-width: 22.125rem;
            }
            .state {
                @apply text-label-sm;
            }
            .description {
                @apply text-label-md text-gray-500;
            }
        }
    }
    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip {
            margin-top: -0.125rem;
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
