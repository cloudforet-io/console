<script setup lang="ts">
import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import LandingContents from '@/services/landing/components/LandingContents.vue';
</script>

<template>
    <div class="workspace-landing-page">
        <console-logo class="logo"
                      :position-fixed="false"
                      :is-hidden-if-tablet="false"
        />
        <landing-contents />
    </div>
</template>

<style scoped lang="postcss">
.workspace-landing-page {
    @apply flex flex-col items-center;
    .logo {
        margin-top: 0.5rem;
        margin-left: -2rem;
    }
}
</style>
