<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router/composables';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import LandingContents from '@/services/landing/components/workspace-landing/LandingContents.vue';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceLandingPageQueryValue } from '@/services/landing/type/workspace-landing-page-type';

const route = useRoute();
const router = useRouter();

const landingPageStore = useLandingPageStore();
landingPageStore.setRedirectPath((route.query as WorkspaceLandingPageQueryValue).redirectPath);

const handleClickLogo = () => {
    router.push({ name: LANDING_ROUTE.DOMAIN._NAME });
};
</script>

<template>
    <div class="workspace-landing-page">
        <console-logo class="logo"
                      :position-fixed="false"
                      :is-hidden-if-tablet="false"
                      @click="handleClickLogo"
        />
        <landing-contents />
    </div>
</template>

<style scoped lang="postcss">
.workspace-landing-page {
    @apply flex flex-col items-center;
    .logo {
        @apply cursor-pointer;
        margin-top: 0.5rem;
        margin-left: -2rem;
    }
}
</style>
