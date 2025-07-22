<script lang="ts" setup>
import { computed } from 'vue';

import { PButton } from '@cloudforet/mirinae';

import type { UserDisableMfaParameters } from '@/api-clients/identity/user/schema/api-verbs/disable-mfa';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { i18n as _i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ModalController from '@/common/components/modals/ModalController.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useUserMfaDisableMutation } from '@/services/iam/composables/mutations/use-user-mfa-disable-mutation';
import { USER_MODAL_MAP } from '@/services/iam/constants/modal.constant';

interface UserMFASettingDisableButtonProps {
    selectedTarget: UserModel | UserModel[];
}

const props = defineProps<UserMFASettingDisableButtonProps>();

/* Computed */
const selectedTargetUsers = computed<UserModel[]>(() => {
    if (Array.isArray(props.selectedTarget)) return props.selectedTarget;
    return [props.selectedTarget];
});
const isSingleTargetUser = computed<boolean>(() => !Array.isArray(props.selectedTarget));

/* API */
// Store failed user IDs
const failedUserIds = new Set<string>();

const { mutateAsync: disableMfa, isPending: isDisableMfaPending } = useUserMfaDisableMutation({
    onError: (error: any, variables: UserDisableMfaParameters) => {
        failedUserIds.add(variables.user_id);
        throw new Error(error.message);
    },
});

/* Events */
const handleDeleteMfaSecretKey = async (onClose: () => void) => {
    if (isDisableMfaPending.value) return;

    // Disable MFA Promise for each user (Bulk)
    const userMFADisablePromises = selectedTargetUsers.value.map(async (user) => {
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
            onClose();
        } else if (results.some((result) => result.status === 'rejected')) { // Bulk disable MFA failed
            if (import.meta.env.DEV) {
                const joinedFailedUserIds = Array.from(failedUserIds.keys()).join(', ');
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
    <div class="user-mfa-setting-disable-button">
        <modal-controller :modal-target="USER_MODAL_MAP.DISABLE_MFA">
            <template #trigger="{ trigger }">
                <p-button style-type="negative-secondary"
                          class="mt-4"
                          size="md"
                          :disabled="selectedTargetUsers.length === 0"
                          icon-left="ic_delete"
                          @click="trigger"
                >
                    {{ $t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_BUTTON_TEXT') }}
                </p-button>
            </template>
            <template #modal="{ visible, onClose }">
                <delete-modal :visible="visible"
                              :header-title="$t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_MODAL_TITLE')"
                              :disabled="selectedTargetUsers.length === 0"
                              :loading="isDisableMfaPending"
                              :confirm-text="$t('COMMON.BUTTONS.DELETE')"
                              @confirm="handleDeleteMfaSecretKey(onClose)"
                              @cancel="onClose"
                              @close="onClose"
                >
                    <template v-if="isSingleTargetUser">
                        {{ $t('IAM.USER.MAIN.MODAL.MFA.DELETE_SINGLE_MFA_SECRET_KEY_MODAL') }}
                    </template>
                    <i18n v-else
                          path="IAM.USER.MAIN.MODAL.MFA.DELETE_MULTI_MFA_SECRET_KEY_MODAL_DESC"
                    >
                        <template #selectedUsers>
                            {{ selectedTargetUsers.length }}
                        </template>
                    </i18n>
                </delete-modal>
            </template>
        </modal-controller>
    </div>
</template>
