<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';

import {
    PPaneLayout, PHeading, PButton, PTextarea, PCollapsibleList, PTextBeautifier,
} from '@cloudforet/mirinae';
import type { CollapsibleItem } from '@cloudforet/mirinae/types/data-display/collapsible/collapsible-list/type';

import type { CommentModel } from '@/schema/opsflow/comment/model';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCommentStore } from '@/services/ops-flow/stores/comment-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const props = defineProps<{
    taskId: string;
}>();

const taskDetailPageStore = useTaskDetailPageStore();
const commentStore = useCommentStore();

const comments = computed<CommentModel[]>(() => commentStore.state.itemsByTaskId[props.taskId] ?? []);
const commentItems = computed<CollapsibleItem<CommentModel>[]>(() => comments.value.map((comment) => ({
    title: comment.created_at,
    data: comment,
})));
const comment = ref('');

const addComment = async () => {
    try {
        await commentStore.create({
            task_id: props.taskId,
            comment: comment.value,
        }, true);
        showSuccessMessage('Comment added successfully', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to add comment');
    }
};
const handleAddComment = async () => {
    if (!comment.value.trim().length) return;
    await addComment();
    await taskDetailPageStore.loadNewEvents();
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
                    placehoder="Add Comment"
                    :value="comment"
                    @update:value="comment = $event"
        />
        <p-button class="mb-6"
                  style-type="tertiary"
                  @click="handleAddComment"
        >
            Add Comment
        </p-button>
        <p-collapsible-list :items="commentItems"
                            toggle-position="contents"
                            :line-clamp="2"
        >
            <template #no-styled-title="{data}">
                <div class="flex gap-1">
                    <span class="text-paragraph-md font-bold text-blue-900">Author</span>
                    <span class="text-paragraph-sm text-gray-400">{{ data.created_at }}</span>
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
