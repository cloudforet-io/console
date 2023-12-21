<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PButtonModal } from '@spaceone/design-system';
import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { Tags } from '@/schema/_common/model';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleUpdateParameters } from '@/schema/identity/role-binding/api-verbs/update';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { UserUpdateParameters } from '@/schema/identity/user/api-verbs/update';
import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import config from '@/lib/config';
import { postDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementAddAdminRole from '@/services/administration/components/UserManagementAddAdminRole.vue';
import UserManagementAddTag from '@/services/administration/components/UserManagementAddTag.vue';
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
    isChangedToggle: false,
    isSetAdminRole: false,
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
    roleBindingId: computed(() => state.roleBindingList.find((r) => r.role_id === formState.role.name)?.role_binding_id),
    workspace: [] as AddModalMenuItem[],
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
    if (value.workspace) formState.workspace = value.workspace;
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
const buildRoleParams = (item?: AddModalMenuItem): any => {
    const baseRoleParams = {
        role_id: formState.role.name || '',
    };
    console.log(isEmpty(formState.role));
    if (isEmpty(formState.role)) {
        return baseRoleParams;
    }
    return {
        ...baseRoleParams,
        workspace_id: item?.name || '',
    };
};

/* API */
const handleConfirm = async () => {
    console.log('confirm!');
    state.loading = true;

    try {
        if (state.isChangedToggle) {
            await fetchPostDisableMfa();
        }

        if (state.isSetAdminRole) {
            await fetchRoleBinding();
        } else {
            console.log('all');
            await Promise.all(formState.workspace.map(fetchRoleBinding));
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
    if (isEmpty(formState.role)) return;

    const roleParams = buildRoleParams(item);

    try {
        if (formState.roleBindingId) {
            await SpaceConnector.clientV2.identity.roleBinding.update<RoleUpdateParameters, RoleBindingModel>({
                ...roleParams,
                role_binding_id: formState.roleBindingId,
            });
        } else {
            await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>({
                ...roleParams,
                user_id: state.data.user_id || '',
                resource_group: state.isSetAdminRole ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
            });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const fetchPostDisableMfa = async () => {
    state.mfaLoading = true;
    try {
        await postDisableMfa({
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
    const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleListParameters, ListResponse<RoleBindingModel>>({
        user_id: state.data.user_id || '',
    });
    state.roleBindingList = results || [];
};

/* Watcher */
watch(() => userPageState.modal.visible.form, async (visible) => {
    if (visible) {
        await setForm();
        await fetchListRoleBindingInfo();
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
                    v-if="!state.smtpEnabled"
                    @change-input="handleChangeInputs"
                    @change-verify="handleChangeVerify"
                />
                <user-management-form-password-form
                    v-if="state.data.auth_type === 'LOCAL'"
                    @change-input="handleChangeInputs"
                />
                <user-management-form-multi-factor-auth :is-changed-toggle.sync="state.isChangedToggle" />
                <user-management-add-admin-role v-if="userPageState.isAdminMode"
                                                :is-set-admin-role.sync="state.isSetAdminRole"
                                                @change-input="handleChangeInputs"
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

<style lang="postcss">
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
