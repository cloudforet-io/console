<script setup lang="ts">
import DomainLandingRecommendation from '@/services/landing/components/DomainLandingRecommendation.vue';
import DomainLandingStartBanner from '@/services/landing/components/DomainLandingStartBanner.vue';
import DomainLandingTitle from '@/services/landing/components/DomainLandingTitle.vue';

</script>

<template>
    <div class="domain-landing-page">
        <domain-landing-title />
        <domain-landing-start-banner />
        <domain-landing-recommendation />
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
