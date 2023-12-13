<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PToolboxTable, PSelectDropdown, PButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import dayjs from 'dayjs';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import RoleDeleteModal
    from '@/services/administration/components/RoleDeleteModal.vue';
import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import {
    EXCEL_TABLE_FIELDS,
    ROLE_SEARCH_HANDLERS,
    ROLE_TABLE_FIELDS,
} from '@/services/administration/constants/role-constant';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const DEFAULT_PAGE_LIMIT = 15;

interface Props {
    tableHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const route = useRoute();
const router = useRouter();

const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(DEFAULT_PAGE_LIMIT)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);
let roleListApiQuery = roleListApiQueryHelper.data;

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    refinedUserItems: computed(() => rolePageState.roles.map((role) => ({
        ...role,
        created_at: dayjs.tz(dayjs.utc(role.created_at), storeState.timezone).format('YYYY-MM-DD hh:mm:ss'),
    }))),
    tags: roleListApiQueryHelper.setKeyItemSets(ROLE_SEARCH_HANDLERS.keyItemSets).queryTags,
});
const modalState = reactive({
    modalVisible: false,
});
const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item',
        name: 'edit',
        label: i18n.t('IAM.ROLE.EDIT'),
        disabled: rolePageState.selectedIndices.length === 0,
    },
    {
        type: 'item',
        name: 'delete',
        label: i18n.t('IAM.ROLE.DELETE'),
        disabled: rolePageState.selectedIndices.length === 0,
    },
]));

/* Component */
const getRowSelectable = (item) => item.role_type === ROLE_TYPE.SYSTEM_ADMIN;
const handleEditRole = (id: string) => {
    router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME, params: { id } });
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
        await replaceUrlQuery('filters', roleListApiQueryHelper.rawQueryStrings);
    }
    await rolePageStore.listRoles({ query: roleListApiQuery });
};

/* API */
const getListRoles = async () => {
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
                         :items="state.refinedUserItems"
                         :select-index="rolePageState.selectedIndices"
                         :fields="ROLE_TABLE_FIELDS"
                         sort-by="name"
                         :sort-desc="true"
                         :total-count="rolePageState.totalCount"
                         :key-item-sets="ROLE_SEARCH_HANDLERS.keyItemSets"
                         :value-handler-map="ROLE_SEARCH_HANDLERS.valueHandlerMap"
                         :query-tags="state.tags"
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
                                   :placeholder="$t('IAM.ROLE.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #col-role_type-format="{value}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ useRoleFormatter(value).name }}</span>
                </span>
            </template>
            <template #col-edit_button-format="{ item }">
                <p-button v-if="item.role_type !== ROLE_TYPE.SYSTEM_ADMIN"
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
    }
}
.description {
    @apply truncate;
    width: 25ch;
}
</style>
