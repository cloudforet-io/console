<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PBadge, PStatus, PToolboxTable, PButton, PSelectDropdown, PTooltip,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { AddModalMenuItem } from '@/services/administration/components/UserManagementAddModal.vue';
import UserManagementTableToolbox from '@/services/administration/components/UserManagementTableToolbox.vue';
import {
    calculateTime, userStateFormatter, useRoleFormatter, userMfaFormatter,
} from '@/services/administration/composables/refined-table-data';
import { USER_SEARCH_HANDLERS } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const route = useRoute();
const emit = defineEmits<{(e: 'confirm'): void; }>();

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);
const roleListApiQueryHelper = new ApiQueryHelper();

const state = reactive({
    refinedUserItems: computed(() => userPageState.users.map((user) => ({
        ...user,
        api_key_count: user?.api_key_count ?? 0,
        mfa: user?.mfa?.state === 'ENABLED' ? 'ON' : 'OFF',
        last_accessed_at: calculateTime(user?.last_accessed_at, userPageStore.timezone),
    }))),
    isSelected: computed(() => userPageState.selectedIndices.length > 0),
    tags: userListApiQueryHelper.setKeyItemSets(USER_SEARCH_HANDLERS.keyItemSets).queryTags,
});
const tableState = reactive({
    userTableFields: computed(() => {
        const additionalFields: DefinitionField[] = [];
        if (userPageState.isAdminMode) {
            additionalFields.push(
                { name: 'mfa', label: 'Multi-factor Auth', sortable: false },
                { name: 'api_key_count', label: 'API Key', sortable: false },
            );
        }
        const baseFields = [
            { name: 'user_id', label: 'User ID', sortable: false },
            { name: 'name', label: 'Name', sortable: false },
            { name: 'state', label: 'State', sortable: false },
            ...additionalFields,
            { name: 'role_type', label: userPageState.isAdminMode ? 'Role Type' : 'Role', sortable: false },
            { name: 'tags', label: 'Tags' },
            { name: 'auth_type', label: 'Auth Type', sortable: false },
            { name: 'last_accessed_at', label: 'Last Activity', sortable: false },
            { name: 'timezone', label: 'Timezone', sortable: false },
        ];
        return userPageStore.isWorkspaceOwner
            ? [
                ...baseFields,
                { name: 'role_binding_info', label: ' ', sortable: false },
            ]
            : baseFields;
    }),
});
const dropdownState = reactive({
    loading: false,
    visibleMenu: false,
    searchText: '',
    selectedItems: [] as SelectDropdownMenuItem[],
    menuItems: [] as SelectDropdownMenuItem[],
});

/* Component */
const handleSelect = async (index) => {
    userPageStore.$patch({ selectedIndices: index });
};
const dropdownMenuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: dropdownState.menuItems,
    };
};
const handleSelectDropdownItem = async (value, rowIndex) => {
    try {
        await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>({
            user_id: state.refinedUserItems[rowIndex].user_id || '',
            role_id: value.name || '',
            resource_group: RESOURCE_GROUP.WORKSPACE,
        });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.ALT_S_CHANGE_ROLE'), '');
        emit('confirm');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};

/* API */
let userListApiQuery = userListApiQueryHelper.data;
const handleChange = async (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', userListApiQueryHelper.rawQueryStrings);
    }
    if (userPageState.isAdminMode) {
        await userPageStore.listUsers({ query: userListApiQuery });
    } else {
        await userPageStore.listWorkspaceUsers({ query: userListApiQuery });
    }
};
const handleClickButton = async (value: RoleBindingModel) => {
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete({
            role_binding_id: value.role_binding_id,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        emit('confirm');
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_REMOVE_USER'), '');
        ErrorHandler.handleError(e);
    }
};
const fetchListRoles = async (inputText: string) => {
    dropdownState.loading = true;

    roleListApiQueryHelper.setFilters([{
        k: 'role_type',
        v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER],
        o: '=',
    }]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }
    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: roleListApiQueryHelper.data,
        });
        dropdownState.menuItems = results?.map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        })) as AddModalMenuItem[];
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }
};
</script>

<template>
    <section class="user-management-table">
        <p-toolbox-table
            search-type="query"
            searchable
            selectable
            sortable
            :loading="userPageState.loading"
            :items="state.refinedUserItems"
            :select-index="userPageState.selectedIndices"
            :fields="tableState.userTableFields"
            sort-by="name"
            :sort-desc="true"
            :total-count="userPageState.totalCount"
            :key-item-sets="USER_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="USER_SEARCH_HANDLERS.valueHandlerMap"
            :query-tags="state.tags"
            :style="{height: `${props.tableHeight}px`}"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange()"
        >
            <template #toolbox-left>
                <user-management-table-toolbox v-if="userPageState.isAdminMode" />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role_type-format="{value, rowIndex}">
                <div class="role-type-wrapper">
                    <p-tooltip position="bottom"
                               :contents="useRoleFormatter(value).name"
                               class="tooltip"
                    >
                        <img :src="useRoleFormatter(value).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                    </p-tooltip>
                    <span>{{ useRoleFormatter(value, !userPageState.isAdminMode).name }}</span>
                    <p-select-dropdown v-if="userPageStore.isWorkspaceOwner && value !== ROLE_TYPE.DOMAIN_ADMIN"
                                       is-filterable
                                       use-fixed-menu-style
                                       menu-position="right"
                                       style-type="icon-button"
                                       :visible-menu="dropdownState.visibleMenu"
                                       :loading="dropdownState.loading"
                                       :search-text.sync="dropdownState.searchText"
                                       :selected="dropdownState.selectedItems"
                                       :handler="dropdownMenuHandler"
                                       class="role-select-dropdown"
                                       @select="handleSelectDropdownItem($event, rowIndex)"
                    >
                        <template #menu-item--format="{item}">
                            <div class="role-menu-item">
                                <img :src="useRoleFormatter(item.role_type).image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                                <div class="role-info-wrapper">
                                    <span>{{ item.label }}</span>
                                    <span class="role-type">({{ item.role_type }})</span>
                                </div>
                            </div>
                        </template>
                    </p-select-dropdown>
                </div>
            </template>
            <template #col-mfa-format="{value}">
                <p-status v-bind="userMfaFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-last_accessed_at-format="{ value }">
                <span v-if="value === -1">
                    No Activity
                </span>
                <span v-else-if="value === 0">
                    {{ $t('IAM.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="value === 1">
                    {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ value }} {{ $t('IAM.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #col-tags-format="{value}">
                <template v-if="!!Object.keys(value).length">
                    <p-badge v-for="([key, val], idx) in Object.entries(value)"
                             :key="`${key}-${val}-${idx}`"
                             badge-type="subtle"
                             shape="square"
                             style-type="gray200"
                             class="mr-2"
                    >
                        {{ key }}: {{ val }}
                    </p-badge>
                </template>
                <template v-else>
                    <span />
                </template>
            </template>
            <template #col-role_binding_info-format="{value}">
                <p-button style-type="tertiary"
                          size="sm"
                          class="remove-button"
                          @click="handleClickButton(value)"
                >
                    {{ $t('IAM.USER.MAIN.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.user-management-table {
    .role-type-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.25rem;
        }
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
        .role-select-dropdown {
            width: auto;
            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    width: 1rem;
                    height: 1rem;
                }
                .role-info-wrapper {
                    @apply flex flex-col;
                    gap: 0.25rem;
                    .role-type {
                        @apply text-gray-500;
                    }
                }
            }
        }
    }
}
</style>
