<script setup lang="ts">
import { computed, ref } from 'vue';

import {
    PButtonModal, PScopedNotification, PFieldGroup, PDivider, PToggleButton, PRadioGroup, PRadio, PButton,
} from '@cloudforet/mirinae';

import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import InfoTooltip from '@/common/components/info-tooltip/InfoTooltip.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';



import { useUserUpdateMutation } from '@/services/iam/composables/mutations/use-user-update-mutation';
import { MULTI_FACTOR_AUTH_ITEMS, USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';


/* Store */
const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

/* State */
const selectedMfaType = ref<MultiFactorAuthType>(MULTI_FACTOR_AUTH_ITEMS[0].type);
const isRequiredMfa = ref(false);

/* Computed */
// Only Local Auth Type Users can be updated
const selectedMFAControllableUsers = computed<UserListItemType[]>(() => userPageGetters.selectedUsers.filter((user) => user.auth_type === 'LOCAL'));

const isIncludedExternalAuthTypeUser = computed<boolean>(() => userPageGetters.selectedUsers.some((user) => user.auth_type !== 'LOCAL'));
const isDisableButtonEnabled = computed<boolean>(() => userPageGetters.selectedUsers.some((user) => user.mfa?.state === 'ENABLED'));


/* API */
// Store failed user IDs
const failedUserIds = new Set<string>();

const { mutateAsync: updateUser, isPending: isUpdateUserPending } = useUserUpdateMutation({
    onError: (error: any, variables: UserUpdateParameters) => {
        // Store failed user IDs for logging failed users
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

const handleChangeRequiredMfa = (value: boolean) => {
    if (!value) {
        // if required mfa is false, set mfa type to default
        selectedMfaType.value = MULTI_FACTOR_AUTH_ITEMS[0].type;
    }
    isRequiredMfa.value = value;
};

const handleChangeMfaType = (value: MultiFactorAuthType) => {
    selectedMfaType.value = value;
};

const handleDeleteMfaSecretKey = () => {
    if (!isDisableButtonEnabled.value) return;
    userPageStore.updateModalSettings({
        type: USER_MODAL_TYPE.DELETE_MFA_SECRET_KEY,
        title: '',
        themeColor: 'alert',
        modalVisibleType: 'deleteMfaSecretKey',
    });
};

const handleConfirm = async () => {
    if (isUpdateUserPending.value) return;

    // Update MFA Promise for each user (Bulk)
    const userUpdatePromises = selectedMFAControllableUsers.value.map(async (user) => {
        if (!user.user_id) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingModal.vue] There are users without user_id');
            else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }

        // API Policy: enforce_mfa_type is required when enforce_mfa is true
        if (isRequiredMfa.value && !selectedMfaType.value) {
            if (import.meta.env.DEV) throw new Error('[UserMFASettingModal.vue] MFA type is required when required MFA is true.');
            else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
        }

        return updateUser({
            user_id: user.user_id,
            enforce_mfa: isRequiredMfa.value,
            enforce_mfa_type: selectedMfaType.value,
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
        } else if (results.some((result) => result.status === 'rejected')) { // Bulk update MFA failed
            if (import.meta.env.DEV) {
                const joinedFailedUserIds = Array.from(failedUserIds.keys())?.join(', ');
                throw new Error(`[UserMFASettingModal.vue] Bulk update MFA failed user IDs: [${joinedFailedUserIds}]`);
            } else throw new Error('[User MFA Setting] Something went wrong! Try again later. If the problem persists, please contact support.');
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
    <p-button-modal class="mfa-setting-modal"
                    size="sm"
                    :visible="userPageState.modal.visible === 'setMfa'"
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
                                   class="mb-4"
            >
                <span>{{ $t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_WARNING_DESC') }}</span>
            </p-scoped-notification>
            <div class="mfa-setting-modal-layout h-full rounded-lg p-4 bg-gray-100">
                <div class="mfa-setting-modal-form rounded-lg p-3 bg-white">
                    <p-field-group :label="$t('IAM.USER.MAIN.MODAL.MFA.REQUIRED_SETTING_FIELD_TITLE')"
                                   required
                    >
                        <template #label-extra>
                            <info-tooltip :tooltip-contents="$t('IAM.USER.MAIN.MODAL.MFA.REQUIRED_FIELD_TOOLTIP_TEXT')"
                                          tooltip-position="bottom"
                                          width="1rem"
                                          height="1rem"
                            />
                        </template>
                        <p-toggle-button :value="isRequiredMfa"
                                         show-state-text
                                         true-state-text="Required"
                                         false-state-text="Optional"
                                         position="left"
                                         @change-toggle="handleChangeRequiredMfa"
                        />
                    </p-field-group>
                    <p-divider horizontal />
                    <p-field-group :label="$t('IAM.USER.MAIN.MODAL.MFA.MFA_TYPE_SELET_FIELD_TITLE')"
                                   class="mt-4"
                                   required
                    >
                        <template #label-extra>
                            <info-tooltip :tooltip-contents="$t('IAM.USER.MAIN.MODAL.MFA.MFA_TYPE_SELECT_FIELD_TOOLTIP_TEXT')"
                                          tooltip-position="bottom"
                                          width="1rem"
                                          height="1rem"
                            />
                        </template>
                        <p-radio-group direction="vertical">
                            <p-radio v-for="item in MULTI_FACTOR_AUTH_ITEMS"
                                     :key="item.type"
                                     :value="item.type"
                                     :selected="selectedMfaType"
                                     :disabled="!isRequiredMfa"
                                     @change="handleChangeMfaType"
                            >
                                {{ item.title }}
                            </p-radio>
                        </p-radio-group>
                    </p-field-group>
                    <p-divider horizontal />
                    <p-button style-type="negative-secondary"
                              class="mt-4"
                              size="md"
                              :disabled="!isDisableButtonEnabled"
                              icon-left="ic_delete"
                              @click="handleDeleteMfaSecretKey"
                    >
                        {{ $t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_BUTTON_TEXT') }}
                    </p-button>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.USER.MAIN.MODAL.MFA.SET_MFA_MODAL_CONFIRM_BUTTON_TEXT') }}
        </template>
    </p-button-modal>
</template>
