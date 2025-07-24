<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleCreateParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/create';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { MFA_STATE } from '@/api-clients/identity/user-profile/schema/constant';
import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import type { UserCreateParameters } from '@/api-clients/identity/user/schema/api-verbs/create';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import type { AuthType } from '@/api-clients/identity/user/schema/type';
import type { WorkspaceGroupAddUsersParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/add-users';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import type { WorkspaceUserCreateParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/create';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { i18n } from '@/translations';

import { useDomainStore } from '@/store/domain/domain-store';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserMFASettingEnforceForm from '@/services/iam/components/mfa/UserMFASettingEnforceForm.vue';
import UserManagementAddAdminRole from '@/services/iam/components/UserManagementAddAdminRole.vue';
import UserManagementAddPassword from '@/services/iam/components/UserManagementAddPassword.vue';
import UserManagementAddRole from '@/services/iam/components/UserManagementAddRole.vue';
import UserManagementAddTag from '@/services/iam/components/UserManagementAddTag.vue';
import UserManagementAddUser from '@/services/iam/components/UserManagementAddUser.vue';
import { MULTI_FACTOR_AUTH_ITEMS, USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { checkEmailFormat } from '@/services/iam/helpers/user-management-form-validations';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { AddModalMenuItem, AddAdminRoleFormState } from '@/services/iam/types/user-type';

interface UserMFASettingFormState {
    isRequiredMfa: boolean;
    selectedMfaType: MultiFactorAuthType;
}

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const domainStore = useDomainStore();

const route = useRoute();

const emit = defineEmits<{(e: 'confirm'): void; }>();

const storeState = reactive({
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
});
const state = reactive({
    loading: false,
    disabledResetPassword: false,
    disabled: computed(() => {
        if (userPageState.isAdminMode && !state.isSetAdminRole) {
            const baseCondition = state.userList.length === 0 || ((state.workspaceGroup.length === 0 && state.workspace.length === 0) || isEmpty(state.role));
            if (state.localUserItem.length > 0 && !state.isResetPassword) {
                return state.password === '' || baseCondition;
            }
            return baseCondition;
        }
        const baseCondition = state.userList.length === 0 || isEmpty(state.role);
        if (state.resetPasswordVisible && !state.isResetPassword) {
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
    workspaceGroup: [] as AddModalMenuItem[],
    isSetAdminRole: false,
    // tag
    tags: {} as Tags,
});

const mfaSettingState = reactive<UserMFASettingFormState>({
    isRequiredMfa: false,
    selectedMfaType: MULTI_FACTOR_AUTH_ITEMS[0].type,
});

/* Component */
const handleAdminRoleChangeInput = (items: AddAdminRoleFormState) => {
    if (items.role) state.role = items.role;
    if (items.workspace) state.workspace = items.workspace;
    if (items.workspaceGroup) state.workspaceGroup = items.workspaceGroup;
};
const handleChangeInput = (items) => {
    if (items.role) state.role = items.role;
    if (items.userList) {
        state.userList = items.userList;
        const newUserItem = state.userList.filter((item) => item.isNew);
        state.localUserItem = state.userList.filter((item) => item.auth_type === 'EMAIL' || item.auth_type === 'ID');
        state.resetPasswordVisible = state.localUserItem.length > 0 && newUserItem.length > 0;
        const emailUsers = state.userList.filter((item) => item.auth_type === 'EMAIL');
        state.isResetPassword = (emailUsers.length === state.userList.length) && storeState.smtpEnabled;
        state.disabledResetPassword = (emailUsers.length !== state.userList.length) || !storeState.smtpEnabled;
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
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
        _state.state.createdWorkspaceId = undefined;
        _state.state.afterWorkspaceCreated = false;
    });
};
/* API */
const fetchCreateUser = async (item: AddModalMenuItem): Promise<void> => {
    const domainSettings = domainStore.state.config?.settings;
    const { isValid } = checkEmailFormat(item.user_id || '');
    const userInfoParams: UserCreateParameters|WorkspaceUserCreateParameters = {
        user_id: item.user_id || '',
        email: !isValid ? '' : item.user_id,
        auth_type: item.auth_type === 'EMAIL' || item.auth_type === 'ID' ? 'LOCAL' : item.auth_type as AuthType,
        password: state.password || '',
        reset_password: item.auth_type === 'EMAIL' && state.isResetPassword,
        language: domainSettings?.language || 'en',
        timezone: domainSettings?.timezone || 'UTC',
    };

    if (userPageState.isAdminMode && userInfoParams.auth_type === 'LOCAL') {
        userInfoParams.enforce_mfa_state = mfaSettingState.isRequiredMfa ? MFA_STATE.ENABLED : undefined;
        userInfoParams.enforce_mfa_type = mfaSettingState.isRequiredMfa ? mfaSettingState.selectedMfaType : undefined;
    }

    const createRoleBinding = async () => {
        if (userPageStore.getters.isWorkspaceOwner || state.isSetAdminRole) {
            await fetchCreateRoleBinding(item);
        } else if (userPageState.afterWorkspaceCreated) {
            await fetchCreateRoleBinding({ ...item, workspace_id: userPageState.createdWorkspaceId });
        } else {
            await Promise.allSettled(state.workspace.map((w) => fetchCreateRoleBinding(item, w)));
            await Promise.allSettled(state.workspaceGroup.map((wg) => fetchAddUserToWorkspaceGroup(item, wg)));
        }
    };

    try {
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
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const fetchCreateRoleBinding = async (userItem: AddModalMenuItem, item?: AddModalMenuItem) => {
    let roleParams: RoleCreateParameters;
    const baseRoleParams = {
        user_id: userItem.user_id || '',
        role_id: state.role.name || '',
        resource_group: state.isSetAdminRole ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
    };
    if (userPageStore.getters.isWorkspaceOwner || state.isSetAdminRole) {
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

const fetchAddUserToWorkspaceGroup = async (userItem: AddModalMenuItem, item?: AddModalMenuItem) => {
    if (!userItem.user_id) return;
    await SpaceConnector.clientV2.identity.workspaceGroup.addUsers<WorkspaceGroupAddUsersParameters, WorkspaceGroupModel>({
        workspace_group_id: item?.name || '',
        users: [{
            user_id: userItem.user_id, role_id: state.role.name || '',
        }],
    });
};

watch(() => route.query, (query) => {
    if (!query) return;
    if (query.isAddUser) {
        state.isSetAdminRole = true;
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal ref="containerRef"
                    class="user-management-additional-modal"
                    modal-body-id="workspace-role-form"
                    :header-title="userPageState.modal.title"
                    size="md"
                    :theme-color="userPageState.modal.themeColor"
                    :fade="true"
                    :backdrop="true"
                    :loading="state.loading"
                    :visible="userPageState.modal.visible === 'add'"
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
                                              :disabled-reset-password="state.disabledResetPassword"
                />
                <div v-if="userPageState.isAdminMode && state.userList.length > 0 && !state.userList.some((item) => item.auth_type === 'EXTERNAL')"
                     class="p-3 bg-white rounded-lg"
                >
                    <user-m-f-a-setting-enforce-form :is-required-mfa.sync="mfaSettingState.isRequiredMfa"
                                                     :selected-mfa-type.sync="mfaSettingState.selectedMfaType"
                    />
                </div>
                <user-management-add-admin-role v-if="userPageState.isAdminMode"
                                                :is-set-admin-role.sync="state.isSetAdminRole"
                                                @change-input="handleAdminRoleChangeInput"
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
    min-height: 34.875rem;
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
