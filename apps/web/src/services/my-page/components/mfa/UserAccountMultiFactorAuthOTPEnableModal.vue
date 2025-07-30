<script lang="ts" setup>
import { reactive, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal,
} from '@cloudforet/mirinae';

import type { UserProfileConfirmMfaParameters } from '@/schema/identity/user-profile/api-verbs/confirm-mfa';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import OTPForm from '@/common/components/mfa/components/OTPForm.vue';
import VerificationCodeForm from '@/common/components/mfa/components/VerificationCodeForm.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';



interface Props {
    reSync?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    reSync: false,
});

const emit = defineEmits<{(e: 'refresh'): void }>();

/* Store */
const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.modalState;

/* State */
const state = reactive({
    loading: false,
});
const validationState = reactive({
    verificationCode: '',
    isInvalidationCodeValid: false as undefined | boolean,
});

/* Computed */
const visible = computed<boolean>(() => {
    if (props.reSync) {
        return multiFactorAuthState.OTPReSyncModalVisible;
    }
    return multiFactorAuthState.OTPEnableModalVisible;
});
const headerTitle = computed<TranslateResult>(() => {
    if (props.reSync) {
        return i18n.t('MY_PAGE.MFA.RESYNC_TITLE');
    }
    return i18n.t('MY_PAGE.MFA.MODAL_MS_TITLE');
});

/* Utils */
const closeModal = () => {
    if (props.reSync) {
        multiFactorAuthStore.setOTPReSyncModalVisible(false);
    } else {
        multiFactorAuthStore.setOTPEnableModalVisible(false);
    }
};

/* API */
const confirmMfa = async (params: UserProfileConfirmMfaParameters) => {
    state.loading = true;
    try {
        const data = await SpaceConnector.clientV2.identity.userProfile.confirmMfa(params);
        showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_ENABLED'), '');
        store.dispatch('user/setMfa', data.mfa ?? {});
        closeModal();
        validationState.verificationCode = '';
        if (props.reSync) multiFactorAuthStore.setOTPEnableModalVisible(true);
    } catch (error: any) {
        ErrorHandler.handleError(error);
        showErrorMessage(error.message, error);
        validationState.isInvalidationCodeValid = true;
    } finally {
        state.loading = false;
    }
};

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
                    theme-color="primary"
                    :disabled="validationState.verificationCode === ''"
                    :loading="state.loading"
                    @confirm="handleClickVerifyButton"
                    @cancel="handleClickCancel"
                    @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p v-if="props.reSync"
                   class="re-sync-desc"
                >
                    {{ $t('MY_PAGE.MFA.RESYNC_DESC') }}
                </p>
                <o-t-p-form v-if="!props.reSync"
                            :verification-code.sync="validationState.verificationCode"
                            :verification-code-invalid.sync="validationState.isInvalidationCodeValid"
                            :invalid-text="$t('COMMON.MFA_MODAL.INVALID_CODE_OTP')"
                />
                <verification-code-form v-else
                                        :invalid.sync="validationState.isInvalidationCodeValid"
                                        :code-value.sync="validationState.verificationCode"
                                        :invalid-text="$t('COMMON.MFA_MODAL.INVALID_CODE_OTP')"
                />
            </div>
        </template>
        <template v-if="!props.reSync"
                  #confirm-button
        >
            {{ $t('COMMON.MFA_MODAL.VERIFY') }}
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
