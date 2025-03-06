<script setup lang="ts">
import { ref, computed } from 'vue';

import { cloneDeep } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryStore = useTaskCategoryStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const loading = ref<boolean>(false);
const name = computed(() => taskCategoryPageStore.getters.targetStatusOption?.data?.name ?? '');

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
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }));
    }
};
const handleConfirm = async () => {
    loading.value = true;
    try {
        if (!taskCategoryPageStore.state.currentCategoryId) {
            throw new Error('Category ID is required');
        }
        if (!taskCategoryPageStore.getters.targetStatusOption) {
            throw new Error('[Console Error] Cannot set default status without a target status');
        }
        await setAsDefaultStatus(taskCategoryPageStore.state.currentCategoryId, taskCategoryPageStore.getters.statusOptions, taskCategoryPageStore.getters.targetStatusOption);
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
    <p-button-modal :visible="taskCategoryPageStore.state.visibleSetDefaultStatusModal"
                    size="sm"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #header-title>
            <i18n path="OPSFLOW.TASK_MANAGEMENT.STATUS.SET_AS_DEFAULT">
                Set <template #status>
                    <strong>{{ name }}</strong>
                </template> as the default status.
            </i18n>
        </template>
        <template #body>
            {{ $t('OPSFLOW.TASK_MANAGEMENT.STATUS.SET_DEFAULT_DESC', {tasks: taskManagementTemplateStore.templates.tasks}) }}
        </template>
    </p-button-modal>
</template>
