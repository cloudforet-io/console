<template>
    <div class="password-container">
        <div class="page-contents">
            <router-view />
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style lang="postcss" scoped>
.password-container {
    &::before {
        @apply absolute;
        content: "";
        background-image: url('@/assets/images/landing/img_landing_cost-explorer_background.png');
        background-size: cover;
        opacity: 0.3;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .page-contents {
        @apply absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}

</style>
