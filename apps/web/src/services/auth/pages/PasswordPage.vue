<template>
    <centered-page-layout>
        <p-data-loader
            class="password-page"
            :loading="state.loading"
        >
            <div class="contents-wrapper">
                <div class="headline-wrapper">
                    <h1 class="title">
                        {{ state.pageTitle }}
                    </h1>
                    <div class="help-text-wrapper">
                        <p v-if="props.status === PASSWORD_STATUS.RESET"
                           class="help-text"
                        >
                            {{ $t('AUTH.PASSWORD.RESET.HELP_TEXT') }}
                            <span class="emphasis">
                                {{ userStore.state.userId }}
                            </span>
                        </p>
                        <p v-if="props.status === PASSWORD_STATUS.FIND"
                           class="help-text"
                        >
                            {{ $t('AUTH.PASSWORD.FIND.HELP_TEXT') }}
                        </p>
                        <p v-else
                           class="help-text"
                        >
                            {{ $t('AUTH.PASSWORD.INVALID_LINK.HELP_TEXT') }}
                        </p>
                    </div>
                </div>
                <password-form
                    ref="passwordFormEl"
                    v-model="forms"
                    :status="props.status"
                    @change-input="handleChangeInput"
                    @click-button="handleClickButton"
                />
                <div class="button-wrapper">
                    <p-button
                        v-if="props.status === PASSWORD_STATUS.RESET"
                        :disabled="
                            !passwordInput
                                || !confirmPasswordInput
                                || passwordInput !== confirmPasswordInput
                                || passwordInput.length < 8
                        "
                        @click="handleClickButton"
                    >
                        {{ $t('AUTH.PASSWORD.RESET.RESET_PASSWORD') }}
                    </p-button>
                    <p-button
                        v-else-if="props.status === PASSWORD_STATUS.FIND"
                        :disabled="userIdInput === ''"
                        @click="handleClickButton"
                    >
                        {{ $t('AUTH.PASSWORD.FIND.SEND') }}
                    </p-button>
                    <p-button
                        v-else
                        :disabled="userIdInput === ''"
                        @click="handleClickButton"
                    >
                        {{ $t('AUTH.PASSWORD.INVALID_LINK.SENT_BUTTON') }}
                    </p-button>
                </div>
                <div v-if="props.status === PASSWORD_STATUS.FIND"
                     class="util-wrapper"
                >
                    <p-icon-button name="ic_arrow-left"
                                   size="sm"
                                   class="go-back-button mr-2"
                    />
                    <p class="go-back-button">
                        <router-link :to="{name: AUTH_ROUTE.SIGN_IN._NAME}">
                            {{ $t('AUTH.PASSWORD.FIND.BACK_TO_SIGN_IN') }}
                        </router-link>
                    </p>
                </div>
            </div>
        </p-data-loader>
    </centered-page-layout>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance, ComputedRef } from 'vue';
import {
    computed, onMounted, reactive, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton, PDataLoader, PIconButton } from '@cloudforet/mirinae';

import type { UserProfileResetPasswordParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/reset-password';
import type { UserProfileUpdatePasswordParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update-password';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { ERROR_ROUTE, ROOT_ROUTE } from '@/router/constant';

import { useDomainStore } from '@/store/domain/domain-store';
import { useUserStore } from '@/store/user/user-store';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';

import PasswordForm from '@/services/auth/components/PasswordForm.vue';
import { PASSWORD_STATUS } from '@/services/auth/constants/password-constant';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import type { PasswordFormExpose } from '@/services/auth/types/password-type';

interface Props {
    status: string;
}
interface PasswordFormState {
    userIdInput: ComputedRef<string>,
    passwordInput: ComputedRef<string>,
    confirmPasswordInput: ComputedRef<string>,
}

const props = withDefaults(defineProps<Props>(), {
    status: '',
});

const passwordFormEl = ref<ComponentPublicInstance<PasswordFormExpose>>();

const router = useRouter();
const route = useRoute();

const domainStore = useDomainStore();
const userStore = useUserStore();
const state = reactive({
    loading: false,
    userType: '',
    pageTitle: computed(() => {
        if (props.status === PASSWORD_STATUS.FIND) {
            return i18n.t('AUTH.PASSWORD.FIND.TITLE');
        }
        if (props.status === PASSWORD_STATUS.INVALID) {
            return i18n.t('AUTH.PASSWORD.INVALID_LINK.TITLE');
        }
        return i18n.t('AUTH.PASSWORD.RESET.TITLE');
    }),
    domainId: computed<string>(() => domainStore.state.domainId),
    tags: {},
});
const {
    forms,
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    userIdInput: '',
    passwordInput: '',
    confirmPasswordInput: '',
}, {
    userIdInput(value: string) { return !emailValidator(value) ? '' : i18n.t('AUTH.PASSWORD.FIND.INVALID_EMAIL_FORMAT'); },
});
const { userIdInput, passwordInput, confirmPasswordInput } = forms;

/* Components */
const handleChangeInput = (value: PasswordFormState) => {
    setForm({
        userIdInput: value.userIdInput.value,
        passwordInput: value.passwordInput.value,
        confirmPasswordInput: value.confirmPasswordInput.value,
    });
};
const handleClickButton = () => {
    if (userIdInput.value !== '' && passwordFormEl.value) {
        if (invalidState.userIdInput) {
            passwordFormEl.value.validationState.isIdValid = invalidState.userIdInput;
            passwordFormEl.value.validationState.idInvalidText = invalidTexts.userIdInput;
            return;
        }
        sendResetEmail(userIdInput.value, state.domainId);
    } else {
        const request: UserProfileUpdatePasswordParameters = {
            new_password: passwordInput.value,
        };
        postResetPassword(request);
    }
    resetInputs();
};
const getSSOTokenFromUrl = (): string|undefined => {
    const query = router.currentRoute.query;
    return query.sso_access_token as string;
};
const getUserIdFromToken = (ssoAccessToken: string): string | undefined => {
    if (!ssoAccessToken) return undefined;
    const decodedToken = jwtDecode<JwtPayload>(ssoAccessToken);
    const expireDate = dayjs((decodedToken.exp || 0) * 1000).utc();
    if (expireDate.isBefore(dayjs().utc())) {
        ErrorHandler.handleError('Expired token.');
        SpaceRouter.router.replace({ name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME, query: { status: 'invalid' } }).catch(() => {});
        return undefined;
    }
    if (decodedToken) return decodedToken.aud as string;
    return undefined;
};
const resetInputs = () => {
    setForm({
        userIdInput: '',
        passwordInput: '',
        confirmPasswordInput: '',
    });
};

/* API */
const sendResetEmail = async (userId, domainId) => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.userProfile.resetPassword<UserProfileResetPasswordParameters>({
            user_id: userId,
            domain_id: domainId,
        });
        await SpaceRouter.router.replace({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId, status: 'done' } }).catch(() => {});
    } catch (e: any) {
        if (e.code === 'ERROR_UNABLE_TO_RESET_PASSWORD_IN_EXTERNAL_AUTH' && passwordFormEl.value) {
            passwordFormEl.value.validationState.isIdValid = true;
            passwordFormEl.value.validationState.idInvalidText = i18n.t('AUTH.PASSWORD.FIND.INVALID_EMAIL_FORMAT');
        } else {
            ErrorHandler.handleError(e);
            await SpaceRouter.router.push({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId, status: 'fail' } }).catch(() => {});
        }
    } finally {
        state.loading = false;
    }
};
const postResetPassword = async (request: UserProfileUpdatePasswordParameters) => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.userProfile.updatePassword<UserProfileUpdatePasswordParameters>(request);
        SpaceConnector.flushToken();
        await SpaceRouter.router.replace({ name: AUTH_ROUTE.EMAIL._NAME, query: { status: 'done' } }).catch(() => {});
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
    } finally {
        state.loading = false;
    }
};

/* Init */
const initStatesByUrlSSOToken = async () => {
    try {
        const ssoAccessToken = getSSOTokenFromUrl();

        // When sso access token is not exist in url query string
        if (!ssoAccessToken) return;
        SpaceConnector.setToken(ssoAccessToken, '');

        const userId = getUserIdFromToken(ssoAccessToken);
        if (!userId) return;

        userStore.setEmail(userId);
        userStore.setUserId(userId);
    } catch (e: any) {
        if (e.message.includes('Invalid token')) {
            ErrorHandler.handleError('Invalid token.');
            await SpaceRouter.router.push({ name: ERROR_ROUTE._NAME, params: { statusCode: '401' } });
        }
    }
};
(async () => {
    if (props.status !== PASSWORD_STATUS.FIND) {
        await initStatesByUrlSSOToken();
    }
})();

onMounted(() => {
    const ssoAccessToken = getSSOTokenFromUrl();
    // Access by reset password email.
    if (ssoAccessToken) return;

    const isResetPasswordPage = route.name === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME;
    const hasRequiredUpdatePassword = userStore.state.requiredActions?.includes('UPDATE_PASSWORD');
    // Access by normal sign in
    if (isResetPasswordPage && !hasRequiredUpdatePassword) router.push(ROOT_ROUTE._NAME);
});
</script>

<style lang="postcss" scoped>
.password-page {
    width: auto;
    .contents-wrapper {
        @apply flex flex-col;
        gap: 2.5rem;
        width: 25rem;
        min-width: 17.5rem;
        .headline-wrapper {
            @apply flex flex-col;
            width: 100%;
            gap: 0.75rem;
            .title {
                @apply font-bold text-display-md;
            }
            .help-text {
                @apply text-gray-700 text-paragraph-md;
                .emphasis {
                    @apply font-bold;
                }
            }
        }

        /* custom design-system component - p-button */
        :deep(.p-button) {
            width: 100%;
        }
        .button-wrapper {
            margin-top: 1rem;
        }
        .util-wrapper {
            @apply flex items-center justify-center;

            /* custom design-system component - p-icon-button */
            :deep(.p-icon-button) {
                margin-right: 0.25rem;
            }
            .go-back-button {
                @apply text-blue-700 text-paragraph-md;
            }
        }
    }
}
</style>
