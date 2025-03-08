<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import type { TaskStatusType } from '@/api-clients/opsflow/task/schema/type';
import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

import { useCategoryStatusOptions } from '../composables/use-category-status-options';
import { useTargetStatusOption } from '../composables/use-target-status-option';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* category status options */
const currentCategoryId = computed(() => taskCategoryPageStore.state.currentCategoryId);
const { categoryStatusOptions } = useCategoryStatusOptions({ categoryId: currentCategoryId });

/* target status option */
const targetStatusType = computed(() => taskCategoryPageStore.state.targetStatus?.type);
const targetStatusId = computed(() => taskCategoryPageStore.state.targetStatus?.statusId);
const { targetStatusOption } = useTargetStatusOption({ categoryStatusOptions, targetStatusType, targetStatusId });
const name = computed(() => targetStatusOption.value?.name ?? '');

/* set default status */
const { taskCategoryAPI, taskCategoryListQueryKey } = useTaskCategoryApi();
const queryClient = useQueryClient();
const { mutate: setAsDefaultStatus, isPending } = useMutation({
    mutationFn: ({ categoryId, statusType, statusId }: { categoryId: string; statusType: TaskStatusType; statusId: string }) => {
        const newStatusOptions = cloneDeep(categoryStatusOptions.value);
        const prevDefault = newStatusOptions[statusType].find((p) => p.is_default);
        if (prevDefault) prevDefault.is_default = false;
        const newDefault = newStatusOptions[statusType].find((p) => p.status_id === statusId);
        if (!newDefault) throw new Error('Status not found');
        newDefault.is_default = true;

        return taskCategoryAPI.update({
            category_id: categoryId,
            status_options: newStatusOptions,
            force: true,
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_EDIT_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }), '');
        taskCategoryPageStore.closeSetDefaultStatusModal();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_EDIT_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }));
    },
});

/* modal event handlers */
const handleConfirm = () => {
    if (!currentCategoryId.value || !targetStatusType.value || !targetStatusId.value) {
        ErrorHandler.handleError(new Error('[Console Error] Cannot set default status without a target states'));
        return;
    }
    setAsDefaultStatus({
        categoryId: currentCategoryId.value,
        statusType: targetStatusType.value,
        statusId: targetStatusId.value,
    });
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
                    :loading="isPending"
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
