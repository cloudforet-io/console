<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PButton, PBadge, PStatus,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleState } from '@/api-clients/identity/role/type';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import RoleDeleteModal
    from '@/services/iam/components/RoleDeleteModal.vue';
import RoleStateUpdateModal from '@/services/iam/components/RoleStateUpdateModal.vue';
import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
import {
    EXCEL_TABLE_FIELDS,
    ROLE_SEARCH_HANDLERS,
} from '@/services/iam/constants/role-constant';
import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';
import { useRolePageStore } from '@/services/iam/store/role-page-store';

interface Props {
    tableHeight?: number;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const userStore = useUserStore();
const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const router = useRouter();

const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(rolePageState.pageStart).setPageLimit(rolePageState.pageLimit)
    .setSort('is_managed', true);
const queryTagHelper = useQueryTags({ keyItemSets: ROLE_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;
let roleListApiQuery = roleListApiQueryHelper.data;

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    fields: computed<DataTableFieldType[]>(() => {
        const defaultFields: DataTableFieldType[] = [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'role_type', label: 'Role Type' },
            { name: 'created_at', label: 'Created', sortable: false },
        ];
        if (props.hasReadWriteAccess) {
            defaultFields.push({ name: 'edit_button', label: ' ', sortable: false });
        }
        return defaultFields;
    }),
});
const modalState = reactive({
    modalVisible: false,
    stateModalVisible: false,
    selectedState: '' as RoleState,
    loading: false,
});
const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item',
        name: 'edit',
        label: i18n.t('IAM.ROLE.EDIT'),
        disabled: rolePageState.selectedIndices.length === 0 || rolePageStore.selectedRoles.filter((item) => item.is_managed).length > 0,
    },
    {
        type: 'item',
        name: 'delete',
        label: i18n.t('IAM.ROLE.DELETE'),
        disabled: rolePageState.selectedIndices.length === 0 || rolePageStore.selectedRoles.filter((item) => item.is_managed).length > 0,
    },
    { type: 'divider' },
    {
        type: 'item',
        name: 'enabled',
        label: i18n.t('IAM.ROLE.ENABLE'),
        disabled: rolePageState.selectedIndices.length === 0
            || rolePageStore.selectedRoles.filter((item) => item.is_managed).length > 0
            || rolePageStore.selectedRoles.filter((item) => item.state === ROLE_STATE.DISABLED).length === 0,
    },
    {
        type: 'item',
        name: 'disabled',
        label: i18n.t('IAM.ROLE.DISABLE'),
        disabled: rolePageState.selectedIndices.length === 0
            || rolePageStore.selectedRoles.filter((item) => item.is_managed).length > 0
            || rolePageStore.selectedRoles.filter((item) => item.state === ROLE_STATE.ENABLED).length === 0,
    },
]));

/* Component */
const getRowSelectable = (item) => item.role_type !== ROLE_TYPE.SYSTEM_ADMIN;
const handleEditRole = (id: string) => {
    router.push({ name: ADMIN_IAM_ROUTE.ROLE.EDIT._NAME, params: { id } });
};
const handleSelectDropdown = (name) => {
    switch (name) {
    case 'edit':
        handleEditRole(rolePageStore.selectedRoles[0].role_id);
        break;
    case 'delete':
        modalState.modalVisible = true;
        break;
    case 'enabled':
        modalState.stateModalVisible = true;
        modalState.selectedState = ROLE_STATE.ENABLED;
        break;
    case 'disabled':
        modalState.stateModalVisible = true;
        modalState.selectedState = ROLE_STATE.DISABLED;
        break;
    default: break;
    }
};
const handleSelect = (index: number[]) => {
    rolePageStore.$patch({ selectedIndices: index });
};
const handleChange = async (options: ToolboxOptions = {}) => {
    roleListApiQuery = getApiQueryWithToolboxOptions(roleListApiQueryHelper, options) ?? roleListApiQuery;
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
    if (options.pageStart !== undefined) rolePageStore.$patch({ pageStart: options.pageStart });
    if (options.pageLimit !== undefined) rolePageStore.$patch({ pageLimit: options.pageLimit });
    await getListRoles();
};

/* API */
const getListRoles = async () => {
    modalState.loading = true;
    try {
        roleListApiQueryHelper
            .setFilters(queryTagHelper.filters.value);
        await rolePageStore.listRoles({ query: roleListApiQuery });
    } finally {
        modalState.loading = false;
    }
};
const handleExport = async () => {
    try {
        await downloadExcel({
            url: '/identity/role/list',
            param: {
                query: roleListApiQueryHelper.data,
            },
            fields: EXCEL_TABLE_FIELDS,
            file_name_prefix: FILE_NAME_PREFIX.role,
            timezone: storeState.timezone,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Init */
(() => {
    getListRoles();
})();
</script>

<template>
    <section class="role-management-table">
        <p-toolbox-table search-type="query"
                         searchable
                         selectable
                         sortable
                         exportable
                         :loading="modalState.loading"
                         disabled
                         :items="rolePageState.roles"
                         :select-index="rolePageState.selectedIndices"
                         :fields="state.fields"
                         sort-by="name"
                         :sort-desc="true"
                         :total-count="rolePageState.totalCount"
                         :key-item-sets="ROLE_SEARCH_HANDLERS.keyItemSets"
                         :value-handler-map="ROLE_SEARCH_HANDLERS.valueHandlerMap"
                         :query-tags="queryTags"
                         :style="{height: `${props.tableHeight}px`}"
                         :get-row-selectable="getRowSelectable"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   reset-selection-on-menu-close
                                   :placeholder="$t('IAM.ROLE.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role_type-format="{value, item}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ useRoleFormatter(value).name }}</span>
                    <p-badge v-if="item?.is_managed"
                             badge-type="solid-outline"
                             style-type="gray500"
                             class="managed-badge"
                    >
                        <span>{{ $t('IAM.ROLE.MANAGED') }}</span>
                    </p-badge>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #col-edit_button-format="{ item }">
                <p-button v-if="!item?.is_managed && item.role_type !== ROLE_TYPE.SYSTEM_ADMIN"
                          size="sm"
                          style-type="tertiary"
                          icon-left="ic_edit"
                          @click="handleEditRole(item.role_id)"
                >
                    {{ $t('IAM.ROLE.EDIT') }}
                </p-button>
            </template>
        </p-toolbox-table>
        <role-delete-modal :visible.sync="modalState.modalVisible"
                           @refresh="handleChange"
        />
        <role-state-update-modal :visible.sync="modalState.stateModalVisible"
                                 :state="modalState.selectedState"
                                 @refresh="handleChange"
        />
    </section>
</template>

<style lang="postcss" scoped>
.role-management-table {
    .left-toolbox-item-select-dropdown {
        min-width: 6.5rem;
    }
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
        .managed-badge {
            min-width: 4.15rem;
            min-height: 0;
            padding-top: 0.15rem;
            padding-bottom: 0.15rem;
        }
    }
}
.description {
    @apply truncate;
    width: 25ch;
}
</style>
