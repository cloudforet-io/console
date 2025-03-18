<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip, PHeadingLayout,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { BasicRoleModel, RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceGroupUserUpdateRoleParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/update-role';
import type { WorkspaceGroupModel, WorkspaceUser } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import LandingWorkspaceGroupAddUsersModal
    from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupAddUsersModal.vue';
import LandingWorkspaceGroupRemoveUserModal
    from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupRemoveUserModal.vue';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
const userWorkspaceGroupStoreState = userWorkspaceGroupStore.state;
const userWorkspaceGroupStoreGetters = userWorkspaceGroupStore.getters;
const landingPageStore = useLandingPageStore();
const landingPageStoreState = landingPageStore.state;
const landingPageStoreGetter = landingPageStore.getters;
const landingPageStoreGroupUserState = landingPageStore.groupUserTableState;
const userStore = useUserStore();

const state = reactive({
    addUserModalVisible: false,
    removeUserModalVisible: false,
    workspaceGroup: computed<WorkspaceGroupModel|undefined>(() => userWorkspaceGroupStoreGetters.workspaceGroupMap[landingPageStoreState.selectedWorkspaceGroup]),
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
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    loginUserRoleType: computed(() => landingPageStoreGetter.workspaceGroupUsers.find((user) => user.user_id === tableState.loginUserId).role_type),
    isUserOwnerRole: computed(() => userStore.state.roleType === ROLE_TYPE.DOMAIN_ADMIN || tableState.loginUserRoleType === ROLE_TYPE.WORKSPACE_OWNER),
    roleMap: {} as Record<string, BasicRoleModel>,
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
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.listBasicRole<RoleListParameters, ListResponse<RoleModel>>({
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


const handleSelect = (index) => {
    landingPageStoreGroupUserState.selectedIndices = index;
};

const handleChange = (options: any = {}) => {
    if (options.pageStart) {
        landingPageStore.$patch((_state) => {
            _state.groupUserTableState.pageStart = options.pageStart;
        });
    }

    if (options.pageLimit) {
        landingPageStore.$patch((_state) => {
            _state.groupUserTableState.pageStart = 1;
            _state.groupUserTableState.pageLimit = options.pageLimit;
            _state.groupUserTableState.thisPage = 1;
        });
    }
};

const handleSelectMenu = async (role: BasicRoleModel, user_id: string) => {
    try {
        if (!role.name || !user_id) throw new Error('role_id or user_id is not exist');
        await SpaceConnector.clientV2.identity.workspaceGroupUser.updateRole<WorkspaceGroupUserUpdateRoleParameters>({
            workspace_group_id: state.workspaceGroup?.workspace_group_id ?? '',
            target_user_id: user_id,
            role_id: role.name,
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
        await userWorkspaceGroupStore.load();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.ALT_E_UPDATE_ROLE'));
    }
};

const handleRefresh = () => {
    userWorkspaceGroupStore.load();
};

const handleAddUsersButtonClick = () => {
    state.addUserModalVisible = true;
};

const handleSelectedGroupUsersRemoveButtonClick = () => {
    state.removeUserList = landingPageStoreGetter.workspaceGroupUserTableItem
        .map((item, index) => (landingPageStoreGroupUserState.selectedIndices.includes(index) ? item : null))
        .filter((item) => item);
    state.removeUserModalVisible = true;
};

const handleSelectedGroupUserRemoveButtonClick = async (item:WorkspaceUser) => {
    state.removeUserList = [item];
    state.removeUserModalVisible = true;
};

const handleChangeSort = (name:string, isDesc:boolean) => {
    landingPageStore.$patch((_state) => {
        if (name === 'role') {
            _state.groupUserTableState.sortBy = `${name}_type`;
        } else {
            _state.groupUserTableState.sortBy = name;
        }

        _state.groupUserTableState.selectedIndices = [];
        _state.groupUserTableState.isDesc = isDesc;
    });
};

const setRoleMap = async () => {
    const { results } = await SpaceConnector.clientV2.identity.role.listBasicRole<RoleListParameters, ListResponse<RoleModel>>();
    tableState.roleMap = results?.reduce((acc, role) => {
        acc[role.role_id] = role;
        return acc;
    }, {});
};

(() => {
    setRoleMap();
})();
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                           use-total-count
                           :total-count="landingPageStoreGetter.workspaceGroupUserTotalCount"
                           heading-type="sub"
                />
            </template>
            <template #extra>
                <div v-if="tableState.isUserOwnerRole"
                     class="workspace-group-tab-group-user-button-wrapper"
                >
                    <p-button style-type="negative-primary"
                              :disabled="!landingPageStoreGroupUserState.selectedIndices.length"
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
                         :loading="userWorkspaceGroupStoreState.loading"
                         :fields="tableState.fields"
                         :items="landingPageStoreGetter.workspaceGroupUserTableItem"
                         :select-index="landingPageStoreGroupUserState.selectedIndices"
                         :total-count="landingPageStoreGetter.workspaceGroupUserTotalCount"
                         sort-by="user_id"
                         search-type="plain"
                         :sort-desc="true"
                         :this-page.sync="landingPageStoreGroupUserState.thisPage"
                         :search-text.sync="landingPageStoreGroupUserState.searchText"
                         selectable
                         sortable
                         searchable
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleRefresh"
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
                        page-size="10"
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
                                                 :workspace-group="state.workspaceGroup"
                                                 @confirm="handleRefresh"
        />
        <landing-workspace-group-remove-user-modal :visible.sync="state.removeUserModalVisible"
                                                   :workspace-group="state.workspaceGroup"
                                                   :remove-user-list="state.removeUserList"
                                                   @confirm="handleRefresh"
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
