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
                        <p v-if="props.status === PasswordStatus.RESET"
                           class="help-text"
                        >
                            {{ $t('AUTH.PASSWORD.RESET.HELP_TEXT') }}
                            <span class="emphasis">
                                {{ state.userInfo.userId }}
                            </span>
                        </p>
                        <p v-else
                           class="help-text"
                        >
                            {{ $t('AUTH.PASSWORD.FIND.HELP_TEXT') }}
                        </p>
                    </div>
                </div>
                <password-form
                    ref="passwordFormEl"
                    v-model="forms"
                    :status="props.status"
                    @change-input="handleChangeInput"
                    @click-input="handleClickButton"
                />
                <div class="button-wrapper">
                    <p-button
                        v-if="props.status === PasswordStatus.RESET"
                        :disabled="
                            passwordInput === ''
                                || confirmPasswordInput === ''
                                || passwordInput !== confirmPasswordInput
                                || passwordInput.length < 8
                        "
                        @click="handleClickButton"
                        @keyup.enter="handleClickButton"
                    >
                        {{ $t('AUTH.PASSWORD.RESET.RESET_PASSWORD') }}
                    </p-button>
                    <p-button
                        v-else
                        :disabled="userIdInput === ''"
                        @click="handleClickButton"
                        @keyup.enter="handleClickButton"
                    >
                        {{ $t('AUTH.PASSWORD.FIND.SEND') }}
                    </p-button>
                </div>
                <div v-if="props.status === PasswordStatus.FIND"
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
import type { ComponentPublicInstance } from 'vue';
import {
    computed,
    getCurrentInstance, reactive, ref,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PButton, PDataLoader, PIconButton } from '@spaceone/design-system';
import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserState } from '@/store/modules/user/type';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';

import PasswordForm from '@/services/auth/password/modules/PasswordForm.vue';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import { PasswordStatus } from '@/services/auth/type';
import type { PasswordFormExpose, PasswordFormState } from '@/services/auth/type';

interface Props {
    status: string;
}

const props = withDefaults(defineProps<Props>(), {
    status: '',
});

const passwordFormEl = ref<ComponentPublicInstance<PasswordFormExpose>>();

const vm = getCurrentInstance()?.proxy as Vue;

const state = reactive({
    loading: false,
    userType: '',
    pageTitle: computed(() => {
        if (props.status === PasswordStatus.FIND) {
            return i18n.t('AUTH.PASSWORD.FIND.TITLE');
        }
        if (props.status === PasswordStatus.INVALID) {
            return i18n.t('AUTH.PASSWORD.INVALID_LINK');
        }
        return i18n.t('AUTH.PASSWORD.RESET.TITLE');
    }),
    domainId: computed<string>(() => store.state.domain.domainId),
    userInfo: computed<UserState>(() => store.state.user),
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
        const {
            userId, email,
        } = state.userInfo;
        const request = {
            user_id: userId,
            password: passwordInput.value,
            email,
        };
        postResetPassword(request);
    }
    resetInputs();
};
const getSSOTokenFromUrl = (): string|undefined => {
    const query = vm.$router.currentRoute.query;
    return query.sso_access_token as string;
};
const getUserIdFromToken = (ssoAccessToken: string): string | undefined => {
    if (!ssoAccessToken) return undefined;
    const decodedToken = jwtDecode<JwtPayload>(ssoAccessToken);
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
        await SpaceConnector.clientV2.identity.user.resetPassword({ user_id: userId, domain_id: domainId });
        await SpaceRouter.router.replace({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId, status: 'done' } }).catch(() => {});
    } catch (e: any) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId, status: 'fail' } }).catch(() => {});
        throw e;
    } finally {
        state.loading = false;
    }
};
const postResetPassword = async (request) => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.user.update(request);
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
        if (!ssoAccessToken) {
            SpaceRouter.router.replace({ name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME, query: { status: 'invalid' } }).catch(() => {});
            return;
        }

        SpaceConnector.setToken(ssoAccessToken, '');
        const userId = getUserIdFromToken(ssoAccessToken);
        // When there is no user id in sso access token
        if (!userId) return;

        state.userInfo.userId = userId;
        state.userInfo.email = userId;

        await store.commit('user/setUser', state.userInfo);
    } catch (e) {
        ErrorHandler.handleError('Invalid token.');
    }
};
(async () => {
    if (props.status !== PasswordStatus.FIND) {
        await initStatesByUrlSSOToken();
    }
})();
</script>

<style lang="postcss" scoped>
.password-page {
    position: relative;
    width: 100%;
    height: 100%;
    justify-content: center;
    .contents-wrapper {
        @apply flex flex-col;
        gap: 2.5rem;
        position: absolute;
        width: 25rem;
        min-width: 17.5rem;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
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
