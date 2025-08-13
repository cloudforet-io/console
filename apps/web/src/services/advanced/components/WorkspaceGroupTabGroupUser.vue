<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    reactive, watch, onUnmounted, computed,
} from 'vue';


import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { ToolboxTableOptions } from '@cloudforet/mirinae/types/data-display/tables/toolbox-table/type';

import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceGroupUser } from '@/api-clients/identity/workspace-group-user/schema/model';
import type { WorkspaceGroupUpdateRoleParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/update-role';
import type { WorkspaceUser } from '@/api-clients/identity/workspace-group/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { useWorkspaceGroupRoleListQuery } from '@/services/advanced/composables/querys/use-workspace-group-role-list-query';
import { useWorkspaceGroupUserListQuery } from '@/services/advanced/composables/querys/use-workspace-group-user-list-query';
import { useRoleFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const userTabState = workspaceGroupPageStore.userTabState;

const { hasReadWriteAccess } = usePageEditableStatus();

const emit = defineEmits<{(e: 'refresh', payload: { isGroupUser?: boolean, isWorkspace?: boolean }): void; }>();

const {
    data: roleListData,
    isPending: isRoleListPending,
} = useWorkspaceGroupRoleListQuery();

interface TableState {
    fields: ComputedRef<DataTableFieldType[]>;
    roleMap: ComputedRef<Record<string, RoleModel>>;
    pageStart: number;
    pageLimit: number;
    thisPage: number;
    searchText: string;
    sortBy: string;
    sortDesc: boolean;
}

const tableState = reactive<TableState>({
    fields: computed<DataTableFieldType[]>(() => {
        const defaultFields: DataTableFieldType[] = [
            { name: 'user_id', label: 'User ID' },
            { name: 'user_name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'role', label: 'Role' },
        ];
        if (hasReadWriteAccess.value) {
            defaultFields.push({ name: 'remove_button', label: ' ', sortable: false });
        }
        return defaultFields;
    }),
    roleMap: computed(() => {
        const map: Record<string, RoleModel> = {};
        roleListData.value?.results?.forEach((role) => {
            map[role.role_id] = role;
        });
        return map;
    }),
    pageStart: 1,
    pageLimit: 10,
    thisPage: 1,
    searchText: '',
    sortBy: 'user_id',
    sortDesc: false,
});

const {
    data: workspaceGroupUserListData, isPending: isWorkspaceGroupUserListPending, refetch: workspaceGroupUserListRefetch,
} = useWorkspaceGroupUserListQuery({
    params: computed(() => ({
        workspace_group_id: workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id,
    })),
});

const filterSearchUser = (user:WorkspaceGroupUser) => {
    const searchText = tableState.searchText.trim();

    if (searchText === '') {
        return true;
    }

    const userIdMatches = user.user_id && user.user_id.includes(searchText);

    return userIdMatches;
};

const filterSortUser = (users: WorkspaceGroupUser[]) : WorkspaceGroupUser[] => {
    const sortedSelectedGroupUsers = users?.sort((a, b) => {
        const aValue = a[tableState.sortBy];
        const bValue = b[tableState.sortBy];

        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (tableState.sortDesc) {
            return bValue.localeCompare(aValue);
        }

        return aValue.localeCompare(bValue);
    });

    if ((workspaceGroupUserListData.value?.length ?? 0) < tableState.pageStart - 1 + tableState.pageLimit) {
        return sortedSelectedGroupUsers.slice(tableState.pageStart - 1);
    }

    return sortedSelectedGroupUsers?.slice(tableState.pageStart - 1, tableState.pageStart - 1 + tableState.pageLimit);
};

const filteredWorkspaceGroupUserListData = computed(() => filterSortUser(workspaceGroupUserListData.value?.filter(filterSearchUser) ?? []));

const roleSelectDropdownState = reactive({
    searchText: '',
    selectedItems: [],
});

const roleMenuHandler = useResourceMenuHandlerMap().role;


const setupModal = (type) => {
    switch (type) {
    case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_GROUP_USER_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER,
        themeColor: 'alert',
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: workspaceGroupPageState.selectedWorkspaceGroup?.name }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        additionalData: { isOpenByWorkspaceGroupUsersTab: true },
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_GROUP_USER_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER,
        themeColor: 'alert',
    }); break;
    default:
        break;
    }
};

const handleSelect = (index:number[]) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.userTabState.selectedUser = workspaceGroupUserListData.value?.filter((_, i) => index.includes(i)) ?? [];
        _state.userTabState.selectedUserIndices = index;
    });
};

const handleChange = async (options:ToolboxTableOptions = {}) => {
    if (options.pageStart) {
        tableState.pageStart = options.pageStart;
    }

    if (options.pageLimit) {
        tableState.pageStart = 1;
        tableState.pageLimit = options.pageLimit;
        tableState.thisPage = 1;
    }
    if (options.searchText) {
        tableState.thisPage = 1;
    }
};

const handleChangeSort = (name:string, isDesc:boolean) => {
    if (name === 'role') {
        tableState.sortBy = `${name}_type`;
    } else {
        tableState.sortBy = name;
    }

    workspaceGroupPageStore.$patch((_state) => {
        _state.userTabState.selectedUserIndices = [];
    });
    tableState.sortDesc = isDesc;
};
const { key: workspaceGroupUserListQueryKey } = useServiceQueryKey('identity', 'workspace-group-user', 'list');
const queryClient = useQueryClient();
const { mutateAsync: updateRoleMutation, isPending: isUpdatingRole } = useMutation({
    mutationFn: (params: WorkspaceGroupUpdateRoleParameters) => SpaceConnector.clientV2.identity.workspaceGroup.updateRole(params),
    onError: async (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: workspaceGroupUserListQueryKey });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
    },
});

const handleSelectMenu = async (value:SelectDropdownMenuItem|string|number, userId: string) => {
    if (typeof value !== 'string') {
        ErrorHandler.handleError(new Error('value have to be string'));
        return;
    }
    if (!workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id) {
        ErrorHandler.handleError(new Error('workspaceGroupId is not defined'));
        return;
    }
    updateRoleMutation({
        workspace_group_id: workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id,
        user_id: userId,
        role_id: value,
    });
};

const handleRefresh = async () => {
    await workspaceGroupUserListRefetch();

    emit('refresh', { isGroupUser: true });
};

const handleAddUsersButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS);
};

const handleSelectedGroupUsersRemoveButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER);
};

const handleSelectedGroupUserRemoveButtonClick = (item:WorkspaceUser) => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER);
    workspaceGroupPageState.modalAdditionalData = {
        selectedGroupUser: item,
    };
};

watch(() => workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id, () => {

}, { immediate: true });

onUnmounted(() => {
    workspaceGroupPageStore.resetGroupUser();
});
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading class="workspace-group-tab-group-user-header"
                           :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                           use-total-count
                           :total-count="workspaceGroupUserListData?.length ?? 0"
                           heading-type="sub"
                />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="negative-primary"
                          :disabled="!userTabState.selectedUserIndices.length"
                          @click="handleSelectedGroupUsersRemoveButtonClick"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
                <p-button style-type="secondary"
                          icon-left="ic_plus_bold"
                          @click="handleAddUsersButtonClick"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_USER') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-toolbox-table class="workspace-group-tab-group-user-table"
                         :loading="isRoleListPending || isWorkspaceGroupUserListPending"
                         :fields="tableState.fields"
                         :items="filteredWorkspaceGroupUserListData"
                         :select-index="userTabState.selectedUserIndices"
                         :total-count="workspaceGroupUserListData?.length ?? 0"
                         sort-by="user_id"
                         search-type="plain"
                         :sort-desc="tableState.sortDesc"
                         :this-page.sync="tableState.thisPage"
                         :search-text.sync="tableState.searchText"
                         :selectable="hasReadWriteAccess"
                         sortable
                         searchable
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleRefresh()"
                         @changeSort="handleChangeSort"
        >
            <template #col-state-format="{ value }">
                <p-status v-bind="groupUserStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role-format="{ item }">
                <span class="role-type">
                    <p-select-dropdown
                        is-filterable
                        use-fixed-menu-style
                        style-type="transparent"
                        class="role-select-dropdown"
                        :disabled="!hasReadWriteAccess"
                        :handler="roleMenuHandler({ menuFilters: [{ k: 'state', v: ROLE_STATE.ENABLED, o: '=' }, { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' }] })"
                        :search-text.sync="roleSelectDropdownState.searchText"
                        :loading="isUpdatingRole"
                        :page-size="10"
                        @select="handleSelectMenu($event, item.user_id)"
                    >
                        <template #dropdown-button>
                            <img :src="useRoleFormatter(item.role_type).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            ><span>{{ tableState.roleMap[item.role_id]?.name }}</span>
                        </template>
                        <!-- eslint-disable vue/no-template-shadow -->
                        <template #menu-item--format="{ item }">
                            <div class="role-menu-item">
                                <img :src="useRoleFormatter(item.data.role_type).image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                                <p-tooltip position="bottom"
                                           :contents="item.label"
                                           class="role-label"
                                >
                                    <span>{{ item.label }}</span>
                                </p-tooltip>
                                <span class="role-type">{{ useRoleFormatter(item.data.role_type, true).name }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                </span>
            </template>
            <template #col-remove_button-format="{ item }">
                <p-button size="sm"
                          style-type="tertiary"
                          @click.stop="() => handleSelectedGroupUserRemoveButtonClick(item)"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-group-user {
    .workspace-group-tab-group-user-table {
        border: none;
    }

    .role-type {
        @apply flex items-center;
        gap: 0.5rem;

        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
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

    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        .no-data {
            position: initial;
        }
    }
}
</style>
