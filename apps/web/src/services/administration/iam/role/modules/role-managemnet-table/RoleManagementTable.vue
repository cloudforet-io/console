<script lang="ts" setup>


import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItem } from '@cloudforet/core-lib/component-util/query-search/type';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown,
    PBadge, PButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ROLE_TYPE_BADGE_OPTION, ROLE_TYPE_LABEL } from '@/services/administration/iam/role/config';
import RoleDeleteModal
    from '@/services/administration/iam/role/modules/role-managemnet-table/modules/RoleDeleteModal.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { useRolePageStore } from '@/services/administration/store/role-page-store';


const DEFAULT_PAGE_LIMIT = 15;

interface Props {
    tableHeight: number;
    manageDisabled: boolean;
}

withDefaults(defineProps<Props>(), {
    tableHeight: 400,
    manageDisabled: false,
});

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const currentRoute = router.currentRoute.value;
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(DEFAULT_PAGE_LIMIT)
    .setSort('name', true)
    .setFiltersAsRawQueryString(currentRoute.query?.filters as undefined|string|(string|null)[]);

const roleSearchHandler = reactive({
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'tags.description', label: 'Description' },
            { name: 'role_type', label: 'Role Type', valueSet: ROLE_TYPE_LABEL },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ] as KeyItem[],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('identity.Role', 'name'),
        role_type: makeEnumValueHandler(ROLE_TYPE_LABEL),
        'tags.description': makeDistinctValueHandler('identity.Role', 'tags.description'),
        created_at: makeDistinctValueHandler('identity.Role', 'created_at', 'datetime'),
    },
});
const state = reactive({
    dropdownMenu: computed(() => ([
        {
            type: 'item',
            name: 'edit',
            label: t('IAM.ROLE.EDIT'),
            disabled: rolePageState.selectedIndices.length > 1 || !state.isSelected,
        },
        {
            type: 'item', name: 'delete', label: t('IAM.ROLE.DELETE'), disabled: !state.isSelected,
        },
    ] as MenuItem[])),
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'tags.description', label: 'Description', sortable: false },
        { name: 'role_type', label: 'Role Type' },
        { name: 'created_at', label: 'Created', sortable: false },
        { name: 'edit_button', label: ' ', sortable: false },
    ],
    excelFields: [
        { key: 'name', name: 'Name' },
        { key: 'tags.description', name: 'Description' },
        { key: 'role_type', name: 'Role Type' },
        { key: 'created_at', name: 'Created' },
    ],
    deleteModalVisible: false,
    // selected
    isSelected: computed(() => rolePageState.selectedIndices.length > 0),
    tags: roleListApiQueryHelper.setKeyItemSets(roleSearchHandler.keyItemSets).queryTags,
    sortBy: 'name',
});
let roleListApiQuery = roleListApiQueryHelper.data;

const openDeleteModal = () => {
    state.deleteModalVisible = true;
};
// event
const handleCreateRole = () => { router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME }); };
const handleEditRole = (id: string) => { router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME, params: { id } }); };
const handleSelectDropdown = (name) => {
    switch (name) {
    case 'edit':
        router.push({
            name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME,
            params: { id: rolePageStore.selectedRoles[0].role_id },
        });
        break;
    case 'delete': openDeleteModal(); break;
    default: break;
    }
};
const handleSelect = (index) => {
    rolePageStore.$patch({ selectedIndices: index });
};
const handleChange = async (options: ToolboxOptions = {}) => {
    roleListApiQuery = getApiQueryWithToolboxOptions(roleListApiQueryHelper, options) ?? roleListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', roleListApiQueryHelper.rawQueryStrings);
    }
    await rolePageStore.listRoles(roleListApiQuery);
};
const handleExport = async () => {
    try {
        await store.dispatch('file/downloadExcel', {
            url: '/identity/role/list',
            param: {
                query: roleListApiQueryHelper.data,
            },
            fields: state.excelFields,
            file_name_prefix: FILE_NAME_PREFIX.role,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
(async () => {
    await rolePageStore.listRoles(roleListApiQuery);
})();

const saveSelectedValueToStore = (selectedIndices: number[]) => {
    rolePageStore.$patch({ selectedIndices });
};

watch(() => rolePageState.selectedIndices, (after) => {
    saveSelectedValueToStore(after);
});

</script>

<template>
    <section class="role-management-table">
        <p-toolbox-table v-model:select-index="rolePageState.selectedIndices"
                         search-type="query"
                         sortable
                         selectable
                         exportable
                         :loading="rolePageState.loading"
                         :items="rolePageState.roles"
                         :fields="state.fields"
                         :sort-desc="true"
                         :sort-by="state.sortBy"
                         :total-count="rolePageState.totalCount"
                         :style="{height: `${tableHeight}px`}"
                         :key-item-sets="roleSearchHandler.keyItemSets"
                         :value-handler-map="roleSearchHandler.valueHandlerMap"
                         :query-tags="state.tags"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template #toolbox-left>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="manageDisabled"
                          @click="handleCreateRole"
                >
                    {{ t('IAM.ROLE.CREATE') }}
                </p-button>
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :items="state.dropdownMenu"
                                   :disabled="manageDisabled"
                                   @select="handleSelectDropdown"
                >
                    {{ t('IAM.ROLE.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-role_type-format="{ value }">
                <p-badge v-if="value"
                         badge-type="solid-outline"
                         :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType"
                >
                    {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                </p-badge>
            </template>
            <template #[`col-tags.description-format`]="{ value }">
                <div class="description">
                    {{ value ? value : '--' }}
                </div>
            </template>
            <template #col-edit_button-format="{ item }">
                <p-button size="sm"
                          style-type="tertiary"
                          icon-left="ic_edit"
                          :disabled="manageDisabled"
                          @click="handleEditRole(item.role_id)"
                >
                    {{ t('IAM.ROLE.EDIT') }}
                </p-button>
            </template>
        </p-toolbox-table>
        <role-delete-modal v-model:visible="state.deleteModalVisible"
                           @refresh="handleChange"
        />
    </section>
</template>

<style lang="postcss" scoped>
.left-toolbox-item-select-dropdown {
    margin-left: 1rem;
}
.description {
    @apply truncate;
    width: 25ch;
}
</style>
