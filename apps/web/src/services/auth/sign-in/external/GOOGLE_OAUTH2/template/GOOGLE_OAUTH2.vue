<script setup lang="ts">
import { PI } from '@spaceone/design-system';
import {
    computed,
    reactive,
} from 'vue';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';

const emit = defineEmits<{(e: 'sign-in', value: string): void;
    (e: 'go-to-admin-sign-in'): void;
}>();
const store = useStore();

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

<style lang="postcss" scoped>
.google-signin-button {
    @apply bg-white text-gray-800 rounded-md border border-gray-400;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 1px rgb(0 0 0 / 10%);
    height: 2.5rem;
    width: 100%;
    font-family: Roboto, sans-serif;
    padding: 0 1rem;
    cursor: pointer;
}

.google-signin-button:hover {
    @apply bg-blue-100 border-gray-400;
    box-shadow: 0 1px 1px rgb(0 0 0 / 20%);
}

.google-signin-button:focus {
    outline: none;
}

.google-signin-button-label {
    font-size: 0.875rem;
    line-height: 1.6;
}

</style>
