<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PScopedNotification,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE, MFA_STATE } from '@/schema/identity/user-profile/constant';
import type { MultiFactorAuthType } from '@/schema/identity/user-profile/type';
import type { UserUpdateParameters } from '@/schema/identity/user/api-verbs/update';
import type { UserModel } from '@/schema/identity/user/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserMFASettingFormLayout from '@/services/iam/components/mfa/UserMFASettingFormLayout.vue';
import { USER_MODAL_MAP } from '@/services/iam/constants/modal-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';


interface UserBulkMFASettingModalEmits {
    (e: 'confirm'): void;
}
const emit = defineEmits<UserBulkMFASettingModalEmits>();

/* Store */
const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageModalState = userPageStore.modalState;
const userPageGetters = userPageStore.getters;

/* State */
const state = reactive({
    loading: false,
    selectedMfaType: MULTI_FACTOR_AUTH_TYPE.OTP as MultiFactorAuthType,
    isRequiredMfa: false,
});

/* Computed */
// Only Local Auth Type Users can be updated
const selectedMFAControllableUsers = computed<UserListItemType[]>(() => userPageGetters.selectedUsers.filter((user) => user.auth_type === 'LOCAL'));

// UI Conditions
const isIncludedExternalAuthTypeUser = computed<boolean>(() => userPageGetters.selectedUsers.some((user) => user.auth_type !== 'LOCAL'));

/* API */
// Store failed user IDs
const failedUserIds = new Set<string>();
const updateUser = async (user: UserUpdateParameters) => {
    try {
        await SpaceConnector.clientV2.identity.user.update<UserUpdateParameters, UserModel>(user);
    } catch (error: any) {
        failedUserIds.add(user.user_id);
        throw new Error(error.message);
    }
};

/* Utils */
const closeModal = () => {
    userPageStore.setBulkMfaSettingModalVisible(false);
};
const initMfaState = () => {
    const firstUser = userPageGetters.selectedUsers[0];
    if (firstUser) {
        state.isRequiredMfa = !!firstUser.mfa?.options?.enforce;
        state.selectedMfaType = firstUser.mfa?.mfa_type || MULTI_FACTOR_AUTH_TYPE.OTP;
    }
};

/* Events */
const handleOpenDisableMfaModal = () => {
    closeModal();
    userPageStore.setMfaSecretKeyDeleteModalVisible(true);
    userPageStore.setPreviousModalType(USER_MODAL_MAP.SET_MFA);
};
const handleClose = () => {
    closeModal();
};

const handleConfirm = async () => {
    if (state.loading) return;

    // Update MFA Promise for each user (Bulk)
    const userUpdatePromises = selectedMFAControllableUsers.value.map(async (user) => {
        if (!user.user_id) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingModal.vue] There are users without user_id');
            else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }

        // API Policy: enforce_mfa_type is required when enforce_mfa_state is ENABLED
        if (state.isRequiredMfa && !state.selectedMfaType) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingModal.vue] MFA type is required when required MFA is true.');
            else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }

        return updateUser({
            user_id: user.user_id,
            enforce_mfa_state: state.isRequiredMfa ? MFA_STATE.ENABLED : MFA_STATE.DISABLED,
            ...(state.isRequiredMfa && { enforce_mfa_type: state.selectedMfaType }),
        });
    });

    if (userUpdatePromises.length === 0) {
        showErrorMessage('[User MFA Setting] There are no users to update.', '');
        return;
    }

    try {
        const results = await Promise.allSettled(userUpdatePromises);
        if (results.every((result) => result.status === 'fulfilled')) {
            showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_SUCCESS_MESSAGE'), '');
            closeModal();
            emit('confirm');
        } else if (results.some((result) => result.status === 'rejected')) { // Bulk update MFA failed
            if (import.meta.env.DEV) {
                const joinedFailedUserIds = Array.from(failedUserIds.keys()).join(', ');
                throw new Error(`[UserMFASettingModal.vue] Bulk update MFA failed user IDs: [${joinedFailedUserIds}]`);
            } else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        // Clear failed user IDs
        failedUserIds.clear();
    }
};

/* Watcher */
watch(() => userPageModalState.bulkMfaSettingModalVisible, (visible) => {
    if (visible) initMfaState();
}, { immediate: true });
</script>

<template>
    <p-button-modal class="user-bulk-mfa-setting-modal"
                    size="sm"
                    :visible="userPageModalState.bulkMfaSettingModalVisible"
                    :header-title="$t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_MODAL_TITLE')"
                    :theme-color="userPageState.modal.themeColor"
                    :loading="state.loading"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-scoped-notification v-if="isIncludedExternalAuthTypeUser"
                                   type="warning"
                                   :title="$t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_WARNING_TITLE')"
                                   icon="ic_warning-filled"
                                   layout="in-section"
                                   class="mb-4"
            >
                <span>{{ $t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_WARNING_DESC') }}</span>
            </p-scoped-notification>

            <div class="p-4 bg-gray-100 rounded-lg">
                <user-m-f-a-setting-form-layout :selected-mfa-controllable-target="selectedMFAControllableUsers"
                                                :is-required-mfa.sync="state.isRequiredMfa"
                                                :selected-mfa-type.sync="state.selectedMfaType"
                                                @click-disable-mfa="handleOpenDisableMfaModal"
                />
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_MODAL_CONFIRM_BUTTON_TEXT') }}
        </template>
    </p-button-modal>
</template>
