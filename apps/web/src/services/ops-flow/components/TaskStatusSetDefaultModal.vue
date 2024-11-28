<script setup lang="ts">
import { ref, computed } from 'vue';

import { cloneDeep } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/schema/opsflow/task/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryStore = useTaskCategoryStore();

const loading = ref<boolean>(false);
const name = computed(() => taskCategoryPageStore.targetStatusOption?.data?.name ?? '');

const setAsDefaultStatus = async (categoryId: string, allStatusOptions: TaskStatusOptions, targetStatusOption: {
            type: TaskStatusType;
            data: TaskStatusOption;
        }) => {
    try {
        const newStatusOptions = cloneDeep(allStatusOptions);
        const { type, data } = targetStatusOption;
        const prevDefault = newStatusOptions[type].find((p) => p.is_default);
        if (prevDefault) prevDefault.is_default = false;
        const newDefault = newStatusOptions[type].find((p) => p.status_id === data.status_id);
        if (!newDefault) throw new Error('Status not found');
        newDefault.is_default = true;

        await taskCategoryStore.update({
            category_id: categoryId,
            status_options: newStatusOptions,
            force: true,
        });
        showSuccessMessage('Task status set as default successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to set task status as default');
    }
};
const handleConfirm = async () => {
    loading.value = true;
    try {
        if (!taskCategoryPageStore.targetStatusOption) {
            throw new Error('[Console Error] Cannot set default status without a target status');
        }
        await setAsDefaultStatus(taskCategoryPageStore.$state.currentCategoryId, taskCategoryPageStore.statusOptions, taskCategoryPageStore.targetStatusOption);
        taskCategoryPageStore.closeSetDefaultStatusModal();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        loading.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskCategoryPageStore.closeSetDefaultStatusModal();
};
const handleClosed = () => {
    taskCategoryPageStore.resetTargetStatus();
};
</script>

<template>
    <p-button-modal :visible="taskCategoryPageStore.$state.visibleSetDefaultStatusModal"
                    size="sm"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #header-title>
            Set <strong>{{ name }}</strong> as the default status.
        </template>
        <template #body>
            This will make it the primary status for related operations.
        </template>
    </p-button-modal>
</template>
