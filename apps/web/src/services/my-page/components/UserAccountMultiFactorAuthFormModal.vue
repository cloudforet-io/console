<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep } from 'lodash';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';
import { i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { postValidationMfaCode } from '@/lib/helper/multi-factor-auth-helper';

import UserAccountMultiFactorAuthModalEmailInfo from '@/services/my-page/components/UserAccountMultiFactorAuthModalEmailInfo.vue';
import UserAccountMultiFactorAuthModalFolding from '@/services/my-page/components/UserAccountMultiFactorAuthModalFolding.vue';
import UserAccountMultiFactorAuthModalMSInfo
    from '@/services/my-page/components/UserAccountMultiFactorAuthModalMSInfo.vue';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';
import type {
    UserInfoType,
} from '@/services/my-page/types/multi-factor-auth-type';

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;
const userStore = useUserStore();

const emit = defineEmits<{(e: 'refresh'): void }>();

const storeState = reactive({
    userId: computed<string|undefined>(() => userStore.state.userId),
    mfa: computed<UserMfa|undefined>(() => userStore.state.mfa || undefined),
    selectedType: computed<string>(() => multiFactorAuthState.selectedType),
    isReSyncModal: computed<boolean>(() => multiFactorAuthState.modalType === 'RE_SYNC'),
    isDisabledModal: computed<boolean>(() => multiFactorAuthState.modalType === 'DISABLED'),
    isSwitchModal: computed<boolean>(() => multiFactorAuthState.modalType === 'SWITCH'),
});
const state = reactive({
    loading: false,
    userInfo: {} as UserInfoType,
    isCollapsed: true,
    isSentCode: false,
    isVerified: computed<boolean>(() => storeState.mfa?.state === 'ENABLED'),
    type: computed<string|undefined>(() => storeState.mfa?.mfa_type || undefined),
    otherType: computed<string|undefined>(() => Object.keys(MULTI_FACTOR_AUTH_TYPE).find((key) => key !== storeState.selectedType)),
});

const modalState = reactive({
    title: computed<TranslateResult>(() => {
        if (storeState.isReSyncModal) {
            return _i18n.t('MY_PAGE.MFA.RESYNC_TITLE');
        }
        if (storeState.isDisabledModal) {
            return _i18n.t('COMMON.MFA_MODAL.ALT.TITLE');
        }
        if (storeState.isSwitchModal) {
            return _i18n.t('MY_PAGE.MFA.CHANGE_TITLE');
        }
        if (storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
            return _i18n.t('MY_PAGE.MFA.MODAL_EMAIL_TITLE');
        }
        return _i18n.t('MY_PAGE.MFA.MODAL_MS_TITLE');
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
    validationState.isValidationCodeValid = true;
    validationState.validationCodeInvalidText = '';
};
const handleClickCancel = async () => {
    resetFormData();
    if (storeState.isSwitchModal && state.otherType) {
        multiFactorAuthStore.setEnableMfaMap({
            [storeState.selectedType]: true,
            [state.otherType]: false,
        });
    }
    multiFactorAuthStore.setModalVisible(false);
};

const handleClickVerifyButton = async () => {
    state.loading = true;
    try {
        state.userInfo = await postValidationMfaCode({
            verify_code: validationState.verificationCode,
        }) as UserInfoType;
        if (storeState.userId === state.userInfo.user_id && state.userInfo.mfa) {
            userStore.setMfa(state.userInfo.mfa);
        }
        resetFormData();
        if (storeState.isReSyncModal || storeState.isSwitchModal) {
            if (storeState.isSwitchModal && state.otherType) {
                multiFactorAuthStore.setEnableMfaMap({
                    [storeState.selectedType]: false,
                    [state.otherType]: true,
                });
                multiFactorAuthStore.setSelectedType(state.otherType);
            }
            multiFactorAuthStore.setModalType('FORM');
        } else {
            multiFactorAuthStore.setModalVisible(false);
        }
    } catch (e: any) {
        validationState.isValidationCodeValid = false;
        validationState.validationCodeInvalidText = storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL
            ? _i18n.t('COMMON.MFA_MODAL.INVALID_CODE_EMAIL')
            : _i18n.t('COMMON.MFA_MODAL.INVALID_CODE_OTP');
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.userId, (userId) => {
    if (userId) {
        state.userInfo = cloneDeep(userStore.state);
    }
}, { immediate: true });
watch(() => multiFactorAuthState.modalType, () => {
    state.isSentCode = false;
    validationState.isValidationCodeValid = true;
    validationState.validationCodeInvalidText = '';
});
</script>

<template>
    <div>
        <p-button-modal :visible="multiFactorAuthState.modalVisible"
                        :header-title="modalState.title"
                        class="mfa-modal-wrapper"
                        size="sm"
                        :theme-color="storeState.isDisabledModal || storeState.isSwitchModal? 'alert' : 'primary'"
                        :disabled="validationState.verificationCode === '' || (storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL && !state.isSentCode)"
                        :loading="state.loading"
                        @confirm="handleClickVerifyButton"
                        @cancel="handleClickCancel"
                        @close="handleClickCancel"
        >
            <template #body>
                <div class="modal-content-wrapper">
                    <p v-if="storeState.isReSyncModal"
                       class="re-sync-desc"
                    >
                        {{ $t('MY_PAGE.MFA.RESYNC_DESC') }}
                    </p>
                    <span v-if="storeState.isDisabledModal"
                          class="disable-modal-desc"
                    >
                        {{ storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL ? $t('COMMON.MFA_MODAL.ALT.DESC') : $t('COMMON.MFA_MODAL.ALT.DESC_MS') }}
                    </span>
                    <span v-if="storeState.isSwitchModal"
                          class="disable-modal-desc"
                    >
                        {{ $t('MY_PAGE.MFA.CHANGE_DESC') }}
                    </span>
                    <user-account-multi-factor-auth-modal-email-info v-if="storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                                                     :is-sent-code.sync="state.isSentCode"
                    />
                    <user-account-multi-factor-auth-modal-m-s-info v-else-if="storeState.selectedType === MULTI_FACTOR_AUTH_TYPE.OTP
                                                                       && !storeState.isDisabledModal
                                                                       && !storeState.isSwitchModal
                                                                       && !storeState.isReSyncModal"
                                                                   :is-re-sync-modal="storeState.isReSyncModal"
                    />
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
                                                                  :is-disabled-modal="storeState.isDisabledModal || storeState.isSwitchModal"
                                                                  :is-re-sync-modal="storeState.isReSyncModal"
                                                                  :is-sent-code.sync="state.isSentCode"
                    />
                </div>
            </template>
            <template v-if="!storeState.isReSyncModal"
                      #confirm-button
            >
                <span v-if="storeState.isDisabledModal || storeState.isSwitchModal">
                    {{ $t('COMMON.MFA_MODAL.ALT.DISABLED') }}
                </span>
                <span v-else>
                    {{ $t('COMMON.MFA_MODAL.VERIFY') }}
                </span>
            </template>
        </p-button-modal>
    </div>
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
