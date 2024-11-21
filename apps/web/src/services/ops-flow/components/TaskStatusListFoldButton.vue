<script setup lang="ts">
import { ref } from 'vue';

import { PI } from '@cloudforet/mirinae';

const isFolded = ref(false);
const emit = defineEmits<{(event: 'update:isFolded', value: boolean): void;
}>();
const handleClick = () => {
    isFolded.value = !isFolded.value;
    emit('update:isFolded', isFolded.value);
};
</script>

<template>
    <button class="inline-flex items-center rounded p-1 pr-3"
            @click="handleClick"
    >
        <p-i :name="isFolded ? 'ic_chevron-right' : 'ic_chevron-down'"
             height="1.25rem"
             width="1.25rem"
             class="flex-shrink-0"
        />
        <span class="flex-shrink-0 text-label-md">
            <slot />
        </span>
    </button>
</template>

<style lang="postcss" scoped>
button {
    @media (hover: hover) {
        &:hover {
            @apply bg-gray-150;
        }
    }
}
</style>
