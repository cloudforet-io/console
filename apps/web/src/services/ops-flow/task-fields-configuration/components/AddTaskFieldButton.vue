<script setup lang="ts">
import { PI } from '@cloudforet/mirinae';

import TaskFieldTypeIcon from '@/services/ops-flow/task-fields-configuration/components/TaskFieldTypeIcon.vue';

const props = defineProps<{
    icon: string;
    name: string;
}>();
const emit = defineEmits<{(event: 'click'): void
}>();
</script>

<template>
    <button class="border border-gray-200 rounded-xl p-2 flex items-center gap-2"
            @click="emit('click')"
    >
        <task-field-type-icon :icon="props.icon" />
        <span class="flex-grow text-label-md text-left">{{ props.name }}</span>
        <p-i name="ic_plus"
             height="1rem"
             width="1rem"
        />
    </button>
</template>
