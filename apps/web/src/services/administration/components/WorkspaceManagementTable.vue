<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PSelectDropdown, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import { userStateFormatter } from '@/services/administration/composables/refined-table-data';
import {
    EXCEL_TABLE_FIELDS,
    WORKSPACE_SEARCH_HANDLERS,
    WORKSPACE_TABLE_FIELDS,
} from '@/services/administration/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';



interface Props {
    tableHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;

const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setSort('name', true);

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});

const modalState = reactive({
    modalVisible: false,
});

const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item',
        name: 'edit',
        label: i18n.t('IAM.WORKSPACES.EDIT'),
        disabled: workspacePageState.selectedIndices.length === 0,
    },
    {
        type: 'item',
        name: 'delete',
        label: i18n.t('IAM.WORKSPACES.DELETE'),
        disabled: workspacePageState.selectedIndices.length === 0,
    },
    {
        type: 'divider',
    },
    {
        type: 'item',
        name: 'enable',
        label: i18n.t('IAM.WORKSPACES.ENABLE'),
    // disabled: rolePageState.selectedIndices.length === 0,
    },
    {
        type: 'item',
        name: 'disable',
        label: i18n.t('IAM.WORKSPACES.DISABLE'),
    // disabled: rolePageState.selectedIndices.length === 0,
    },
]));

const getRowSelectable = (item) => item.role_type === ROLE_TYPE.SYSTEM_ADMIN;

const handleEditWorkspace = (id: string) => {
    console.debug('handleEditWorkspace', id);
};

const handleSelectDropdown = (name) => {
    switch (name) {
    case 'edit':
        handleEditWorkspace(workspacePageStore.selectedWorkspaces[0].workspace_id);
        break;
    case 'delete':
        modalState.modalVisible = true;
        break;
    case 'enable':
        // enable
        break;
    case 'disable':
        // disable
        break;
    default: break;
    }
};

const handleSelect = (index: number[]) => {
    workspacePageStore.$patch({ selectedIndices: index });
};

const handleChange = async (options: ToolboxOptions = {}) => {
    workspaceListApiQuery = getApiQueryWithToolboxOptions(workspaceListApiQueryHelper, options) ?? workspaceListApiQuery;
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
    if (options.pageStart !== undefined) workspacePageStore.$patch({ pageStart: options.pageStart });
    if (options.pageLimit !== undefined) workspacePageStore.$patch({ pageLimit: options.pageLimit });
    await workspacePageStore.listWorkspaces({ query: workspaceListApiQuery });
};

const queryTagHelper = useQueryTags({ keyItemSets: WORKSPACE_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;
let workspaceListApiQuery = workspaceListApiQueryHelper.data;

const getListWorkspaces = async () => {
    workspaceListApiQueryHelper
        .setPageStart(workspacePageState.pageStart).setPageLimit(workspacePageState.pageLimit)
        .setFilters(queryTagHelper.filters.value);
    await workspacePageStore.listWorkspaces({ query: workspaceListApiQuery });
};

const handleExport = async () => {
    try {
        await downloadExcel({
            url: '/identity/workspace/list',
            param: {
                query: workspaceListApiQueryHelper.data,
            },
            fields: EXCEL_TABLE_FIELDS,
            file_name_prefix: FILE_NAME_PREFIX.workspace,
            timezone: storeState.timezone,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Init */
(() => {
    getListWorkspaces();
})();

</script>

<template>
    <section class="workspace-management-table">
        <p-toolbox-table search-type="query"
                         searchable
                         selectable
                         sortable
                         exportable
                         :loading="false"
                         disabled
                         :items="workspacePageState.workspaces"
                         :select-index="workspacePageState.selectedIndices"
                         :fields="WORKSPACE_TABLE_FIELDS"
                         sort-by="name"
                         :sort-desc="true"
                         :total-count="workspacePageState.totalCount"
                         :key-item-sets="WORKSPACE_SEARCH_HANDLERS.keyItemSets"
                         :value-handler-map="WORKSPACE_SEARCH_HANDLERS.valueHandlerMap"
                         :query-tags="queryTags"
                         :style="{height: `${props.tableHeight}px`}"
                         :get-row-selectable="getRowSelectable"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template #toolbox-left>
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   :placeholder="$t('IAM.WORKSPACES.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-management-table {
    .left-toolbox-item-select-dropdown {
        min-width: 6.5rem;
    }
}
</style>
