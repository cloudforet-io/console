<template>
    <p-button class="google-oauth-wrapper"
              style-type="tertiary"
              @click="handleLogin"
    >
        <div class="google-signin-button">
            <p-i name="logo_google"
                 width="1rem"
                 height="1rem"
                 class="mr-2"
            />
            <span class="google-signin-button-label">{{ $t('COMMON.SIGN_IN.BUTTON_LABEL', {
                idp: 'Google',
            }) }}</span>
        </div>
    </p-button>
</template>

<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI, PButton } from '@spaceone/design-system';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const router = useRouter();

const emit = defineEmits(['sign-in', 'go-to-admin-sign-in']);

const state = reactive({
    userId: computed(() => store.state.user.userId),
    token: '',
});

const onSignIn = () => {
    emit('sign-in', state.userId);
};
const onErrorSignIn = (e, token) => {
    state.token = token;
    if (e.message.includes('MFA')) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const userEmail = e.message.match(emailRegex);
        router.push({
            name: AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH._NAME,
            params: {
                accessToken: state.token,
                mfaEmail: userEmail[0],
                userId: state.userId?.trim() as string,
            },
        });
    } else {
        ErrorHandler.handleError(e);
    }
};

const handleLogin = async () => {
    try {
        await loadAuth('GOOGLE_OAUTH2').signIn(onSignIn, onErrorSignIn);
    } catch (e: any) {
        ErrorHandler.handleError(e);
    }
};

</script>

<style lang="postcss" scoped>
.google-oauth-wrapper {
    height: 2rem;
    width: 100%;

    .google-signin-button {
        @apply flex items-center gap-1;
        cursor: pointer;
    }
}

.google-signin-button:focus {
    outline: none;
}

.google-signin-button-label {
    font-size: 0.875rem;
    line-height: 1.6;
}

</style>
