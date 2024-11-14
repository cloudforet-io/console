<script setup lang="ts">
import {
    onUnmounted,
} from 'vue';

import FNB from '@/common/modules/navigations/FNB.vue';

import LandingHeader from '@/services/landing/components/workspace-landing/LandingHeader.vue';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const landingPageStore = useLandingPageStore();

onUnmounted(() => {
    landingPageStore.reset();
});
</script>

<template>
    <div class="lading-container">
        <landing-header />
        <div class="scroll-contents">
            <router-view />
        </div>
        <f-n-b class="fnb" />
    </div>
</template>

<style scoped lang="postcss">
.lading-container {
    @apply relative flex flex-col w-full h-full;
    .scroll-contents {
        @apply flex flex-col items-center overflow-y-auto;
        padding-right: 1.5rem;
        padding-bottom: 2rem;
        padding-left: 1.5rem;
        flex: 1;
        .fnb {
            @apply absolute w-full bg-gray-100;
            bottom: 0;
            margin-top: 2rem;
        }
    }
}
</style>
