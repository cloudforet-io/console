<script setup lang="ts">
import { reactive } from 'vue';

import GNBNavigationRail from '@/common/modules/navigations/gnb/GNBNavigationRail.vue';
import GNBToolbox from '@/common/modules/navigations/gnb/GNBToolbox.vue';

const state = reactive({
    isMinimizeGnb: false,
});
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
              :class="{'is-minimize': state.isMinimizeGnb}"
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
    &.is-minimize {
        left: $gnb-navigation-rail-min-width;
        width: calc(100% - $gnb-navigation-rail-min-width);
    }
}
</style>
