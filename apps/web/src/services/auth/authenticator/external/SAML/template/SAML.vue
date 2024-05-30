<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';

import { PLazyImg } from '@spaceone/design-system';

import type { Metadata } from '@/schema/identity/domain/api-verbs/get-auth-info';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

const state = reactive({
    authOptions: computed<Metadata>(() => store.state.domain.authOptions),
});

const handleLogin = () => {
    try {
        const idpUrl = state.authOptions?.sso_url;
        if (!idpUrl) {
            throw new Error('SAML SSO URL is not defined');
        }
        window.location.href = idpUrl;
    } catch (e: any) {
        ErrorHandler.handleError(e);
    }
};

</script>

<template>
    <div class="saml-wrapper"
         @click="handleLogin"
    >
        <button class="saml-signin-button">
            <p-lazy-img :src="state.authOptions?.icon ?? ''"
                        width="1rem"
                        height="1rem"
            >
                <template #error>
                    <span />
                </template>
            </p-lazy-img>
            <span class="saml-signin-button-label"> {{ state.authOptions.label ?? 'SAML' }} </span>
        </button>
    </div>
</template>

<style lang="postcss" scoped>
.saml-wrapper {
    @apply bg-white text-gray-900 rounded-md border border-gray-400;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    height: 2rem;
    width: 100%;
    font-family: Roboto, sans-serif;
    padding: 0 1rem;
    cursor: pointer;

    .saml-signin-button {
        @apply flex items-center gap-1;
        cursor: pointer;
    }
}

.saml-wrapper:hover {
    @apply bg-blue-100 border-gray-400;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.saml-wrapper:focus {
    outline: none;
}

.saml-signin-button-label {
    @apply text-label-md font-bold;
    font-size: 0.875rem;
    line-height: 1.6;
}

</style>
