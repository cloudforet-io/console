<template>
    <div class="p-pane-layout" v-on="$listeners">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'PPaneLayout',
};
</script>

<style lang="postcss" scoped>
.p-pane-layout {
    @apply bg-white border border-gray3;
    box-shadow: 0 0 8px rgba(theme('colors.primary'), 0.08);
    border-radius: 2px;
}
</style>
