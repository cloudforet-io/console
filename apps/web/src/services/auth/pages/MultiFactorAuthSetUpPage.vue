<script lang="ts" setup>
import {
    computed, onBeforeUnmount, onMounted, reactive, ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PI, PTextButton,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import { i18n as _i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';


import EmailFoldingInfo from '@/common/components/mfa/components/EmailFoldingInfo.vue';
import EmailInfo from '@/common/components/mfa/components/EmailInfo.vue';
import OTPForm from '@/common/components/mfa/components/OTPForm.vue';
import VerificationCodeForm from '@/common/components/mfa/components/VerificationCodeForm.vue';
import { useUserProfileConfirmMfaMutation } from '@/common/components/mfa/composables/use-user-profile-confirm-mfa-mutation';
import ErrorHandler from '@/common/composables/error/errorHandler';

import MultifactorAuthConfigured from '@/services/auth/components/mfa/MultifactorAuthConfigured.vue';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';


type TitleType = {
    icon: string;
    title: string;
    desc: TranslateResult;
};

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const {
    mfaType: mfaTypeRouteParam,
} = route.params as { mfaType: MultiFactorAuthType | undefined };

const state = reactive({
    // isLocalLogin: computed<boolean>(() => userStore.state.authType === 'LOCAL'),
    myMFAType: computed<MultiFactorAuthType|undefined>(() => userStore.state.mfa?.mfa_type),
    isInvalidMfaType: computed<boolean>(() => state.myMFAType !== mfaTypeRouteParam || !state.myMFAType || !mfaTypeRouteParam),
    needToEnableMFA: computed<boolean>(() => {
        const isMFAEnforced = !!userStore.state.mfa?.options?.enforce && !!state.myMFAType;
        const needToEnableMFA = isMFAEnforced && userStore.state.mfa?.state !== 'ENABLED';
        return needToEnableMFA;
    }),
    titleInfo: computed<TitleType>(() => {
        if (mfaTypeRouteParam === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
            return {
                icon: 'ic_notification-protocol_envelope',
                title: 'Email',
                desc: _i18n.t('AUTH.MFA.EMAIL_INFO'),
            };
        }
        return {
            icon: 'ic_microsoft_auth',
            title: 'Microsoft Authenticator App',
            desc: _i18n.t('AUTH.MFA.OTP_INFO'),
        };
    }),
});

const validationState = reactive({
    verificationCode: '',
    isVerificationCodeInvalid: false,
    verificationCodeInvalidText: computed<TranslateResult>(() => {
        if (mfaTypeRouteParam === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
            return _i18n.t('COMMON.MFA_MODAL.INVALID_CODE_EMAIL');
        }
        return _i18n.t('COMMON.MFA_MODAL.INVALID_CODE_OTP');
    }),
});

const isSentCode = ref<boolean>(false);
const isVerified = ref<boolean>(false);

/* Components */
const handleClickGoBackButton = () => {
    SpaceConnector.flushToken();
    router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME });
};

/* API */
const { mutate: confirmMfa, isPending: isConfirmMfaPending } = useUserProfileConfirmMfaMutation({
    onSuccess: () => {
        SpaceConnector.flushToken();
        isVerified.value = true;
    },
    onError: (error) => {
        validationState.isVerificationCodeInvalid = true;
        ErrorHandler.handleError(error);
        showErrorMessage(error.message, error);
    },
});


/* Events */
const handleClickConfirmButton = async () => {
    await confirmMfa({
        verify_code: validationState.verificationCode,
    });
};

const getSSOTokenFromUrl = (): string|undefined => {
    const query = router.currentRoute.query;
    return query.sso_access_token as string;
};

onMounted(() => {
    const ssoAccessToken = getSSOTokenFromUrl();

    if (!ssoAccessToken) return;
    SpaceConnector.setToken(ssoAccessToken, '');
});

onBeforeUnmount(() => {
    SpaceConnector.flushToken();
});
</script>

<template>
    <div class="multi-factor-authentication-page">
        <div v-if="!isVerified"
             class="form-wrapper"
        >
            <div class="headline-wrapper">
                <p-i :name="state.titleInfo.icon"
                     height="2rem"
                     width="2rem"
                />
                <span>{{ state.titleInfo.title }}</span>
            </div>
            <div v-if="mfaTypeRouteParam === MULTI_FACTOR_AUTH_TYPE.OTP"
                 class="o-t-p-form-wrapper pt-2 pb-6"
            >
                <o-t-p-form :verification-code.sync="validationState.verificationCode"
                            :verification-code-invalid.sync="validationState.isVerificationCodeInvalid"
                            :invalid-text="validationState.verificationCodeInvalidText"
                />
            </div>
            <div v-else-if="mfaTypeRouteParam === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                 class="email-info-wrapper"
            >
                <email-info :is-sent-code.sync="isSentCode"
                            is-form
                />
                <verification-code-form :invalid.sync="validationState.isVerificationCodeInvalid"
                                        :code-value.sync="validationState.verificationCode"
                                        :invalid-text="validationState.verificationCodeInvalidText"
                />
                <email-folding-info :is-sent-code.sync="isSentCode" />
            </div>
            <p-button size="lg"
                      :loading="isConfirmMfaPending"
                      class="confirm-button"
                      :disabled="validationState.verificationCode === ''"
                      @click="handleClickConfirmButton"
            >
                {{ $t('AUTH.MFA.SETUP_VERIFY') }}
            </p-button>
            <div class="toolbox-wrapper">
                <p-text-button class="go-back-button mr-2"
                               icon-left="ic_arrow-left"
                               style-type="highlight"
                               size="md"
                               @click="handleClickGoBackButton"
                >
                    {{ $t('AUTH.MFA.GO_BACK') }}
                </p-text-button>
            </div>
        </div>
        <multifactor-auth-configured v-else />
    </div>
</template>

<style lang="postcss" scoped>
.multi-factor-authentication-page {
    @apply flex flex-col;
    width: 100%;
    margin-top: 6rem;
    .form-wrapper {
        @apply relative flex flex-col border border-gray-200 bg-white;
        width: 100%;
        max-width: 28.5rem;
        padding: 2rem;
        align-self: center;
        gap: 0.5rem;
        border-radius: 0.375rem;
        .headline-wrapper {
            @apply flex items-center text-display-md font-bold;
            gap: 0.75rem;
        }
        .email-info-wrapper {
            .email-info-desc {
                @apply block text-label-md;
            }
            .email-text {
                @apply block text-violet-600 font-medium;
                padding-top: 0.25rem;
            }
        }
        .input-form {
            margin-top: 1rem;
            .text-input {
                width: 100%;
            }
        }
        .toolbox-wrapper {
            margin-top: 2rem;
            .go-back-button {
                @apply inline-flex items-center justify-center;
                gap: 0.25rem;
            }
        }
        .collapsible-container {
            @apply relative bg-gray-100 border border-gray-200;
            width: 100%;
            max-width: initial;
            margin-top: 1rem;
            padding: 2rem 1rem 1rem;
            border-radius: 0.375rem;
            .close-button {
                @apply absolute;
                top: 0.5rem;
                right: 1rem;
            }
        }
    }
}
</style>
