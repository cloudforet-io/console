<script setup lang="ts">
import { PBadge } from '@cloudforet/mirinae';

const props = defineProps<{
    name: string;
    color: string;
}>();
</script>

<template>
    <p-badge badge-type="subtle"
             shape="square"
             :style-type="props.color"
    >
        {{ props.name }}
    </p-badge>
</template>
