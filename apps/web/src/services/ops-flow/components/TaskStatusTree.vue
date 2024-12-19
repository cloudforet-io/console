<script setup lang="ts">
import { computed } from 'vue';

import type { TaskStatusOption, TaskStatusType } from '@/schema/opsflow/task/type';
import { i18n } from '@/translations';

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
    { key: 'IN_PROGRESS', name: 'In Progress' },
    { key: 'COMPLETED', name: 'Completed' },
]);

const handleUpdateItems = async (statusType: TaskStatusType, items: TaskStatusOption[]) => {
    try {
        if (!taskCategoryPageStore.state.currentCategoryId) {
            throw new Error('Category ID is required');
        }
        await taskCategoryStore.update({
            category_id: taskCategoryPageStore.state.currentCategoryId,
            status_options: {
                ...taskCategoryPageStore.getters.statusOptions,
                [statusType]: items,
            },
            force: true,
        });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: i18n.t('OPSFLOW.STATUS') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.STATUS') }));
    }
};
</script>

<template>
    <div>
        <template v-for="taskStatus in taskStatusTree">
            <task-status-list :key="taskStatus.key"
                              :type="taskStatus.key"
                              :header="taskStatus.name"
                              :items="taskCategoryPageStore.getters.statusOptions[taskStatus.key]"
                              @update:items="handleUpdateItems(taskStatus.key, $event)"
            />
        </template>
    </div>
</template>
