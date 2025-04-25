<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useCommentApi } from '@/api-clients/opsflow/comment/composables/use-comment-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { getParticle, i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskEventsQuery } from '@/services/ops-flow/composables/use-task-events-query';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';


const taskDetailPageStore = useTaskDetailPageStore();

/* events */
const { refetch: refetchEvents } = useTaskEventsQuery({
    taskId: computed(() => taskDetailPageStore.state.targetTaskId),
    fetchOnCreation: false,
});

/* delete comment */
const queryClient = useQueryClient();
const { commentAPI } = useCommentApi();
const { withSuffix: withCommentListQueryKeySuffix } = useServiceQueryKey('opsflow', 'comment', 'list');

const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: ({ commentId }: {commentId: string; taskId: string}) => commentAPI.delete({ comment_id: commentId }),
    onSuccess: (data, { taskId }) => {
        queryClient.invalidateQueries({
            queryKey: withCommentListQueryKeySuffix(taskId),
        });
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }) as string, '');
        refetchEvents();
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('OPSFLOW.ERR_S_DELETE_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }));
    },
    onSettled: () => {
        taskDetailPageStore.closeCommentDeleteModal();
    },
});

/* modal event handlers */
const handleConfirm = async () => {
    if (!taskDetailPageStore.state.targetCommentId) {
        ErrorHandler.handleRequestError(new Error('targetCommentId is not defined'), 'Error occurred before deleting comment', true);
        return;
    }
    if (!taskDetailPageStore.state.targetTaskId) {
        ErrorHandler.handleRequestError(new Error('targetTaskId is not defined'), 'Error occurred before deleting comment', true);
        return;
    }

    await deleteComment({ commentId: taskDetailPageStore.state.targetCommentId, taskId: taskDetailPageStore.state.targetTaskId });
    await refetchEvents();
};
</script>

<template>
    <delete-modal :header-title="String($t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                      object: $t('OPSFLOW.TASK_BOARD.COMMENT'),
                      particle:getParticle(String($t('OPSFLOW.TASK_BOARD.COMMENT')),'object') }))"
                  :visible="taskDetailPageStore.state.visibleCommentDeleteModal"
                  :loading="isDeleting"
                  @close="taskDetailPageStore.closeCommentDeleteModal()"
                  @cancel="taskDetailPageStore.closeCommentDeleteModal()"
                  @confirm="handleConfirm"
    />
</template>
