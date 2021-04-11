<template>
    <div>
        <transition name="slide-up">
            <general-page-layout class="overlay-page-layout">
                <div class="page-wrapper">
                    <slot />
                </div>
            </general-page-layout>
        </transition>
    </div>
</template>

<script lang="ts">
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';

export default {
    name: 'OverlayPageLayout',
    components: { GeneralPageLayout },
    setup() {
        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
.overlay-page-layout {
    @apply bg-white;
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    flex-direction: column;
    z-index: 99;
    overflow: auto;

    /* transition: opacity 0.3s ease; */
    max-height: 100%;
    min-height: 100%;
    max-width: 100vw;
    .page-wrapper {
        width: 100%;
        border: none;
        flex-grow: 1;
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
