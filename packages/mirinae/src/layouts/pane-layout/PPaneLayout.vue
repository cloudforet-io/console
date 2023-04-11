<template>
    <div class="p-pane-layout" v-on="$listeners">
        <slot />
    </div>
</template>

<script lang="ts">
export default {
    name: 'PPaneLayout',
};
</script>

<style lang="postcss">
.p-pane-layout {
    @apply bg-white border border-gray-200 rounded-lg;
}
</style>
