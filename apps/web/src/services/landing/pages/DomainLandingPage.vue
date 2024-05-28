<script setup lang="ts">
import DomainLandingTitle from '@/services/landing/components/DomainLandingTitle.vue';

</script>

<template>
    <div class="domain-landing-page">
        <domain-landing-title />
    </div>
</template>

<style lang="postcss" scoped>
.domain-landing-page {
    @apply flex flex-col;
    width: 100%;
    padding-top: 7rem;
    gap: 4rem;
}
</style>
