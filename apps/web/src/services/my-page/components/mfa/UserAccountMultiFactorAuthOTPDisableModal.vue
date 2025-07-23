<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal,
} from '@cloudforet/mirinae';

import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import VerificationCodeForm from '@/common/components/mfa/components/VerificationCodeForm.vue';
import { useUserProfileConfirmMfaMutation } from '@/common/components/mfa/composables/use-user-profile-confirm-mfa-mutation';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';


interface Props {
    switch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    switch: false,
});

const emit = defineEmits<{(e: 'refresh'): void }>();

/* Store */
const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.modalState;
const userStore = useUserStore();

/* State */
const validationState = reactive({
    verificationCode: '',
    isInvalidationCodeValid: false as undefined | boolean,
});

/* Computed */
const visible = computed<boolean>(() => {
    if (props.switch) {
        return multiFactorAuthState.OTPSwitchModalVisible;
    }
    return multiFactorAuthState.OTPDisableModalVisible;
});
const headerTitle = computed<TranslateResult>(() => {
    if (props.switch) {
        return i18n.t('MY_PAGE.MFA.CHANGE_TITLE');
    }
    return i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
});

/* Utils */
const closeModal = () => {
    if (props.switch) {
        multiFactorAuthStore.setOTPSwitchModalVisible(false);
    } else {
        multiFactorAuthStore.setOTPDisableModalVisible(false);
    }
};

/* API */
const { mutateAsync: confirmMfa, isPending: isConfirmingMfa } = useUserProfileConfirmMfaMutation({
    onSuccess: (data: UserModel) => {
        showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_DISABLED'), '');
        userStore.setMfa(data.mfa ?? {});
        closeModal();
        if (props.switch) multiFactorAuthStore.setEmailEnableModalVisible(true);
    },
    onError: (error: Error) => {
        ErrorHandler.handleError(error);
        showErrorMessage(error.message, error);
        validationState.isInvalidationCodeValid = true;
    },
});


/* Events */
const handleClickCancel = async () => {
    closeModal();
    emit('refresh');
};

const handleClickVerifyButton = async () => {
    await confirmMfa({
        verify_code: validationState.verificationCode,
    });
    emit('refresh');
};

</script>

<template>
    <p-button-modal :visible="visible"
                    :header-title="headerTitle"
                    class="mfa-modal-wrapper"
                    size="sm"
                    theme-color="alert"
                    :disabled="validationState.verificationCode === ''"
                    :loading="isConfirmingMfa"
                    @confirm="handleClickVerifyButton"
                    @cancel="handleClickCancel"
                    @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <span v-if="props.switch"
                      class="disable-modal-desc"
                >
                    {{ $t('MY_PAGE.MFA.CHANGE_DESC') }}
                </span>
                <span v-else
                      class="disable-modal-desc"
                >
                    {{ $t('COMMON.MFA_MODAL.ALT.DESC_MS') }}
                </span>
                <verification-code-form :invalid.sync="validationState.isInvalidationCodeValid"
                                        :code-value.sync="validationState.verificationCode"
                                        :invalid-text="$t('COMMON.MFA_MODAL.INVALID_CODE_OTP')"
                />
            </div>
        </template>
        <template #confirm-button>
            {{ $t('COMMON.MFA_MODAL.ALT.DISABLED') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.mfa-modal-wrapper {
    .disable-modal-desc {
        @apply block;
        margin-top: 1.625rem;
        margin-bottom: 1rem;
    }
    .re-sync-desc {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .validation-code-form {
        @apply flex items-end;
        gap: 1rem;
        .form {
            flex: 1;
        }
        .verified {
            @apply inline-flex items-center text-label-md font-normal text-green-600;
            gap: 0.25rem;
        }

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            .title-wrapper .title {
                @apply flex items-center;
                gap: 0.5rem;
            }
        }
    }
    .change-confirm-button {
        @apply flex items-center;
        gap: 0.25rem;
    }
}

/* custom design-system component - p-button-modal */
:deep(.p-button-modal) {
    .modal-content .header .modal-header {
        min-height: initial;
    }
}
</style>
