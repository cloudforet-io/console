<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';

import type { TaskStatusOption } from '@/schema/opsflow/task/type';

import TaskStatusDraggableItem from '@/services/ops-flow/components/TaskStatusDraggableItem.vue';
import TaskStatusListFoldButton from '@/services/ops-flow/components/TaskStatusListFoldButton.vue';

const props = defineProps<{
    header: string;
    items: TaskStatusOption[];
}>();
const emit = defineEmits<{(event: 'update:items', value: TaskStatusOption[]): void;
}>();
const draggableItems = computed({
    get() {
        return props.items;
    },
    set(value: TaskStatusOption[]) {
        emit('update:items', value);
    },
});

</script>

<template>
    <div>
        <div class="pt-2 pb-1">
            <task-status-list-fold-button>{{ props.header }}</task-status-list-fold-button>
        </div>
        <draggable v-model="draggableItems"
                   tag="ol"
                   draggable=".draggable-item"
                   ghost-class="ghost"
        >
            <task-status-draggable-item v-for="item in props.items"
                                        :key="item.key"
                                        :name="item.name"
            />
        </draggable>
    </div>
</template>
