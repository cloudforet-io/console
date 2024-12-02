<script setup lang="ts">
import { ref, computed } from 'vue';

import {
    PPaneLayout, PHeading, PButton, PTextarea, PCollapsibleList, PTextBeautifier,
} from '@cloudforet/mirinae';
import type { CollapsibleItem } from '@cloudforet/mirinae/types/data-display/collapsible/collapsible-list/type';

import type { CommentModel } from '@/schema/opsflow/comment/model';

const comments = ref<CommentModel[]>([
    {
        comment_id: 'comment_1',
        comment: 'This is a comment',
        comment_type: 'COMMENT',
        is_edited: false,
        mentions: {
            USER: ['wanzargen@mz.co.kr'],
        },
        task_id: 'task_1',
        project_id: 'project_1',
        domain_id: 'domain_1',
        workspace_id: 'workspace_1',
        created_at: '2021-09-01T00:00:00Z',
        updated_at: '2021-09-01T00:00:00Z',
    },
    {
        comment_id: 'comment_2',
        comment: 'This is a comment 2',
        comment_type: 'COMMENT',
        is_edited: false,
        mentions: {},
        task_id: 'task_1',
        project_id: 'project_1',
        domain_id: 'domain_1',
        workspace_id: 'workspace_1',
        created_at: '2021-09-02T00:00:00Z',
        updated_at: '2021-09-02T00:00:00Z',
    },
]);
const commentItems = computed<CollapsibleItem<CommentModel>[]>(() => comments.value.map((comment) => ({
    title: comment.created_at,
    data: comment,
})));
</script>

<template>
    <p-pane-layout class="pt-8 pb-10 px-4">
        <p-heading class="mb-6"
                   heading-type="sub"
                   title="Comment"
        />
        <p-textarea class="mb-3"
                    placehoder="Add Comment"
        />
        <p-button class="mb-6"
                  style-type="tertiary"
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
