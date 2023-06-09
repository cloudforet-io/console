<template>
    <div class="p-pane-layout"
         v-on="listeners"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';

const attrs = useAttrs();
const listeners = {
    ...attrs,
};

</script>

<style lang="postcss">
.p-pane-layout {
    @apply bg-white border border-gray-200 rounded-lg;
}
</style>
