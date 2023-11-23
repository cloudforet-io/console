<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton,
    PButtonModal,
    PFieldGroup, PI,
    PTextInput, PTooltip,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postValidationMfaCode } from '@/lib/helper/multi-factor-authentication-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import CollapsibleContents
    from '@/common/modules/modals/multi-factor-authentication-modal/modules/CollapsibleContents.vue';
import EmailInfo from '@/common/modules/modals/multi-factor-authentication-modal/modules/EmailInfo.vue';

interface Props {
    type: string
    email?: string
    verified?: boolean
    mfaType?: string
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    type: 'verify',
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
    isCollapsed: true,
    isSentCode: false,
});

const modalState = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    title: computed(() => {
        if (props.type === 'disabled') {
            return i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
        }
        if (props.type === 'change') {
            return i18n.t('COMMON.MFA_MODAL.CHANGE.TITLE');
        }
        if (props.type === 'new') {
            return i18n.t('COMMON.MFA_MODAL.EDIT.TITLE');
        }
        return i18n.t('COMMON.MFA_MODAL.TITLE');
    }),
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
    modalState.proxyVisible = false;
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
        modalState.proxyVisible = false;
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
        :visible="modalState.proxyVisible"
        :header-title="modalState.title"
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
                <email-info :email="props.email"
                            :type="props.type"
                            :is-sent-code.sync="state.isSentCode"
                />
                <div class="validation-code-form">
                    <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                                   :invalid="validationState.isValidationCodeValid"
                                   :invalid-text="validationState.validationCodeInvalidText"
                                   required
                                   class="form"
                    >
                        <p-text-input :value="validationState.verificationCode"
                                      :invalid="validationState.isValidationCodeValid"
                                      class="text-input"
                                      @update:value="handleChangeInput"
                        />
                    </p-field-group>
                    <p-button v-if="props.type === 'change'"
                              style-type="secondary"
                              :loading="state.loading"
                              :disabled="!state.isSentCode"
                    >
                        {{ $t('COMMON.MFA_MODAL.VERIFY') }}
                    </p-button>
                </div>
                <collapsible-contents :mfa-type="props.mfaType"
                                      :email="props.email"
                />
            </div>
        </template>
        <template #close-button>
            <p-tooltip
                v-if="props.type === 'change' && !props.verified"
                :contents="$t('COMMON.MFA_MODAL.CHANGE.TOOLTIP')"
                position="bottom"
            >
                {{ $t('COMMON.MFA_MODAL.CHANGE.CANCEL') }}
            </p-tooltip>
        </template>
        <template #confirm-button>
            <div v-if="props.type === 'change'"
                 class="change-confirm-button"
            >
                <span>{{ $t('COMMON.MFA_MODAL.CHANGE.CONFIRM_BTN') }}</span>
                <p-i name="ic_arrow-right"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                />
            </div>
            <span v-else>
                {{ $t('COMMON.MFA_MODAL.VERIFY') }}
            </span>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.mfa-email-modal-wrapper {
    .modal-content-wrapper {
        @apply flex flex-col;
        margin-bottom: 1rem;

        .validation-code-form {
            @apply flex items-end;
            gap: 1rem;
            .form {
                width: 100%;
                .text-input {
                    width: 100%;
                    flex: 1;
                }
            }
        }
    }
    .change-confirm-button {
        @apply flex items-center;
        gap: 0.25rem;
    }
}
</style>
