<template>
    <div ref="containerRef"
         class="p-centered-layout"
    >
        <div v-if="$slots['top-contents']"
             class="top-contents-wrapper"
        >
            <slot name="top-contents" />
        </div>
        <div ref="layoutWrapperRef"
             class="layout-contents-wrapper"
             :class="{ 'contents-over-wrapper': isContentsOverWrapper }"
        >
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const containerRef = ref<HTMLElement|null>(null);
const layoutWrapperRef = ref<HTMLElement|null>(null);
const isContentsOverWrapper = ref(false);

const observer = new ResizeObserver((entries) => {
    const containerClientHeight = containerRef.value?.clientHeight ?? 0;
    if (entries[0].target.scrollHeight > containerClientHeight) {
        isContentsOverWrapper.value = true;
    } else {
        isContentsOverWrapper.value = false;
    }
});

onMounted(() => {
    if (layoutWrapperRef.value) observer.observe(layoutWrapperRef.value);
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
    }
}
</style>
