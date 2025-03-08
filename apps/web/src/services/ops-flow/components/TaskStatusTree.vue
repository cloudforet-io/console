<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import type { TaskStatusOption, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskStatusList from '@/services/ops-flow/components/TaskStatusList.vue';
import { TASK_STATUS_LABELS } from '@/services/ops-flow/constants/task-status-label-constant';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

import { useCategoryStatusOptions } from '../composables/use-category-status-options';

const taskCategoryPageStore = useTaskCategoryPageStore();

const taskStatusTree = computed<{
    key: TaskStatusType,
    name: string,
}[]>(() => [
    { key: 'TODO', name: TASK_STATUS_LABELS.TODO },
    { key: 'IN_PROGRESS', name: TASK_STATUS_LABELS.IN_PROGRESS },
    { key: 'COMPLETED', name: TASK_STATUS_LABELS.COMPLETED },
]);

/* cateogry status options */
const categoryId = computed(() => taskCategoryPageStore.state.currentCategoryId);
const { categoryStatusOptions } = useCategoryStatusOptions({ categoryId });

/* update status options */
const { taskCategoryAPI, taskCategoryListQueryKey, taskCategoryQueryKey } = useTaskCategoryApi();
const queryClient = useQueryClient();
const { mutate } = useMutation({
    mutationFn: ({ statusType, items }: {statusType: TaskStatusType; items: TaskStatusOption[]}) => {
        if (!categoryId.value) throw new Error('Category ID is required');
        if (!categoryStatusOptions.value) throw new Error('Category status options are NOT loaded yet');
        return taskCategoryAPI.update({
            category_id: categoryId.value,
            status_options: {
                ...categoryStatusOptions.value,
                [statusType]: items,
            },
            force: true,
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
        queryClient.invalidateQueries({ queryKey: taskCategoryQueryKey.value });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: i18n.t('OPSFLOW.STATUS') }), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: i18n.t('OPSFLOW.STATUS') }));
    },
});

const handleUpdateItems = async (statusType: TaskStatusType, items: TaskStatusOption[]) => {
    mutate({ statusType, items });
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
