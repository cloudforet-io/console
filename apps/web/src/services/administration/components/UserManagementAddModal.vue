<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import { isEmpty } from 'lodash';

import type { RoleType } from '@/schema/identity/role/type';
import type { AuthType } from '@/schema/identity/user/type';
import { i18n } from '@/translations';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementAddPassword from '@/services/administration/components/UserManagementAddPassword.vue';
import UserManagementAddRole from '@/services/administration/components/UserManagementAddRole.vue';
import UserManagementAddUser from '@/services/administration/components/UserManagementAddUser.vue';
import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

export interface AddModalMenuItem extends MenuItem {
    label?: string;
    name?: string;
    user_id?: string;
    role_type?: RoleType;
    auth_type?: AuthType;
    isNew?: boolean;
}

const workspaceStore = useWorkspaceStore();
const modalSettingStore = useUserModalSettingStore();
const modalSettingState = modalSettingStore.$state;

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
const handleClose = () => {
    state.password = '';
    state.role = {};
    state.resetPasswordVisible = false;
    state.isResetPassword = true;
    state.disabled = true;
    modalSettingStore.$patch((_state) => {
        _state.visible.additional = false;
    });
};
const handleChangeList = (items: AddModalMenuItem[]) => {
    state.selectedItems = items;
    const resetPasswordItem = items.filter((item) => item.isNew);
    if (resetPasswordItem.length > 0) {
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
        showSuccessMessage(i18n.t('IDENTITY.USER.FORM.ALT_S_SEND_INVITATION_EMAIL'), '');
        emit('confirm');
    } catch (e: any) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
        handleClose();
    }
};

/* API */
const fetchCreateUser = async (item: AddModalMenuItem): Promise<any> => {
    try {
        const params = {
            user_id: item.user_id || '',
            role_id: state.role.name || '',
            workspace_id: workspaceStore.getters.currentWorkspaceId || '',
        };

        if (item.isNew) {
            await modalSettingStore.createWorkspaceUser({
                ...params,
                auth_type: item.auth_type || 'LOCAL',
                password: state.password || '',
                reset_password: state.isResetPassword,
            });
        } else {
            await modalSettingStore.createRoleBinding({
                ...params,
                permission_group: 'WORKSPACE',
            });
        }
    } catch (e: any) {
        ErrorHandler.handleError(e);
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
                    :header-title="modalSettingState.title"
                    size="md"
                    :theme-color="modalSettingState.themeColor"
                    :fade="true"
                    :backdrop="true"
                    :visible="modalSettingState.visible.additional"
                    :disabled="state.disabled"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <user-management-add-user @change-list="handleChangeList" />
                <user-management-add-password v-if="state.resetPasswordVisible"
                                              @change-input="handleChangeInput"
                                              @change-toggle="handleChangeToggle"
                />
                <user-management-add-role @change-role="handleChangeRole" />
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
