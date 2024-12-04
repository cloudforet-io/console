<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae/';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedTasks from '@/services/ops-flow/components/AssociatedTasks.vue';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const taskCategoryStore = useTaskCategoryStore();


const deletable = computed(() => !taskManagementPageStore.getters.associatedTasksToCategory.length);
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
    <p-button-modal :visible="taskManagementPageStore.state.visibleDeleteCategoryModal"
                    theme-color="alert"
                    :header-title="deletable ? 'Are you sure you want to delete this category?' : 'Delete Category'"
                    :size="deletable ? 'sm' : 'md'"
                    :loading="loading"
                    :disabled="!deletable"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <p v-if="!deletable"
               class="text-paragraph-lg font-bold mb-4"
            >
                하위 태스크가 존재하므로 카테고리 삭제가 불가합니다.
            </p>
        </template>
        <associated-tasks v-if="!!taskManagementPageStore.getters.associatedTasksToCategory.length" />
    </p-button-modal>
</template>
