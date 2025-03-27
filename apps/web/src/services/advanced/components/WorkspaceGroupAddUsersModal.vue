<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PSelectDropdown, PIconButton, PAvatar, PTextInput, PScopedNotification,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceGroupUserFindParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/find';
import type { WorkspaceGroupUserSummaryModel } from '@/api-clients/identity/workspace-group-user/schema/model';
import type { WorkspaceGroupAddUsersParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/add-users';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { USER_STATE } from '@/services/iam/constants/user-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void}>();

const state = reactive({
    loading: false,
    isAllValid: computed(() => roleSelectedItems.value.length > 0 && userDropdownState.selectedItems.length > 0),
});

const {
    loading: roleLoading, searchText: roleSearchText, menuList: roleMenuList, selectedItems: roleSelectedItems, handleClickShowMore: handleClickShowMoreRole,
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

const userDropdownState = reactive({
    userList: [] as WorkspaceGroupUserSummaryModel[],
    menuList: computed(() => userDropdownState.userList.map((user) => ({
        label: user.user_id,
        name: user.user_id,
        disabled: userDropdownState.selectedItems.includes(user.user_id),
    }))),
    inputSelectedItem: [] as MenuItem[],
    selectedItems: [] as string[],
    searchText: '',
    loading: false,
    pageLimit: 10,
});

const resetState = () => {
    roleSelectedItems.value = [];
    userDropdownState.searchText = '';
    userDropdownState.menuList = [];
};

const handleConfirm = async () => {
    try {
        state.loading = true;
        await SpaceConnector.clientV2.identity.workspaceGroup.addUsers<WorkspaceGroupAddUsersParameters, WorkspaceGroupModel>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroupId ?? workspaceGroupPageState.modalAdditionalData?.workspaceGroupId,
            users: userDropdownState.selectedItems.map((item) => ({
                user_id: item, role_id: roleSelectedItems.value[0]?.name,
            })),
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_USERS'), '');
        await workspaceGroupPageStore.fetchWorkspaceGroups({ blockSelectedIndicesReset: true });
        await workspaceGroupPageStore.listWorkspaceGroupUsers();
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        resetState();
        workspaceGroupPageStore.closeModal();
        state.loading = false;
    }
};

const handleCloseModal = () => {
    resetState();
    workspaceGroupPageStore.closeModal();
};

const handleRemoveUser = (item: string) => {
    userDropdownState.selectedItems = userDropdownState.selectedItems.filter((selectedItem) => selectedItem !== item);
};

const fetchUserFindList = async ():Promise<WorkspaceGroupUserSummaryModel[]> => {
    userDropdownState.loading = true;
    try {
        if (!(workspaceGroupPageGetters.selectedWorkspaceGroupId ?? workspaceGroupPageState.modalAdditionalData?.workspaceGroupId)) throw Error('Invalid Workspace Group Id.');
        const { results } = await SpaceConnector.clientV2.identity.workspaceGroupUser.find<WorkspaceGroupUserFindParameters, ListResponse<WorkspaceGroupUserSummaryModel>>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroupId ?? workspaceGroupPageState.modalAdditionalData?.workspaceGroupId,
            keyword: userDropdownState.searchText,
            state: USER_STATE.ENABLE,
            page: {
                start: 0,
                limit: userDropdownState.pageLimit,
            },
        });
        return results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    } finally {
        userDropdownState.loading = false;
    }
};

const handleEnter = (user: [MenuItem]) => {
    const selectedUser = user[0]?.name;
    const isExistUser = userDropdownState.selectedItems.find((selectedItem:string) => selectedItem === selectedUser);
    if (!selectedUser || isExistUser) return;
    userDropdownState.selectedItems.push(selectedUser);
    userDropdownState.inputSelectedItem = [];
};

debouncedWatch(() => userDropdownState.searchText, async () => {
    userDropdownState.userList = await fetchUserFindList() || [];
}, { debounce: 300 });

watch(() => workspaceGroupPageState.modal.visible, async (visible) => {
    if (visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS) {
        userDropdownState.selectedItems = [];
        userDropdownState.userList = await fetchUserFindList() || [];
    }
});
</script>

<template>
    <p-button-modal class="workspace-group-add-users-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS"
                    :loading="state.loading"
                    size="sm"
                    :disabled="!state.isAllValid"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <div class="form-wrapper">
                <p-scoped-notification type="information"
                                       icon="ic_info-circle"
                                       layout="in-section"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_DESCRIPTION') }}
                </p-scoped-notification>
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.USER_SELECT_DROP_DOWN_TITLE')"
                               class="mt-4"
                >
                    <template #default>
                        <div class="user-form-wrapper">
                            <p-text-input :value.sync="userDropdownState.searchText"
                                          class="user-search-input"
                                          :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.USER_DROP_DOWN_PLACEHOLDER')"
                                          :selected="userDropdownState.inputSelectedItem"
                                          use-auto-complete
                                          use-fixed-menu-style
                                          :menu="userDropdownState.menuList"
                                          @update:selected="handleEnter"
                            />
                            <div class="selected-user-list">
                                <div v-for="item in userDropdownState.selectedItems"
                                     :key="item"
                                     class="selected-user-item"
                                >
                                    <div class="flex items-center gap-2">
                                        <p-avatar class="menu-icon"
                                                  size="md"
                                        />
                                        {{ item }}
                                    </div>
                                    <p-icon-button name="ic_close"
                                                   size="md"
                                                   @click="handleRemoveUser(item)"
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </p-field-group>
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_SELECT_DROP_DOWN_TITLE')"
                >
                    <template #default>
                        <p-select-dropdown
                            is-filterable
                            use-fixed-menu-style
                            class="role-select-dropdown"
                            disable-handler
                            :menu="roleMenuList"
                            :selected.sync="roleSelectedItems"
                            :search-text.sync="roleSearchText"
                            :loading="roleLoading"
                            :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_DROP_DOWN_PLACEHOLDER')"
                            @click-show-more="handleClickShowMoreRole"
                        >
                            <template #dropdown-left-area>
                                <img v-if="roleSelectedItems.length > 0"
                                     :src="useRoleFormatter(roleSelectedItems[0]?.role_type ?? 'USER').image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                            </template>
                            <template #menu-item--format="{ item }">
                                <div class="role-menu-item">
                                    <img :src="useRoleFormatter(item.role_type).image"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <span class="role-label">{{ item.label }}</span>
                                    <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                    </template>
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.WORKSPACE_GROUP.MODAL.ADD') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-group-add-users-modal {
    .role-select-dropdown {
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }

        .role-menu-item {
            @apply flex items-center;
            gap: 0.25rem;

            .role-label {
                @apply truncate;
                flex-grow: 1;
            }

            .role-type {
                @apply text-label-sm text-gray-400;
            }
        }
    }

    .user-form-wrapper {
        @apply p-4 border border-gray-200 rounded;

        .selected-user-list {
            margin-top: 0.5rem;
            min-height: 7rem;
            max-height: 17.5rem;
            overflow-y: auto;

            .selected-user-item {
                @apply flex items-center justify-between rounded text-label-md;
                padding: 0.5rem;
                &:hover {
                    @apply bg-blue-100;
                }
            }
        }
    }

    .user-search-input {
        @apply w-full;
    }
}

/* custom design-system component - p-button-modal */
:deep() {
    .modal-content {
        .header {
            .modal-header {
                word-break: break-all;
            }
        }
    }
}
</style>
