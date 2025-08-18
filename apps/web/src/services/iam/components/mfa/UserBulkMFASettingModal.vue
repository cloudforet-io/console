<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PScopedNotification,
} from '@cloudforet/mirinae';

import { MFA_STATE } from '@/api-clients/identity/user-profile/schema/constant';
import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserMFASettingFormLayout from '@/services/iam/components/mfa/UserMFASettingFormLayout.vue';
import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { USER_MODAL_MAP } from '@/services/iam/constants/modal.constant';
import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/iam/constants/user-constant';
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
const userStore = useUserStore();

/* State */
const selectedMfaType = ref<MultiFactorAuthType>(MULTI_FACTOR_AUTH_ITEMS[0].type);
const isRequiredMfa = ref(false);

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);

const { userListData: selectedUsers } = useUserListQuery(selectedUserIds);


/* Computed */
// Only Local Auth Type Users can be updated
const selectedMFAControllableUsers = computed<UserListItemType[]>(() => selectedUsers.value?.filter((user) => user.auth_type === 'LOCAL') || []);

// UI Conditions
const isIncludedExternalAuthTypeUser = computed<boolean>(() => selectedUsers.value?.some((user) => user.auth_type !== 'LOCAL') || false);

/* API */
// Store failed user IDs
const failedUserIds = new Set<string>();

const queryClient = useQueryClient();
const { key: userListKey } = useServiceQueryKey('identity', 'user', 'list');

const { userAPI } = useUserApi();
const isUpdateUserPending = ref(false);

const updateUser = async (params: UserUpdateParameters) => {
    try {
        const result = await userAPI.update(params);
        return result;
    } catch (error: any) {
        failedUserIds.add(params.user_id);
        throw new Error(error.message);
    }
};

/* Utils */
const closeModal = () => {
    userPageStore.setBulkMfaSettingModalVisible(false);
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
    if (isUpdateUserPending.value) return;

    isUpdateUserPending.value = true;

    // Update MFA Promise for each user (Bulk)
    const userUpdatePromises = selectedMFAControllableUsers.value.map(async (user) => {
        if (!user.user_id) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingModal.vue] There are users without user_id');
            else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }

        // API Policy: enforce_mfa_type is required when enforce_mfa_state is ENABLED
        if (isRequiredMfa.value && !selectedMfaType.value) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingModal.vue] MFA type is required when required MFA is true.');
            else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }

        const updateParams: UserUpdateParameters = {
            user_id: user.user_id,
            enforce_mfa_state: isRequiredMfa.value ? MFA_STATE.ENABLED : MFA_STATE.DISABLED,
        };

        if (isRequiredMfa.value) {
            updateParams.enforce_mfa_type = selectedMfaType.value;
        }

        return updateUser(updateParams);
    });

    if (userUpdatePromises.length === 0) {
        showErrorMessage('[User MFA Setting] There are no users to update.', '');
        isUpdateUserPending.value = false;
        return;
    }

    try {
        const results = await Promise.allSettled(userUpdatePromises);
        if (results.every((result) => result.status === 'fulfilled')) {
            await queryClient.invalidateQueries({ queryKey: userListKey.value });

            showSuccessMessage(i18n.t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_SUCCESS_MESSAGE'), '');
            closeModal();
            emit('confirm');
        } else if (results.some((result) => result.status === 'rejected')) { // Bulk update MFA failed
            if (import.meta.env.DEV) {
                const joinedFailedUserIds = Array.from(failedUserIds.keys()).join(', ');
                throw new Error(`[UserMFASettingModal.vue] Bulk update MFA failed user IDs: [${joinedFailedUserIds}]`);
            } else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }
    } catch (error: any) {
        ErrorHandler.handleError(error);
        showErrorMessage(error.message, error);
    } finally {
        // Clear failed user IDs
        failedUserIds.clear();
        isUpdateUserPending.value = false;
    }
};

watch(() => selectedMFAControllableUsers.value, (users) => {
    if (users.length > 0) {
        const firstSelectedUser = selectedUserIds.value
            .map((id) => selectedUsers.value?.find((user) => user.user_id === id))
            .filter((user) => user && user.auth_type === 'LOCAL')[0];

        if (firstSelectedUser) {
            isRequiredMfa.value = !!firstSelectedUser.mfa?.options?.enforce;
            selectedMfaType.value = firstSelectedUser.mfa?.mfa_type || MULTI_FACTOR_AUTH_ITEMS[0].type;
        }
    }
});

watch(() => userPageModalState.bulkMfaSettingModalVisible, async (visible) => {
    if (visible) {
        await userStore.getUserInfo();
    }
});
</script>

<template>
    <p-button-modal class="user-bulk-mfa-setting-modal"
                    size="sm"
                    :visible="userPageModalState.bulkMfaSettingModalVisible"
                    :header-title="$t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_MODAL_TITLE')"
                    :theme-color="userPageState.modal.themeColor"
                    :loading="isUpdateUserPending"
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
            >
                <span>{{ $t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_WARNING_DESC') }}</span>
            </p-scoped-notification>

            <div class="p-4 bg-gray-100 rounded-lg mt-4">
                <user-m-f-a-setting-form-layout :selected-mfa-controllable-target="selectedMFAControllableUsers"
                                                :is-required-mfa.sync="isRequiredMfa"
                                                :selected-mfa-type.sync="selectedMfaType"
                                                @click-disable-mfa="handleOpenDisableMfaModal"
                />
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_MODAL_CONFIRM_BUTTON_TEXT') }}
        </template>
    </p-button-modal>
</template>
