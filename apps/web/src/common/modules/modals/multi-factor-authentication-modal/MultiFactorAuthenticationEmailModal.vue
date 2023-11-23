<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal,
    PFieldGroup,
    PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postValidationMfaCode } from '@/lib/helper/multi-factor-authentication-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import CollapsibleContents
    from '@/common/modules/modals/multi-factor-authentication-modal/modules/CollapsibleContents.vue';
import EmailInfo from '@/common/modules/modals/multi-factor-authentication-modal/modules/EmailInfo.vue';

interface Props {
    email?: string
    verified?: boolean
    mfaType?: string
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    email: '',
    verified: false,
    mfaType: '',
    visible: false,
});

const emit = defineEmits<{(e: 'refresh'): void }>();

const state = reactive({
    loading: false,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    proxyVisible: useProxyValue('visible', props, emit),
    isCollapsed: true,
});

const validationState = reactive({
    verificationCode: '',
    isValidationCodeValid: undefined as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = (value: string) => {
    validationState.verificationCode = value;
};
const handleClickCancel = () => {
    resetFormData();
    state.proxyVisible = false;
};
const resetFormData = () => {
    validationState.verificationCode = '';
    state.isCollapsed = false;
};

/* API */
const handleClickConfirmButton = async () => {
    state.loading = true;
    try {
        await postValidationMfaCode({
            user_id: state.userId,
            domain_id: state.domainId,
            verify_code: validationState.verificationCode,
        });
        state.proxyVisible = false;
        resetFormData();
    } catch (e: any) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = i18n.t('COMMON.MFA_MODAL.INVALID_CODE');
    } finally {
        state.loading = false;
        emit('refresh');
    }
};
</script>

<template>
    <p-button-modal
        :visible="state.proxyVisible"
        :header-title="$t('COMMON.MFA_MODAL.TITLE')"
        class="mfa-email-modal-wrapper"
        size="sm"
        :disabled="validationState.verificationCode === ''"
        :loading="state.loading"
        @confirm="handleClickConfirmButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <email-info :email="props.email" />
                <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                               :invalid="validationState.isValidationCodeValid"
                               :invalid-text="validationState.validationCodeInvalidText"
                               required
                >
                    <p-text-input :value="validationState.verificationCode"
                                  :invalid="validationState.isValidationCodeValid"
                                  class="text-input"
                                  @update:value="handleChangeInput"
                    />
                </p-field-group>
                <collapsible-contents :mfa-type="props.mfaType"
                                      :email="props.email"
                />
            </div>
        </template>
        <template #confirm-button>
            {{ $t('COMMON.MFA_MODAL.VERIFY') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.mfa-email-modal-wrapper {
    .modal-content-wrapper {
        @apply flex flex-col;
        margin-bottom: 1rem;

        .text-input {
            width: 100%;
        }
    }
}
</style>
