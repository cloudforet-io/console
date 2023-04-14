<template>
    <div class="centered-page-layout">
        <div class="layout-contents">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style lang="postcss" scoped>
.centered-page-layout {
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
    .layout-contents {
        @apply absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
</style>
