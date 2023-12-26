<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PSelectDropdown, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import {
    setApiQueryWithToolboxOptions,
} from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import WorkspacesDeleteModal from '@/services/administration/components/WorkspacesDeleteModal.vue';
import WorkspacesSetEnableModal from '@/services/administration/components/WorkspacesSetEnableModal.vue';
import { userStateFormatter } from '@/services/administration/composables/refined-table-data';
import {
    EXCEL_TABLE_FIELDS,
    WORKSPACE_SEARCH_HANDLERS, WORKSPACE_STATE,
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

const router = useRouter();
const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setSort('name', true);
const queryTagsHelper = useQueryTags({ keyItemSets: WORKSPACE_SEARCH_HANDLERS.keyItemSets });
queryTagsHelper.setURLQueryStringFilters(router.currentRoute.query.filters);

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});

const modalState = reactive({
    deleteModalVisible: false,
    setEnableModalVisible: false,
    enableState: undefined as undefined| typeof WORKSPACE_STATE[keyof typeof WORKSPACE_STATE],
});

const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item',
        name: 'edit',
        label: i18n.t('IAM.WORKSPACES.EDIT'),
        disabled: workspacePageState.selectedIndices.length !== 1,
    },
    {
        type: 'item',
        name: 'delete',
        label: i18n.t('IAM.WORKSPACES.DELETE'),
        disabled: workspacePageState.selectedIndices.length !== 1,
    },
    {
        type: 'divider',
    },
    {
        type: 'item',
        name: 'enable',
        label: i18n.t('IAM.WORKSPACES.ENABLE'),
        disabled: workspacePageState.selectedIndices.length !== 1 || (workspacePageState.selectedIndices.length === 1 && workspacePageStore.selectedWorkspaces[0].state === 'ENABLED'),
    },
    {
        type: 'item',
        name: 'disable',
        label: i18n.t('IAM.WORKSPACES.DISABLE'),
        disabled: workspacePageState.selectedIndices.length !== 1 || (workspacePageState.selectedIndices.length === 1 && workspacePageStore.selectedWorkspaces[0].state === 'DISABLED'),
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
        modalState.deleteModalVisible = true;
        break;
    case 'enable':
        modalState.enableState = WORKSPACE_STATE.ENABLE;
        modalState.setEnableModalVisible = true;
        break;
    case 'disable':
        if (workspacePageState.workspaces.filter((workspace) => workspace.state === 'ENABLED').length === 1) {
            Vue.notify({
                group: 'toastTopCenter',
                type: 'alert',
                title: i18n.t('IAM.WORKSPACES.REQUIRED_ENABLE_WORKSPACE'),
                duration: 2000,
                speed: 1,
            });
        } else {
            modalState.enableState = WORKSPACE_STATE.DISABLE;
            modalState.setEnableModalVisible = true;
        }
        break;
    default: break;
    }
};

const handleSelect = (index: number[]) => {
    workspacePageStore.$patch({ selectedIndices: index });
};

const handleChange = async (options: ToolboxOptions = {}) => {
    setApiQueryWithToolboxOptions(workspaceListApiQueryHelper, options);
    if (options.queryTags !== undefined) {
        queryTagsHelper.setQueryTags(options.queryTags);
        await replaceUrlQuery('filters', queryTagsHelper.urlQueryStringFilters.value);
    }
    if (options.pageStart !== undefined) workspacePageStore.$patch({ pageStart: options.pageStart });
    if (options.pageLimit !== undefined) workspacePageStore.$patch({ pageLimit: options.pageLimit });
    await workspacePageStore.listWorkspaces({ query: workspaceListApiQueryHelper.data });
};

const { queryTags } = queryTagsHelper;

const getListWorkspaces = async () => {
    workspaceListApiQueryHelper
        .setPageStart(workspacePageState.pageStart).setPageLimit(workspacePageState.pageLimit)
        .setFilters(queryTagsHelper.filters.value);
    await workspacePageStore.listWorkspaces({ query: workspaceListApiQueryHelper.data });
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
        <workspaces-delete-modal :visible.sync="modalState.deleteModalVisible"
                                 @refresh="handleChange()"
        />
        <workspaces-set-enable-modal :visible.sync="modalState.setEnableModalVisible"
                                     :enable-modal-type="modalState.enableState"
                                     @refresh="handleChange()"
        />
    </section>
</template>

<style lang="postcss" scoped>
.workspace-management-table {
    .left-toolbox-item-select-dropdown {
        min-width: 6.5rem;
    }
}
</style>
