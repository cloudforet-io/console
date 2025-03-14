<script setup lang="ts">
import {
    reactive, watch, onUnmounted, computed,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { WorkspaceGroupUpdateRoleParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/update-role';
import type { WorkspaceUser } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { useRoleFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const userTabState = workspaceGroupPageStore.userTabState;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const { hasReadWriteAccess } = usePageEditableStatus();

const emit = defineEmits<{(e: 'refresh', payload: { isGroupUser?: boolean, isWorkspace?: boolean }): void; }>();

const tableState = reactive({
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
        workspaceGroupPageState.roles.forEach((role) => {
            map[role.role_id] = role;
        });
        return map;
    }),
});

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore,
} = useSelectDropDownList<RoleModel>({
    pageSize: 10,
    transformer: (_role) => ({
        label: _role.name,
        name: _role.role_id,
        role_type: _role.role_type,
    }),
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
        query: {
            ...apiQueryHelper.data,
            filter: [
                ...(apiQueryHelper.data.filter || []),
                { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: 'not' },
            ],
        },
    }),
});

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
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: workspaceGroupPageState.workspaceGroups[workspaceGroupPageState.selectedIndices[0]]?.name }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
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
    userTabState.selectedUserIndices = index;
};

const handleChange = async (options: any = {}) => {
    if (options.pageStart) {
        userTabState.pageStart = options.pageStart;
    }

    if (options.pageLimit) {
        userTabState.pageStart = 1;
        userTabState.pageLimit = options.pageLimit;
        userTabState.thisPage = 1;
    }
    if (options.searchText) {
        userTabState.thisPage = 1;
    }
    await workspaceGroupPageStore.listWorkspaceGroupUsers();
};

const handleSelectMenu = async (value:{label:string, name:string, role_type: RoleType}, userId: string) => {
    try {
        const roleId = value.name;
        const workspaceGroupId = workspaceGroupPageGetters.selectedWorkspaceGroupId;

        await SpaceConnector.clientV2.identity.workspaceGroup.updateRole<WorkspaceGroupUpdateRoleParameters>({
            workspace_group_id: workspaceGroupId,
            user_id: userId,
            role_id: roleId,
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        await workspaceGroupPageStore.listWorkspaceGroupUsers();
    }
};

const handleRefresh = async () => {
    await workspaceGroupPageStore.listWorkspaceGroupUsers();

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

const handleChangeSort = (name:string, isDesc:boolean) => {
    if (name === 'role') {
        userTabState.sortBy = `${name}_type`;
    } else {
        userTabState.sortBy = name;
    }

    userTabState.selectedUserIndices = [];
    userTabState.sortDesc = isDesc;
};

watch(() => workspaceGroupPageGetters.selectedWorkspaceGroupId, () => {
    workspaceGroupPageStore.listWorkspaceGroupUsers();
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
                           :total-count="userTabState.userInSelectedGroupTotalCount"
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
                         :loading="workspaceGroupPageState.loading"
                         :fields="tableState.fields"
                         :items="userTabState.userInSelectedGroup"
                         :select-index="userTabState.selectedUserIndices"
                         :total-count="userTabState.userInSelectedGroupTotalCount"
                         sort-by="user_id"
                         search-type="plain"
                         :sort-desc="userTabState.sortDesc"
                         :this-page.sync="userTabState.thisPage"
                         :search-text.sync="userTabState.searchText"
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
                            ><span>{{ tableState.roleMap[item.role_id].name }}</span>
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
