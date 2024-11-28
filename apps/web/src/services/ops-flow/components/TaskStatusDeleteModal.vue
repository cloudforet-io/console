<script setup lang="ts">
import { ref } from 'vue';

import { cloneDeep } from 'lodash';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/schema/opsflow/task/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryStore = useTaskCategoryStore();

const deleteStatusOption = async (categoryId: string, allStatusOptions: TaskStatusOptions, targetStatusOption: {
            type: TaskStatusType;
            data: TaskStatusOption;
        }) => {
    try {
        const newStatusOptions = cloneDeep(allStatusOptions);
        const { type, data } = targetStatusOption;
        const idx = newStatusOptions[type].findIndex((p) => p.status_id === data.status_id);
        if (idx === -1) throw new Error('Status not found');
        newStatusOptions[type].splice(idx, 1);

        await taskCategoryStore.update({
            category_id: categoryId,
            status_options: newStatusOptions,
            force: true,
        });
        showSuccessMessage('Task status deleted successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to delete task status');
    }
};
const loading = ref<boolean>(false);
const handleConfirm = async () => {
    try {
        loading.value = true;
        if (!taskCategoryPageStore.state.currentCategoryId) throw new Error('Category ID is required');
        await deleteStatusOption(taskCategoryPageStore.state.currentCategoryId, taskCategoryPageStore.getters.statusOptions, taskCategoryPageStore.getters.targetStatusOption);
        taskCategoryPageStore.closeDeleteStatusModal();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        loading.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskCategoryPageStore.closeDeleteStatusModal();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetStatus();
};
</script>

<template>
    <delete-modal :visible="taskCategoryPageStore.state.visibleStatusDeleteModal"
                  header-title="Are you sure you want to delete this status?"
                  size="sm"
                  :loading="loading"
                  @confirm="handleConfirm"
                  @close="handleCloseOrCancel"
                  @cancel="handleCloseOrCancel"
                  @closed="handleClosed"
    />
</template>
