<script setup lang="ts">
import {
    ref, computed, onBeforeMount, onUnmounted,
} from 'vue';

import {
    PPaneLayout, PHeading, PButton, PCollapsibleList, PBadge, PLazyImg,
} from '@cloudforet/mirinae';
import type { CollapsibleItem } from '@cloudforet/mirinae/types/data-display/collapsible/collapsible-list/type';

import type { CommentModel } from '@/api-clients/opsflow/comment/schema/model';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';
import TextEditor from '@/common/components/editor/TextEditor.vue';
import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useTimezoneDate } from '@/common/composables/timezone-date';

import { useCommentStore } from '@/services/ops-flow/stores/comment-store';
import { useTaskDetailPageStore } from '@/services/ops-flow/stores/task-detail-page-store';

const props = defineProps<{
    taskId: string;
}>();

const taskDetailPageStore = useTaskDetailPageStore();
const commentStore = useCommentStore();
const userReferenceStore = useUserReferenceStore();
const userStore = useUserStore();

const userId = computed(() => userStore.state.userId);
const getAuthor = (item: CommentModel) => {
    const u = item.created_by;
    if (!u) return 'Unknown';
    return userReferenceStore.getters.userItems[u]?.label ?? u;
};
const getSourceIcon = (item: CommentModel) => item.source?.icon ?? '';
const getSourceName = (item: CommentModel) => item.source?.name ?? '';
const getWritePermission = (item: CommentModel) => item.created_by === userId.value;
const comments = computed<CommentModel[]>(() => commentStore.comments ?? []);
const commentItems = computed<CollapsibleItem<CommentModel>[]>(() => comments.value.map((comment) => ({
    title: comment.created_at,
    data: comment,
})));
const { getTimezoneDate } = useTimezoneDate();

/* add comment */
const addingComment = ref<boolean>(false);
const addComment = async (comment: string) => {
    try {
        addingComment.value = true;
        await commentStore.create({
            task_id: props.taskId,
            comment,
        }, true);
        showSuccessMessage(i18n.t('OPSFLOW.ALT_S_ADD_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('OPSFLOW.ALT_E_ADD_TARGET', { target: i18n.t('OPSFLOW.TASK_BOARD.COMMENT') }));
    } finally {
        addingComment.value = false;
    }
};
const addCommentAndApplyToEvents = async (comment: string) => {
    if (!comment.trim().length) return;
    await addComment(comment);
    await taskDetailPageStore.loadNewEvents();
};
const contents = ref<string>('');


/* mention */
// const allUserItems = computed<SelectDropdownMenuItem[]>(() => (Object.values(userReferenceStore.getters.userItems) as UserReferenceItem[]).map((u) => ({
//     name: u.key,
//     label: u.label || u.name,
// })));
// const getMentionList = (keyword: string) => {
//     const filtered = allUserItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label as string));
//     return filtered.slice(0, 10);
// };


/* handle add comment events */
const handleClickAddComment = () => {
    addCommentAndApplyToEvents(contents.value);
    contents.value = '';
};


/* list comments for initial load */
onBeforeMount(async () => {
    await commentStore.listByTaskId(props.taskId, {
        query: {
            sort: [{ key: 'created_at', desc: true }],
        },
    });
});

onUnmounted(() => {
    commentStore.$reset();
    commentStore.$dispose();
});
</script>

<template>
    <p-pane-layout class="pt-8 pb-10 px-4">
        <p-heading class="mb-6"
                   heading-type="sub"
                   :title="$t('OPSFLOW.TASK_BOARD.COMMENT')"
        />
        <div class="mb-3">
            <text-editor :placeholder="$t('OPSFLOW.TASK_BOARD.COMMENT')"
                         contents-type="markdown"
                         :show-undo-redo-buttons="false"
                         :value="contents"
                         :style="{minHeight: '5rem'}"
                         @update:value="contents = $event"
            />
        </div>
        <p-button class="mb-6"
                  style-type="tertiary"
                  :loading="addingComment"
                  @click="handleClickAddComment"
        >
            {{ $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.TASK_BOARD.COMMENT') }) }}
        </p-button>
        <p-collapsible-list :items="commentItems"
                            toggle-position="contents"
                            :line-clamp="2"
        >
            <template #no-styled-title="{data}">
                <div class="flex w-full gap-1 items-center">
                    <template v-if="data.source">
                        <div class="pr-1">
                            <p-lazy-img :src="getSourceIcon(data)" />
                        </div>
                        <p-badge v-if="!data.source"
                                 badge-type="subtle"
                                 style-type="primary3"
                                 shpae="square"
                        >
                            {{ getSourceName(data) }}
                        </p-badge>
                    </template>
                    <span class="text-paragraph-md font-bold text-blue-900">{{ getAuthor(data) }}</span>
                    <div class="flex-1 truncate">
                        <span class="flex-grow text-paragraph-sm text-gray-400">{{ getTimezoneDate(data.created_at) }}</span>
                    </div>
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
                <div :class="{'pl-10': !!data.source}">
                    <text-editor-viewer contents-type="markdown"
                                        :contents="data.comment"
                    />
                </div>
            </template>
        </p-collapsible-list>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.contenteditable-div {
    @apply text-label-md bg-white border border-gray-300 rounded-md text-gray-900;
    min-height: 7.75rem;
    padding: 0.5rem;
    white-space: pre-wrap;
    overflow-y: auto;
    line-height: 1.25rem;
    outline: none;
    resize: block;
    &[data-placeholder]:empty::before {
        @apply text-gray-400;
        content: attr(data-placeholder);
    }
}
</style>

