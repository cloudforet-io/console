<script setup lang="ts">
import { ref } from 'vue';

import { getParticle, i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCommentStore } from '@/services/ops-flow/stores/comment-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const taskDetailPageStore = useTaskDetailPageStore();
const commentStore = useCommentStore();
const loading = ref<boolean>(false);

const deleteComment = async () => {
    try {
        if (!taskDetailPageStore.state.targetComment) throw new Error('targetComment is not defined');
        loading.value = true;
        await commentStore.delete(taskDetailPageStore.state.targetComment.comment_id);
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }) as string, '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ERR_S_DELETE_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }));
    } finally {
        loading.value = false;
        taskDetailPageStore.closeCommentDeleteModal();
    }
};
const handleConfirm = async () => {
    await deleteComment();
    await taskDetailPageStore.loadNewEvents();
};
</script>

<template>
    <delete-modal :header-title="$t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
                      object: $t('OPSFLOW.TASK_BOARD.COMMENT'),
                      particle:getParticle($t('OPSFLOW.TASK_BOARD.COMMENT'),'object') })"
                  :visible="taskDetailPageStore.state.visibleCommentDeleteModal"
                  :loading="loading"
                  @close="taskDetailPageStore.closeCommentDeleteModal()"
                  @cancel="taskDetailPageStore.closeCommentDeleteModal()"
                  @confirm="handleConfirm"
    />
</template>
