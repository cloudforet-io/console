<script lang="ts" setup>
import { reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import { store } from '@/store';

import config from '@/lib/config';

import SignInLeftContainer from '@/services/auth/components/SignInLeftContainer.vue';


const route = useRoute();

const state = reactive({
    isDomainAdmin: false,
    images: computed(() => {
        const domainImage = config.get('DOMAIN_IMAGE');
        if (!isEmpty(domainImage)) {
            return {
                ciLogo: config.get('DOMAIN_IMAGE.CI_LOGO'),
                ciTextWithType: config.get('DOMAIN_IMAGE.CI_TEXT_WITH_TYPE'),
                signIn: config.get('DOMAIN_IMAGE.SIGN_IN'),
            };
        }
        return undefined;
    }),
    symbolFaviconUrl: computed<string|undefined>(() => {
        const domainSettings = store.state.domain.config?.settings;
        return domainSettings?.symbol_favicon_url;
    }),
    wordTypeLogoUrl: computed<string|undefined>(() => {
        const domainSettings = store.state.domain.config?.settings;
        return domainSettings?.wordtype_logo_url;
    }),
});

watch(() => route.name, (name) => {
    state.isDomainAdmin = name === 'domainAdminSignIn';
}, { immediate: true });
</script>

<template>
    <div class="sign-in-container">
        <div class="ci-wrapper">
            <template v-if="state.images">
                <img class="logo-character"
                     :src="state.images.ciLogo"
                >
                <img class="logo-text"
                     :src="state.images.ciTextWithType"
                >
            </template>
            <template v-else>
                <img v-if="state.symbolFaviconUrl"
                     class="logo-character"
                     :src="state.symbolFaviconUrl"
                >
                <img v-else
                     class="logo-character"
                     src="@/assets/images/brand/brand_logo.png"
                >
                <img v-if="state.wordTypeLogoUrl"
                     class="logo-text"
                     :src="state.wordTypeLogoUrl"
                >
                <img v-else
                     class="logo-text"
                     src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg"
                >
            </template>
        </div>
        <div class="contents-wrapper">
            <sign-in-left-container :is-domain-admin="state.isDomainAdmin" />
            <router-view />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.sign-in-container {
    .ci-wrapper {
        @apply flex fixed;
        flex-flow: row;
        z-index: 1000;
        .logo-character {
            width: 56px;
            height: 56px;
            margin-top: 2rem;
            margin-left: 2rem;
        }
        .logo-text {
            width: auto;
            height: 40px;
            margin-top: 2.5rem;
            margin-left: 0.5rem;
        }

        @screen tablet {
            @apply hidden;
        }
    }

    .contents-wrapper {
        @apply flex absolute;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
    }
}
</style>
