<script setup lang="ts">
import { ref } from 'vue';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskTypeStore = useTaskTypeStore();

const loading = ref<boolean>(false);
const handleConfirm = async () => {
    try {
        loading.value = true;
        if (!taskCategoryPageStore.state.targetTaskTypeId) {
            throw new Error('[Console Error] Cannot delete task type without a target task type');
        }
        await taskTypeStore.delete(taskCategoryPageStore.state.targetTaskTypeId, taskCategoryPageStore.getters.targetTaskType?.category_id);
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
</script>

<template>
    <delete-modal :visible="taskCategoryPageStore.state.visibleTaskTypeDeleteModal"
                  header-title="Are you sure you want to delete this task type?"
                  size="sm"
                  :loading="loading"
                  @confirm="handleConfirm"
                  @close="handleCloseOrCancel"
                  @cancel="handleCloseOrCancel"
                  @closed="handleClosed"
    />
</template>
