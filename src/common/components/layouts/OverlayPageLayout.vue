<template>
    <div class="overlay-page-layout">
        <div class="page-wrapper">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'OverlayPageLayout',
    setup() {
        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
.overlay-page-layout {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    flex-direction: column;
    z-index: 99;

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
</style>
