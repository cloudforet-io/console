<template>
    <p-data-loader class="reset-password-page"
                   :loading="loading"
    >
        <div v-if="showResetPassword"
             class="reset-password-wrapper"
        >
            <p class="title">
                {{ $t('AUTH.RESET_PASSWORD_PAGE.RESET_PASSWORD') }}
            </p>
            <p class="help-text">
                {{ $t('AUTH.RESET_PASSWORD_PAGE.HELP_TEXT') }}<span class="text-gray-900">{{ userId }}</span>
            </p>
            <div class="form-wrapper">
                <p-field-group :label="$t('COMMON.PROFILE.PASSWORD')"
                               required
                               :invalid="invalidState.password"
                               :invalid-text="invalidTexts.password"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="password"
                                      type="password"
                                      :invalid="invalid"
                                      @update:value="setForm('password', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                               required
                               :invalid="invalidState.confirmPassword"
                               :invalid-text="invalidTexts.confirmPassword"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="confirmPassword"
                                      type="password"
                                      :invalid="invalid"
                                      @update:value="setForm('confirmPassword', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
            <p-button :disabled="!isAllValid"
                      style-type="primary"
                      size="lg"
                      :block="true"
                      @click="handleResetPassword"
            >
                {{ $t('AUTH.RESET_PASSWORD_PAGE.RESET_PASSWORD') }}
            </p-button>
            <p-button style-type="secondary"
                      size="lg"
                      :block="true"
                      class="not-change-button"
                      @click="handleGoToLoginPage"
            >
                {{ $t('AUTH.RESET_PASSWORD_PAGE.GO_TO_LOGIN_WITHOUT_CHANGE') }}
            </p-button>
        </div>
        <div v-else
             class="invalid-link-wrapper"
        >
            <img class="logo-character"
                 src="@/assets/images/brand-asset_no-file_opacity50.svg"
            >
            <p class="help-text">
                {{ warningMessage }}
            </p>
            <p-button style-type="primary"
                      size="lg"
                      class="mt-8"
                      @click="handleGoToLoginPage"
            >
                {{ $t('AUTH.RESET_PASSWORD_PAGE.GO_TO_LOGIN_PAGE') }}
            </p-button>
        </div>
    </p-data-loader>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PButton, PDataLoader, PFieldGroup, PTextInput,
} from '@spaceone/design-system';
import type { JwtPayload } from 'jwt-decode';
import jwtDecode from 'jwt-decode';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserState } from '@/store/modules/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { getDefaultRouteAfterSignIn, getPasswordValidationInfo } from '@/services/auth/lib/helper';
import { AUTH_ROUTE } from '@/services/auth/route-config';

const UPDATE_PASSWORD_ACTION = 'UPDATE_PASSWORD';

export default {
    name: 'ResetPasswordPage',
    components: {
        PFieldGroup,
        PTextInput,
        PButton,
        PDataLoader,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: true,
            userId: '',
            userType: '',
            showResetPassword: false,
            isSessionExpired: computed(() => !!store.state.user.isSessionExpired),
            warningMessage: i18n.t('AUTH.RESET_PASSWORD_PAGE.INVALID_LINK'),
        });

        const {
            forms: { password, confirmPassword },
            invalidState,
            invalidTexts,
            setForm, isAllValid,
        } = useFormValidator({
            password: '',
            confirmPassword: '',
        }, {
            password: (val: string) => {
                const { invalidText } = getPasswordValidationInfo(val);
                return invalidText;
            },
            confirmPassword: (val: string) => {
                if (password.value !== val) return i18n.t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
                return true;
            },
        });

        /* Util */
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

        /* Api */
        const getUserInfo = async (): Promise<UserState|undefined> => {
            try {
                const response = await SpaceConnector.client.identity.user.get({
                    user_id: state.userId,
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
        const updateUser = async () => {
            try {
                await SpaceConnector.client.identity.user.update({
                    user_id: state.userId,
                    password: password.value,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const signIn = async () => {
            try {
                await store.dispatch('user/signIn', {
                    domainId: store.state.domain.domainId,
                    credentials: { password: password.value },
                    userType: state.userType || 'USER',
                    userId: state.userId,
                });
            } catch (e: any) {
                throw new Error(e);
            }
        };

        /* Event */
        const handleResetPassword = async () => {
            if (!isAllValid.value) return;

            await updateUser();
            await signIn();

            const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/isDomainOwner'], store.getters['user/hasSystemRole'], store.getters['user/hasPermission']);
            await vm.$router.push(defaultRoute);
        };
        const handleGoToLoginPage = async () => {
            await SpaceRouter.router.push({ name: AUTH_ROUTE.SIGN_OUT._NAME });
        };

        const initStatesByUrlSSOToken = async () => {
            try {
                const ssoAccessToken = getSSOTokenFromUrl();

                // When sso access token is not exist in url query string
                if (!ssoAccessToken) return;

                SpaceConnector.setToken(ssoAccessToken, '');
                const userId = getUserIdFromToken(ssoAccessToken);
                // When there is no user id in sso access token
                if (!userId) return;

                state.userId = userId;
                const userInfo = await getUserInfo();
                // When user info doesnt exist
                if (!userInfo) return;

                await store.commit('user/setUser', userInfo);
                const requiredActions = userInfo.requiredActions;
                state.userType = userInfo.userType || 'USER';
                // When a user has already updated password
                if (!requiredActions?.includes(UPDATE_PASSWORD_ACTION)) {
                    state.showResetPassword = false;
                    state.warningMessage = i18n.t('AUTH.RESET_PASSWORD_PAGE.ALREADY_RESET_TEXT');
                } else {
                    state.showResetPassword = true;
                }
            } catch (e) {
                ErrorHandler.handleError('Invalid token.');
            }
        };

        /* Init */
        (async () => {
            // When signed-in user needs to update password
            if (!state.isSessionExpired) {
                if (store.state.user.requiredActions?.includes('UPDATE_PASSWORD')) {
                    state.userId = store.state.user.userId;
                    state.userType = store.state.user.userType;
                    state.showResetPassword = true;
                } else {
                    state.showResetPassword = false;
                    state.warningMessage = i18n.t('AUTH.RESET_PASSWORD_PAGE.ALREADY_RESET_TEXT');
                }
            // When a user accessed by sso token
            } else {
                await initStatesByUrlSSOToken();
            }
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            invalidState,
            invalidTexts,
            password,
            confirmPassword,
            setForm,
            isAllValid,
            handleResetPassword,
            handleGoToLoginPage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.reset-password-page {
    @apply bg-white;
    position: relative;
    width: 100%;
    height: 100%;
    justify-content: center;
    .reset-password-wrapper {
        position: absolute;
        width: 25rem;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: auto;
        padding: 0;
        .title {
            @apply text-primary;
            font-size: 2rem;
            font-weight: 400;
            line-height: 1.25;
            padding-bottom: 1rem;
        }
        .help-text {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .form-wrapper {
            padding-top: 2.125rem;
            padding-bottom: 3.125rem;
            .p-text-input {
                width: 100%;
            }
        }
        .not-change-button {
            margin-top: 1.5rem;
        }
    }
    .invalid-link-wrapper {
        position: absolute;
        width: 23rem;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        margin: auto;
        padding: 0;
        .logo-character {
            height: 6rem;
            margin: 1rem auto;
        }
        .title {
            @apply text-primary-1;
            font-size: 2rem;
            font-weight: 400;
            line-height: 1.25;
            padding-bottom: 1rem;
        }
        .help-text {
            @apply text-gray-500;
            font-size: 1rem;
            line-height: 1.5;
        }
    }

    @screen mobile {
        .reset-password-wrapper, .invalid-link-wrapper {
            width: 100%;
            padding: 2.5rem;
        }
    }
}
</style>
