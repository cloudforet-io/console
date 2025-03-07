<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { useCommentApi } from '@/api-clients/opsflow/comment/composables/use-comment-api';
import { getParticle, i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const taskDetailPageStore = useTaskDetailPageStore();

/* delete comment */
const queryClient = useQueryClient();
const { commentAPI, commentListQueryKey } = useCommentApi();
const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: commentAPI.delete,
    onSuccess: () => {
        if (taskDetailPageStore.state.task) {
            queryClient.invalidateQueries({
                queryKey: [commentListQueryKey.value, taskDetailPageStore.state.task.task_id],
            });
        }
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }) as string, '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('OPSFLOW.ERR_S_DELETE_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }));
    },
});

/* modal event handlers */
const handleConfirm = async () => {
    try {
        if (!taskDetailPageStore.state.targetComment) throw new Error('targetComment is not defined');

        await deleteComment({ comment_id: taskDetailPageStore.state.targetComment.comment_id });
        await taskDetailPageStore.loadNewEvents();
    } finally {
        taskDetailPageStore.closeCommentDeleteModal();
    }
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
