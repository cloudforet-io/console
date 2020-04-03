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
    @apply bg-white border border-gray-200;
    border-radius: 2px;
}
</style>
