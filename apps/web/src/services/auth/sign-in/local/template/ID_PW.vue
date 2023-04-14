<template>
    <div class="local-wrapper">
        <form class="form"
              onsubmit="return false"
        >
            <p-field-group :label="isDomainOwner ? $t('COMMON.SIGN_IN.ADMIN_ID') : $t('COMMON.SIGN_IN.USER_ID')"
                           :invalid="isIdValid === false"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="userId"
                                  :placeholder="!isMobile() ? 'E-mail Address' : 'User ID'"
                                  :invalid="invalid"
                                  block
                                  @update:value="checkUserId"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('COMMON.SIGN_IN.PASSWORD')"
                           required
                           :invalid="isPasswordValid === false"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="password"
                                  type="password"
                                  placeholder="Password"
                                  :invalid="invalid"
                                  block
                                  @update:value="checkPassword"
                                  @keyup.enter="signIn"
                    />
                </template>
            </p-field-group>
        </form>
        <div class="util-wrapper">
            <p class="reset-pw-button">
                <router-link id="reset-pw-button"
                             :to="{ name: AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME, query: { status: 'find' } }"
                >
                    {{ $t('AUTH.PASSWORD.FIND.FORGOT_PASSWORD') }}
                </router-link>
            </p>
            <p-button :style-type="buttonStyleType"
                      type="submit"
                      size="lg"
                      class="sign-in-btn"
                      :loading="loading"
                      @click="signIn"
            >
                {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import type { SetupContext } from 'vue';
import {
    getCurrentInstance,
    reactive,
    toRefs,
    defineComponent, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import { PButton, PTextInput, PFieldGroup } from '@spaceone/design-system';

import { store } from '@/store';

import { isMobile } from '@/lib/helper/cross-browsing-helper';


import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/route-config';

export default defineComponent({
    name: 'IDPWSignIn',
    components: {
        PButton,
        PTextInput,
        PFieldGroup,
    },
    props: {
        isDomainOwner: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context: SetupContext) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            userId: '' as string | undefined,
            password: '',
            loading: false,
        });

        const validationState = reactive({
            isIdValid: undefined as undefined | boolean,
            idInvalidText: '' as TranslateResult | string,
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        const checkUserId = () => {
            if (!state.userId) {
                validationState.isIdValid = false;
                validationState.idInvalidText = vm.$t('COMMON.SIGN_IN.USER_ID_REQUIRED');
            } else {
                validationState.isIdValid = true;
                validationState.idInvalidText = '';
            }
        };

        const checkPassword = async () => {
            if (state.password.length === 1) await store.dispatch('display/hideSignInErrorMessage');
            if ((state.password.replace(/ /g, '').length !== state.password.length)
                || !state.password) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('COMMON.SIGN_IN.PASSWORD_REQUIRED');
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }
        };

        const signIn = async () => {
            state.loading = true;
            checkUserId();
            await checkPassword();
            if (!validationState.isIdValid || !validationState.isPasswordValid) {
                state.loading = false;
                return;
            }
            const credentials = {
                password: state.password.trim(),
            };
            try {
                await loadAuth().signIn(credentials, state.userId?.trim(), props.isDomainOwner ? 'DOMAIN_OWNER' : 'USER');
                await store.dispatch('display/hideSignInErrorMessage');
                if (store.state.user.requiredActions?.includes('UPDATE_PASSWORD')) {
                    await vm.$router.push({ name: AUTH_ROUTE.PASSWORD._NAME });
                } else {
                    context.emit('sign-in', state.userId);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.password = '';
                await store.dispatch('display/showSignInErrorMessage');
            } finally {
                state.loading = false;
            }
        };

        const buttonStyleType = computed(() => (props.isDomainOwner ? 'primary' : 'substitutive'));

        return {
            ...toRefs(state),
            ...toRefs(validationState),
            AUTH_ROUTE,
            isMobile,
            signIn,
            checkUserId,
            checkPassword,
            buttonStyleType,
        };
    },
});
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    input:-webkit-autofill {
        transition: background-color 5000s;
        -webkit-box-shadow: 0 0 0 30px white inset !important;
    }
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
        transition: background-color 5000s;
        -webkit-box-shadow: 0 0 0 30px theme('colors.blue.100') inset !important;
    }
    .p-button {
        @apply font-normal text-gray-700;
    }
}
.local-wrapper {
    margin: auto;
    width: 100%;
    .form {
        @apply flex flex-col;
        gap: 1.25rem;
        .p-field-group {
            margin-bottom: 0;
        }
    }
    .input-label {
        @apply text-label-md font-bold text-gray-900 mt-2;
        margin-bottom: 0.375rem;
    }
    .util-wrapper {
        @apply flex flex-col;
        gap: 2.5rem;
        width: 100%;
        margin-top: 1.125rem;
        .reset-pw-button {
            @apply text-label-md text-blue-700;
        }
    }

    @screen tablet {
        .form {
            gap: 1.5rem;
        }
        .util-wrapper {
            gap: 2.5rem;
            margin-top: 1.5rem;
        }
    }

    @screen mobile {
        .p-field-group:deep(label) {
            display: none;
        }
    }
}
</style>
