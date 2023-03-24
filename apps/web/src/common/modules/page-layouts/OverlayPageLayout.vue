<template>
    <transition name="slide-up">
        <general-page-layout v-if="visible"
                             class="overlay-page-layout"
        >
            <slot />
        </general-page-layout>
    </transition>
</template>

<script lang="ts">
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

export default {
    name: 'OverlayPageLayout',
    components: { GeneralPageLayout },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
    },
    setup() {
        return {
        };
    },
};
</script>

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
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
</style>
