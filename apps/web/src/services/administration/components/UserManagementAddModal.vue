<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { AuthType } from '@/schema/identity/user/type';
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
import { useUserPageStore } from '@/services/administration/store/user-page-store';

export interface AddModalMenuItem extends MenuItem {
    label?: string;
    name?: string;
    user_id?: string;
    role_type?: RoleType;
    auth_type?: AuthType;
    isNew?: boolean;
}

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    disabled: true,
    selectedItems: [] as AddModalMenuItem[],
    password: '',
    role: {} as AddModalMenuItem,
    resetPasswordVisible: false,
    isResetPassword: true,
});

/* Component */
const handleChangeList = (items: AddModalMenuItem[]) => {
    state.selectedItems = items;
    const newUserItem = items.filter((item) => item.isNew);
    const localUserItem = items.filter((item) => item.auth_type === 'LOCAL');
    if (localUserItem.length > 0 && newUserItem.length > 0) {
        state.resetPasswordVisible = true;
    }
};
const handleChangeInput = (value: string) => {
    state.password = value;
};
const handleChangeRole = (role: AddModalMenuItem) => {
    state.role = role;
};
const handleChangeToggle = (value: boolean) => {
    state.isResetPassword = value;
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        await Promise.all(state.selectedItems.map(fetchCreateUser));
        showSuccessMessage(i18n.t('IAM.USER.FORM.ALT_S_SEND_INVITATION_EMAIL'), '');
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
    state.disabled = true;
    userPageStore.$patch((_state) => {
        _state.modal.visible.add = false;
        _state.modal = cloneDeep(_state.modal);
    });
};

/* API */
const fetchCreateUser = async (item: AddModalMenuItem): Promise<any> => {
    const params = {
        user_id: item.user_id || '',
        role_id: state.role.name || '',
    };

    if (item.isNew) {
        await SpaceConnector.clientV2.identity.workspaceUser.create<WorkspaceUserCreateParameters, WorkspaceUserModel>({
            ...params,
            auth_type: item.auth_type || 'LOCAL',
            password: state.password || '',
            reset_password: state.isResetPassword,
        });
    } else {
        await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>({
            ...params,
            resource_group: RESOURCE_GROUP.WORKSPACE,
        });
    }
};

/* Watcher */
watch([() => state.selectedItems, () => state.role], ([validItems, role]) => {
    if (validItems.length > 0 && !isEmpty(role)) {
        state.disabled = false;
    }
});
</script>

<template>
    <p-button-modal ref="containerRef"
                    class="user-management-additional-modal"
                    :header-title="userPageState.modal.title"
                    size="md"
                    :theme-color="userPageState.modal.themeColor"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.modal.visible.add"
                    :disabled="state.disabled"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <user-management-add-user @change-list="handleChangeList" />
                <user-management-add-password v-if="state.resetPasswordVisible && state.selectedItems.length > 0"
                                              @change-input="handleChangeInput"
                                              @change-toggle="handleChangeToggle"
                />
                <user-management-add-admin-role v-if="userPageState.isAdminMode" />
                <user-management-add-role v-else
                                          @change-role="handleChangeRole"
                />
                <user-management-add-tag v-if="userPageState.isAdminMode" />
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
