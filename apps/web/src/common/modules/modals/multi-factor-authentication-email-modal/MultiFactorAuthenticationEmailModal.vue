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
    PI, PIconButton,
    PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postEnableMfa, postValidationMfaCode } from '@/lib/helper/multi-factor-authentication-helper';
import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';
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
    confirmLoading: false,

    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    proxyVisible: useProxyValue('visible', props, emit),
    isCollapsed: true,
    isEditMode: false,
});

const validationState = reactive({
    isValidationCodeValid: undefined as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

const {
    forms: {
        newEmail,
        verificationCode,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    newEmail: '',
    verificationCode: '',
}, {
    newEmail(value: string) { return !emailValidator(value) ? '' : i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID'); },
});

/* Components */
const handleClickEditButton = () => {
    state.isEditMode = true;
};
const handleClickCancel = () => {
    resetFormData();
    state.proxyVisible = false;
};
const resetFormData = () => {
    setForm('newEmail', '');
    setForm('verificationCode', '');
    state.isEditMode = false;
    state.isCollapsed = false;
};

/* API */
const handleClickSendEmailButton = async () => {
    state.loading = true;

    await postEnableMfa({
        user_id: state.userId,
        mfa_type: props.mfaType,
        options: {
            email: state.isEditMode ? newEmail.value : props.email,
        },
        domain_id: state.domainId,
    });
    state.isEditMode = false;

    state.loading = false;
};
const handleClickConfirmButton = async () => {
    state.confirmLoading = true;
    try {
        await postValidationMfaCode({
            user_id: state.userId,
            domain_id: state.domainId,
            verify_code: verificationCode.value,
        });
        state.proxyVisible = false;
        resetFormData();
    } catch (e: any) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = i18n.t('COMMON.MFA_MODAL.INVALID_CODE');
    } finally {
        state.confirmLoading = false;
        emit('refresh');
    }
};

/* Watcher */
watch(() => props.visible, (value) => {
    state.proxyVisible = value;
    if (value) {
        if (props.verified) {
            state.isEditMode = true;
        }
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :visible="state.proxyVisible"
        :header-title="$t('COMMON.MFA_MODAL.TITLE')"
        class="mfa-email-modal-wrapper"
        size="sm"
        :disabled="!verificationCode"
        :loading="state.confirmLoading"
        @confirm="handleClickConfirmButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <div class="email-info-wrapper">
                    <div v-if="!state.isEditMode"
                         class="sent-email-wrapper"
                    >
                        <div class="contents-wrapper">
                            <p>{{ $t('COMMON.MFA_MODAL.SENT_DESC') }}</p>
                            <div class="email-wrapper">
                                <p-i name="ic_envelope-filled"
                                     height="0.875rem"
                                     width="0.875rem"
                                     color="inherit"
                                />
                                <p class="email-text">
                                    {{ newEmail || props.email }}
                                </p>
                            </div>
                        </div>
                        <p-icon-button class="icon-edit"
                                       name="ic_edit"
                                       size="md"
                                       color="inherit"
                                       @click="handleClickEditButton"
                        />
                    </div>
                    <div v-else
                         class="edit-email-wrapper"
                    >
                        <p-field-group :label="$t('COMMON.MFA_MODAL.EMAIL')"
                                       :invalid="invalidState.newEmail"
                                       :invalid-text="invalidTexts.newEmail"
                                       class="email-input-group"
                                       required
                        >
                            <p-text-input :value="newEmail"
                                          :invalid="invalidState.newEmail"
                                          class="text-input"
                                          @update:value="setForm('newEmail', $event)"
                            />
                        </p-field-group>
                        <p-button style-type="secondary"
                                  :loading="state.loading"
                                  size="md"
                                  :disabled="newEmail === '' || invalidState.newEmail"
                                  @click="handleClickSendEmailButton"
                        >
                            {{ $t('COMMON.MFA_MODAL.SEND_CODE') }}
                        </p-button>
                    </div>
                </div>
                <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                               :invalid="validationState.isValidationCodeValid"
                               :invalid-text="validationState.validationCodeInvalidText"
                               required
                >
                    <p-text-input :value="verificationCode"
                                  :invalid="validationState.isValidationCodeValid"
                                  class="text-input"
                                  @update:value="setForm('verificationCode', $event)"
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
            .edit-email-wrapper {
                @apply flex items-end;
                margin-bottom: 0.875rem;
                gap: 1rem;
                .email-input-group {
                    flex: 1;
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
