<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onBeforeMount, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { screens } from '@spaceone/design-system';

import { store } from '@/store';

import GNBNavigationRail from '@/common/modules/navigations/gnb/GNBNavigationRail.vue';
import GNBToolbox from '@/common/modules/navigations/gnb/GNBToolbox.vue';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;

const route = useRoute();
const { width } = useWindowSize();

const storeState = reactive({
    visibleSidebar: computed(() => store.state.display.visibleSidebar),
    isHideNavRail: computed(() => gnbGetters.isHideNavRail),
    isMinimizeNavRail: computed(() => gnbGetters.isMinimizeNavRail),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
});

watch([() => state.isMobileSize, () => route.path], async ([isMobileSize]) => {
    if (!isMobileSize) return;
    await gnbStore.createMinimizeNavRail(isMobileSize);
    await gnbStore.fetchNavRailStatus();
}, { immediate: true });

watch(() => storeState.visibleSidebar, (visibleSidebar) => {
    if (visibleSidebar) {
        gnbStore.createMinimizeNavRail(visibleSidebar);
    }
}, { immediate: true });

onBeforeMount(() => {
    gnbStore.fetchNavRailStatus();
});
</script>

<template>
    <div class="layout-container">
        <nav class="gnb">
            <g-n-b-toolbox class="g-n-b-item" />
            <g-n-b-navigation-rail class="g-n-b-item" />
        </nav>
        <main class="main"
              :class="{
                  'is-hide': state.isMobileSize || storeState.isHideNavRail,
                  'is-minimize': !state.isMobileSize && !storeState.isHideNavRail && storeState.isMinimizeNavRail,
              }"
        >
            <slot name="main" />
        </main>
    </div>
</template>

<style scoped lang="postcss">
.gnb {
    z-index: 50;
    .g-n-b-item {
        @apply absolute flex border-gray-200;
    }
}
.main {
    @apply absolute;
    top: $gnb-toolbox-height;
    left: $gnb-navigation-rail-max-width;
    width: calc(100% - $gnb-navigation-rail-max-width);
    height: calc(100% - $gnb-toolbox-height);
    margin: auto;
    transition: left 0.3s ease, width 0.3s ease;
    &.is-hide {
        left: 0;
        width: 100%;
    }
    &.is-minimize {
        left: $gnb-navigation-rail-min-width;
        width: calc(100% - $gnb-navigation-rail-min-width);
    }
}
</style>
