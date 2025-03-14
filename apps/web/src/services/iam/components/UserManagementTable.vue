<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PStatus, PToolboxTable, PButton, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleBindingDeleteParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/delete';
import type { RoleBindingUpdateRoleParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/update-role';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import UserManagementRemoveModal from '@/services/iam/components/UserManagementRemoveModal.vue';
import UserManagementTableToolbox from '@/services/iam/components/UserManagementTableToolbox.vue';
import {
    calculateTime, userStateFormatter, useRoleFormatter, userMfaFormatter,
} from '@/services/iam/composables/refined-table-data';
import { USER_SEARCH_HANDLERS, USER_STATE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { ExtendUserListItemType } from '@/services/iam/types/user-type';

interface Props {
    tableHeight: number;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
    hasReadWriteAccess: true,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;
const userStore = useUserStore();

const roleListApiQueryHelper = new ApiQueryHelper();
const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(userPageState.pageStart).setPageLimit(userPageState.pageLimit)
    .setSort('name', true);
let userListApiQuery = userListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: USER_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;

const storeState = reactive({
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
});
const state = reactive({
    selectedRemoveItem: '',
    refinedUserItems: computed<ExtendUserListItemType[]>(() => userPageState.users.map((user) => ({
        ...user,
        type: user?.role_binding_info?.workspace_group_id ? 'Workspace Group' : 'Workspace',
        mfa_state: user?.mfa?.state === 'ENABLED' ? 'ON' : 'OFF',
        last_accessed_at: user?.last_accessed_at,
    }))),
    // refinedUserItems: computed<ExtendUserListItemType[]>(() => userPageState.users.map)
});
const tableState = reactive({
    userTableFields: computed<DataTableFieldType[]>(() => {
        const additionalFields: DataTableFieldType[] = [];
        if (userPageState.isAdminMode) {
            additionalFields.push(
                { name: 'mfa_state', label: 'MFA', sortKey: 'mfa.state' },
                {
                    name: 'role_id', label: 'Admin Role', sortable: true, sortKey: 'role_type',
                },
            );
        } else {
            additionalFields.push(
                { name: 'type', label: 'Type', sortable: false },
                { name: 'role_binding', label: 'Role', sortable: false },
                { name: 'user_group', label: 'User Group', sortable: false },
            );
        }
        const baseFields = [
            { name: 'user_id', label: 'User ID' },
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            ...additionalFields,
            { name: 'tags', label: 'Tags', sortable: false },
            { name: 'auth_type', label: 'Auth Type' },
            { name: 'last_accessed_at', label: 'Last Activity' },
        ];
        return userPageGetters.isWorkspaceOwner && props.hasReadWriteAccess
            ? [
                ...baseFields,
                { name: 'remove_button', label: ' ', sortable: false },
            ]
            : baseFields;
    }),
    valueHandlerMap: computed(() => {
        const resourceType = userPageState.isAdminMode ? 'identity.User' : 'identity.WorkspaceUser';
        return {
            user_id: makeDistinctValueHandler(resourceType, 'user_id'),
            name: makeDistinctValueHandler(resourceType, 'name', 'string', [{ k: 'name', v: '', o: 'not' }]),
            state: makeEnumValueHandler(USER_STATE),
            email: makeDistinctValueHandler(resourceType, 'email'),
            auth_type: makeDistinctValueHandler(resourceType, 'auth_type'),
            last_accessed_at: makeDistinctValueHandler(resourceType, 'last_accessed_at', 'datetime'),
            tags: makeDistinctValueHandler(resourceType, 'tags'),
        };
    }),
});
const dropdownState = reactive({
    loading: false,
    visibleMenu: false,
    searchText: '',
    menuItems: [] as SelectDropdownMenuItem[],
});
const modalState = reactive({
    visible: false,
    title: '',
    loading: false,
});

/* Component */
const handleSelect = async (index) => {
    userPageState.selectedIndices = index;
};
const handleClickButton = async (value: RoleBindingModel|undefined) => {
    if (!value) return;
    state.selectedRemoveItem = value.role_binding_id;
    modalState.visible = true;
    modalState.title = i18n.t('IAM.USER.MAIN.MODAL.REMOVE_WORKSPACE_TITLE') as string;
};
const handleChange = (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
    if (options.queryTags !== undefined) {
        userPageStore.$patch((_state) => {
            _state.state.searchFilters = userListApiQueryHelper.filters;
        });
    }
    if (options.pageStart !== undefined) userPageState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) userPageState.pageLimit = options.pageLimit;
    fetchUserList();
};
const closeRemoveModal = () => {
    modalState.visible = false;
};
/* API */
const dropdownMenuHandler: AutocompleteHandler = async (inputText: string) => {
    dropdownState.loading = true;

    roleListApiQueryHelper.setFilters([
        { k: 'role_type', v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER], o: '=' },
        { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
    ]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }
    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: {
                ...roleListApiQueryHelper.data,
                filter: [
                    ...(roleListApiQueryHelper.data?.filter || []),
                    { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                ],
            },
        });
        dropdownState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }

    return {
        results: dropdownState.menuItems,
    };
};
const handleSelectDropdownItem = async (value, rowIndex) => {
    try {
        const response = await SpaceConnector.clientV2.identity.roleBinding.updateRole<RoleBindingUpdateRoleParameters, RoleBindingModel>({
            role_binding_id: state.refinedUserItems[rowIndex]?.role_binding_info?.role_binding_id || '',
            role_id: value || '',
        });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.ALT_S_CHANGE_ROLE'), '');
        const roleName = userPageGetters.roleMap[response.role_id]?.name ?? '';
        userPageStore.$patch((_state) => {
            _state.state.users[rowIndex].role_binding = {
                name: roleName,
                type: response.role_type,
            };
        });
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const fetchUserList = async () => {
    userPageState.loading = true;
    try {
        if (userPageState.isAdminMode) {
            await userPageStore.listUsers({ query: userListApiQuery });
        } else {
            await userPageStore.listWorkspaceUsers({ query: userListApiQuery });
        }
    } finally {
        userPageState.loading = false;
    }
};
const handleRemoveButton = async () => {
    modalState.loading = true;
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>({
            role_binding_id: state.selectedRemoveItem,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        closeRemoveModal();
        await fetchUserList();
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_REMOVE_USER'), '');
        ErrorHandler.handleError(e);
    } finally {
        modalState.loading = false;
    }
};

const isWorkspaceGroupUser = (item: ExtendUserListItemType) => !!item?.role_binding_info?.workspace_group_id;
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
            :value-handler-map="tableState.valueHandlerMap"
            :query-tags="queryTags"
            :style="{height: `${props.tableHeight}px`}"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange()"
        >
            <template v-if="props.hasReadWriteAccess && userPageState.isAdminMode"
                      #toolbox-left
            >
                <user-management-table-toolbox />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role_id-format="{value}">
                <div v-if="userPageGetters.roleMap[value]?.name"
                     class="role-type-wrapper"
                >
                    <img :src="useRoleFormatter(userPageGetters.roleMap[value]?.role_type || ROLE_TYPE.USER).image"
                         alt="Role Type Icon"
                         class="role-type-icon"
                    >
                    <span class="pr-4">{{ userPageGetters.roleMap[value]?.name ?? '' }}</span>
                </div>
            </template>
            <template #col-role_binding-format="{value, rowIndex, item:fieldItem}">
                <div class="role-type-wrapper">
                    <p-select-dropdown v-if="userPageGetters.isWorkspaceOwner && state.refinedUserItems[rowIndex].user_id !== storeState.loginUserId"
                                       is-filterable
                                       use-fixed-menu-style
                                       style-type="transparent"
                                       :visible-menu="dropdownState.visibleMenu"
                                       :loading="dropdownState.loading"
                                       :search-text.sync="dropdownState.searchText"
                                       :handler="dropdownMenuHandler"
                                       :disabled="!props.hasReadWriteAccess || isWorkspaceGroupUser(fieldItem)"
                                       class="role-select-dropdown"
                                       @select="handleSelectDropdownItem($event, rowIndex)"
                    >
                        <template #dropdown-button>
                            <p-tooltip position="bottom"
                                       :contents="useRoleFormatter(value?.type).name"
                                       class="tooltip"
                            >
                                <img :src="useRoleFormatter(value?.type).image"
                                     alt="Role Type Icon"
                                     class="role-type-icon"
                                >
                            </p-tooltip>
                            <span>{{ value.name }}</span>
                        </template>
                        <template #menu-item--format="{item}">
                            <div class="role-menu-item">
                                <img :src="useRoleFormatter(item.role_type).image"
                                     alt="Role Type Icon"
                                     class="role-type-icon"
                                >
                                <p-tooltip position="bottom"
                                           :contents="item.label"
                                           class="role-label"
                                >
                                    <span>{{ item.label }}</span>
                                </p-tooltip>
                                <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                    <div v-else
                         class="flex gap-1"
                    >
                        <p-tooltip position="bottom"
                                   :contents="useRoleFormatter(value?.type).name"
                                   class="tooltip"
                        >
                            <img :src="useRoleFormatter(value?.type).image"
                                 alt="Role Type Icon"
                                 class="role-type-icon"
                            >
                        </p-tooltip>{{ value.name }}
                    </div>
                </div>
            </template>
            <template #col-mfa_state-format="{value}">
                <p-status v-bind="userMfaFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-last_accessed_at-format="{ value }">
                <span v-if="calculateTime(value, storeState.timezone) === -1">
                    -
                </span>
                <span v-else-if="calculateTime(value, storeState.timezone) === 0">
                    {{ $t('IAM.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="calculateTime(value, storeState.timezone) === 1">
                    {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ calculateTime(value, storeState.timezone) }} {{ $t('IAM.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #col-tags-format="{value}">
                <template v-if="value && !!Object.keys(value).length">
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
            <template #col-remove_button-format="{item}">
                <p-button v-if="!isWorkspaceGroupUser(item)"
                          style-type="negative-secondary"
                          size="sm"
                          class="remove-button"
                          @click.stop="handleClickButton(item?.role_binding_info)"
                >
                    {{ $t('IAM.USER.REMOVE') }}
                </p-button>
            </template>
            <template v-if="!userPageState.isAdminMode"
                      #col-user_group-format="{value}"
            >
                <div v-if="value.length > 0 && value.length < 4">
                    <p-badge v-for="(val, idx) in value"
                             :key="`${val.id}-${idx}`"
                             badge-type="subtle"
                             shape="square"
                             style-type="gray200"
                             class="mr-2"
                    >
                        {{ val.name }}
                    </p-badge>
                </div>
                <div v-else-if="value.length > 3"
                     class="flex"
                >
                    <div v-for="(val, idx) in value"
                         :key="`${val.id}-${idx}`"
                    >
                        <p-badge
                            v-if="idx < 3"
                            badge-type="subtle"
                            shape="square"
                            style-type="gray200"
                            class="mr-2"
                        >
                            {{ val.name }}
                        </p-badge>
                        <p-badge
                            v-if="idx === 3"
                            badge-type="subtle"
                            shape="round"
                            style-type="blue300"
                            class="mr-2"
                        >
                            + {{ value.length - 3 }}
                        </p-badge>
                        <div v-else-if="idx > 3" />
                    </div>
                </div>
                <div v-else />
            </template>
        </p-toolbox-table>
        <user-management-remove-modal v-if="modalState.visible"
                                      :visible.sync="modalState.visible"
                                      :title="modalState.title"
                                      :loading="modalState.loading"
                                      @confirm="handleRemoveButton"
        />
    </section>
</template>

<style lang="postcss" scoped>
.user-management-table {
    .role-type-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
            margin-right: 0.25rem;
        }
        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
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
                .role-label {
                    @apply truncate;
                    width: 14.375rem;
                }
                .role-type {
                    @apply text-label-sm text-gray-400;
                }
            }
        }
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .no-data {
        position: initial;
    }
}
</style>
