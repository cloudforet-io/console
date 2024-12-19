<script setup lang="ts">
import { PI } from '@cloudforet/mirinae';

const props = defineProps<{
    icon: string;
}>();
</script>

<template>
    <span class="inline-flex items-center justify-center w-5 h-5 bg-gray-150 rounded-md">
        <p-i :name="props.icon"
             height="1rem"
             width="1rem"
        />
    </span>
</template>
