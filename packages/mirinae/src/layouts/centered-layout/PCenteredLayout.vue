<template>
    <div class="p-centered-layout">
        <div v-if="slots['top-contents']"
             class="top-contents-wrapper"
        >
            <slot name="top-contents" />
        </div>
        <div ref="layoutWrapperRef"
             class="layout-contents-wrapper"
             :class="{ 'contents-over-wrapper': isContentsOverWrapper }"
        >
            <div ref="layoutContentsRef"
                 class="layout-contents"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref, onMounted, onUnmounted, useSlots,
} from 'vue';

const slots = useSlots();

const layoutWrapperRef = ref<HTMLElement|null>(null);
const layoutContentsRef = ref<HTMLElement|null>(null);
const isContentsOverWrapper = ref(false);

const observer = new ResizeObserver((entries) => {
    if (!layoutWrapperRef.value) return;
    const wrapperClientHeight = layoutWrapperRef.value.clientHeight;
    if (entries[0].target.scrollHeight > wrapperClientHeight) {
        isContentsOverWrapper.value = true;
    } else {
        isContentsOverWrapper.value = false;
    }
});

onMounted(() => {
    if (layoutContentsRef.value) observer.observe(layoutContentsRef.value);
});
onUnmounted(() => {
    observer.disconnect();
});
</script>

<style lang="postcss">
.p-centered-layout {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    &::before {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        content: "";
        background-image: url('./assets/background.png');
        background-size: cover;
        opacity: 0.3;
    }
    > .top-contents-wrapper {
        @apply absolute z-10;
        top: 1rem;
        left: 1.25rem;
    }
    > .layout-contents-wrapper {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        min-width: 360px;
        padding: 2rem 2.5rem;
        &.contents-over-wrapper {
            justify-content: flex-start;
        }
        .layout-contents {
            display: flex;
            width: 100%;
            justify-content: center;
        }
    }
}
</style>
