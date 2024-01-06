<template>
    <div class="google-oauth-wrapper">
        <button class="google-signin-button"
                @click="handleLogin"
        >
            <p-i name="logo_google"
                 width="18px"
                 height="18px"
                 class="mr-2"
            />
            <span class="google-signin-button-label">Sign in with Google</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI } from '@spaceone/design-system';

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
                authType: 'EXTERNAL',
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
.google-signin-button {
    @apply bg-white text-gray-800 rounded-md border border-gray-400;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    height: 2.5rem;
    width: 100%;
    font-family: Roboto, sans-serif;
    padding: 0 1rem;
    cursor: pointer;
}

.google-signin-button:hover {
    @apply bg-blue-100 border-gray-400;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.google-signin-button:focus {
    outline: none;
}

.google-signin-button-label {
    font-size: 0.875rem;
    line-height: 1.6;
}

</style>
