<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { screens } from '@spaceone/design-system';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import GNBNavigationRail from '@/common/modules/navigations/gnb/GNBNavigationRail.vue';
import GNBToolbox from '@/common/modules/navigations/gnb/GNBToolbox.vue';


const route = useRoute();

const state = reactive({
    isMinimizeGnb: false,
});

// mobile
window.addEventListener('resize', () => {
    state.isMinimizeGnb = window.innerWidth < screens.mobile.max;
});

watch([() => isMobile(), () => route.path], ([isMobileState]) => {
    if (!isMobileState) return;
    state.isMinimizeGnb = isMobileState;
}, { immediate: true });
</script>

<template>
    <div class="layout-container">
        <div class="gnb">
            <g-n-b-toolbox class="g-n-b-item"
                           :is-minimize-gnb.sync="state.isMinimizeGnb"
            />
            <g-n-b-navigation-rail class="g-n-b-item"
                                   :is-minimize-gnb="state.isMinimizeGnb"
            />
        </div>
        <main class="main"
              :class="{'is-minimize': state.isMinimizeGnb, 'is-mobile': isMobile() }"
        >
            <slot name="main" />
        </main>
    </div>
</template>

<style scoped lang="postcss">
.gnb {
    z-index: 10;
    .g-n-b-item {
        @apply absolute flex border-gray-200;
    }
}
.main {
    @apply absolute;
    top: $gnb-toolbox-height;
    left: $gnb-navigation-rail-max-width;
    width: calc(100% - $gnb-navigation-rail-max-width);
    transition: left 0.3s ease, width 0.3s ease;
    &.is-minimize, &.is-mobile {
        left: $gnb-navigation-rail-min-width;
        width: calc(100% - $gnb-navigation-rail-min-width);
    }
}
</style>
