<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton,
    PButtonModal,
    PCollapsibleToggle,
    PFieldGroup,
    PI,
    PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postEnableMfa, postValidationMfaCode } from '@/lib/helper/multi-factor-authentication-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

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
const handleClickSendEmailButton = async () => {
    await postEnableMfa({
        user_id: state.userId,
        mfa_type: props.mfaType,
        options: {
            email: props.email,
        },
        domain_id: state.domainId,
    });
};
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

/* Watcher */
watch(() => props.visible, (value) => {
    state.proxyVisible = value;
}, { immediate: true });
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
                <div class="email-info-wrapper">
                    <div class="sent-email-wrapper">
                        <div class="contents-wrapper">
                            <p>{{ $t('COMMON.MFA_MODAL.SENT_DESC') }}</p>
                            <div class="email-wrapper">
                                <p-i name="ic_envelope-filled"
                                     height="0.875rem"
                                     width="0.875rem"
                                     color="inherit"
                                />
                                <p class="email-text">
                                    {{ props.email }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                               :invalid="validationState.isValidationCodeValid"
                               :invalid-text="validationState.validationCodeInvalidText"
                               required
                >
                    <p-text-input :value="validationState.verificationCode"
                                  :invalid="validationState.isValidationCodeValid"
                                  class="text-input"
                                  @change="handleChangeInput"
                    />
                </p-field-group>
                <div class="collapsible-wrapper">
                    <p-collapsible-toggle v-if="state.isCollapsed"
                                          v-model="state.isCollapsed"
                    >
                        {{ $t('COMMON.MFA_MODAL.COLLAPSE_TITLE') }}
                    </p-collapsible-toggle>
                    <p v-if="!state.isCollapsed"
                       class="collapsed-contents"
                    >
                        {{ $t('COMMON.MFA_MODAL.COLLAPSE_DESC') }}
                        <p-button class="send-code-button"
                                  @click.prevent="handleClickSendEmailButton"
                        >
                            <span class="emphasis">{{ $t('COMMON.MFA_MODAL.SEND_NEW_CODE') }}</span>
                        </p-button>
                    </p>
                </div>
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

        .email-info-wrapper {
            margin-bottom: 1rem;
            .sent-email-wrapper {
                @apply flex justify-between items-center bg-gray-100 rounded text-label-md text-gray-700;
                padding: 0.5rem;
                .contents-wrapper {
                    @apply flex flex-col;
                    .email-wrapper {
                        @apply flex items-center font-bold;
                        gap: 0.375rem;
                    }
                }
            }
        }

        .text-input {
            width: 100%;
        }

        .collapsible-wrapper {
            margin-top: 2rem;
            .collapsed-contents {
                @apply text-paragraph-sm text-gray-500;
                .send-code-button {
                    @apply text-label-xs font-normal text-blue-700;
                    height: 1rem;
                    background: initial;
                    padding: 0;
                    margin: 0;
                    .emphasis:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}
</style>
