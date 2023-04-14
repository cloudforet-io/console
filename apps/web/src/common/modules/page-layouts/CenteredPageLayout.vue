<template>
    <div class="centered-page-layout">
        <g-n-b-logo :to="state.logoLink"
                    class="gnb-logo"
        />
        <div class="layout-contents">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, reactive } from 'vue';

import { store } from '@/store';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import { MENU_ID } from '@/lib/menu/config';

import GNBLogo from '@/common/modules/navigations/gnb/modules/GNBLogo.vue';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/route-config';

const state = reactive({
    logoLink: computed(() => (isUserAccessibleToMenu(MENU_ID.HOME_DASHBOARD, store.getters['user/pagePermissionList']) ? { name: HOME_DASHBOARD_ROUTE._NAME } : null)),

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
        @apply absolute;
        top: 1rem;
        left: 1.25rem;
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
