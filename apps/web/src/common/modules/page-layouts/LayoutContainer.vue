<script setup lang="ts">
import { reactive } from 'vue';

import NavigationRail from '@/common/modules/navigations/gnb/NavigationRail.vue';
import Toolbox from '@/common/modules/navigations/gnb/Toolbox.vue';

const state = reactive({
    isMinimizeGnb: false,
});
</script>

<template>
    <div class="layout-container">
        <div class="gnb">
            <toolbox class="gnb-item"
                     :is-minimize-gnb.sync="state.isMinimizeGnb"
            />
            <navigation-rail class="gnb-item"
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
    .gnb-item {
        @apply absolute flex items-center bg-white border-gray-200;
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
