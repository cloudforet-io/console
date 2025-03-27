<script setup lang="ts">
import {
    ref, computed, watch, onBeforeUnmount,
} from 'vue';

import { PButtonModal } from '@cloudforet/mirinae/';

import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedTasks from '@/services/ops-flow/components/AssociatedTasks.vue';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskCategoryStore = useTaskCategoryStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();


const deletable = computed(() => !taskManagementPageStore.getters.associatedTasksToCategory.length);
const headerTitle = computed(() => {
    if (taskManagementPageStore.state.loadingAssociatedTasksToCategory) {
        return ' ';
    }
    return deletable.value
        ? _i18n.t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
            object: _i18n.t('OPSFLOW.CATEGORY'),
            particle: getParticle(_i18n.t('OPSFLOW.CATEGORY') as string, 'object'),
        })
        : _i18n.t('OPSFLOW.DELETE_TARGET', { target: _i18n.t('OPSFLOW.CATEGORY') });
});

const loading = ref<boolean>(false);
const deleteCategory = async (categoryId: string) => {
    try {
        await taskCategoryStore.delete(categoryId);
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: _i18n.t('OPSFLOW.CATEGORY') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: _i18n.t('OPSFLOW.CATEGORY') }));
    }
};
const handleConfirm = async () => {
    try {
        loading.value = true;
        if (!taskManagementPageState.targetCategoryId) {
            throw new Error('[Console Error] Cannot delete category without a target category');
        }
        await deleteCategory(taskManagementPageState.targetCategoryId);
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to delete category');
    } finally {
        taskManagementPageStore.closeDeleteCategoryModal();
        loading.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskManagementPageStore.closeDeleteCategoryModal();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetCategoryId();
};
watch(() => taskManagementPageState.visibleDeleteCategoryModal, (visible) => {
    if (visible) {
        if (!taskManagementPageState.targetCategoryId) {
            ErrorHandler.handleError(new Error('[Console Error] Cannot delete category without a target category'));
            return;
        }
        taskManagementPageStore.loadAssociatedTasksToCategory(taskManagementPageState.targetCategoryId);
    }
});
onBeforeUnmount(() => {
    taskManagementPageStore.flushAssociatedTasksToCategoryMap();
});
</script>

<template>
    <p-button-modal :visible="taskManagementPageState.visibleDeleteCategoryModal"
                    theme-color="alert"
                    :header-title="headerTitle"
                    :size="deletable ? 'sm' : 'md'"
                    :loading="loading"
                    :loading-backdrop="taskManagementPageState.loadingAssociatedTasksToCategory"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <p v-if="!deletable"
               class="text-paragraph-lg font-bold mb-4"
            >
                {{ $t('OPSFLOW.TASK_MANAGEMENT.CATEGORY.DELETE_CONFIRMATION_DESC', {
                    tasks: taskManagementTemplateStore.templates.tasks,
                    particle: getParticle(taskManagementTemplateStore.templates.tasks, 'subject')
                }) }}
            </p>
            <associated-tasks v-if="!deletable"
                              :tasks="taskManagementPageStore.getters.associatedTasksToCategory"
            />
        </template>
    </p-button-modal>
</template>
