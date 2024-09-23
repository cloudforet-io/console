<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode';
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PFieldGroup, PTextInput, PIconButton,
} from '@cloudforet/mirinae';

import { store } from '@/store';
import { i18n as _i18n } from '@/translations';

import { postValidationMfaCode } from '@/lib/helper/multi-factor-auth-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { UserListItemType } from '@/services/iam/types/user-type';
import UserAccountMultiFactorAuthModalEmailInfo from '@/services/my-page/components/UserAccountMultiFactorAuthModalEmailInfo.vue';
import UserAccountMultiFactorAuthModalFolding from '@/services/my-page/components/UserAccountMultiFactorAuthModalFolding.vue';
import type { MultiFactorAuthModalType } from '@/services/my-page/types/multi-factor-auth-type';
import { MULTI_FACTOR_AUTH_MODAL_TYPE } from '@/services/my-page/types/multi-factor-auth-type';

interface Props {
    type: MultiFactorAuthModalType
    verified?: boolean
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    type: MULTI_FACTOR_AUTH_MODAL_TYPE.EMAIL,
    verified: false,
    visible: false,
});

const qrcode = useQRCode('https://vueuse.org', {
    margin: 0,
});

const emit = defineEmits<{(e: 'refresh'): void }>();

const state = reactive({
    loading: false,
    data: {} as UserListItemType,
    userId: computed(() => store.state.user.userId),
    isCollapsed: true,
    isSentCode: false,

    // TEMP DATA
    passkey: '5PFZQPE3HQTY7D74',
});

const modalState = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    title: computed(() => {
        if (props.type === MULTI_FACTOR_AUTH_MODAL_TYPE.DISABLED) {
            return _i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
        }
        const type = props.type.toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        return _i18n.t('COMMON.MFA_MODAL.TITLE', { type });
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
    handleClickVerifyButton();
};
const handleClickRefreshButton = () => {};

/* API */
const handleClickVerifyButton = async () => {
    state.loading = true;
    try {
        state.data = await postValidationMfaCode({
            verify_code: validationState.verificationCode,
        }) as UserListItemType;
        modalState.proxyVisible = false;
        if (state.userId === state.data.user_id) {
            await store.dispatch('user/setUser', state.data);
        }
        resetFormData();
    } catch (e: any) {
        validationState.isValidationCodeValid = false;
        validationState.validationCodeInvalidText = _i18n.t('COMMON.MFA_MODAL.INVALID_CODE');
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
        class="mfa-modal-wrapper"
        size="sm"
        :theme-color="props.type === MULTI_FACTOR_AUTH_MODAL_TYPE.DISABLED? 'alert' : 'primary'"
        :disabled="validationState.verificationCode === '' || !state.isSentCode"
        :loading="state.loading"
        @confirm="handleConfirmButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <span v-if="props.type === MULTI_FACTOR_AUTH_MODAL_TYPE.DISABLED"
                      class="disable-modal-desc"
                >
                    {{ $t('COMMON.MFA_MODAL.ALT.DESC') }}
                </span>
                <user-account-multi-factor-auth-modal-email-info v-if="props.type === MULTI_FACTOR_AUTH_MODAL_TYPE.EMAIL"
                                                                 email="test"
                                                                 :type="props.type"
                                                                 :is-sent-code.sync="state.isSentCode"
                />
                <div v-else
                     class="set-up-desc-wrapper"
                >
                    <p class="set-up-title">
                        <i18n path="MY_PAGE.MFA.STEP_DESC">
                            <template #type>
                                <router-link to="https://www.microsoft.com/en-us/security/mobile-authenticator-app">
                                    <u>Microsoft Authenticator App</u>
                                </router-link>
                            </template>
                        </i18n>
                    </p>
                    <ol class="set-up-desc">
                        <li>{{ $t('MY_PAGE.MFA.STEP1') }}</li>
                        <li>{{ $t('MY_PAGE.MFA.STEP2') }}</li>
                    </ol>
                    <img :src="qrcode"
                         alt="QR Code"
                         class="qrcode"
                    >
                    <div class="passkey-wrapper">
                        <p-text-input :value="state.passkey"
                                      class="passkey"
                                      disabled
                                      block
                        />
                        <p-icon-button name="ic_refresh"
                                       class="refresh-btn"
                                       size="md"
                                       style-type="tertiary"
                                       @click="handleClickRefreshButton"
                        />
                    </div>
                    <ol class="set-up-desc"
                        start="3"
                    >
                        <li>{{ $t('MY_PAGE.MFA.STEP3') }}</li>
                    </ol>
                </div>
                <div class="validation-code-form">
                    <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                                   :invalid="!validationState.isValidationCodeValid"
                                   :invalid-text="validationState.validationCodeInvalidText"
                                   required
                                   class="form"
                    >
                        <p-text-input :value="validationState.verificationCode"
                                      :invalid="!validationState.isValidationCodeValid"
                                      class="text-input"
                                      block
                                      @update:value="handleChangeInput"
                        />
                    </p-field-group>
                </div>
                <user-account-multi-factor-auth-modal-folding v-if="props.type !== MULTI_FACTOR_AUTH_MODAL_TYPE.MS"
                                                              :type="props.type"
                                                              :is-sent-code.sync="state.isSentCode"
                />
            </div>
        </template>
        <template #confirm-button>
            <span v-if="props.type === MULTI_FACTOR_AUTH_MODAL_TYPE.DISABLED">
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
    .set-up-desc-wrapper {
        @apply flex flex-col text-paragraph-md;
        margin-bottom: 0.5rem;
        .set-up-desc {
            list-style: decimal;
            padding-left: 1rem;
        }
    }
    .qrcode {
        width: 6.25rem;
        height: 6.25rem;
        margin: 1rem auto;
    }
    .passkey-wrapper {
        @apply flex;
        margin-bottom: 0.5rem;
        gap: 0.5rem;

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            .input-container.disabled {
                background-color: white;
            }
        }
        .refresh-btn {
            border-radius: 0.25rem;
        }
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
</style>
