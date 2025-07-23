<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { BasicRoleModel } from '@/api-clients/identity/role/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupModel, WorkspaceUser } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { sortTableItems } from '@/common/utils/table-sort';

import { useRoleFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import LandingWorkspaceGroupAddUsersModal
    from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupAddUsersModal.vue';
import LandingWorkspaceGroupRemoveUserModal
    from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupRemoveUserModal.vue';
import { useRoleListBasicRoleQuery } from '@/services/landing/composables/use-role-list-basic-role-query';
import { useUserProfileGetWorkspaceGroupsQuery } from '@/services/landing/composables/use-user-profile-get-workspace-groups-query';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';


const queryClient = useQueryClient();
const landingPageStore = useLandingPageStore();
const landingPageState = landingPageStore.state;
const userStore = useUserStore();
const { roleAPI } = useRoleApi();
const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();

const state = reactive({
    addUserModalVisible: false,
    removeUserModalVisible: false,
    removeUserList: [] as WorkspaceUser[],
});

const tableState = reactive({
    fields: [
        { name: 'user_id', label: 'User ID' },
        { name: 'user_name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'role', label: 'Role' },
        { name: 'remove_button', label: ' ', sortable: false },
    ],
    searchText: '',
    sortBy: 'user_id',
    sortDesc: false,
    thisPage: 1,
    pageSize: 10,
    selectedIndices: [] as number[],
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    loginUserRoleType: computed<RoleType|undefined>(() => workspaceGroupUsers.value?.find((user) => user.user_id === tableState.loginUserId)?.role_type),
    isUserOwnerRole: computed(() => userStore.state.roleType === ROLE_TYPE.DOMAIN_ADMIN || tableState.loginUserRoleType === ROLE_TYPE.WORKSPACE_OWNER),
    roleMap: computed(() => basicRoleList.value?.results?.reduce((acc, role) => {
        acc[role.role_id] = role;
        return acc;
    }, {})),
});
const workspaceGroup = computed<WorkspaceGroupModel|undefined>(() => workspaceGroupList.value?.find((item) => item.workspace_group_id === landingPageState.selectedWorkspaceGroupId));
const workspaceGroupUsers = computed<WorkspaceUser[]>(() => workspaceGroup.value?.users || []);
const filteredUsers = computed<WorkspaceUser[]>(() => {
    if (!tableState.searchText || tableState.searchText === '') {
        return workspaceGroupUsers.value;
    }
    return workspaceGroupUsers.value
        .filter((user) => (user.user_id && user.user_id.includes(tableState.searchText))
        || (user.user_name && user.user_name.includes(tableState.searchText)));
});
const tableItems = computed<WorkspaceUser[]>(() => {
    const sortedUsers = sortTableItems<WorkspaceUser>(filteredUsers.value, tableState.sortBy, tableState.sortDesc);
    const pageStart = getPageStart(tableState.thisPage, tableState.pageSize);
    if (filteredUsers.value.length < pageStart - 1 + tableState.pageSize) {
        return sortedUsers?.slice(pageStart - 1) || [];
    }
    return sortedUsers?.slice(pageStart - 1, pageStart - 1 + tableState.pageSize) || [];
});

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore,
} = useSelectDropDownList<BasicRoleModel>({
    pageSize: 10,
    transformer: (_role) => ({
        label: _role.name,
        name: _role.role_id,
        role_type: _role.role_type,
    }),
    fetcher: (apiQueryHelper) => roleAPI.listBasicRole({
        query: {
            ...apiQueryHelper.data,
            filter: [
                ...(apiQueryHelper.data?.filter || []),
                { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: 'not' },
            ],
        },
    }),
});

/* Query */
const {
    data: workspaceGroupList,
    isLoading: isWorkspaceGroupListLoading,
    key: workspaceGroupListQueryKey,
    refetch: refetchWorkspaceGroupList,
} = useUserProfileGetWorkspaceGroupsQuery();
const { data: basicRoleList } = useRoleListBasicRoleQuery();

/* Mutation */
const { mutate: updateWorkspaceGroupUserRole } = useMutation({
    mutationFn: workspaceGroupUserAPI.updateRole,
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
        queryClient.invalidateQueries({ queryKey: workspaceGroupListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.ALT_E_UPDATE_ROLE'));
    },
});


/* Event Handler */
const handleSelectMenu = async (role: BasicRoleModel, user_id: string) => {
    if (!role.name || !user_id) throw new Error('role_id or user_id is not exist');
    updateWorkspaceGroupUserRole({
        workspace_group_id: workspaceGroup.value?.workspace_group_id ?? '',
        target_user_id: user_id,
        role_id: role.name,
    });
};

const handleRefresh = () => {
    refetchWorkspaceGroupList();
};

const handleConfirmRemoveUser = () => {
    handleRefresh();
    tableState.selectedIndices = [];
};

const handleAddUsersButtonClick = () => {
    state.addUserModalVisible = true;
};

const handleSelectedGroupUsersRemoveButtonClick = () => {
    state.removeUserList = tableItems.value
        .filter((item, index) => tableState.selectedIndices.includes(index));
    state.removeUserModalVisible = true;
};

const handleSelectedGroupUserRemoveButtonClick = async (item:WorkspaceUser) => {
    state.removeUserList = [item];
    state.removeUserModalVisible = true;
};

const handleChange = (options: any = {}) => {
    if (!options) return;
    tableState.thisPage = 1;
    tableState.selectedIndices = [];
};

watch([
    () => tableState.searchText,
], () => {
    tableState.thisPage = 1;
    tableState.selectedIndices = [];
}, { immediate: true });
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                           use-total-count
                           :total-count="workspaceGroupUsers.length"
                           heading-type="sub"
                />
            </template>
            <template #extra>
                <div v-if="tableState.isUserOwnerRole"
                     class="workspace-group-tab-group-user-button-wrapper"
                >
                    <p-button style-type="negative-primary"
                              :disabled="!tableState.selectedIndices.length"
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
                </div>
            </template>
        </p-heading-layout>
        <p-toolbox-table class="workspace-group-tab-group-user-table"
                         style="height: calc(100vh - 25rem);"
                         :loading="isWorkspaceGroupListLoading"
                         :fields="tableState.fields"
                         :items="tableItems"
                         :select-index.sync="tableState.selectedIndices"
                         :total-count="workspaceGroupUsers.length"
                         search-type="plain"
                         :sort-by.sync="tableState.sortBy"
                         :sort-desc.sync="tableState.sortDesc"
                         :this-page.sync="tableState.thisPage"
                         :page-size.sync="tableState.pageSize"
                         :search-text.sync="tableState.searchText"
                         selectable
                         sortable
                         searchable
                         @change="handleChange"
                         @refresh="handleRefresh"
        >
            <template #col-state-format="{ value }">
                <p-status v-bind="groupUserStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role-format="{ item }">
                <span class="role-type">
                    <p-select-dropdown
                        v-if="tableState.isUserOwnerRole"
                        is-filterable
                        use-fixed-menu-style
                        style-type="transparent"
                        class="role-select-dropdown"
                        :menu="menuList"
                        :selected.sync="selectedItems"
                        :search-text.sync="searchText"
                        :loading="loading"
                        disable-handler
                        :page-size="10"
                        @click-show-more="handleClickShowMore"
                        @select="handleSelectMenu($event, item.user_id)"
                    >
                        <template #dropdown-button>
                            <img :src="useRoleFormatter(item.role_type).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            ><span class="role-name">{{ tableState.roleMap[item.role_id]?.name }}</span>
                        </template>
                        <!-- eslint-disable vue/no-template-shadow -->
                        <template #menu-item--format="{ item }">
                            <div class="role-menu-item">
                                <img :src="useRoleFormatter(item.role_type).image"
                                     alt="role-type-icon"
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
                         class="readonly-role-field"
                    >
                        <img :src="useRoleFormatter(item.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        ><p-tooltip position="bottom"
                                    :contents="tableState.roleMap[item.role_id]?.name"
                                    class="role-label"
                        ><span>{{ tableState.roleMap[item.role_id]?.name }}</span></p-tooltip>
                    </div>
                </span>
            </template>
            <template #col-remove_button-format="{ item }">
                <p-button v-if="tableState.isUserOwnerRole"
                          size="sm"
                          style-type="tertiary"
                          @click.stop="() => handleSelectedGroupUserRemoveButtonClick(item)"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
        <landing-workspace-group-add-users-modal :visible.sync="state.addUserModalVisible"
                                                 :workspace-group="workspaceGroup"
                                                 @confirm="handleRefresh"
        />
        <landing-workspace-group-remove-user-modal :visible.sync="state.removeUserModalVisible"
                                                   :workspace-group="workspaceGroup"
                                                   :remove-user-list="state.removeUserList"
                                                   @confirm="handleConfirmRemoveUser"
        />
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-group-user {
    .workspace-group-tab-group-user-button-wrapper {
        display: flex;
        gap: 1rem;
    }

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
        .role-name {
            @apply truncate;
            max-width: 19.375rem;
        }
    }

    .readonly-role-field {
        @apply flex items-center;
        gap: 0.25rem;

        > span {
            @apply truncate;
            width: 14.375rem;
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
