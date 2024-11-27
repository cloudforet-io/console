<script setup lang="ts">
import { ref } from 'vue';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const loading = ref<boolean>(false);
const handleConfirm = async () => {
    loading.value = true;
    // await taskCategoryPageStore.deleteStatus();
    taskCategoryPageStore.closeDeleteStatusModal();
    loading.value = false;
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
