<script setup lang="ts">
import { ref, computed } from 'vue';

import { cloneDeep } from 'lodash';

import { PButtonModal } from '@cloudforet/mirinae';

import type { TaskStatusOption, TaskStatusOptions, TaskStatusType } from '@/schema/opsflow/task/type';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import TaskStatusBadge from '@/services/ops-flow/components/TaskStatusBadge.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskCategoryPageState = taskCategoryPageStore.state;
const taskCategoryPageGetters = taskCategoryPageStore.getters;
const taskCategoryStore = useTaskCategoryStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

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
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: _i18n.t('OPSFLOW.STATUS') }));
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
                    :header-title="$t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                        object: $t('OPSFLOW.STATUS'),
                        particle: getParticle($t('OPSFLOW.STATUS'), 'object'),
                    })"
                    size="md"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <div class="mb-4 flex items-end justify-between">
                <i18n path="OPSFLOW.TASK_MANAGEMENT.STATUS.DELETE_CONTINUE"
                      tag="p"
                      class="flex items-center text-paragraph-lg font-bold"
                >
                    <!-- CAUTION: Do not remove the following comments. They are used to prevent auto-formatting of the template. -->
                    <!-- In this case, template tags must be in a single line to prevent inserting unnecessary spaces. -->
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <template #task>{{ taskManagementTemplateStore.templates.task }}</template>
                    <template #default>
                        <task-status-badge v-if="defaultStatus"
                                           class="mx-1 font-normal"
                                           :name="defaultStatus.name"
                                           :color="defaultStatus.color"
                        /><template v-else>
                            $t{('OPSFLOW.DEFAULT')}
                        </template>
                    </template>
                </i18n>
            </div>
        </template>
    </p-button-modal>
</template>
