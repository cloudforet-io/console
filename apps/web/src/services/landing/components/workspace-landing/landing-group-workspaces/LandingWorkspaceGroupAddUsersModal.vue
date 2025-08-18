<script setup lang="ts">
import { computed, reactive } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PSelectDropdown, PIconButton, PAvatar, PTextInput, PScopedNotification,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { MyWorkspaceGroupModel } from '@/api-clients/identity/user-profile/schema/model';
import { useWorkspaceGroupUserApi } from '@/api-clients/identity/workspace-group-user/composables/use-workspace-group-user-api';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { USER_STATE } from '@/services/iam/constants/user-constant';
import { useWorkspaceGroupUserFindPaginationQuery } from '@/services/landing/composables/use-workspace-group-user-find-pagination-query';


const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'update:visible'): void;
}>();

interface Props {
    workspaceGroup?: WorkspaceGroupModel | MyWorkspaceGroupModel
    visible: boolean;
}

const { roleAPI } = useRoleApi();
const { workspaceGroupUserAPI } = useWorkspaceGroupUserApi();

const props = defineProps<Props>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
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
    fetcher: (apiQueryHelper) => roleAPI.listBasicRole({
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

const resetState = () => {
    roleSelectedItems.value = [];
    userDropdownState.menuList = [];
    userDropdownState.searchText = '';
    userDropdownState.selectedItems = [];
};

/* Mutation */
const { mutateAsync: addWorkspaceGroupUser, isPending: isAddingWorkspaceGroupUser } = useMutation({
    mutationFn: workspaceGroupUserAPI.add,
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_USERS'), '');
        emit('confirm');
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
    onSettled: () => {
        resetState();
        state.proxyVisible = false;
    },
});

/* Handlers */
const handleConfirm = async () => {
    if (!props.workspaceGroup?.workspace_group_id) throw Error('Invalid Workspace Group Id.');
    addWorkspaceGroupUser({
        workspace_group_id: props.workspaceGroup?.workspace_group_id,
        users: userDropdownState.selectedItems.map((item) => ({
            user_id: item, role_id: roleSelectedItems.value[0]?.name,
        })),
    });
};

const handleCloseModal = () => {
    state.proxyVisible = false;
    resetState();
};

const handleRemoveUser = (item: string) => {
    userDropdownState.selectedItems = userDropdownState.selectedItems.filter((selectedItem) => selectedItem !== item);
};
// userFind logic
const userDropdownState = reactive({
    menuList: computed<MenuItem[]>(() => userList.value?.results?.map((user) => ({
        label: user.user_id,
        name: user.user_id,
        disabled: userDropdownState.selectedItems.includes(user.user_id),
    }))),
    inputSelectedItem: [] as MenuItem[],
    selectedItems: [] as string[],
    searchText: '',
});

/* Query */
const { data: userList } = useWorkspaceGroupUserFindPaginationQuery({
    params: computed(() => ({
        workspace_group_id: props.workspaceGroup?.workspace_group_id || '',
        keyword: userDropdownState.searchText,
        state: USER_STATE.ENABLE,
    })),
    thisPage: computed(() => 1),
    pageSize: computed(() => 10),
});

/* Handlers */
const handleEnter = (user: [MenuItem]) => {
    const selectedUser = user[0]?.name;
    const isExistUser = userDropdownState.selectedItems.find((selectedItem:string) => selectedItem === selectedUser);
    if (!selectedUser || isExistUser) return;
    userDropdownState.selectedItems.push(selectedUser);
    userDropdownState.inputSelectedItem = [];
};
</script>

<template>
    <p-button-modal class="workspace-group-add-users-modal"
                    :header-title="$t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: props.workspaceGroup?.name })"
                    :visible="props.visible"
                    :loading="isAddingWorkspaceGroupUser"
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
                                       class="mt-4"
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
        .close-button {
            position: static;
        }
        .header {
            .modal-header {
                word-break: break-all;
            }
        }
    }
}
</style>
