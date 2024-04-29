<script setup lang="ts">
import FNB from '@/common/modules/navigations/FNB.vue';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import LandingContents from '@/services/landing/components/LandingContents.vue';
import LandingHeader from '@/services/landing/components/LandingHeader.vue';
</script>

<template>
    <div class="workspace-lading-page">
        <landing-header />
        <div class="scroll-contents">
            <console-logo class="logo"
                          :position-fixed="false"
                          :is-hidden-if-tablet="false"
            />
            <landing-contents />
            <f-n-b class="fnb" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.workspace-lading-page {
    @apply relative flex flex-col w-full h-full;
    .scroll-contents {
        @apply flex flex-col items-center overflow-y-auto;
        padding-right: 1.5rem;
        padding-bottom: calc($fnb-height + 5.375rem);
        padding-left: 1.5rem;
        .logo {
            margin-top: 0.5rem;
            margin-left: -2rem;
        }
        .fnb {
            @apply absolute w-full bg-gray-100;
            bottom: 0;
            margin-top: 2rem;
        }
    }
}
</style>
