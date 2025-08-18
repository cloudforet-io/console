<script setup lang="ts">
import {
    computed, type ComputedRef, reactive, ref, watch,
} from 'vue';

import { cloneDeep, isEmpty } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { MFA_STATE } from '@/api-clients/identity/user-profile/schema/constant';
import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { postUserValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserMFASettingFormLayout from '@/services/iam/components/mfa/UserMFASettingFormLayout.vue';
import UserManagementAddTag from '@/services/iam/components/UserManagementAddTag.vue';
import UserManagementFormAdminRole from '@/services/iam/components/UserManagementFormAdminRole.vue';
import UserManagementFormInfoForm from '@/services/iam/components/UserManagementFormInfoForm.vue';
import UserManagementFormNotificationEmailForm
    from '@/services/iam/components/UserManagementFormNotificationEmailForm.vue';
import UserManagementFormPasswordForm from '@/services/iam/components/UserManagementFormPasswordForm.vue';
import { useUserUpdateMutation } from '@/services/iam/composables/mutations/use-user-update-mutation';
import { useRoleBindingDeleteMutation } from '@/services/iam/composables/role-binding/mutations/use-role-binding-delete-mutation';
import { useRoleBindingListQuery } from '@/services/iam/composables/role-binding/use-role-binding-list-query';
import { useUserGetQuery } from '@/services/iam/composables/use-admin-user-get-query';
import { useRoleBindingCreateMutation } from '@/services/iam/composables/use-role-binding-create-mutation';
import { useRoleBindingUpdateRoleMutation } from '@/services/iam/composables/use-role-binding-update-role-mutation';
import { useRoleListQuery } from '@/services/iam/composables/use-role-list-query';
import { USER_MODAL_MAP } from '@/services/iam/constants/modal.constant';
import { MULTI_FACTOR_AUTH_ITEMS, PASSWORD_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { AddModalMenuItem } from '@/services/iam/types/user-type';


interface UserMFASettingFormState {
    isRequiredMfa: boolean;
    selectedMfaType: MultiFactorAuthType;
}
interface Emits {
    (e: 'confirm'): void;
}
interface State {
    mfaLoading: boolean;
    smtpEnabled: ComputedRef<boolean>;
    mfa: ComputedRef<UserMfa|undefined>;
    loginUserId: ComputedRef<string|undefined>;
    isChangedMfaToggle: boolean;
    isChangedRoleToggle: boolean;
}

const emit = defineEmits<Emits>();


const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userStore = useUserStore();

/* Queries */
const { roleListData: roles } = useRoleListQuery();
const { data: userData, isLoading: isUserLoading } = useUserGetQuery({
    userId: computed(() => userPageState.selectedUserForForm?.user_id || ''),
});
const { data: roleBindingListData, isLoading: isRoleBindingListLoading } = useRoleBindingListQuery({
    params: computed(() => ({
        user_id: userData.value?.user_id || '',
        query: {
            filter: [{ k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: 'eq' }],
        },
    })),
    enabled: computed(() => !!userData.value?.user_id && userPageState.modal.visible === 'form'),
});
const roleBindingList = computed<RoleBindingModel[]>(() => roleBindingListData.value?.results || []);

const state = reactive<State>({
    mfaLoading: false,
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    mfa: computed<UserMfa|undefined>(() => userStore.state.mfa),
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    isChangedMfaToggle: false,
    isChangedRoleToggle: false,
});

const mfaSettingFormState = reactive<UserMFASettingFormState>({
    isRequiredMfa: false,
    selectedMfaType: MULTI_FACTOR_AUTH_ITEMS[0].type,
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

const tagModifiedByUser = ref<boolean>(false);

/* Components */
const closeModal = () => {
    userPageStore.$patch((_state) => {
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};
const handleClose = () => {
    closeModal();
    userPageStore.setSelectedUserForForm(undefined);
};
const setForm = () => {
    formState.name = userData.value?.name || '';
    formState.email = userData.value?.email || '';
    formState.tags = userData.value?.tags || {};
};

/* Events */
const handleChangeInputs = (value) => {
    if (value.email) formState.email = value.email;
    if (value.isValidEmail !== undefined) formState.isValidEmail = value.isValidEmail;
    if (value.password) formState.password = value.password || '';
    if (value.passwordType) formState.passwordType = value.passwordType;
    if (value.role) formState.role = value.role;
};


const handleOpenDisableMfaModal = () => {
    closeModal();
    userPageStore.setMfaSecretKeyDeleteModalVisible(true);
    userPageStore.setPreviousModalType(USER_MODAL_MAP.UPDATE);
};
const handleConfirm = async () => {
    const userInfoParams = buildUserInfoParams();
    if (userData.value?.auth_type === 'LOCAL') { // Only Local Auth Type Users can be updated
        const existingMfa = userData.value?.mfa;
        if (!!existingMfa?.options?.enforce !== mfaSettingFormState.isRequiredMfa) { // switch required mfa state Case
            userInfoParams.enforce_mfa_state = mfaSettingFormState.isRequiredMfa ? MFA_STATE.ENABLED : MFA_STATE.DISABLED;
            if (userInfoParams.enforce_mfa_state === MFA_STATE.ENABLED) {
                userInfoParams.enforce_mfa_type = mfaSettingFormState.isRequiredMfa ? mfaSettingFormState.selectedMfaType : undefined;
            }
        } else if (mfaSettingFormState.isRequiredMfa && existingMfa?.mfa_type !== mfaSettingFormState.selectedMfaType) { // switch mfa type Case (enforce mfa state is true)
            userInfoParams.enforce_mfa_state = MFA_STATE.ENABLED;
            userInfoParams.enforce_mfa_type = mfaSettingFormState.selectedMfaType;
        }
    }
    await updateUser(userInfoParams);
};


/* APIs */
const buildUserInfoParams = (): UserUpdateParameters => ({
    user_id: userData.value?.user_id || '',
    name: formState.name,
    email: formState.isValidEmail ? formState.email : userData.value?.email || '',
    tags: formState.tags ? { ...formState.tags } : {},
    password: formState.password || '',
    reset_password: userData.value?.auth_type === 'LOCAL' && formState.passwordType === PASSWORD_TYPE.RESET,
});

const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUserUpdateMutation({
    onMutate: async () => {
        if (roleBindingList.value.length > 0 && !state.isChangedRoleToggle) {
            await deleteRoleBinding({
                role_binding_id: roleBindingList.value[0].role_binding_id || '',
            });
        } else {
            await fetchRoleBinding();
        }
    },
    onSuccess: async (_, variables) => {
        // Verify Email
        if (formState.isValidEmail) {
            await verifyUserEmail();

            // NOTE: Should refactor this after User Query is implemented
            if (state.loginUserId === variables.user_id) {
                await userStore.updateUser({
                    email: variables.email,
                });
                userStore.setEmailVerified(true);
            }
        }

        showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.ALT_S_UPDATE_USER'), '');
        closeModal();
        emit('confirm');
        userPageStore.setSelectedUserForForm(undefined);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.USER.MAIN.MODAL.ALT_E_UPDATE_USER'));
    },
});

const { mutateAsync: deleteRoleBinding, isPending: isDeletingRoleBinding } = useRoleBindingDeleteMutation({
    onError: (e) => {
        ErrorHandler.handleRequestError(e, e.message);
    },
});
const { mutateAsync: createRoleBinding, isPending: isCreatingRoleBinding } = useRoleBindingCreateMutation({
    onError: (e) => {
        ErrorHandler.handleRequestError(e, e.message);
    },
});
const { mutateAsync: updateRoleBinding, isPending: isUpdatingRoleBinding } = useRoleBindingUpdateRoleMutation({
    onError: (e) => {
        ErrorHandler.handleRequestError(e, e.message);
    },
});


const fetchRoleBinding = async (item?: AddModalMenuItem) => {
    if (userData.value?.user_id === userStore.state.userId) return;
    if (isEmpty(formState.role)) return;

    if (roleBindingList.value.length === 0) {
        await createRoleBinding({
            role_id: formState.role.name || '',
            workspace_id: item?.name || '',
            user_id: userData.value?.user_id || '',
            resource_group: RESOURCE_GROUP.DOMAIN,
        });
    } else {
        await updateRoleBinding({
            role_id: formState.role.name || '',
            role_binding_id: roleBindingList.value[0].role_binding_id || '',
        });
    }
};

const verifyUserEmail = async () => {
    await postUserValidationEmail({
        user_id: userData.value?.user_id || '',
        email: userData.value?.email || '',
    });
};

const isLoading = computed(() => (
    isUserLoading.value
    || isRoleBindingListLoading.value
    || isUpdatingUser.value
    || isDeletingRoleBinding.value
    || isCreatingRoleBinding.value
    || isUpdatingRoleBinding.value
));

/* Watcher */
watch(() => userPageState.modal.visible, async (visible) => {
    if (visible === 'form') {
        await setForm();
    } else {
        formState.password = '';
        formState.passwordType = '';
        formState.passwordManual = false;
        formState.isValidEmail = false;
        formState.role = {} as AddModalMenuItem;
        tagModifiedByUser.value = false;
    }
});

watch([roleBindingList, roles, () => userPageState.modal.visible], ([list, _roles, _visible]) => {
    if (_visible !== 'form') return;
    const roleList = _roles || [];
    if (list && list.length > 0) {
        const matchingRole = roleList.find((r) => r.role_id === list[0].role_id);
        formState.role = matchingRole ? {
            label: matchingRole.name,
            name: matchingRole.role_id,
            role_type: matchingRole.role_type,
        } : {};
    }
}, { immediate: true });

watch(() => userData.value?.mfa, (mfa) => {
    if (mfa) {
        mfaSettingFormState.isRequiredMfa = !!mfa.options?.enforce;
        mfaSettingFormState.selectedMfaType = mfa.mfa_type || MULTI_FACTOR_AUTH_ITEMS[0].type;
    }
}, { immediate: true });

watch(() => userData.value?.tags, (tags) => {
    if (tags !== undefined && userPageState.modal.visible === 'form' && !tagModifiedByUser.value) {
        formState.tags = { ...tags };
    }
}, { immediate: true });

</script>

<template>
    <p-button-modal class="user-management-modal"
                    :header-title="userPageState.modal.title"
                    size="md"
                    :loading="isLoading"
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
                    v-if="userData?.auth_type === 'LOCAL'"
                    @change-input="handleChangeInputs"
                />
                <user-m-f-a-setting-form-layout v-if="userData?.auth_type === 'LOCAL'"
                                                :selected-mfa-controllable-target="userData"
                                                :is-required-mfa.sync="mfaSettingFormState.isRequiredMfa"
                                                :selected-mfa-type.sync="mfaSettingFormState.selectedMfaType"
                                                @click-disable-mfa="handleOpenDisableMfaModal"
                />
                <user-management-form-admin-role v-if="userPageState.isAdminMode"
                                                 :role.sync="formState.role"
                                                 :is-changed-toggle.sync="state.isChangedRoleToggle"
                />
                <user-management-add-tag v-if="userPageState.isAdminMode && userData"
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
