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


import UserAccountMultiFactorAuthModalEmailInfo from '@/services/my-page/components/UserAccountMultiFactorAuthModalEmailInfo.vue';
import UserAccountMultiFactorAuthModalFolding from '@/services/my-page/components/UserAccountMultiFactorAuthModalFolding.vue';
import UserAccountMultiFactorAuthModalMSInfo
    from '@/services/my-page/components/UserAccountMultiFactorAuthModalMSInfo.vue';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';
import type {
    UserInfoType,
} from '@/services/my-page/types/multi-factor-auth-type';
import { MULTI_FACTOR_AUTH_TYPE } from '@/services/my-page/types/multi-factor-auth-type';

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;

const emit = defineEmits<{(e: 'refresh'): void }>();

const storeState = reactive({
    userId: computed<string>(() => store.state.user.userId),
    selectedType: computed<string>(() => multiFactorAuthState.selectedType),
    isReSyncModal: computed<boolean>(() => multiFactorAuthState.modalType === 'RE_SYNC'),
    isDisabledModal: computed<boolean>(() => multiFactorAuthState.modalType === 'DISABLED'),
});
const state = reactive({
    loading: false,
    userInfo: {} as UserInfoType,
    isCollapsed: true,
    isSentCode: false,
});

const modalState = reactive({
    title: computed(() => {
        if (storeState.isReSyncModal) {
            return _i18n.t('MY_PAGE.MFA.RESYNC_TITLE');
        }
        if (storeState.isDisabledModal) {
            return _i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
        }
        const type = storeState.selectedType?.toLowerCase()
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
    multiFactorAuthStore.setModalVisible(false);
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
    <p-button-modal :visible="multiFactorAuthState.modalVisible"
                    :header-title="modalState.title"
                    class="mfa-modal-wrapper"
                    size="sm"
                    :theme-color="storeState.isDisabledModal? 'alert' : 'primary'"
                    :disabled="validationState.verificationCode === '' || !state.isSentCode"
                    :loading="state.loading"
                    @confirm="handleClickVerifyButton"
                    @cancel="handleClickCancel"
                    @close="handleClickCancel"
    >
        <template #body>
            <p v-if="storeState.isReSyncModal"
               class="re-sync-desc"
            >
                {{ $t('MY_PAGE.MFA.RESYNC_DESC') }}
            </p>
            <div v-else
                 class="modal-content-wrapper"
            >
                <span v-if="storeState.isDisabledModal"
                      class="disable-modal-desc"
                >
                    {{ $t('COMMON.MFA_MODAL.ALT.DESC') }}
                </span>
                <user-account-multi-factor-auth-modal-email-info v-if="storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                                                 :is-disabled-modal="storeState.isDisabledModal"
                                                                 :is-sent-code.sync="state.isSentCode"
                />
                <user-account-multi-factor-auth-modal-m-s-info v-else-if="storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.MS && !storeState.isDisabledModal" />
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
                <user-account-multi-factor-auth-modal-folding v-if="storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                                              :is-disabled-modal="storeState.isDisabledModal"
                                                              :is-sent-code.sync="state.isSentCode"
                />
            </div>
        </template>
        <template v-if="!storeState.isReSyncModal"
                  #confirm-button
        >
            <span v-if="storeState.isDisabledModal">
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
