<script setup lang="ts">
import { ref, computed } from 'vue';

import { cloneDeep } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/schema/opsflow/task/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskStatusBadge from '@/services/ops-flow/components/TaskStatusBadge.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskCategoryStore = useTaskCategoryStore();

const defaultStatus = computed<TaskStatusOption|undefined>(() => {
    if (!taskCategoryPageGetters.targetStatusOption) {
        ErrorHandler.handleError(new Error('Target status option is required'));
        return undefined;
    }
    const { type } = taskCategoryPageGetters.targetStatusOption;
    const defaultStatusOption = taskCategoryPageGetters.statusOptions[type].find((p) => p.is_default);
    if (!defaultStatusOption) {
        ErrorHandler.handleError(new Error('Default status option is not found'));
        return undefined;
    }
    return defaultStatusOption;
});
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
    <p-button-modal :visible="taskCategoryPageState.visibleStatusDeleteModal"
                    theme-color="alert"
                    header-title="Are you sure you want to delete this status?"
                    size="md"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <div class="mb-4 flex items-end justify-between">
                <p class="flex items-center text-paragraph-lg font-bold">
                    이 상태를 삭제하면 연결된 모든 태스크의 상태가 <task-status-badge v-if="defaultStatus"
                                                                  class="mx-1 font-normal"
                                                                  :name="defaultStatus.name"
                                                                  :color="defaultStatus.color"
                    /><template v-else>
                        디폴트 상태
                    </template>로 일괄 변경됩니다. 계속 하시겠습니까?
                </p>
            </div>
        </template>
    </p-button-modal>
</template>
