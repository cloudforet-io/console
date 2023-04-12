<template>
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
                    <p v-if="state.status === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
                       class="help-text"
                    >
                        {{ $t('AUTH.PASSWORD.RESET.HELP_TEXT') }}
                        <span class="emphasis">
                            {{ state.email }}
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
                v-model="formState"
                :status="state.status"
                @change-input="handleChangeInput"
                @click-input="handleClickButton"
            />
            <div class="button-wrapper">
                <p-button
                    v-if="state.status === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
                    :disabled="
                        formState.password === ''
                            || formState.confirmPassword === ''
                            || formState.password !== formState.confirmPassword
                            || formState.password.length< 8
                    "
                    @click="handleClickButton"
                >
                    {{ $t('AUTH.PASSWORD.RESET.RESET_PASSWORD') }}
                </p-button>
                <p-button
                    v-else
                    :disabled="formState.userId === ''"
                    @click="handleClickButton"
                >
                    {{ $t('AUTH.PASSWORD.FIND.SEND') }}
                </p-button>
            </div>
            <div v-if="state.status === AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME"
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

import type { UserState } from '@/store/modules/user/type';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import PasswordForm from '@/services/auth/password/moduels/PasswordForm.vue';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import type { PasswordFormExpose } from '@/services/auth/type';

const passwordFormEl = ref<ComponentPublicInstance<PasswordFormExpose>>();

const vm = getCurrentInstance()?.proxy as Vue;

const state = reactive({
    loading: false,
    logUserId: '',
    userType: '',
    status: computed(() => SpaceRouter.router.currentRoute.name),
    pageTitle: computed(() => {
        if (state.status === AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME) {
            return vm.$t('AUTH.PASSWORD.FIND.TITLE');
        }
        if (state.status === AUTH_ROUTE.EMAIL.INVALID._NAME) {
            return 'The link is invalid';
        }
        return vm.$t('AUTH.PASSWORD.RESET.TITLE');
    }),
    domainId: computed<string>(() => store.state.domain.domainId),
    userInfo: computed<UserState>(() => store.state.user),
    tags: {},
    // TODO: 이메일에서 받아오는 것으로 변경
    email: '',
});
const formState = reactive({
    userId: '',
    password: '',
    confirmPassword: '',
});

/* Components */
const getSSOTokenFromUrl = (): string|undefined => {
    const queryString = vm.$router.currentRoute.query;
    return queryString.sso_access_token as string;
};
const getUserIdFromToken = (ssoAccessToken: string): string | undefined => {
    if (!ssoAccessToken) return undefined;
    const decodedToken = jwtDecode<JwtPayload>(ssoAccessToken);
    if (decodedToken) return decodedToken.aud as string;
    return undefined;
};
const handleChangeInput = (value) => {
    formState.userId = value.userId;
    formState.password = value.password;
    formState.confirmPassword = value.confirmPassword;
};
const resetInputs = () => {
    formState.userId = '';
    formState.password = '';
    formState.confirmPassword = '';
};
const handleClickButton = () => {
    if (formState.userId !== '') {
        if (emailValidator(formState.userId)) {
            if (passwordFormEl.value) {
                passwordFormEl.value.validationState.isIdValid = false;
                passwordFormEl.value.validationState.idInvalidText = vm.$t('AUTH.PASSWORD.FIND.INVALID_EMAIL_FORMAT');
            }
            return;
        }
        sendResetEmail(formState.userId, state.domainId);
    } else {
        const {
            userId, name, email, language, timezone,
        } = state.userInfo;
        const request = {
            user_id: userId,
            password: formState.password,
            name,
            email,
            language,
            timezone,
            tags: state.tags,
            domain_id: state.domainId,
        };
        postResetPassword(request);
    }
    resetInputs();
};

/* API */
const getUserInfo = async (): Promise<UserState|undefined> => {
    try {
        const response = await SpaceConnector.client.identity.user.get({
            user_id: state.logUserId,
        });
        return {
            userId: response.user_id,
            userType: 'USER',
            backend: response.backend,
            name: response.name,
            email: response.email,
            language: response.language,
            timezone: response.timezone,
            requiredActions: response.required_actions,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
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
        // TODO: API 완성 후 연결
        // await SpaceConnector.clientV2.identity.user.update({ user_id: userId, password });
        // await SpaceRouter.router.replace({ name: AUTH_ROUTE.EMAIL._NAME, query: { status: 'done' } }).catch(() => {});
    } catch (e: any) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: AUTH_ROUTE.EMAIL._NAME, query: { userId: request.user_id, status: 'fail' } }).catch(() => {});
        throw e;
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
        // When there is no user id in sso access token
        if (!userId) return;

        state.logUserId = userId;
        const userInfo = await getUserInfo();
        // When user info doesnt exist
        if (!userInfo) return;

        await store.commit('user/setUser', userInfo);
        state.userType = userInfo.userType || 'USER';
    } catch (e) {
        ErrorHandler.handleError('Invalid token.');
    }
};
(async () => {
    await initStatesByUrlSSOToken();
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
