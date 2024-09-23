<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { store } from '@/store';
import { i18n as _i18n } from '@/translations';

import { postValidationMfaCode } from '@/lib/helper/multi-factor-auth-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import UserAccountMultiFactorAuthModalEmailInfo from '@/services/my-page/components/UserAccountMultiFactorAuthModalEmailInfo.vue';
import UserAccountMultiFactorAuthModalFolding from '@/services/my-page/components/UserAccountMultiFactorAuthModalFolding.vue';
import UserAccountMultiFactorAuthModalMSInfo
    from '@/services/my-page/components/UserAccountMultiFactorAuthModalMSInfo.vue';
import type {
    MultiFactorAuthModalDataType,
    MultiFactorAuthType,
    UserInfoType,
} from '@/services/my-page/types/multi-factor-auth-type';
import { MULTI_FACTOR_AUTH_TYPE } from '@/services/my-page/types/multi-factor-auth-type';

interface Props {
    data: MultiFactorAuthModalDataType
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    data: undefined,
    visible: false,
});

const emit = defineEmits<{(e: 'refresh'): void }>();

const storeState = reactive({
    userId: computed<string>(() => store.state.user.userId),
});
const state = reactive({
    loading: false,
    mfaType: computed<MultiFactorAuthType>(() => props.data?.type),
    isReSyncModal: computed<boolean>(() => props.data.isReSync || false),
    isDisabledModal: computed<boolean>(() => !state.isReSyncModal && !props.data.state),
    userInfo: {} as UserInfoType,
    isCollapsed: true,
    isSentCode: false,
});

const modalState = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    title: computed(() => {
        if (state.isReSyncModal) {
            return _i18n.t('MY_PAGE.MFA.RESYNC_TITLE');
        }
        if (state.isDisabledModal) {
            return _i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
        }
        const type = state.mfaType.toLowerCase()
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
    if (storeState.userId === state.userInfo.user_id) {
        await store.dispatch('user/setUser', state.userInfo);
    }
};

/* API */
const handleClickVerifyButton = async () => {
    state.loading = true;
    try {
        state.userInfo = await postValidationMfaCode({
            verify_code: validationState.verificationCode,
        }) as UserInfoType;
        if (storeState.userId === state.userInfo.user_id) {
            await store.dispatch('user/setUser', state.userInfo);
        }
        modalState.proxyVisible = false;
        resetFormData();
    } catch (e: any) {
        validationState.isValidationCodeValid = false;
        validationState.validationCodeInvalidText = _i18n.t('COMMON.MFA_MODAL.INVALID_CODE');
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => storeState.userId, (userId) => {
    if (userId) {
        state.userInfo = store.state.user;
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :visible="modalState.proxyVisible"
        :header-title="modalState.title"
        class="mfa-modal-wrapper"
        size="sm"
        :theme-color="state.isDisabledModal? 'alert' : 'primary'"
        :disabled="validationState.verificationCode === '' || !state.isSentCode"
        :loading="state.loading"
        @confirm="handleClickVerifyButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <p v-if="state.isReSyncModal"
               class="re-sync-desc"
            >
                {{ $t('MY_PAGE.MFA.RESYNC_DESC') }}
            </p>
            <div v-else
                 class="modal-content-wrapper"
            >
                <span v-if="state.isDisabledModal"
                      class="disable-modal-desc"
                >
                    {{ $t('COMMON.MFA_MODAL.ALT.DESC') }}
                </span>
                <user-account-multi-factor-auth-modal-email-info v-if="state.mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                                                 :mfa-type="props.data?.type"
                                                                 :is-disabled-modal="state.isDisabledModal"
                                                                 :is-sent-code.sync="state.isSentCode"
                />
                <user-account-multi-factor-auth-modal-m-s-info v-else-if="state.mfaType === MULTI_FACTOR_AUTH_TYPE.MS && props.data.state" />
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
                <user-account-multi-factor-auth-modal-folding v-if="state.mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                                              :is-disabled-modal="state.isDisabledModal"
                                                              :is-sent-code.sync="state.isSentCode"
                />
            </div>
        </template>
        <template v-if="!state.isReSyncModal"
                  #confirm-button
        >
            <span v-if="state.isDisabledModal">
                {{ $t('COMMON.MFA_MODAL.ALT.DISABLED') }}
            </span>
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
