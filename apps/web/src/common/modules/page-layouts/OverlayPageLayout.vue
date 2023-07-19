<script lang="ts" setup>
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

interface Props {
    visible: boolean;
}

defineProps<Props>();

</script>

<template>
    <transition name="slide-up">
        <general-page-layout v-if="visible"
                             class="overlay-page-layout"
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
    width: 100%;
    height: calc(100vh - $(gnb-height));
    top: $gnb-height;
    left: 0;
    flex-direction: column;
    z-index: 99;
    overflow: auto;

    /* transition: opacity 0.3s ease; */
    max-width: 100vw;
}

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
</style>
