<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import draggable from 'vuedraggable';

import type { TaskStatusOption, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

import TaskStatusDraggableItem from '@/services/ops-flow/components/TaskStatusDraggableItem.vue';
import TaskStatusListFoldButton from '@/services/ops-flow/components/TaskStatusListFoldButton.vue';


const props = defineProps<{
    header: string;
    type: TaskStatusType;
    items: TaskStatusOption[];
}>();
const emit = defineEmits<{(event: 'update:items', value: TaskStatusOption[]): void;
}>();

const isFolded = ref(false);

// `localItems` acts as a proxy for `props.items`, allowing temporary local updates
// while waiting for asynchronous changes to reflect in the parent.
const localItems = ref<TaskStatusOption[]>(props.items);
// `draggableItems` syncs `localItems` with the parent via an `update:items` event,
// ensuring local changes are reflected in both states.
const draggableItems = computed<TaskStatusOption[]>({
    get() {
        return localItems.value;
    },
    set(value: TaskStatusOption[]) {
        localItems.value = value;
        emit('update:items', value);
    },
});

watch(() => props.items, (newItems) => {
    localItems.value = newItems;
});

</script>

<template>
    <div>
        <div class="pt-2 pb-1">
            <task-status-list-fold-button :is-folded.sync="isFolded">
                {{ props.header }}
            </task-status-list-fold-button>
        </div>
        <div v-show="!isFolded">
            <draggable v-model="draggableItems"
                       tag="ol"
                       draggable=".task-status-draggable-item"
                       ghost-class="ghost"
                       handle=".drag-handle"
            >
                <task-status-draggable-item v-for="(item, index) in draggableItems"
                                            :id="item.status_id"
                                            :key="item.status_id"
                                            :index="index"
                                            :name="item.name"
                                            :color="item.color"
                                            :type="props.type"
                                            :is-default="item.is_default"
                />
            </draggable>
        </div>
    </div>
</template>
