<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PButtonModal, PFieldGroup, PI, PTextInput, PTooltip,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postValidationMfaCode } from '@/lib/helper/multi-factor-auth-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { UserListItemType } from '@/services/iam/types/user-type';
import UserAccountMultiFactorAuthModalEmailInfo from '@/services/my-page/components/UserAccountMultiFactorAuthModalEmailInfo.vue';
import UserAccountMultiFactorAuthModalFolding from '@/services/my-page/components/UserAccountMultiFactorAuthModalFolding.vue';

interface Props {
    type: string
    email?: string
    verified?: boolean
    mfaType?: string
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    type: '',
    email: '',
    verified: false,
    mfaType: '',
    visible: false,
});

const emit = defineEmits<{(e: 'refresh'): void }>();

const state = reactive({
    loading: false,
    data: {} as UserListItemType,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    isCollapsed: true,
    isSentCode: false,
    isNextStep: false,
});

const modalState = reactive({
    proxyType: useProxyValue('type', props, emit),
    proxyVisible: useProxyValue('visible', props, emit),
    title: computed(() => {
        if (modalState.proxyType === 'new') {
            return i18n.t('COMMON.MFA_MODAL.EDIT.TITLE');
        }
        if (modalState.proxyType === 'disabled') {
            return i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
        }
        if (modalState.proxyType === 'change') {
            return i18n.t('COMMON.MFA_MODAL.CHANGE.TITLE');
        }
        return i18n.t('COMMON.MFA_MODAL.TITLE');
    }),
});

const validationState = reactive({
    verificationCode: '',
    isValidationCodeValid: true as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

/* Components */
const resetFormData = () => {
    validationState.verificationCode = '';
    state.isCollapsed = false;
    emit('refresh');
};
const handleChangeInput = (value: string) => {
    validationState.verificationCode = value;
};
const handleClickCancel = async () => {
    modalState.proxyVisible = false;
    await resetFormData();
    if (state.userId === state.data.user_id) {
        await store.dispatch('user/setUser', state.data);
    }
};
const handleConfirmButton = () => {
    if (modalState.proxyType === 'change') {
        modalState.proxyType = 'new';
        state.isNextStep = false;
        state.isSentCode = false;
    } else {
        handleClickVerifyButton();
    }
};

/* API */
const handleClickVerifyButton = async () => {
    state.loading = true;
    try {
        state.data = await postValidationMfaCode({
            verify_code: validationState.verificationCode,
        }) as UserListItemType;
        if (modalState.proxyType !== 'change') {
            modalState.proxyVisible = false;
            if (state.userId === state.data.user_id) {
                await store.dispatch('user/setUser', state.data);
            }
        } else {
            state.isNextStep = true;
        }
        resetFormData();
    } catch (e: any) {
        validationState.isValidationCodeValid = false;
        validationState.validationCodeInvalidText = i18n.t('COMMON.MFA_MODAL.INVALID_CODE');
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.userId, (userId) => {
    if (userId) {
        state.data = store.state.user;
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :visible="modalState.proxyVisible"
        :header-title="modalState.title"
        :class="['mfa-modal-wrapper', modalState.proxyType]"
        size="sm"
        :theme-color="modalState.proxyType === 'disabled'? 'alert' : 'primary'"
        :disabled="modalState.proxyType !== 'change' ? validationState.verificationCode === '' : !(state.isNextStep && state.isSentCode)"
        :loading="modalState.proxyType !== 'change' ? state.loading : false"
        @confirm="handleConfirmButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <span v-if="modalState.proxyType === 'disabled'"
                      class="disable-modal-desc"
                >
                    {{ $t('COMMON.MFA_MODAL.ALT.DESC') }}
                </span>
                <user-account-multi-factor-auth-modal-email-info :email="props.email"
                                                                 :type="modalState.proxyType"
                                                                 :mfa-type="props.mfaType"
                                                                 :is-sent-code.sync="state.isSentCode"
                />
                <div class="validation-code-form">
                    <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                                   :invalid="!validationState.isValidationCodeValid"
                                   :invalid-text="validationState.validationCodeInvalidText"
                                   required
                                   class="form"
                    >
                        <template #label-extra>
                            <span v-if="modalState.proxyType === 'change' && state.isNextStep && state.isSentCode"
                                  class="verified"
                            >
                                <p-i name="ic_verified"
                                     height="1rem"
                                     width="1rem"
                                     class="verified-icon"
                                     color="#60B731"
                                />
                                <span>
                                    {{ $t('COMMON.MFA_MODAL.ALT.VERIFIED') }}
                                </span>
                            </span>
                        </template>
                        <p-text-input :value="validationState.verificationCode"
                                      :invalid="!validationState.isValidationCodeValid"
                                      class="text-input"
                                      :disabled="modalState.proxyType === 'new' && !state.isSentCode"
                                      @update:value="handleChangeInput"
                        />
                    </p-field-group>
                    <p-button v-if="modalState.proxyType === 'change'"
                              style-type="secondary"
                              :loading="state.loading"
                              :disabled="!state.isSentCode || state.isNextStep"
                              @click="handleClickVerifyButton"
                    >
                        {{ $t('COMMON.MFA_MODAL.VERIFY') }}
                    </p-button>
                </div>
                <user-account-multi-factor-auth-modal-folding :mfa-type="props.mfaType"
                                                              :email="props.email"
                                                              :type="modalState.proxyType"
                                                              :is-sent-code.sync="state.isSentCode"
                />
            </div>
        </template>
        <template #close-button>
            <p-tooltip
                v-if="modalState.proxyType === 'change' && state.isNextStep"
                :contents="$t('COMMON.MFA_MODAL.CHANGE.TOOLTIP')"
                position="bottom"
            >
                {{ $t('COMMON.MFA_MODAL.CHANGE.CANCEL') }}
            </p-tooltip>
        </template>
        <template #confirm-button>
            <div v-if="modalState.proxyType === 'change'"
                 class="change-confirm-button"
            >
                <span>{{ $t('COMMON.MFA_MODAL.CHANGE.CONFIRM_BTN') }}</span>
                <p-i name="ic_arrow-right"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                />
            </div>
            <span v-else-if="modalState.proxyType === 'disabled'">
                {{ $t('COMMON.MFA_MODAL.ALT.DISABLED') }}
            </span>
            <span v-else>{{ $t('COMMON.MFA_MODAL.VERIFY') }}</span>
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
    .validation-code-form {
        @apply flex items-end;
        gap: 1rem;
        .form {
            flex: 1;
            .p-text-input {
                width: 100%;
            }
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
    &.change {
        /* custom design-system component - p-button */
        :deep(.p-button) {
            &.confirm-button:not(.disabled) {
                @apply bg-primary-1;
            }
        }
    }
}
</style>
