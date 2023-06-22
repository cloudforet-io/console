<template>
    <div class="centered-page-layout">
        <g-n-b-logo v-if="!props.hasNavBar"
                    class="gnb-logo"
                    :to="{ name: ROOT_ROUTE._NAME }"
        />
        <div class="layout-contents">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

import { ROOT_ROUTE } from '@/router/service-routes';

import GNBLogo from '@/common/modules/navigations/gnb/modules/GNBLogo.vue';

interface Props {
    hasNavBar?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    hasNavBar: false,
});
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
    .gnb-logo {
        @apply absolute z-10;
        top: 1rem;
        left: 1.25rem;
    }
    .layout-contents {
        @apply absolute flex items-center justify-center;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
    }
}
</style>
