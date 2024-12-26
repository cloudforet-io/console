<script setup lang="ts">
import { ref } from 'vue';

import { getParticle, i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import { useTaskStore } from '@/services/ops-flow/stores/task-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const emit = defineEmits<{(event: 'deleted'): void;
}>();
const taskDetailPageStore = useTaskDetailPageStore();
const taskStore = useTaskStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const loading = ref<boolean>(false);

let hasDeleted = false;
const deleteTask = async () => {
    try {
        if (!taskDetailPageStore.state.task) throw new Error('task is not defined');
        loading.value = true;
        await taskStore.delete(taskDetailPageStore.state.task.task_id);
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
