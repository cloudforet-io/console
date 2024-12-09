<script setup lang="ts">
import { ref } from 'vue';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';

const emit = defineEmits<{(event: 'deleted'): void;
}>();
const taskDetailPageStore = useTaskDetailPageStore();
const taskStore = useTaskStore();
const loading = ref<boolean>(false);

const deleteTask = async () => {
    try {
        if (!taskDetailPageStore.state.taskId) throw new Error('taskId is not defined');
        loading.value = true;
        await taskStore.delete(taskDetailPageStore.state.taskId);
        showSuccessMessage('Comment deleted successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to delete comment');
    } finally {
        loading.value = false;
        taskDetailPageStore.closeTaskDeleteModal();
    }
};
let hasDeleted = false;
const handleConfirm = async () => {
    await deleteTask();
    hasDeleted = true;
};
const handleClosed = () => {
    if (hasDeleted) {
        emit('deleted');
    }
    hasDeleted = false;
};
</script>

<template>
    <delete-modal header-title="Are you sure you want to delete this task?"
                  :visible="taskDetailPageStore.state.visibleTaskDeleteModal"
                  :loading="loading"
                  @close="taskDetailPageStore.closeTaskDeleteModal()"
                  @cancel="taskDetailPageStore.closeTaskDeleteModal()"
                  @closed="handleClosed"
                  @confirm="handleConfirm"
    />
</template>
