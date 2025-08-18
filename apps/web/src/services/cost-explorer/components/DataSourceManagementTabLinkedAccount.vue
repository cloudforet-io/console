<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isObject } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import {
    PButton, PHeading, PHeadingLayout, PToolboxTable, PBadge, PSelectDropdown, PI, PTooltip, PSelectStatus, PStatus,
} from '@cloudforet/mirinae';
import type {
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { useDataSourceAccountApi } from '@/api-clients/cost-analysis/data-source-account/composables/use-data-source-account-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useQueryTags } from '@/common/composables/query-tags';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray, red } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import DataSourceManagementModal from '@/services/cost-explorer/components/DataSourceManagementModal.vue';
import {
    makeDataSourceDistinctValueHandler,
} from '@/services/cost-explorer/composables/data-source-handler';
import { useDataSourceAccountListQuery } from '@/services/cost-explorer/composables/use-data-source-account-list-query';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { CostLinkedAccountModalType } from '@/services/cost-explorer/types/data-sources-type';


interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const resourceMenuHandlerMap = useResourceMenuHandlerMap();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
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
    valueHandlerMap: computed<ValueHandlerMap>(() => {
        const filters: ApiFilter[] = [{ k: 'data_source_id', v: dataSourcesPageState.selectedDataSourceId, o: 'eq' }];
        return {
            name: makeDistinctValueHandler('cost_analysis.DataSourceAccount', 'name', 'string', filters),
            account_id: makeDistinctValueHandler('cost_analysis.DataSourceAccount', 'account_id', 'string', filters),
            workspace_id: makeDataSourceDistinctValueHandler(filters, storeState.workspaceList),
        };
    }),
    filterFields: computed(() => [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALL') },
        { name: 'linked', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.LINKED') },
        { name: 'notLinked', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.NOT_LINKED') },
    ]),
    selectedFilter: ['all'] as string[],
    thisPage: 1,
    pageSize: 15,
    sortBy: 'created_at',
    sortDesc: true,
    selectedIndices: [] as number[],
});

const workspaceMenuHandler = resourceMenuHandlerMap.workspace({
    menuFilters: [
        { k: 'state', v: 'ENABLED', o: '=' },
        { k: 'is_dormant', v: false, o: '=' },
    ],
});

const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

/* Query */
const linkedAccountListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
const {
    data: linkedAccountList,
    totalCount: linkedAccountListTotalCount,
    refetch: refetchLinkedAccountList,
    key: linkedAccountListQueryKey,
    isLoading,
} = useDataSourceAccountListQuery({
    params: computed(() => {
        linkedAccountListApiQueryHelper
            .setFilters(queryTagHelper.filters.value)
            .setSort(tableState.sortBy, tableState.sortDesc);

        if (tableState.selectedFilter[0] !== 'all') {
            linkedAccountListApiQueryHelper.addFilter({ k: 'is_linked', v: tableState.selectedFilter[0] === 'linked', o: '=' });
        }

        return {
            data_source_id: dataSourcesPageState.selectedDataSourceId,
            query: linkedAccountListApiQueryHelper.data,
        };
    }),
    thisPage: computed(() => tableState.thisPage),
    pageSize: computed(() => tableState.pageSize),
});

/* Mutation */
const queryClient = useQueryClient();
const { dataSourceAccountAPI } = useDataSourceAccountApi();
const { mutate: updateLinkedAccount } = useMutation({
    mutationFn: dataSourceAccountAPI.update,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: linkedAccountListQueryKey.value });
    },
});

/* Event Handlers */
const getWorkspaceInfo = (id: string): WorkspaceModel|undefined => {
    if (!id) return undefined;
    return storeState.workspaceList.find((i) => i.workspace_id === id);
};
const handleSelect = (indices: number[]) => {
    tableState.selectedIndices = indices;
};
const handleSelectStatus = (selected: string[]) => {
    tableState.selectedFilter = selected;
};
const handleChangeToolbox = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
};
const handleSelectDropdownItem = async (idx: number, menuItem: SelectDropdownMenuItem|string) => {
    const accountItem = linkedAccountList.value?.results?.[idx];
    if (!accountItem) return;
    await updateLinkedAccount({
        data_source_id: accountItem.data_source_id,
        account_id: accountItem.account_id,
        workspace_id: isObject(menuItem) ? menuItem?.name : menuItem,
    });
};
const handleClickAction = (action: CostLinkedAccountModalType) => {
    dataSourcesPageStore.setModalType(action);
    dataSourcesPageStore.setModalVisible(true);
};


watch(() => tableState.selectedIndices, (indices) => {
    if (indices.length > 0) {
        dataSourcesPageStore.setSelectedLinkedAccountIds(indices.map((i) => linkedAccountList.value?.results?.[i]?.account_id || ''));
    } else {
        dataSourcesPageStore.setSelectedLinkedAccountIds([]);
    }
});
</script>

<template>
    <div class="data-source-management-tab-linked-account">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           use-total-count
                           use-selected-count
                           :selected-count="dataSourcesPageState.selectedLinkedAccountIds.length"
                           :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE')"
                           :total-count="linkedAccountListTotalCount"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <div class="extra-wrapper">
                    <p-button style-type="tertiary"
                              :disabled="!dataSourcesPageState.selectedLinkedAccountIds.length"
                              @click="handleClickAction('RESET')"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESET') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              :disabled="!dataSourcesPageState.selectedLinkedAccountIds.length"
                              @click="handleClickAction('UPDATE')"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.UPDATE') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
        <!-- Table -->
        <p-toolbox-table search-type="query"
                         class="data-source-management-tab-linked-account-table"
                         searchable
                         :selectable="props.hasReadWriteAccess"
                         sortable
                         disabled
                         :placeholder="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SELECT')"
                         :loading="isLoading"
                         :items="linkedAccountList?.results"
                         :select-index="tableState.selectedIndices"
                         :fields="tableState.fields"
                         :sort-by.sync="tableState.sortBy"
                         :sort-desc.sync="tableState.sortDesc"
                         :page-size.sync="tableState.pageSize"
                         :this-page.sync="tableState.thisPage"
                         :total-count="linkedAccountListTotalCount"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         @select="handleSelect"
                         @change="handleChangeToolbox"
                         @refresh="refetchLinkedAccountList()"
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
                                   :page-size="10"
                                   :visible-menu="dropdownState.visible"
                                   :search-text.sync="dropdownState.searchText"
                                   :disabled="!props.hasReadWriteAccess"
                                   show-select-marker
                                   is-filterable
                                   :selected="value ? [{ name: value, label: getWorkspaceInfo(value)?.name || '' }] : undefined"
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
        <!-- Modal -->
        <data-source-management-modal v-if="dataSourcesPageState.modalVisible" />
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-linked-account {
    .extra-wrapper {
        @apply flex;
        gap: 0.5rem;
    }
}
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
