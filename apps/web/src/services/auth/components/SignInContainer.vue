<script lang="ts" setup>
import { reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { store } from '@/store';

import config from '@/lib/config';

import SignInLeftContainer from '@/services/auth/components/SignInLeftContainer.vue';


const route = useRoute();

const state = reactive({
    isDomainAdmin: false,
    logoImage: computed<string|undefined>(() => {
        const domainSettings = store.state.domain.config?.settings;
        if (domainSettings?.symbol_favicon_url) return domainSettings.symbol_favicon_url;

        const configImage = config.get('DOMAIN_IMAGE.CI_LOGO');
        if (configImage) return configImage;

        return undefined;
    }),
    textImage: computed<string|undefined>(() => {
        const domainSettings = store.state.domain.config?.settings;
        if (domainSettings?.wordtype_logo_url) return domainSettings?.wordtype_logo_url;

        const configImage = config.get('DOMAIN_IMAGE.CI_TEXT_WITH_TYPE');
        if (configImage) return configImage;

        return undefined;
    }),
});

watch(() => route.name, (name) => {
    state.isDomainAdmin = name === 'domainAdminSignIn';
}, { immediate: true });
</script>

<template>
    <div class="sign-in-container">
        <div class="ci-wrapper">
            <!--logo image-->
            <img v-if="state.logoImage"
                 class="logo-image"
                 :src="state.logoImage"
            >
            <img v-else
                 class="logo-image"
                 src="@/assets/images/brand/brand_logo.png"
            >
            <!--logo text image-->
            <img v-if="state.textImage"
                 class="text-image"
                 :src="state.textImage"
            >
            <img v-else
                 class="text-image"
                 src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg"
            >
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
        .logo-image {
            width: 56px;
            height: 56px;
            margin-top: 2rem;
            margin-left: 2rem;
        }
        .text-image {
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
