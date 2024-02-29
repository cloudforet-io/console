<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { screens } from '@spaceone/design-system';

import GNBNavigationRail from '@/common/modules/navigations/gnb/GNBNavigationRail.vue';
import GNBToolbox from '@/common/modules/navigations/gnb/GNBToolbox.vue';

const route = useRoute();
const { width } = useWindowSize();

const state = reactive({
    isMinimizeGnb: false,
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
});

watch([() => state.isMobileSize, () => route.path], ([isMobileSize]) => {
    if (!isMobileSize) return;
    state.isMinimizeGnb = isMobileSize;
}, { immediate: true });
</script>

<template>
    <div class="layout-container">
        <nav class="gnb">
            <g-n-b-toolbox class="g-n-b-item"
                           :is-minimize-gnb.sync="state.isMinimizeGnb"
            />
            <g-n-b-navigation-rail class="g-n-b-item"
                                   :is-minimize-gnb="state.isMinimizeGnb"
            />
        </nav>
        <main class="main"
              :class="{'is-mobile': state.isMobileSize, 'is-minimize': !state.isMobileSize && state.isMinimizeGnb}"
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
    height: calc(100% - $top-bar-height - $gnb-toolbox-height);
    transition: left 0.3s ease, width 0.3s ease;
    &.is-mobile {
        left: 0;
        width: 100%;
    }
    &.is-minimize {
        left: $gnb-navigation-rail-min-width;
        width: calc(100% - $gnb-navigation-rail-min-width);
    }
}
</style>
