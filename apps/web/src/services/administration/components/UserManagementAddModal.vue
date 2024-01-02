<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PButtonModal } from '@spaceone/design-system';
import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { Tags } from '@/schema/_common/model';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { UserCreateParameters } from '@/schema/identity/user/api-verbs/create';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserCreateParameters } from '@/schema/identity/workspace-user/api-verbs/create';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementAddAdminRole from '@/services/administration/components/UserManagementAddAdminRole.vue';
import UserManagementAddPassword from '@/services/administration/components/UserManagementAddPassword.vue';
import UserManagementAddRole from '@/services/administration/components/UserManagementAddRole.vue';
import UserManagementAddTag from '@/services/administration/components/UserManagementAddTag.vue';
import UserManagementAddUser from '@/services/administration/components/UserManagementAddUser.vue';
import { USER_MODAL_TYPE } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { AddModalMenuItem } from '@/services/administration/types/user-type';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    disabled: computed(() => {
        if (userPageState.isAdminMode && !state.isSetAdminRole) {
            const baseCondition = state.userList.length === 0 || (state.workspace.length === 0 || isEmpty(state.role));
            if (state.localUserItem.length > 0 && !state.isResetPassword) {
                return state.password === '' || baseCondition;
            }
            return baseCondition;
        }
        const baseCondition = state.userList.length === 0 || isEmpty(state.role);
        if (state.localUserItem.length > 0 && !state.isResetPassword) {
            return state.password === '' || baseCondition;
        }
        return baseCondition;
    }),
    // user
    userList: [] as AddModalMenuItem[],
    localUserItem: [] as AddModalMenuItem[],
    // password
    password: '',
    resetPasswordVisible: false,
    isResetPassword: true,
    // role
    role: {} as AddModalMenuItem,
    workspace: [] as AddModalMenuItem[],
    isSetAdminRole: false,
    // tag
    tags: {} as Tags,
});

/* Component */
const handleChangeInput = (items) => {
    if (items.role) state.role = items.role;
    if (items.workspace) state.workspace = items.workspace;
    if (items.userList) {
        state.userList = items.userList;
        const newUserItem = state.userList.filter((item) => item.isNew);
        state.localUserItem = state.userList.filter((item) => item.auth_type === 'LOCAL');
        state.resetPasswordVisible = state.localUserItem.length > 0 && newUserItem.length > 0;
    }
};

const handleConfirm = async () => {
    state.loading = true;
    try {
        await Promise.all(state.userList.map(fetchCreateUser));
        if (userPageState.modal.type === USER_MODAL_TYPE.INVITE) {
            showSuccessMessage(i18n.t('IAM.USER.FORM.ALT_S_SEND_INVITATION_EMAIL'), '');
        } else {
            showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.ALT_S_ADD_USER'), '');
        }
        emit('confirm');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    state.password = '';
    state.role = {};
    state.resetPasswordVisible = false;
    state.isResetPassword = true;
    state.isSetAdminRole = false;
    userPageStore.$patch((_state) => {
        _state.modal.visible.add = false;
        _state.modal = cloneDeep(_state.modal);
        _state.createdWorkspaceId = undefined;
        _state.afterWorkspaceCreated = false;
    });
};
/* API */
const fetchCreateUser = async (item: AddModalMenuItem): Promise<void> => {
    const userInfoParams = {
        user_id: item.user_id || '',
        email: item.user_id || '',
        auth_type: item.auth_type || 'LOCAL',
        password: state.password || '',
        reset_password: item.auth_type === 'LOCAL' && state.isResetPassword,
    };

    const createRoleBinding = async () => {
        if (userPageStore.isWorkspaceOwner || state.isSetAdminRole) {
            await fetchCreateRoleBinding(item);
        } else if (userPageState.afterWorkspaceCreated) {
            await fetchCreateRoleBinding({ ...item, workspace_id: userPageState.createdWorkspaceId });
        } else {
            await Promise.all(state.workspace.map((w) => fetchCreateRoleBinding(item, w)));
        }
    };

    if (userPageState.isAdminMode || (userPageState.afterWorkspaceCreated && item.isNew)) {
        await SpaceConnector.clientV2.identity.user.create<UserCreateParameters, UserModel>({
            ...userInfoParams,
            tags: state.tags,
        });
        await createRoleBinding();
    } else if (item.isNew) {
        await SpaceConnector.clientV2.identity.workspaceUser.create<WorkspaceUserCreateParameters, WorkspaceUserModel>({
            ...userInfoParams,
            role_id: state.role.name || '',
        });
    } else {
        await createRoleBinding();
    }
};
const fetchCreateRoleBinding = async (userItem: AddModalMenuItem, item?: AddModalMenuItem) => {
    let roleParams: RoleCreateParameters;
    const baseRoleParams = {
        user_id: userItem.user_id || '',
        role_id: state.role.name || '',
        resource_group: state.isSetAdminRole ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
    };
    if (userPageStore.isWorkspaceOwner || state.isSetAdminRole) {
        roleParams = baseRoleParams;
    } else if (userPageState.afterWorkspaceCreated) {
        roleParams = {
            ...baseRoleParams,
            workspace_id: userPageState.createdWorkspaceId || '',
        };
    } else {
        roleParams = {
            ...baseRoleParams,
            workspace_id: item?.name || '',
        };
    }

    await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>(roleParams);
};

</script>

<template>
    <p-button-modal ref="containerRef"
                    class="user-management-additional-modal"
                    :header-title="userPageState.modal.title"
                    size="md"
                    :theme-color="userPageState.modal.themeColor"
                    :fade="true"
                    :backdrop="true"
                    :loading="state.loading"
                    :visible="userPageState.modal.visible.add"
                    :disabled="state.disabled"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <user-management-add-user @change-input="handleChangeInput" />
                <user-management-add-password v-if="state.resetPasswordVisible && state.userList.length > 0"
                                              :is-reset.sync="state.isResetPassword"
                                              :password.sync="state.password"
                />
                <user-management-add-admin-role v-if="userPageState.isAdminMode"
                                                :is-set-admin-role.sync="state.isSetAdminRole"
                                                @change-input="handleChangeInput"
                />
                <user-management-add-role v-else
                                          @change-input="handleChangeInput"
                />
                <user-management-add-tag v-if="userPageState.isAdminMode"
                                         is-bordered
                                         :tags.sync="state.tags"
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss">
.user-management-additional-modal {
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
