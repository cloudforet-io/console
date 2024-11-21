<script setup lang="ts">
import { PI, PBadge } from '@cloudforet/mirinae';

import type { TaskStatusType } from '@/schema/opsflow/task/type';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const props = defineProps<{
    index: number;
    id: string;
    name: string;
    color: string;
    type: TaskStatusType;
}>();

const taskCategoryPageStore = useTaskCategoryPageStore();

const handleEdit = () => {
    taskCategoryPageStore.openEditStatusForm(props.index, props.type);
};
const handleDelete = () => {
    taskCategoryPageStore.openDeleteStatusModal(props.index, props.type);
};
</script>

<template>
    <li class="task-status-draggable-item">
        <p-i name="ic_drag-handle"
             width="1rem"
             height="1rem"
             class="drag-handle"
        />
        <div class="flex-grow">
            <p-badge class="ml-2"
                     badge-type="subtle"
                     shape="square"
                     :style-type="props.color"
            >
                {{ props.name }}
            </p-badge>
        </div>
        <action-menu-button @edit="handleEdit"
                            @delete="handleDelete"
        />
    </li>
</template>

<style lang="postcss" scoped>
.task-status-draggable-item {
    @apply flex items-center px-2 border border-b-0 border-gray-150;
    height: 2.625rem;
    &:first-of-type {
        @apply rounded-t-lg;
    }
    &:last-of-type {
        @apply rounded-b-lg border-b;
    }
    &.ghost {
        @apply rounded-lg border;
    }
    >.drag-handle {
        cursor: grab;
    }
}
</style>
