<template>
    <div class="google-oauth-wrapper">
        <button class="google-signin-button"
                @click="handleLogin"
        >
            <p-i name="logo_googleg_48dp"
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

import { PI } from '@spaceone/design-system';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';

const emit = defineEmits(['sign-in', 'go-to-admin-sign-in']);

const state = reactive({
    userId: computed(() => store.state.user.userId),
});

const onSignIn = () => {
    emit('sign-in', state.userId);
};

const handleLogin = async () => {
    try {
        await loadAuth('GOOGLE_OAUTH2').signIn(onSignIn);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

</script>

<style lang="postcss" scoped>
.google-signin-button {
    @apply bg-white text-gray-800;
    border: 1px solid #dadce0;
    border-radius: 4px;
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
    @apply bg-blue-100;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    border-color: #dadce0;
}

.google-signin-button:focus {
    outline: none;
}

.google-signin-button-label {
    font-size: 0.875rem;
    line-height: 1.6;
}

</style>
