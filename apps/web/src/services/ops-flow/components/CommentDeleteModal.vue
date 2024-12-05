<script setup lang="ts">
import { ref } from 'vue';

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
        showSuccessMessage('Comment deleted successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to delete comment');
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
    <delete-modal header-title="Are you sure you want to delete this comment?"
                  :visible="taskDetailPageStore.state.visibleCommentDeleteModal"
                  :disabled="loading"
                  @close="taskDetailPageStore.closeCommentDeleteModal()"
                  @cancel="taskDetailPageStore.closeCommentDeleteModal()"
                  @confirm="handleConfirm"
    />
</template>
