<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { PButtonModal, PIconButton } from '@cloudforet/mirinae';

import { i18n as _i18n } from '@/translations';

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

const deletable = computed(() => !taskCategoryPageStore.getters.associatedTasksToType.length);
const headerTitle = computed(() => {
    if (taskCategoryPageState.loadingAssociatedTasksToType) {
        return ' ';
    }
    return deletable.value
        ? _i18n.t('OPSFLOW.TASK_MANAGEMENT.TASK_TYPE_DELETE.CHECK_TITLE', { taskType: taskManagementTemplateStore.templates.taskType })
        : _i18n.t('OPSFLOW.TASK_MANAGEMENT.TASK_TYPE_DELETE.TITLE', { taskType: taskManagementTemplateStore.templates.taskType });
});
const loading = ref<boolean>(false);
const handleConfirm = async () => {
    try {
        loading.value = true;
        if (!taskCategoryPageState.targetTaskTypeId) {
            throw new Error('[Console Error] Cannot delete task type without a target task type');
        }
        await taskTypeStore.delete(taskCategoryPageState.targetTaskTypeId, taskCategoryPageStore.getters.targetTaskType?.category_id);
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to delete task type');
    } finally {
        taskCategoryPageStore.closeDeleteTaskTypeModal();
        loading.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskCategoryPageStore.closeDeleteTaskTypeModal();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetTaskTypeId();
};
const handleRefresh = () => {
    if (!taskCategoryPageState.targetTaskTypeId) {
        ErrorHandler.handleError(new Error('[Console Error] Cannot delete task type without a target task type'));
        return;
    }
    taskCategoryPageStore.loadAssociatedTasksToType(taskCategoryPageState.targetTaskTypeId, true);
};

watch(() => taskCategoryPageState.visibleTaskTypeDeleteModal, (visible) => {
    if (visible) {
        if (!taskCategoryPageState.targetTaskTypeId) {
            ErrorHandler.handleError(new Error('[Console Error] Cannot delete task type without a target task type'));
            return;
        }
        taskCategoryPageStore.loadAssociatedTasksToType(taskCategoryPageState.targetTaskTypeId);
    }
});
</script>

<template>
    <p-button-modal :visible="taskCategoryPageState.visibleTaskTypeDeleteModal"
                    theme-color="alert"
                    :header-title="headerTitle"
                    :size="deletable ? 'sm' : 'md'"
                    :loading="loading"
                    :loading-backdrop="taskCategoryPageState.loadingAssociatedTasksToType"
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
                        {{ $t('OPSFLOW.TASK_MANAGEMENT.TASK_TYPE_DELETE.DELETE_UNAVAILABLE', { taskType: taskManagementTemplateStore.templates.taskType }) }}
                    </p>
                    <p-icon-button name="ic_refresh"
                                   @click="handleRefresh"
                    />
                </div>
                <associated-tasks :tasks="taskCategoryPageStore.getters.associatedTasksToType" />
            </div>
        </template>
    </p-button-modal>
</template>
