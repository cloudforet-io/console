<script setup lang="ts">
import { computed } from 'vue';

import type { TaskStatusOption, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskStatusList from '@/services/ops-flow/components/TaskStatusList.vue';
import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryStore = useTaskCategoryStore();

const taskStatusTree = computed<{
    key: TaskStatusType,
    name: string,
}[]>(() => [
    { key: 'TODO', name: TASK_STATUS_LABELS.TODO },
    { key: 'IN_PROGRESS', name: TASK_STATUS_LABELS.IN_PROGRESS },
    { key: 'COMPLETED', name: TASK_STATUS_LABELS.COMPLETED },
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
