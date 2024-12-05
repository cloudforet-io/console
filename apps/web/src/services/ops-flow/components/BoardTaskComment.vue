<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';

import {
    PPaneLayout, PHeading, PButton, PTextarea, PCollapsibleList, PTextBeautifier,
} from '@cloudforet/mirinae';
import type { CollapsibleItem } from '@cloudforet/mirinae/types/data-display/collapsible/collapsible-list/type';

import type { CommentModel } from '@/schema/opsflow/comment/model';
import { store } from '@/store';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCommentStore } from '@/services/ops-flow/stores/comment-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const props = defineProps<{
    taskId: string;
}>();

const taskDetailPageStore = useTaskDetailPageStore();
const commentStore = useCommentStore();
const userReferenceStore = useUserReferenceStore();
const userId = computed(() => store.state.user.userId);
const getAuthor = (item: CommentModel) => {
    const u = item.created_by;
    return userReferenceStore.getters.userItems[u]?.label ?? u ?? 'Unknown';
};
const getWritePermission = (item: CommentModel) => item.created_by === userId.value;
const comments = computed<CommentModel[]>(() => commentStore.state.itemsByTaskId[props.taskId] ?? []);
const commentItems = computed<CollapsibleItem<CommentModel>[]>(() => comments.value.map((comment) => ({
    title: comment.created_at,
    data: comment,
})));
const comment = ref('');

const addingComment = ref<boolean>(false);
const addComment = async (cmt: string) => {
    try {
        addingComment.value = true;
        await commentStore.create({
            task_id: props.taskId,
            comment: cmt,
        }, true);
        showSuccessMessage('Comment added successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to add comment');
    } finally {
        addingComment.value = false;
    }
};
const addCommentAndApplyToEvents = async (cmt: string) => {
    if (!cmt.trim().length) return;
    await addComment(cmt);
    await taskDetailPageStore.loadNewEvents();
};
const handleClickAddComment = () => {
    addCommentAndApplyToEvents(comment.value);
    comment.value = '';
};
const handleKeyEnter = (e: KeyboardEvent) => {
    if (e.shiftKey) return;
    addCommentAndApplyToEvents(comment.value);
    comment.value = '';
};
onBeforeMount(async () => {
    await commentStore.listByTaskId(props.taskId, {
        query: {
            sort: [{ key: 'created_at', desc: true }],
        },
    });
});
</script>

<template>
    <p-pane-layout class="pt-8 pb-10 px-4">
        <p-heading class="mb-6"
                   heading-type="sub"
                   title="Comment"
        />
        <p-textarea class="mb-3"
                    placeholder="Add Comment"
                    :value="comment"
                    @update:value="comment = $event"
                    @keydown.enter.prevent
                    @keyup.enter="handleKeyEnter"
        />
        <p-button class="mb-6"
                  style-type="tertiary"
                  :loading="addingComment"
                  @click="handleClickAddComment"
        >
            Add Comment
        </p-button>
        <p-collapsible-list :items="commentItems"
                            toggle-position="contents"
                            :line-clamp="2"
        >
            <template #no-styled-title="{data}">
                <div class="flex w-full gap-1 items-center">
                    <span class="text-paragraph-md font-bold text-blue-900">{{ getAuthor(data) }}</span>
                    <span class="flex-grow text-paragraph-sm text-gray-400">{{ data.created_at }}</span>
                    <action-menu-button v-if="getWritePermission(data)"
                                        style-type="tertiary"
                                        size="sm"
                                        class="flex-shrink-0"
                                        :menu="['delete']"
                                        @delete="taskDetailPageStore.openCommentDeleteModal(data)"
                    />
                </div>
            </template>
            <template #default="{data}">
                <p-text-beautifier class="whitespace-pre-line"
                                   :value="data.comment"
                />
            </template>
        </p-collapsible-list>
    </p-pane-layout>
</template>
