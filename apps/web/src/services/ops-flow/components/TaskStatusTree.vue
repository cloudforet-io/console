<script setup lang="ts">
import { computed } from 'vue';

import type { TaskStatusOption, TaskStatusType } from '@/schema/opsflow/task/type';

import TaskStatusList from '@/services/ops-flow/components/TaskStatusList.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskCategoryStore = taskCategoryPageStore.taskCategoryStore;

const taskStatusTree = computed<{
    key: TaskStatusType,
    name: string,
}[]>(() => [
    { key: 'TODO', name: 'To-do' },
    { key: 'IN_PROGRESS', name: 'In progress' },
    { key: 'COMPLETED', name: 'Completed' },
]);

const handleUpdateItems = (statusType: TaskStatusType, items: TaskStatusOption[]) => {
    if (!taskCategoryPageStore.state.currentCategoryId) return;
    taskCategoryStore.update({
        category_id: taskCategoryPageStore.state.currentCategoryId,
        status_options: {
            ...taskCategoryPageGetters.statusOptions,
            [statusType]: items,
        },
    });
};
</script>

<template>
    <div>
        <template v-for="taskStatus in taskStatusTree">
            <task-status-list :key="taskStatus.key"
                              :header="taskStatus.name"
                              :items="taskCategoryPageGetters.statusOptions[taskStatus.key]"
                              @update:items="handleUpdateItems(taskStatus.key, $event)"
            />
        </template>
    </div>
</template>
