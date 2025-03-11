<script setup lang="ts">
import { ref } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { TaskDeleteParameters } from '@/api-clients/opsflow/task/schema/api-verbs/delete';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { getParticle, i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const emit = defineEmits<{(event: 'deleted'): void;
}>();
const taskDetailPageStore = useTaskDetailPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const loading = ref<boolean>(false);

let hasDeleted = false;
const deleteTask = async () => {
    try {
        if (!taskDetailPageStore.state.targetTaskId) throw new Error('task is not defined');
        loading.value = true;
        await SpaceConnector.clientV2.opsflow.task.delete<TaskDeleteParameters, TaskModel>({
            task_id: taskDetailPageStore.state.targetTaskId,
        });
        hasDeleted = true;
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.Task }) as string, '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ERR_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.Task }));
    } finally {
        loading.value = false;
        taskDetailPageStore.closeTaskDeleteModal();
    }
};

const handleConfirm = async () => {
    await deleteTask();
};
const handleClosed = () => {
    if (hasDeleted) {
        emit('deleted');
    }
    hasDeleted = false;
};
</script>

<template>
    <delete-modal :header-title="$t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                      object: taskManagementTemplateStore.templates.task,
                      particle: getParticle(taskManagementTemplateStore.templates.task,'object') })"
                  :visible="taskDetailPageStore.state.visibleTaskDeleteModal"
                  :loading="loading"
                  @close="taskDetailPageStore.closeTaskDeleteModal()"
                  @cancel="taskDetailPageStore.closeTaskDeleteModal()"
                  @closed="handleClosed"
                  @confirm="handleConfirm"
    />
</template>
