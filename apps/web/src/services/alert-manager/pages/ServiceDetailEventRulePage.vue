<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});
</script>

<template>
    <div>
        {{ props.serviceId }}
    </div>
</template>
