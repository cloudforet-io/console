<script setup lang="ts">
import { computed } from 'vue';

import type { TaskStatusOption, TaskStatusType } from '@/schema/opsflow/task/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskStatusList from '@/services/ops-flow/components/TaskStatusList.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryStore = useTaskCategoryStore();

const taskStatusTree = computed<{
    key: TaskStatusType,
    name: string,
}[]>(() => [
    { key: 'TODO', name: 'To-do' },
    { key: 'IN_PROGRESS', name: 'In progress' },
    { key: 'COMPLETED', name: 'Completed' },
]);

const handleUpdateItems = async (statusType: TaskStatusType, items: TaskStatusOption[]) => {
    try {
        if (!taskCategoryPageStore.$state.currentCategoryId) {
            throw new Error('Category ID is required');
        }
        await taskCategoryStore.update({
            category_id: taskCategoryPageStore.$state.currentCategoryId,
            status_options: {
                ...taskCategoryPageStore.statusOptions,
                [statusType]: items,
            },
        });
        showSuccessMessage('Task status options updated successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to update task status options');
    }
};
</script>

<template>
    <div>
        <template v-for="taskStatus in taskStatusTree">
            <task-status-list :key="taskStatus.key"
                              :type="taskStatus.key"
                              :header="taskStatus.name"
                              :items="taskCategoryPageStore.statusOptions[taskStatus.key]"
                              @update:items="handleUpdateItems(taskStatus.key, $event)"
            />
        </template>
    </div>
</template>
