<script setup lang="ts">
import { ref } from 'vue';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskCategoryStore = taskManagementPageStore.taskCategoryStore;

const loading = ref<boolean>(false);
const handleConfirm = async () => {
    try {
        loading.value = true;
        if (!taskManagementPageStore.state.targetCategoryId) {
            throw new Error('[Console Error] Cannot delete category without a target category');
        }
        await taskCategoryStore.delete(taskManagementPageStore.state.targetCategoryId);
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
</script>

<template>
    <delete-modal :visible="taskManagementPageStore.state.visibleDeleteCategoryModal"
                  header-title="Are you sure you want to delete this category?"
                  size="sm"
                  :loading="loading"
                  @confirm="handleConfirm"
                  @close="handleCloseOrCancel"
                  @cancel="handleCloseOrCancel"
                  @closed="handleClosed"
    />
</template>
