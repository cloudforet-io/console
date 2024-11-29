<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
    serviceId: string;
}>();
</script>

<template>
    <div>
        {{ props.serviceId }}
    </div>
</template>
