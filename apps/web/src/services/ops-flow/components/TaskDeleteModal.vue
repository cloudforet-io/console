<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useTaskApi } from '@/api-clients/opsflow/task/composables/use-task-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { getParticle, i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskQuery } from '@/services/ops-flow/composables/use-task-query';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const emit = defineEmits<{(event: 'deleted'): void;
}>();
const taskDetailPageStore = useTaskDetailPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const { taskAPI } = useTaskApi();
const { key: taskListQueryKey } = useServiceQueryKey('opsflow', 'task', 'list');
const queryClient = useQueryClient();
const { mutate: deleteTask, isSuccess: hasDeleted, isPending } = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) => taskAPI.delete({ task_id: taskId }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskListQueryKey.value });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.Task }) as string, '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ERR_S_DELETE_TARGET', { target: taskManagementTemplateStore.templates.Task }));
    },
    onSettled: () => {
        taskDetailPageStore.closeTaskDeleteModal();
    },
});
const { removeQuery: removeTaskQuery } = useTaskQuery({
    taskId: computed(() => taskDetailPageStore.state.targetTaskId),
    enabled: computed(() => taskDetailPageStore.state.visibleTaskDeleteModal),
});

const handleConfirm = () => {
    if (!taskDetailPageStore.state.targetTaskId) {
        ErrorHandler.handleRequestError(new Error('targetTaskId is not defined'), 'Error occurred before deleting task', true);
        return;
    }
    deleteTask({ taskId: taskDetailPageStore.state.targetTaskId });
};
const handleClosed = () => {
    if (hasDeleted.value) {
        emit('deleted');
        removeTaskQuery();
    }
};
</script>

<template>
    <delete-modal :header-title="$t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                      object: taskManagementTemplateStore.templates.task,
                      particle: getParticle(taskManagementTemplateStore.templates.task,'object') })"
                  :visible="taskDetailPageStore.state.visibleTaskDeleteModal"
                  :loading="isPending"
                  @close="taskDetailPageStore.closeTaskDeleteModal()"
                  @cancel="taskDetailPageStore.closeTaskDeleteModal()"
                  @closed="handleClosed"
                  @confirm="handleConfirm"
    />
</template>
