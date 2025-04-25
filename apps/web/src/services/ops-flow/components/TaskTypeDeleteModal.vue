<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PIconButton } from '@cloudforet/mirinae';

import { useTaskTypeApi } from '@/api-clients/opsflow/task-type/composables/use-task-type-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedTasks from '@/services/ops-flow/components/AssociatedTasks.vue';
import { useAssociatedTasksQuery } from '@/services/ops-flow/composables/use-associated-tasks-query';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* load associated tasks */
const {
    tasks, isLoading, refetch,
} = useAssociatedTasksQuery({
    params: computed(() => ({ task_type_id: taskCategoryPageState.targetTaskTypeId })),
    enabled: computed(() => !!taskCategoryPageState.visibleTaskTypeDeleteModal && !!taskCategoryPageState.targetTaskTypeId),
});

/* UI states */
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

/* delete task type */
const { taskTypeAPI } = useTaskTypeApi();
const { key: taskTypeListQueryKey } = useServiceQueryKey('opsflow', 'task-type', 'list');
const queryClient = useQueryClient();
const { mutateAsync: deleteTaskType, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
        if (!taskCategoryPageState.targetTaskTypeId) {
            throw new Error('[Console Error] Cannot delete task type without a target task type');
        }
        await taskTypeAPI.delete({
            task_type_id: taskCategoryPageState.targetTaskTypeId,
        });
    },
    onSuccess: () => {
        // invalidate task type list query
        queryClient.invalidateQueries({ queryKey: taskTypeListQueryKey.value });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
    },
    onSettled: () => {
        taskCategoryPageStore.closeDeleteTaskTypeModal();
    },
});

/* event handlers */
const handleConfirm = () => {
    deleteTaskType();
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
