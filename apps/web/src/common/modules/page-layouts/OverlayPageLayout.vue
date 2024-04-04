<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;

const storeState = reactive({
    isMinimizeNavRail: computed(() => gnbGetters.isMinimizeNavRail),
});
</script>

<template>
    <transition name="slide-up">
        <general-page-layout v-if="props.visible"
                             class="overlay-page-layout"
                             :class="{'is-minimize': storeState.isMinimizeNavRail}"
        >
            <slot />
        </general-page-layout>
    </transition>
</template>

<style lang="postcss" scoped>
.overlay-page-layout {
    @apply bg-white;
    position: fixed;
    display: flex;
    width: calc(100% - $gnb-navigation-rail-max-width);
    height: calc(100vh - $(top-bar-height));
    top: calc($top-bar-height + $gnb-toolbox-height);
    left: $gnb-navigation-rail-max-width;
    flex-direction: column;
    z-index: 99;
    overflow: auto;
    transition: left 0.3s ease, width 0.3s ease;

    /* transition: opacity 0.3s ease; */
    max-width: 100vw;

    &.is-minimize {
        left: $gnb-navigation-rail-min-width;
        width: calc(100% - $gnb-navigation-rail-min-width);
    }
}

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
</style>
