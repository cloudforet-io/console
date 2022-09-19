<template>
    <div class="p-empty">
        <slot />
    </div>
</template>

<script lang="ts">

export default {
    name: 'PEmpty',
    setup() {
        return {};
    },
};
</script>

<style lang="postcss">
.p-empty {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.2;

    @apply text-gray-300;
}
</style>
