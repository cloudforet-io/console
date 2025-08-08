<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleCreateParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/create';
import type { RoleBindingDeleteParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/delete';
import type { RoleBindingListParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/list';
import type { RoleBindingUpdateRoleParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/update-role';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import type { UserMfa, UserModel } from '@/api-clients/identity/user/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { postUserDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { postUserValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementAddTag from '@/services/iam/components/UserManagementAddTag.vue';
import UserManagementFormAdminRole from '@/services/iam/components/UserManagementFormAdminRole.vue';
import UserManagementFormInfoForm from '@/services/iam/components/UserManagementFormInfoForm.vue';
import UserManagementFormMultiFactorAuth
    from '@/services/iam/components/UserManagementFormMultiFactorAuth.vue';
import UserManagementFormNotificationEmailForm
    from '@/services/iam/components/UserManagementFormNotificationEmailForm.vue';
import UserManagementFormPasswordForm from '@/services/iam/components/UserManagementFormPasswordForm.vue';
import { useRoleListQuery } from '@/services/iam/composables/use-role-list-query';
import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { PASSWORD_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { AddModalMenuItem, UserListItemType } from '@/services/iam/types/user-type';


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
const userPageState = userPageStore.state;
const userStore = useUserStore();

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { userListData: selectedUsers } = useUserListQuery(selectedUserIds);
const { roleListData: roles } = useRoleListQuery();

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    mfaLoading: false,
    data: computed<UserListItemType>(() => selectedUsers.value?.[0] ?? {}),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    mfa: computed<UserMfa|undefined>(() => userStore.state.mfa),
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    isChangedMfaToggle: false,
    isChangedRoleToggle: false,
    roleBindingList: [] as RoleBindingModel[],
});
const formState = reactive({
    name: '',
    email: '',
    isValidEmail: false,
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
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};
const setForm = () => {
    formState.name = state.data.name || '';
    formState.email = state.data.email || '';
    formState.tags = state.data.tags || {};
};
const handleChangeInputs = (value) => {
    if (value.email) formState.email = value.email;
    if (value.isValidEmail !== undefined) formState.isValidEmail = value.isValidEmail;
    if (value.password) formState.password = value.password || '';
    if (value.passwordType) formState.passwordType = value.passwordType;
    if (value.role) formState.role = value.role;
};
const buildUserInfoParams = (): UserManagementData => ({
    user_id: state.data.user_id || '',
    name: formState.name,
    email: formState.isValidEmail ? formState.email : state.data.email || '',
    tags: formState.tags || {},
    password: formState.password || '',
    reset_password: state.data.auth_type === 'LOCAL' && formState.passwordType === PASSWORD_TYPE.RESET,
});

const { userAPI } = useUserApi();
const { key: userListQueryKey } = useServiceQueryKey('identity', 'user', 'list');
const { withSuffix: userGetQueryKey } = useServiceQueryKey('identity', 'user', 'get');
const queryClient = useQueryClient();

const { mutateAsync: updateUser } = useMutation({
    mutationFn: userAPI.update,
    onSuccess: async () => {
        if (formState.isValidEmail) {
            await updateUserEmail();
            await verifyUserEmail();
            if (state.loginUserId === state.data.user_id) {
                await userStore.updateUser({
                    email: state.data.email,
                });
                userStore.setEmailVerified(true);
            }
            userPageStore.setUserEmail(state.data.user_id, state.data.email);
        }
        if (state.isChangedMfaToggle) {
            await fetchPostDisableMfa();
        }

        if (state.roleBindingList.length > 0 && !state.isChangedRoleToggle) {
            await fetchDeleteRoleBinding();
        } else {
            await fetchRoleBinding();
        }

        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGetQueryKey(state.data.user_id ?? '') });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.ALT_S_UPDATE_USER'), '');
        handleClose();
        emit('confirm');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.USER.MAIN.MODAL.ALT_E_UPDATE_USER'));
    },
});

/* API */
const handleConfirm = async () => {
    const userInfoParams = buildUserInfoParams();
    await updateUser(userInfoParams);
};
const fetchRoleBinding = async (item?: AddModalMenuItem) => {
    if (state.data.user_id === userStore.state.userId) return;
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
            userStore.setMfa({
                ...state.data.mfa as UserMfa,
                state: 'DISABLED',
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
        const matchingRole = roles.value?.find((r) => r.role_id === results[0].role_id);
        formState.role = matchingRole ? {
            label: matchingRole.name,
            name: matchingRole.role_id,
            role_type: matchingRole.role_type,
        } : {};
    }

    state.roleBindingList = results || [];
};
const updateUserEmail = async () => {
    await SpaceConnector.clientV2.identity.user.update<UserUpdateParameters, UserModel>({
        user_id: state.data.user_id || '',
        email: state.data.email || '',
    });
};
const verifyUserEmail = async () => {
    await postUserValidationEmail({
        user_id: state.data.user_id || '',
        email: state.data.email || '',
    });
};

/* Watcher */
watch(() => userPageState.modal.visible, async (visible) => {
    if (visible === 'form') {
        await setForm();
        await fetchListRoleBindingInfo();
    } else {
        formState.password = '';
        formState.passwordType = '';
        formState.passwordManual = false;
        formState.isValidEmail = false;
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
                    :visible="userPageState.modal.visible === 'form'"
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
