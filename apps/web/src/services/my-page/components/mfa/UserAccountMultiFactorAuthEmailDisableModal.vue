<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserProfileConfirmMfaParameters } from '@/schema/identity/user-profile/api-verbs/confirm-mfa';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import EmailFoldingInfo from '@/common/components/mfa/components/EmailFoldingInfo.vue';
import EmailInfo from '@/common/components/mfa/components/EmailInfo.vue';
import VerificationCodeForm from '@/common/components/mfa/components/VerificationCodeForm.vue';
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

/* State */
const state = reactive({
    loading: false,
});
const validationState = reactive({
    verificationCode: '',
    isInvalidationCodeValid: false,
});
const isSentCode = ref<boolean>(false);

/* Computed */
const visible = computed<boolean>(() => {
    if (props.switch) {
        return multiFactorAuthState.emailSwitchModalVisible;
    }
    return multiFactorAuthState.emailDisableModalVisible;
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
        multiFactorAuthStore.setEmailSwitchModalVisible(false);
    } else {
        multiFactorAuthStore.setEmailDisableModalVisible(false);
    }
};

/* API */
const confirmMfa = async (params: UserProfileConfirmMfaParameters) => {
    state.loading = true;
    try {
        const res = await SpaceConnector.clientV2.identity.userProfile.confirmMfa(params);
        showSuccessMessage(i18n.t('COMMON.MFA_MODAL.ALT_S_DISABLED'), '');
        store.dispatch('user/setMfa', res.mfa ?? {});
        closeModal();
        if (props.switch) multiFactorAuthStore.setOTPEnableModalVisible(true);
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
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
                    theme-color="alert"
                    :disabled="validationState.verificationCode === '' || !isSentCode"
                    :loading="state.loading"
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
                    {{ $t('COMMON.MFA_MODAL.ALT.DESC') }}
                </span>
                <email-info :is-sent-code.sync="isSentCode" />
                <verification-code-form :invalid.sync="validationState.isInvalidationCodeValid"
                                        :code-value.sync="validationState.verificationCode"
                                        :invalid-text="$t('COMMON.MFA_MODAL.INVALID_CODE_EMAIL')"
                />
                <email-folding-info is-disabled-modal
                                    :is-sent-code.sync="isSentCode"
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
