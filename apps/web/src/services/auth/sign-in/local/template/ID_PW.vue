<template>
    <div class="local-wrapper">
        <form class="form"
              onsubmit="return false"
        >
            <p-field-group :label="isDomainOwner ? t('COMMON.SIGN_IN.ADMIN_ID') : t('COMMON.SIGN_IN.USER_ID')"
                           :invalid="validationState.isIdValid === false"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="state.userId"
                                  :placeholder="!isMobile() ? 'E-mail Address' : 'User ID'"
                                  :invalid="invalid"
                                  block
                                  @update:value="handleUpdateUserId"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="t('COMMON.SIGN_IN.PASSWORD')"
                           required
                           :invalid="validationState.isPasswordValid === false"
            >
                <template #default="{invalid}">
                    <p-text-input :value="state.password"
                                  type="password"
                                  placeholder="Password"
                                  :invalid="invalid"
                                  block
                                  @update:value="handleUpdatePassword"
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
                    {{ t('AUTH.PASSWORD.FIND.FORGOT_PASSWORD') }}
                </router-link>
            </p>
            <p-button :style-type="buttonStyleType"
                      type="submit"
                      size="lg"
                      class="sign-in-btn"
                      :loading="state.loading"
                      @click="signIn"
            >
                {{ t('COMMON.SIGN_IN.SIGN_IN') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
/* eslint-disable camelcase */
import { PButton, PTextInput, PFieldGroup } from '@spaceone/design-system';
import {
    reactive, computed,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { isMobile } from '@/lib/helper/cross-browsing-helper';


import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/route-config';


interface Props {
    isDomainOwner?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isDomainOwner: false,
});
const emit = defineEmits<{(e:'sign-in', value: string): void}>();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    userId: '' as string,
    password: '',
    loading: computed(() => store.state.user.isSignInLoading),
});

const validationState = reactive({
    isIdValid: undefined as undefined | boolean,
    idInvalidText: '',
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: '',
    isPasswordCheckValid: undefined as undefined | boolean,
    passwordCheckInvalidText: '',
});

const checkUserId = () => {
    if (!state.userId) {
        validationState.isIdValid = false;
        validationState.idInvalidText = t('COMMON.SIGN_IN.USER_ID_REQUIRED');
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
        validationState.passwordInvalidText = t('COMMON.SIGN_IN.PASSWORD_REQUIRED');
    } else {
        validationState.isPasswordValid = true;
        validationState.passwordInvalidText = '';
    }
};

const handleUpdateUserId = (userId: string) => {
    state.userId = userId;
    checkUserId();
};
const handleUpdatePassword = async (password: string) => {
    state.password = password;
    await checkPassword();
};

const signIn = async () => {
    checkUserId();
    await checkPassword();
    if (!validationState.isIdValid || !validationState.isPasswordValid) {
        return;
    }
    const credentials = {
        password: state.password.trim(),
    };
    try {
        await loadAuth().signIn(credentials, state.userId?.trim(), props.isDomainOwner ? 'DOMAIN_OWNER' : 'USER');
        await store.dispatch('display/hideSignInErrorMessage');
        if (store.state.user.requiredActions?.includes('UPDATE_PASSWORD')) {
            await router.push({ name: AUTH_ROUTE.PASSWORD._NAME });
        } else {
            emit('sign-in', state.userId);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.password = '';
        await store.dispatch('display/showSignInErrorMessage');
    }
};

const buttonStyleType = computed(() => (props.isDomainOwner ? 'primary' : 'substitutive'));

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
