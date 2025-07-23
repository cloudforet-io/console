<script setup lang="ts">
import { computed } from 'vue';

import type { UserDisableMfaParameters } from '@/api-clients/identity/user/schema/api-verbs/disable-mfa';
import { i18n as _i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';


import { useUserMfaDisableMutation } from '@/services/iam/composables/mutations/use-user-mfa-disable-mutation';
import { USER_MODAL_MAP } from '@/services/iam/constants/modal.constant';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';

interface UserMFASecretKeyDeleteModalEmits {
    (e: 'confirm'): void;
}

const emit = defineEmits<UserMFASecretKeyDeleteModalEmits>();

/* Store */
const userPageStore = useUserPageStore();
const userPageModalState = userPageStore.modalState;
const userPageGetters = userPageStore.getters;

/* Computed */
// Only Local Auth Type Users can be disabled (disable = delete secret key)
const selectedMFAEnabledUsers = computed<UserListItemType[]>(() => userPageGetters.selectedUsers.filter((user) => user.auth_type === 'LOCAL' && user.mfa?.state === 'ENABLED') || []);

/* API */
// Store failed user IDs
const failedUserIds = new Set<string>();

const { mutateAsync: disableMfa, isPending: isDisableMfaPending } = useUserMfaDisableMutation({
    onError: (error: any, variables: UserDisableMfaParameters) => {
        failedUserIds.add(variables.user_id);
        throw new Error(error.message);
    },
});

/* Utils */
const closeModal = () => {
    userPageStore.setMfaSecretKeyDeleteModalVisible(false);
    userPageStore.setPreviousModalType(undefined);
};
const openPreviousModal = () => {
    if (userPageModalState.previousModalType === USER_MODAL_MAP.SET_MFA) {
        userPageStore.setBulkMfaSettingModalVisible(true);
    }
    if (userPageModalState.previousModalType === USER_MODAL_MAP.UPDATE) {
        userPageStore.updateModalSettings({
            type: USER_MODAL_TYPE.UPDATE,
            title: '',
            themeColor: 'primary',
            modalVisibleType: 'form',
        });
    }
};

/* Events */
const handleCancel = () => {
    openPreviousModal();
    closeModal();
};

const handleClose = () => {
    closeModal();
};

/* Events */
const handleDeleteMfaSecretKey = async () => {
    if (isDisableMfaPending.value) return;

    // Disable MFA Promise for each user (Bulk)
    const userMFADisablePromises = selectedMFAEnabledUsers.value.map(async (user) => {
        if (!user.user_id) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingDisableButton.vue] There are users without user_id');
            else throw new Error('[User MFA Secret Key Delete] Something went wrong! Try again later. If the problem persists, please contact support.');
        }
        return disableMfa({ user_id: user.user_id });
    });


    try {
        // Disable MFA Promise for each user (Bulk)
        const results = await Promise.allSettled(userMFADisablePromises);
        if (results.every((result) => result.status === 'fulfilled')) {
            showSuccessMessage(_i18n.t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_SUCCESS_MESSAGE'), '');
            openPreviousModal();
            closeModal();
            emit('confirm');
        } else if (results.some((result) => result.status === 'rejected')) { // Bulk disable MFA failed
            if (import.meta.env.DEV) {
                const joinedFailedUserIds = Array.from(failedUserIds.keys()).join(', ');
                throw new Error(`[UserMFASettingDisableButton.vue] Bulk disable MFA failed user IDs: [${joinedFailedUserIds}]`);
            } else throw new Error('[User MFA Secret Key Delete] Something went wrong! Try again later. If the problem persists, please contact support.');
        }
    } catch (error: any) {
        ErrorHandler.handleError(error);
        showErrorMessage(error.message, error);
    } finally {
        // Clear failed user IDs
        failedUserIds.clear();
    }
};
</script>

<template>
    <delete-modal :visible="userPageModalState.mfaSecretKeyDeleteModalVisible"
                  :header-title="$t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_MODAL_TITLE')"
                  :disabled="selectedMFAEnabledUsers.length === 0"
                  :loading="isDisableMfaPending"
                  :confirm-text="$t('COMMON.BUTTONS.DELETE')"
                  @confirm="handleDeleteMfaSecretKey"
                  @cancel="handleCancel"
                  @close="handleClose"
    >
        <template v-if="selectedMFAEnabledUsers.length === 1 && userPageModalState.previousModalType === USER_MODAL_MAP.UPDATE">
            {{ $t('IAM.USER.MAIN.MODAL.MFA.DELETE_SINGLE_MFA_SECRET_KEY_MODAL_DESC') }}
        </template>
        <i18n v-else
              path="IAM.USER.MAIN.MODAL.MFA.DELETE_MULTI_MFA_SECRET_KEY_MODAL_DESC"
        >
            <template #selectedUsers>
                {{ selectedMFAEnabledUsers.length }}
            </template>
        </i18n>
    </delete-modal>
</template>
