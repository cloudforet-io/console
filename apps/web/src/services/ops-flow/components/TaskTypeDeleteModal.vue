<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedTasks from '@/services/ops-flow/components/AssociatedTasks.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskTypeStore = useTaskTypeStore();

const deletable = computed(() => !taskCategoryPageStore.getters.associatedTasksToType.length);
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
    <p-button-modal :visible="taskCategoryPageStore.state.visibleTaskTypeDeleteModal"
                    theme-color="alert"
                    :header-title="deletable ? 'Are you sure you want to delete this task type?' : 'Delete Task Type'"
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
                하위 태스크가 존재하므로 태스크 타입 삭제가 불가합니다.
            </p>
        </template>
        <associated-tasks v-if="!!deletable"
                          :tasks="taskCategoryPageStore.getters.associatedTasksToType"
        />
    </p-button-modal>
</template>
