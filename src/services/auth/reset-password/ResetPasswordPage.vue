<template>
    <div class="reset-password-page">
        <div v-if="showResetPassword" class="reset-password-wrapper">
            <p class="title">
                {{ $t('AUTH.RESET_PASSWORD_PAGE.RESET_PASSWORD') }}
            </p>
            <p class="help-text">
                {{ $t('AUTH.RESET_PASSWORD_PAGE.HELP_TEXT') }}<span class="text-gray-900">{{ userInfo.userId }}</span>
            </p>
            <div class="form-wrapper">
                <p-field-group :label="$t('COMMON.PROFILE.PASSWORD')"
                               required
                               :invalid="invalidState.password"
                               :invalid-text="invalidTexts.password"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="password" type="password"
                                      :invalid="invalid"
                                      @input="setForm('password', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                               required
                               :invalid="invalidState.confirmPassword"
                               :invalid-text="invalidTexts.confirmPassword"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="confirmPassword" type="password"
                                      :invalid="invalid"
                                      @input="setForm('confirmPassword', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
            <p-button :disabled="!isAllValid" style-type="primary" size="md"
                      class="reset-button"
                      @click="handleResetPassword"
            >
                {{ $t('AUTH.RESET_PASSWORD_PAGE.RESET_PASSWORD') }}
            </p-button>
        </div>
        <div v-else class="invalid-link-wrapper">
            <img class="logo-character" src="@/assets/images/brand-asset_no-file_opacity50.svg">
            <p class="title">
                {{ $t('AUTH.RESET_PASSWORD_PAGE.INVALID_LINK') }}
            </p>
            <p class="help-text">
                {{ $t('AUTH.RESET_PASSWORD_PAGE.HELP_TEXT_2') }}
            </p>
            <p-button style-type="primary" size="md" class="reset-button"
                      @click="handleGoToLoginPage"
            >
                {{ $t('AUTH.RESET_PASSWORD_PAGE.GO_TO_LOGIN_PAGE') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { PButton, PFieldGroup, PTextInput } from '@spaceone/design-system';
import jwt from 'jsonwebtoken';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { getPasswordValidationInfo } from '@/services/auth/lib/helper';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';


const UPDATE_PASSWORD_ACTION = 'UPDATE_PASSWORD';

export default {
    name: 'ResetPasswordPage',
    components: {
        PFieldGroup,
        PTextInput,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            userId: '',
            userType: '',
            showResetPassword: false,
            isLoginUser: computed(() => !!store.state.user.userId),
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
        const getUserIdFromToken = (): string | undefined => {
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            const ssoAccessToken = params.get('sso_access_token') as string;
            const decodedToken = jwt.decode(ssoAccessToken);
            if (decodedToken) {
                SpaceConnector.setToken(ssoAccessToken, '');
                return decodedToken.aud;
            }
            return undefined;
        };

        /* Api */
        const getUserInfo = async () => {
            try {
                const result = await SpaceConnector.client.identity.user.get({
                    user_id: state.userId,
                });
                state.userType = result.user_type || 'USER';
                const requiredActions = result.required_actions;
                state.showResetPassword = requiredActions.includes(UPDATE_PASSWORD_ACTION);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.showResetPassword = false;
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
            await vm.$router.push({ name: DASHBOARD_ROUTE._NAME });
        };
        const handleGoToLoginPage = () => {
            SpaceRouter.router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
        };

        /* Init */
        (async () => {
            if (state.isLoginUser) {
                if (store.state.user.requiredActions?.includes('UPDATE_PASSWORD')) {
                    state.userId = store.state.user.userId;
                    state.userType = store.state.user.userType;
                    state.showResetPassword = true;
                } else {
                    await vm.$router.push({ name: DASHBOARD_ROUTE._NAME });
                }
            } else {
                const userId = getUserIdFromToken();
                if (userId) {
                    state.userId = userId;
                    await getUserInfo();
                } else {
                    state.showResetPassword = false;
                }
            }
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
        .reset-button {
            width: 100%;
            height: 2.5rem;
            font-size: 1rem;
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
        .reset-button {
            height: 2.5rem;
            font-size: 1rem;
            margin-top: 2rem;
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
