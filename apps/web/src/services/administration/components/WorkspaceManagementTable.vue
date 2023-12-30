<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PSelectDropdown, PStatus, PToolboxTable, PLink,
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

const emit = defineEmits<{(e: 'select-action', value: string): void; }>();

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

const handleSelectDropdown = (name: string) => {
    emit('select-action', name);
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
    await workspacePageStore.load({ query: workspaceListApiQueryHelper.data });
};

const { queryTags } = queryTagsHelper;

const handleExport = async () => {
    try {
        await downloadExcel({
            data: workspacePageState.workspaces,
            fields: EXCEL_TABLE_FIELDS,
            file_name_prefix: FILE_NAME_PREFIX.workspace,
            timezone: storeState.timezone,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};


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
            <template #col-name-format="{value}">
                <p-link :text="value"
                        action-icon="internal-link"
                        new-tab
                />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-users-format="{value}">
                <p-link :text="value"
                        action-icon="internal-link"
                        new-tab
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
