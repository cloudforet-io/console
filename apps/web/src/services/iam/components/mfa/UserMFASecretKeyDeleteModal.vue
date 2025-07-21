<script setup lang="ts">
import { computed } from 'vue';

import type { UserDisableMfaParameters } from '@/api-clients/identity/user/schema/api-verbs/disable-mfa';
import { i18n as _i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';


import { useUserMfaDisableMutation } from '@/services/iam/composables/mutations/use-user-mfa-disable-mutation';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';


/* Store */
const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
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
    userPageStore.updateModalSettings({
        type: '',
        title: '',
        themeColor: 'primary',
        modalVisibleType: undefined,
    });
};

/* Events */
const handleClose = () => {
    closeModal();
};

const handleDeleteMfaSecretKey = async () => {
    if (isDisableMfaPending.value) return;

    // Disable MFA Promise for each user (Bulk)
    const userMFADisablePromises = selectedMFAEnabledUsers.value.map(async (user) => {
        if (!user.user_id) {
            if (import.meta.env.DEV) throw new Error('[UserMFASecretKeyDeleteModal.vue] There are users without user_id');
            else throw new Error('[User MFA Secret Key Delete] Something went wrong! Try again later. If the problem persists, please contact support.');
        }
        return disableMfa({ user_id: user.user_id });
    });


    try {
        // Disable MFA Promise for each user (Bulk)
        const results = await Promise.allSettled(userMFADisablePromises);
        if (results.every((result) => result.status === 'fulfilled')) {
            showSuccessMessage(_i18n.t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_SUCCESS_MESSAGE'), '');
            closeModal();
        } else if (results.some((result) => result.status === 'rejected')) { // Bulk disable MFA failed
            if (import.meta.env.DEV) {
                const joinedFailedUserIds = Array.from(failedUserIds.keys())?.join(', ');
                throw new Error(`[UserMFASecretKeyDeleteModal.vue] Bulk disable MFA failed user IDs: [${joinedFailedUserIds}]`);
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
    <delete-modal :visible="userPageState.modal.visible === 'deleteMfaSecretKey'"
                  :header-title="$t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_MODAL_TITLE')"
                  :disabled="selectedMFAEnabledUsers.length === 0"
                  :loading="isDisableMfaPending"
                  :confirm-text="$t('COMMON.BUTTONS.DELETE')"
                  @confirm="handleDeleteMfaSecretKey"
                  @cancel="handleClose"
                  @close="handleClose"
    >
        <i18n path="IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_MODAL_DESC">
            <template #selectedUsers>
                {{ selectedMFAEnabledUsers.length }}
            </template>
        </i18n>
    </delete-modal>
</template>
