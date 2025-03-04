<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';
import { PButtonModal, PIconButton } from '@cloudforet/mirinae';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedTasks from '@/services/ops-flow/components/AssociatedTasks.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskTypeStore = useTaskTypeStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const deletable = computed(() => !tasks.value?.length);
const headerTitle = computed(() => {
    if (isLoading.value) return ' ';
    return deletable.value
        ? _i18n.t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
            object: taskManagementTemplateStore.templates.TaskType,
            particle: getParticle(taskManagementTemplateStore.templates.TaskType, 'object'),
        })
        : _i18n.t('OPSFLOW.DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
});
const isDeleting = ref<boolean>(false);

/* load associated tasks */
const { taskListQueryKey, taskAPI } = useTaskApi();
const {
    data: tasks, isLoading, isError, refetch,
} = useQuery<TaskModel[], APIError, TaskModel[], [QueryKey, Parameters<typeof taskAPI.list>[0]]>({
    queryKey: computed(() => [
        taskListQueryKey.value,
        { task_type_id: taskCategoryPageState.targetTaskTypeId },
    ]),
    queryFn: async ({ queryKey }) => {
        const [, params] = queryKey;
        const { results } = await taskAPI.list(params);
        return results ?? [];
    },
    enabled: computed(() => !!taskCategoryPageState.visibleTaskTypeDeleteModal && !!taskCategoryPageState.targetTaskTypeId),
    // time control
    gcTime: 1000 * 60 * 2, // 2 minutes
    staleTime: 1000 * 30, // 30 seconds
});
watch(isError, (error) => {
    if (error) {
        ErrorHandler.handleError(error);
    }
});


/* events */
const handleConfirm = async () => {
    try {
        isDeleting.value = true;
        if (!taskCategoryPageState.targetTaskTypeId) {
            throw new Error('[Console Error] Cannot delete task type without a target task type');
        }
        await taskTypeStore.delete(taskCategoryPageState.targetTaskTypeId, taskCategoryPageStore.getters.targetTaskType?.category_id);
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
    } finally {
        taskCategoryPageStore.closeDeleteTaskTypeModal();
        isDeleting.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskCategoryPageStore.closeDeleteTaskTypeModal();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetTaskTypeId();
};
const handleRefresh = () => {
    refetch();
};
</script>

<template>
    <p-button-modal :visible="taskCategoryPageState.visibleTaskTypeDeleteModal"
                    theme-color="alert"
                    :header-title="headerTitle"
                    :size="deletable ? 'sm' : 'md'"
                    :loading="isDeleting"
                    :loading-backdrop="isLoading"
                    :disabled="!deletable"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <div v-if="!deletable">
                <div class="mb-4 flex items-end justify-between">
                    <p class="text-paragraph-lg font-bold">
                        {{ $t('OPSFLOW.TASK_MANAGEMENT.TASK_TYPE.DELETE_UNAVAILABLE', {
                            taskType: taskManagementTemplateStore.templates.TaskType,
                            tasks: taskManagementTemplateStore.templates.tasks,
                            particle: getParticle(taskManagementTemplateStore.templates.tasks, 'subject')
                        }) }}
                    </p>
                    <p-icon-button name="ic_refresh"
                                   @click="handleRefresh"
                    />
                </div>
                <associated-tasks :tasks="tasks ?? []" />
            </div>
        </template>
    </p-button-modal>
</template>
