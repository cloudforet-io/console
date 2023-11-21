<script lang="ts" setup>
import { reactive, computed } from 'vue';

import { isEmpty } from 'lodash';

import config from '@/lib/config';

const state = reactive({
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
});
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
                <img class="logo-character"
                     src="@/assets/images/brand/brand_logo.png"
                >
                <img class="logo-text"
                     src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg"
                >
            </template>
        </div>
        <router-view />
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
        }

        @screen tablet {
            @apply hidden;
        }
    }
}
</style>
