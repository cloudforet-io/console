<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { PButtonModal, PIconButton } from '@cloudforet/mirinae';

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

const deletable = computed(() => !taskCategoryPageStore.getters.associatedTasksToType.length);
const headerTitle = computed(() => {
    if (taskCategoryPageState.loadingAssociatedTasksToType) {
        return ' ';
    }
    return deletable.value
        ? _i18n.t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
            object: taskManagementTemplateStore.templates.TaskType,
            particle: getParticle(taskManagementTemplateStore.templates.TaskType, 'object'),
        })
        : _i18n.t('OPSFLOW.DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType });
});
const loading = ref<boolean>(false);
const handleConfirm = async () => {
    try {
        loading.value = true;
        if (!taskCategoryPageState.targetTaskTypeId) {
            throw new Error('[Console Error] Cannot delete task type without a target task type');
        }
        await taskTypeStore.delete(taskCategoryPageState.targetTaskTypeId, taskCategoryPageStore.getters.targetTaskType?.category_id);
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: taskManagementTemplateStore.templates.TaskType }));
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
                <associated-tasks :tasks="taskCategoryPageStore.getters.associatedTasksToType" />
            </div>
        </template>
    </p-button-modal>
</template>
