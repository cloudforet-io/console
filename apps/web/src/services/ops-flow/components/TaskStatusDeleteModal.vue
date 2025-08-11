<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskStatusBadge from '@/services/ops-flow/components/TaskStatusBadge.vue';
import { useCategoryStatusOptions } from '@/services/ops-flow/composables/use-category-status-options';
import { useDefaultStatusOption } from '@/services/ops-flow/composables/use-default-status-option';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* status option */
const categoryId = computed(() => taskCategoryPageState.currentCategoryId);
const targetStatusType = computed(() => taskCategoryPageState.targetStatus?.type);
const targetStatusId = computed(() => taskCategoryPageState.targetStatus?.statusId);
const { categoryStatusOptions } = useCategoryStatusOptions({ categoryId });
const { defaultStatusOption } = useDefaultStatusOption({ categoryStatusOptions, targetStatusType });

/* delete status option */
const { taskCategoryAPI } = useTaskCategoryApi();
const { key: taskCategoryListQueryKey } = useServiceQueryKey('opsflow', 'task-category', 'list');
const { withSuffix: taskCategoryWithSuffix } = useServiceQueryKey('opsflow', 'task-category', 'get');
const queryClient = useQueryClient();
const { mutateAsync: deleteStatusOption, isPending: isDeleting } = useMutation({
    mutationFn: () => {
        if (!categoryId.value) throw new Error('Category ID is required');
        if (!targetStatusType.value || !targetStatusId.value) throw new Error('Target status type and ID are required');
        if (!categoryStatusOptions.value) throw new Error('Category status options are required');
        const newStatusOptions = cloneDeep(categoryStatusOptions.value);
        const idx = newStatusOptions[targetStatusType.value].findIndex((p) => p.status_id === targetStatusId.value);
        if (idx === -1) throw new Error('Status not found');
        newStatusOptions[targetStatusType.value].splice(idx, 1);

        return taskCategoryAPI.update({
            category_id: categoryId.value,
            status_options: newStatusOptions,
            force: true,
        });
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
        queryClient.invalidateQueries({ queryKey: taskCategoryWithSuffix(data.category_id) });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }), '');
        taskCategoryPageStore.closeDeleteStatusModal();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }), true);
    },
});

/* modal event handlers */
const handleConfirm = () => {
    deleteStatusOption();
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
                    :header-title="$t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                        object: $t('OPSFLOW.STATUS'),
                        particle: getParticle(String($t('OPSFLOW.STATUS')), 'object'),
                    })"
                    size="md"
                    :loading="isDeleting"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <div class="mb-4 flex items-end justify-between">
                <i18n path="OPSFLOW.TASK_MANAGEMENT.STATUS.DELETE_CONTINUE"
                      tag="p"
                      class="text-paragraph-lg font-bold"
                >
                    <!-- CAUTION: Do not remove the following comments. They are used to prevent auto-formatting of the template. -->
                    <!-- In this case, template tags must be in a single line to prevent inserting unnecessary spaces. -->
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <template #task>{{ taskManagementTemplateStore.templates.task }}</template>
                    <template #default>
                        <task-status-badge v-if="defaultStatusOption"
                                           class="mx-1 font-normal"
                                           :name="defaultStatusOption.name"
                                           :color="defaultStatusOption.color"
                        /><template v-else>
                            {{ $t('OPSFLOW.DEFAULT') }}
                        </template>
                    </template>
                </i18n>
            </div>
        </template>
    </p-button-modal>
</template>
