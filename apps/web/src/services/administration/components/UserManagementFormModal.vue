<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';
import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { Tags } from '@/schema/_common/model';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleBindingDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import type { RoleBindingListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingUpdateRoleParameters } from '@/schema/identity/role-binding/api-verbs/update-role';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { UserUpdateParameters } from '@/schema/identity/user/api-verbs/update';
import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import config from '@/lib/config';
import { postUserDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementAddTag from '@/services/administration/components/UserManagementAddTag.vue';
import UserManagementFormAdminRole from '@/services/administration/components/UserManagementFormAdminRole.vue';
import UserManagementFormInfoForm from '@/services/administration/components/UserManagementFormInfoForm.vue';
import UserManagementFormMultiFactorAuth
    from '@/services/administration/components/UserManagementFormMultiFactorAuth.vue';
import UserManagementFormNotificationEmailForm
    from '@/services/administration/components/UserManagementFormNotificationEmailForm.vue';
import UserManagementFormPasswordForm from '@/services/administration/components/UserManagementFormPasswordForm.vue';
import { PASSWORD_TYPE } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { AddModalMenuItem, UserListItemType } from '@/services/administration/types/user-type';

interface UserManagementData {
    user_id: string;
    name: string;
    email: string;
    tags: Tags;
    password: string;
    reset_password?: boolean;
    backend?: string;
    user_type?: string;
}

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    mfaLoading: false,
    data: computed<UserListItemType>(() => userPageStore.selectedUsers[0]),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    mfa: computed(() => store.state.user.mfa),
    loginUserId: computed(() => store.state.user.userId),
    isChangedMfaToggle: false,
    isChangedRoleToggle: false,
    roleBindingList: [] as RoleBindingModel[],
});
const formState = reactive({
    name: '',
    email: '',
    // password
    password: '',
    passwordType: '',
    passwordManual: false,
    // role
    role: {} as AddModalMenuItem,
    // tag
    tags: {} as Tags,
});

/* Components */
const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.modal.visible.form = false;
        _state.modal = cloneDeep(_state.modal);
    });
};
const setForm = () => {
    formState.name = state.data.name || '';
    formState.email = state.data.email || '';
    formState.tags = state.data.tags || {};
};
const handleChangeInputs = (value) => {
    if (value.email) formState.email = value.email;
    if (value.password) formState.password = value.password || '';
    if (value.passwordType) formState.passwordType = value.passwordType;
    if (value.role) formState.role = value.role;
};
const handleChangeVerify = (status) => {
    state.data.email_verified = status;
};
const buildUserInfoParams = (): UserManagementData => ({
    user_id: state.data.user_id || '',
    name: formState.name,
    email: formState.email || '',
    tags: formState.tags || {},
    password: formState.password || '',
    reset_password: state.data.auth_type === 'LOCAL' && formState.passwordType === PASSWORD_TYPE.RESET,
});

/* API */
const handleConfirm = async () => {
    state.loading = true;

    try {
        if (state.isChangedMfaToggle) {
            await fetchPostDisableMfa();
        }

        if (state.roleBindingList.length > 0 && !state.isChangedRoleToggle) {
            await fetchDeleteRoleBinding();
        } else {
            await fetchRoleBinding();
        }

        const userInfoParams = buildUserInfoParams();
        await SpaceConnector.clientV2.identity.user.update<UserUpdateParameters, UserModel>(userInfoParams);

        showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.ALT_S_UPDATE_USER'), '');
        handleClose();
        emit('confirm');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.USER.MAIN.MODAL.ALT_E_UPDATE_USER'));
    } finally {
        state.loading = false;
    }
};
const fetchRoleBinding = async (item?: AddModalMenuItem) => {
    if (state.data.user_id === store.state.user.userId) return;
    if (isEmpty(formState.role)) return;

    const roleParams = {
        role_id: formState.role.name || '',
    };

    const roleBindingItem = state.roleBindingList[0];

    try {
        if (state.roleBindingList.length === 0) {
            await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>({
                ...roleParams,
                workspace_id: item?.name || '',
                user_id: state.data.user_id || '',
                resource_group: RESOURCE_GROUP.DOMAIN,
            });
        } else {
            await SpaceConnector.clientV2.identity.roleBinding.updateRole<RoleBindingUpdateRoleParameters, RoleBindingModel>({
                ...roleParams,
                role_binding_id: roleBindingItem?.role_binding_id || '',
            });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const fetchDeleteRoleBinding = async () => {
    const roleBindingItem = state.roleBindingList[0];

    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>({
            role_binding_id: roleBindingItem?.role_binding_id || '',
        });
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const fetchPostDisableMfa = async () => {
    state.mfaLoading = true;
    try {
        await postUserDisableMfa({
            user_id: state.data.user_id || '',
        });
        if (state.loginUserId === state.data.user_id) {
            await store.dispatch('user/setUser', {
                mfa: {
                    ...state.data?.mfa,
                    state: 'DISABLED',
                },
            });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        state.mfaLoading = false;
    }
};
const fetchListRoleBindingInfo = async () => {
    const response = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>({
        user_id: state.data.user_id || '',
        query: {
            filter: [{ k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: 'eq' }],
        },
    });
    const results = response.results || [];
    if (results?.length > 0) {
        const matchingRole = userPageState.roles.find((r) => r.role_id === results[0].role_id);
        formState.role = matchingRole ? {
            label: matchingRole.name,
            name: matchingRole.role_id,
            role_type: matchingRole.role_type,
        } : {};
    }

    state.roleBindingList = results || [];
};

/* Watcher */
watch(() => userPageState.modal.visible.form, async (visible) => {
    if (visible) {
        await setForm();
        await fetchListRoleBindingInfo();
    } else {
        formState.password = '';
        formState.passwordType = '';
        formState.passwordManual = false;
        formState.role = {} as AddModalMenuItem;
    }
});
</script>

<template>
    <p-button-modal class="user-management-modal"
                    :header-title="userPageState.modal.title"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.modal.visible.form"
                    :disabled="formState.passwordManual && formState.password === ''"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="input-form-wrapper">
                <user-management-form-info-form :name.sync="formState.name" />
                <user-management-form-notification-email-form
                    v-if="state.smtpEnabled"
                    @change-input="handleChangeInputs"
                    @change-verify="handleChangeVerify"
                />
                <user-management-form-password-form
                    v-if="state.data.auth_type === 'LOCAL'"
                    @change-input="handleChangeInputs"
                />
                <user-management-form-multi-factor-auth :is-changed-toggle.sync="state.isChangedMfaToggle" />
                <user-management-form-admin-role v-if="userPageState.isAdminMode"
                                                 :role.sync="formState.role"
                                                 :is-changed-toggle.sync="state.isChangedRoleToggle"
                />
                <user-management-add-tag v-if="userPageState.isAdminMode"
                                         :tags.sync="formState.tags"
                                         is-edit
                                         is-form-visible
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.user-management-modal {
    .input-form-wrapper {
        @apply flex flex-col bg-gray-100 rounded-lg;
        padding: 1rem;
        gap: 1rem;
        & + .input-form-wrapper {
            margin-top: 1.5rem;
        }
    }
}

.p-field-group {
    margin-bottom: 0;
}
</style>
