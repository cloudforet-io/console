<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PSelectDropdown, PIconButton, PAvatar,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceGroupAddUsersParameters } from '@/schema/identity/workspace-group/api-verbs/add-users';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const emit = defineEmits<{(e: 'confirm'): void}>();



const state = reactive({
    loading: false,
    isAllValid: computed(() => roleSelectedItems.value.length > 0 && userSelectedItems.value.length > 0),
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
    filter: [{ k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' }],
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
        query: apiQueryHelper.data,
    }),
});

const {
    loading: userLoading, searchText: userSearchText, menuList: userMenuList, selectedItems: userSelectedItems, handleClickShowMore: handleClickShowMoreUser,
} = useSelectDropDownList<UserModel>({
    pageSize: 10,
    transformer: (_user) => ({
        name: _user.name,
        user_id: _user.user_id,
    }),
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>({
        query: apiQueryHelper.data,
    }),
    searchKey: 'user_id',
});

const resetState = () => {
    roleSelectedItems.value = [];
    userSelectedItems.value = [];
};

const handleConfirm = async () => {
    try {
        state.loading = true;
        await SpaceConnector.clientV2.identity.workspaceGroup.addUsers<WorkspaceGroupAddUsersParameters, WorkspaceGroupModel>({
            workspace_group_id: workspaceGroupPageState.modalAdditionalData?.workspaceGroupId ?? workspaceGroupPageStore.getters.selectedWorkspaceGroup?.workspace_group_id,
            users: userSelectedItems.value.map((item) => ({
                user_id: item?.user_id, role_id: roleSelectedItems.value[0]?.name,
            })),
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_USERS'), '');
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
    workspaceGroupPageStore.closeModal();
};

const handleRemoveUser = (item: UserModel) => {
    userSelectedItems.value = userSelectedItems.value.filter((selectedItem) => selectedItem.user_id !== item.user_id);
};
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
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_SELECT_DROP_DOWN_TITLE')"
                               style-type="secondary"
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
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.USER_SELECT_DROP_DOWN_TITLE')"
                               style-type="secondary"
                >
                    <template #default>
                        <p-select-dropdown
                            is-filterable
                            use-fixed-menu-style
                            class="user-select-dropdown"
                            style-type="TERTIARY_ICON_BUTTON"
                            disable-handler
                            multi-selectable
                            :menu="userMenuList"
                            :selected.sync="userSelectedItems"
                            :search-text.sync="userSearchText"
                            :loading="userLoading"
                            :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.USER_DROP_DOWN_PLACEHOLDER')"
                            @click-show-more="handleClickShowMoreUser"
                        >
                            <template #menu-item--format="{ item }">
                                <div class="user-menu-item">
                                    <span class="role-user_id">{{ item.user_id }}({{ item.name }})</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                    </template>
                </p-field-group>
            </div>
            <div v-for="item in userSelectedItems"
                 :key="item.user_id"
                 class="selected-user-item"
            >
                <div class="flex items-center gap-2">
                    <p-avatar class="menu-icon"
                              size="md"
                    />
                    {{ item.user_id }}
                </div>
                <p-icon-button name="ic_close"
                               size="md"
                               @click="handleRemoveUser(item)"
                />
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

    .user-select-dropdown {
        .user-menu-item {
            @apply flex items-center justify-between;
            gap: 0.25rem;
        }

        :deep(.dropdown-button)::before {
            content: "Add Users";
        }

        :deep(.selection-display-wrapper) {
            display: none;
        }
    }

    .selected-user-item {
        @apply flex items-center justify-between rounded text-label-md;
        padding: 0.5rem;
        &:hover {
            @apply bg-blue-100;
        }
    }
}
</style>
