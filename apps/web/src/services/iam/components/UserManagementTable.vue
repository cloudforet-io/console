<script lang="ts" setup>
import {
    computed, onMounted, reactive, ref,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PBadge, PStatus, PToolboxTable, PButton, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';


import UserManagementRemoveModal from '@/services/iam/components/UserManagementRemoveModal.vue';
import UserManagementTableToolbox from '@/services/iam/components/UserManagementTableToolbox.vue';
import {
    calculateTime, userStateFormatter, useRoleFormatter, userMfaFormatter,
} from '@/services/iam/composables/refined-table-data';
import { useRoleBindingDeleteMutation } from '@/services/iam/composables/use-role-binding-delete-mutation';
import { useRoleBindingUpdateRoleMutation } from '@/services/iam/composables/use-role-binding-update-role-mutation';
import { useRoleListQuery } from '@/services/iam/composables/use-role-list-query';
import { useUserListPaginationQuery } from '@/services/iam/composables/use-user-list-pagination-query';
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
const appContextStore = useAppContextStore();

const roleListApiQueryHelper = new ApiQueryHelper();
const userListApiQueryHelper = new ApiQueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: USER_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;

const queryClient = useQueryClient();
const { key: userListQueryKey } = useServiceQueryKey('identity', 'user', 'list');
const { key: workspaceUserListQueryKey } = useServiceQueryKey('identity', 'workspace-user', 'list');
const { key: workspaceUserGetQueryKey } = useServiceQueryKey('identity', 'workspace-user', 'get', {
    contextKey: computed(() => userPageState.selectedUserIds[0] ?? ''),
});

const { roleListData } = useRoleListQuery();

const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
});
const roleMap = computed<Record<string, RoleModel>>(() => {
    const map: Record<string, RoleModel> = {};
    roleListData.value?.forEach((role) => {
        map[role.role_id] = role;
    });
    return map;
});
const state = reactive({
    selectedRemoveItem: '',
    refinedUserItems: computed<ExtendUserListItemType[]>(() => userList.value.map((user) => {
        const additionalItems: Record<string, any> = {};
        if (userPageState.isAdminMode) {
            additionalItems.mfa_state = user?.mfa?.state === 'ENABLED' ? 'ON' : 'OFF';
        } else {
            additionalItems.type = user?.role_binding_info?.workspace_group_id ? 'Workspace Group' : 'Workspace';
            additionalItems.role_binding = {
                type: user?.role_binding_info?.role_type ?? ROLE_TYPE.USER,
                name: roleMap.value[user?.role_binding_info?.role_id]?.name ?? '',
            };
            additionalItems.user_group = getUserGroupPerUser(user?.user_id);
        }

        return {
            ...user,
            ...additionalItems,
        };
    })),
});
const tableState = reactive({
    userTableFields: computed<DataTableFieldType[]>(() => {
        const additionalFields: DataTableFieldType[] = [];
        if (storeState.isAdminMode) {
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
    thisPage: 1,
    pageLimit: 15,
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
const queryState = reactive({
    sortKey: 'name',
    sortDesc: true,
});

/* Component */
const handleSelect = async (index) => {
    const selectedUserIds = index.map((i) => state.refinedUserItems[i].user_id);
    userPageStore.setSelectedUserIds(selectedUserIds);
    userPageStore.setSelectedIndices(index);
};

const handleClickButton = async (value: RoleBindingModel|undefined) => {
    if (!value) return;
    state.selectedRemoveItem = value.role_binding_id;
    modalState.visible = true;
    modalState.title = i18n.t('IAM.USER.MAIN.MODAL.REMOVE_WORKSPACE_TITLE') as string;
};
const handleChange = (options: any = {}) => {
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
    if (options.sortBy !== undefined && options.sortDesc !== undefined) {
        queryState.sortKey = options.sortBy;
        queryState.sortDesc = options.sortDesc;
    }
};

const handleRefresh = async () => {
    await userRefresh();
};

const closeRemoveModal = () => {
    modalState.visible = false;
};

/* API */
const {
    roleListData: _roleListData,
    roleListIsLoading,
    refetchRoleList,
} = useRoleListQuery(
    computed(() => {
        const filters: ConsoleFilter[] = [
            { k: 'role_type', v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER], o: '=' },
            { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
        ];
        if (dropdownState.searchText?.trim()) {
            filters.push({
                k: 'name',
                v: dropdownState.searchText.trim(),
                o: '',
            });
        }
        roleListApiQueryHelper.setFilters(filters as ConsoleFilter[]);
        return {
            query: {
                ...roleListApiQueryHelper.data,
                only: ['role_id', 'name', 'role_type'],
            },
        };
    }),
);

const dropdownMenuHandler: AutocompleteHandler = async () => {
    try {
        await refetchRoleList();
        dropdownState.menuItems = (_roleListData.value ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    }

    return {
        results: (_roleListData.value ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        })),
    };
};

const { mutateAsync: updateRoleBinding } = useRoleBindingUpdateRoleMutation({
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: workspaceUserListQueryKey.value });
        await queryClient.invalidateQueries({
            queryKey: workspaceUserGetQueryKey.value,
        });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.ALT_S_CHANGE_ROLE'), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, error.message);
    },
});

const handleSelectDropdownItem = async (value: string, rowIndex: number) => {
    await updateRoleBinding({
        role_binding_id: state.refinedUserItems[rowIndex]?.role_binding_info?.role_binding_id || '',
        role_id: value || '',
    });
};

const {
    data: userList, totalCount: userTotalCount, isLoading: userIsLoading, refresh: userRefresh,
} = useUserListPaginationQuery({
    params: computed(() => {
        userListApiQueryHelper.setSort(queryState.sortKey, queryState.sortDesc);

        userListApiQueryHelper.setFilters(queryTagHelper.filters.value);

        return {
            query: userListApiQueryHelper.data,
        } as UserListParameters;
    }),
    thisPage: computed(() => tableState.thisPage),
    pageSize: computed(() => tableState.pageLimit),
});

const { userGroupAPI } = useUserGroupApi();
const userGroupPerUser = ref<UserGroupModel[]>();

const { key: userGroupListQueryKey, params: userGroupListQueryParams } = useServiceQueryKey('identity', 'user-group', 'list', {
    params: computed(() => ({
        query: {
            only: ['user_group_id', 'name', 'users'],
        },
    })),
});

const { data: userGroupList } = useScopedQuery({
    queryKey: userGroupListQueryKey,
    queryFn: () => userGroupAPI.list(userGroupListQueryParams.value),
    select: (data) => data.results ?? [],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
    enabled: true,
}, ['WORKSPACE']);

onMounted(async () => {
    const { results } = await userGroupAPI.list({});
    userGroupPerUser.value = results;
});

const getUserGroupPerUser = (userId: string) => {
    const userGroupNames: string[] = [];
    userGroupList.value?.forEach((userGroup) => {
        if (userGroup.users !== undefined) {
            if (userGroup.users.includes(userId)) {
                userGroupNames.push(userGroup.name);
            }
        }
    });

    return userGroupNames;
};

const { mutateAsync: deleteRoleBinding, isPending: isDeletingRoleBinding } = useRoleBindingDeleteMutation({
    onSuccess: async () => {
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        closeRemoveModal();
        await userRefresh();
        userPageStore.setSelectedIndices([]);
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, error.message);
    },
    onSettled: () => {
        modalState.loading = false;
    },
});

const handleRemoveButton = async () => {
    modalState.loading = true;

    await deleteRoleBinding({
        role_binding_id: state.selectedRemoveItem,
    });
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
            :loading="userIsLoading"
            :items="state.refinedUserItems"
            :select-index="userPageState.selectedIndices"
            :fields="tableState.userTableFields"
            sort-by="name"
            :sort-desc="true"
            :total-count="userTotalCount"
            :key-item-sets="USER_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            :query-tags="queryTags"
            :style="{height: `${props.tableHeight}px`}"
            :this-page.sync="tableState.thisPage"
            :page-size.sync="tableState.pageLimit"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleRefresh()"
        >
            <template v-if="props.hasReadWriteAccess && storeState.isAdminMode"
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
                <div v-if="roleMap[value]?.name"
                     class="role-type-wrapper"
                >
                    <img :src="useRoleFormatter(roleMap[value]?.role_type || ROLE_TYPE.USER).image"
                         alt="Role Type Icon"
                         class="role-type-icon"
                    >
                    <span class="pr-4">{{ roleMap[value]?.name ?? '' }}</span>
                </div>
            </template>
            <template #col-role_binding-format="{value, rowIndex, item:fieldItem}">
                <div class="role-type-wrapper">
                    <p-select-dropdown v-if="userPageGetters.isWorkspaceOwner && state.refinedUserItems[rowIndex].user_id !== storeState.loginUserId"
                                       is-filterable
                                       use-fixed-menu-style
                                       style-type="transparent"
                                       :visible-menu="dropdownState.visibleMenu"
                                       :loading="roleListIsLoading"
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
            <template v-if="!storeState.isAdminMode"
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
                        {{ val }}
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
                            {{ val }}
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
                                      :loading="isDeletingRoleBinding"
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
