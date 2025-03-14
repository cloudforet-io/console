<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';

import { PLazyImg, PButton } from '@cloudforet/mirinae';

import type { Metadata } from '@/api-clients/identity/domain/schema/api-verbs/get-auth-info';

import { useDomainStore } from '@/store/domain/domain-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


const domainStore = useDomainStore();
const state = reactive({
    authOptions: computed<Metadata>(() => domainStore.state.authOptions),
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
    <p-button class="saml-wrapper"
              style-type="tertiary"
              @click="handleLogin"
    >
        <div class="saml-signin-button">
            <p-lazy-img :src="state.authOptions?.icon ?? ''"
                        width="1rem"
                        height="1rem"
            >
                <template #error>
                    <span />
                </template>
            </p-lazy-img>
            <span class="saml-signin-button-label"> {{ $t('COMMON.SIGN_IN.BUTTON_LABEL', {
                idp: state.authOptions.idp_name ?? 'SAML' ,
            }) }} </span>
        </div>
    </p-button>
</template>

<style lang="postcss" scoped>
.saml-wrapper {
    height: 2rem;
    width: 100%;

    .saml-signin-button {
        @apply flex items-center gap-1;
    }
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
