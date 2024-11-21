<script setup lang="ts">
import { PI, PBadge } from '@cloudforet/mirinae';

const props = defineProps<{
    name: string;
}>();
</script>

<template>
    <li>
        <p-i name="ic_drag-handle" />
        <p-badge badge-type="subtle">
            {{ props.name }}
        </p-badge>
    </li>
</template>

<style lang="postcss" scoped>
li {
    height: 2.625rem;
}
</style>
