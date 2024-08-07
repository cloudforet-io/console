<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PButton, PBadge,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/navigation/toolbox/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';


import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import RoleDeleteModal
    from '@/services/iam/components/RoleDeleteModal.vue';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import {
    EXCEL_TABLE_FIELDS,
    ROLE_SEARCH_HANDLERS,
    ROLE_TABLE_FIELDS,
} from '@/services/iam/constants/role-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { useRolePageStore } from '@/services/iam/store/role-page-store';

interface Props {
    tableHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;
const { getProperRouteLocation } = useProperRouteLocation();

const router = useRouter();

const roleListApiQueryHelper = new ApiQueryHelper()
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
        label: i18n.t('IAM.ROLE.EDIT'),
        disabled: rolePageState.selectedIndices.length === 0 || rolePageStore.selectedRoles.filter((item) => item.is_managed).length > 0,
    },
    {
        type: 'item',
        name: 'delete',
        label: i18n.t('IAM.ROLE.DELETE'),
        disabled: rolePageState.selectedIndices.length === 0 || rolePageStore.selectedRoles.filter((item) => item.is_managed).length > 0,
    },
]));

/* Component */
const getRowSelectable = (item) => item.role_type === ROLE_TYPE.SYSTEM_ADMIN;
const handleEditRole = (id: string) => {
    router.push(getProperRouteLocation({ name: IAM_ROUTE.ROLE.EDIT._NAME, params: { id } }));
};
const handleSelectDropdown = (name) => {
    switch (name) {
    case 'edit':
        handleEditRole(rolePageStore.selectedRoles[0].role_id);
        break;
    case 'delete':
        modalState.modalVisible = true;
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
    await rolePageStore.listRoles({ query: roleListApiQuery });
};

/* API */
const queryTagHelper = useQueryTags({ keyItemSets: ROLE_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;
let roleListApiQuery = roleListApiQueryHelper.data;
const getListRoles = async () => {
    roleListApiQueryHelper
        .setPageStart(rolePageState.pageStart).setPageLimit(rolePageState.pageLimit)
        .setFilters(queryTagHelper.filters.value);
    await rolePageStore.listRoles({ query: roleListApiQuery });
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
                         :loading="false"
                         disabled
                         :items="rolePageState.roles"
                         :select-index="rolePageState.selectedIndices"
                         :fields="ROLE_TABLE_FIELDS"
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
            <template #toolbox-left>
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   reset-selection-on-menu-close
                                   :placeholder="$t('IAM.ROLE.ACTION')"
                                   @select="handleSelectDropdown"
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
