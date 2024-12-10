<script setup lang="ts">
import {
    ref, computed, reactive, onBeforeMount, onMounted, onUnmounted,
} from 'vue';

import { debounce, throttle } from 'lodash';

import {
    PPaneLayout, PHeading, PButton, PCollapsibleList, PTextBeautifier, getTextHighlightRegex, PContextMenu,
    useIgnoreWindowArrowKeydownEvents,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { CollapsibleItem } from '@cloudforet/mirinae/types/data-display/collapsible/collapsible-list/type';

import type { CommentModel } from '@/schema/opsflow/comment/model';

import type { UserReferenceItem } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

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
const userStore = useUserStore();
const userId = computed(() => userStore.state.userId);
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
    if (contentEditableDivRef.value) {
        contentEditableDivRef.value.textContent = '';
    }
    if (hiddenDivRef.value) {
        hiddenDivRef.value.textContent = '';
    }
};

// mention
const allUserItems = computed<SelectDropdownMenuItem[]>(() => (Object.values(userReferenceStore.getters.userItems) as UserReferenceItem[]).map((u) => ({
    name: u.key,
    label: u.label || u.name,
})));
const refinedUserItems = computed<SelectDropdownMenuItem[]>(() => {
    const filtered = allUserItems.value.filter((item) => getTextHighlightRegex(keyword.value).test(item.label as string));
    return filtered.slice(0, 10);
});
const mentionTriggerIndex = ref(-1);
const showSuggestions = ref(false);
const keyword = ref('');
const getCaretOffset = (contentsEl: HTMLDivElement) => {
    let caretOffset = 0;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentsEl);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
};
const detectMention = debounce(() => {
    const contentsEl = contentEditableDivRef.value;
    if (!contentsEl) return;

    const cursorPosition = getCaretOffset(contentsEl);
    const textBeforeCursor = contentsEl.textContent?.slice(0, cursorPosition) ?? '';
    const mentionMatch = /@([\p{L}\p{N}_]*)$/u.exec(textBeforeCursor);
    if (mentionMatch) {
        mentionTriggerIndex.value = mentionMatch.index;
        keyword.value = mentionMatch[1];
        showSuggestions.value = true;
        calculatePopupPosition();
        syncScroll();
    } else {
        clearMention();
    }
}, 200);
let lastKeyPressed = '';
const handleInput = (e: InputEvent) => {
    // Ignore arrow key events when suggestions are shown
    if (showSuggestions.value && (lastKeyPressed === 'ArrowDown' || lastKeyPressed === 'ArrowUp')) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (!range) return;

        // Get the current text node and its content
        const textNode = range.startContainer;
        const textContent = textNode.textContent || '';

        // Remove the keyword and prepare for mention insertion
        const mentionText = `@${keyword.value}`;
        const lastAtIndex = textContent.lastIndexOf('@');
        const beforeMention = textContent.slice(0, lastAtIndex);
        const afterMention = textContent.slice(range.endOffset);
        textNode.textContent = beforeMention + mentionText + afterMention;
        // Move the cursor to the space after the mention
        const afterCursorPosition = beforeMention.length + mentionText.length;
        range.setStart(textNode, afterCursorPosition);
        range.setEnd(textNode, afterCursorPosition);
        selection?.removeAllRanges(); // clear the current selection
        selection?.addRange(range); // set the new cursor position

        return;
    }
    if (lastKeyPressed === 'Escape' || lastKeyPressed === 'Tab') {
        return;
    }
    if (lastKeyPressed === 'Enter') {
        return;
    }
    comment.value = (e.target as HTMLDivElement).innerText;
    detectMention(); // detect mention after IME input ends
};
useIgnoreWindowArrowKeydownEvents({ predicate: showSuggestions });
const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        if (showSuggestions.value) {
            menuRef.value?.focus();
        }
    } else if (showSuggestions.value && (e.key === 'Escape' || e.key === 'Tab' || e.key === ' ')) {
        clearMention();
    } else if (e.key === 'Enter') {
        if (!showSuggestions.value && !e.shiftKey) {
            addCommentAndApplyToEvents(comment.value);
            comment.value = '';
            if (contentEditableDivRef.value) {
                contentEditableDivRef.value.textContent = '';
            }
            if (hiddenDivRef.value) {
                hiddenDivRef.value.textContent = '';
            }
        }
    }

    lastKeyPressed = e.key; // Track the last key pressed
};
const selectSuggestion = (item: SelectDropdownMenuItem) => {
    const contentsDiv = contentEditableDivRef.value;
    if (!contentsDiv) return;

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    if (!range) return;

    // Get the current text node and its content
    const textNode = range.startContainer;
    const textContent = textNode.textContent || '';

    // Remove the keyword and prepare for mention insertion
    const lastAtIndex = textContent.lastIndexOf('@');
    const beforeMention = textContent.slice(0, lastAtIndex);
    const afterMention = textContent.slice(range.endOffset);
    textNode.textContent = beforeMention + afterMention;

    // Create a span element for the selected user mention
    const mentionSpan = document.createElement('span');
    mentionSpan.className = 'mention'; // CSS class for styling the mention
    mentionSpan.textContent = item.label as string; // Display the user label
    mentionSpan.dataset.userId = item.name; // Store user ID as a dataset attribute
    mentionSpan.contentEditable = 'false'; // Make the mention non-editable

    // Insert the mentionSpan at the correct position
    range.setStart(textNode, beforeMention.length);
    range.setEnd(textNode, beforeMention.length);
    range.insertNode(mentionSpan);

    // Add a space after the mention for continued typing
    const space = document.createTextNode(' ');
    range.setStartAfter(mentionSpan);
    range.setEndAfter(mentionSpan);
    range.insertNode(space);

    // Move the cursor to the space after the mention
    range.setStartAfter(space);
    range.setEndAfter(space);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Reset state after inserting the mention
    showSuggestions.value = false;
    keyword.value = '';
    mentionTriggerIndex.value = -1;
};
const containerRef = ref<HTMLDivElement|null>(null);
/* focus in & out */
const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check if the click is outside contentEditableDivRef or menuRef
    if (containerRef.value?.contains(target)) {
        detectMention();
    } else {
        showSuggestions.value = false;
    }
};
onMounted(() => {
    document.addEventListener('mousedown', handleGlobalClick);
});
onUnmounted(() => {
    document.removeEventListener('mousedown', handleGlobalClick);
});


const clearMention = () => {
    showSuggestions.value = false;
    keyword.value = '';
    mentionTriggerIndex.value = -1;
    if (hiddenDivRef.value) {
        hiddenDivRef.value.textContent = comment.value;
        // if (comment.value.charCodeAt(comment.value.length - 1) === 10) { // if last character is newline, add zero width space
        //     hiddenDivRef.value.textContent += '\u200B';
        // }
    }
};
const handleMenuEsc = () => {
    clearMention();
    focusOnInput();
};
const focusOnInput = () => {
    if (contentEditableDivRef.value) {
        contentEditableDivRef.value.focus();
    }
};

const menuRef = ref<any|null>(null);
const contentEditableDivRef = ref<HTMLDivElement|null>(null);
const hiddenDivRef = ref<HTMLDivElement|null>(null);
const popupPosition = reactive({ top: 0, left: 0, width: undefined as number|undefined });
const POPUP_MIN_WIDTH = 200;
const POPUP_PAD = 1;
const calculatePopupPosition = () => {
    const contentsEl = contentEditableDivRef.value;
    const hiddenDiv = hiddenDivRef.value;
    if (!contentsEl || !hiddenDiv) return;

    // initialize hidden div
    hiddenDiv.textContent = '';

    // append a text node before caret position
    const beforeCaretTextNode = document.createTextNode(comment.value.slice(0, mentionTriggerIndex.value));
    hiddenDiv.appendChild(beforeCaretTextNode);

    // append a span element to calculate caret position
    const caretSpanEl = hiddenDiv.children[0] ?? document.createElement('span');
    caretSpanEl.textContent = `@${keyword.value}`;
    hiddenDiv.appendChild(caretSpanEl);

    // append a text node after caret position
    const afterCaretTextNode = document.createTextNode(comment.value.slice(mentionTriggerIndex.value + caretSpanEl.textContent.length));
    hiddenDiv.appendChild(afterCaretTextNode);

    // sync scroll of hidden div with textarea to calculate caret position
    syncScroll();

    // calculate popup position
    const contentsRect = contentsEl.getBoundingClientRect();
    const caretRect = caretSpanEl.getBoundingClientRect();
    const caretBottom = caretRect.bottom > contentsRect.bottom ? contentsRect.bottom : caretRect.bottom;
    popupPosition.top = caretBottom - contentsRect.top;
    popupPosition.left = caretRect.left - contentsRect.left - POPUP_PAD;

    // calculate width of popup
    let width = contentsRect.width - (caretRect.left - contentsRect.left);
    if (width <= POPUP_MIN_WIDTH) {
        const diff = POPUP_MIN_WIDTH - width;
        popupPosition.left -= diff;
        width = POPUP_MIN_WIDTH;
    }
    popupPosition.width = width;
};

// sync style of hidden div with textarea
onMounted(() => {
    if (!hiddenDivRef.value || !contentEditableDivRef.value) return;
    const contentsEl = contentEditableDivRef.value;
    const hiddenDiv = hiddenDivRef.value;
    hiddenDiv.style.font = getComputedStyle(contentsEl).font;
    hiddenDiv.style.lineHeight = getComputedStyle(contentsEl).lineHeight;
    hiddenDiv.style.padding = getComputedStyle(contentsEl).padding;
    hiddenDiv.style.border = getComputedStyle(contentsEl).border;
    hiddenDiv.style.width = `${contentsEl.offsetWidth}px`;
    hiddenDiv.style.height = `${contentsEl.offsetHeight}px`;
    hiddenDiv.style.wordBreak = getComputedStyle(contentsEl).wordBreak;
});

// sync scroll of hidden div with textarea
const syncScroll = throttle(() => {
    const contentsEl = contentEditableDivRef.value as HTMLDivElement;
    const hiddenDiv = hiddenDivRef.value;

    if (contentsEl && hiddenDiv) {
        hiddenDiv.scrollTop = contentsEl.scrollTop;
    }
}, 100);

// list comments for initial load
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
        <div ref="containerRef"
             class="relative mb-3"
        >
            <div ref="hiddenDivRef"
                 :style="{
                     position: 'absolute',
                     pointerEvents: 'none',
                     whiteSpace: 'pre-wrap',
                     visibility: 'hidden',
                     overflowY: 'auto',
                 }"
            />
            <div ref="contentEditableDivRef"
                 contenteditable="true"
                 class="contenteditable-div"
                 data-placeholder="Add Comment"
                 @input="handleInput"
                 @keydown="handleKeydown"
                 @scroll="syncScroll"
            />
            <p-context-menu v-if="showSuggestions"
                            ref="menuRef"
                            :menu="refinedUserItems"
                            :selected="[]"
                            :highlight-term="keyword"
                            :style="{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px`,
                                      width: `auto`, minWidth: `${POPUP_MIN_WIDTH}px`, maxWidth: `${popupPosition.width}px` }"
                            class="suggestion-list"
                            @select="selectSuggestion"
                            @keyup:up:end="focusOnInput"
                            @keyup:down:end="focusOnInput"
                            @keyup:esc="handleMenuEsc"
            />
        </div>
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

<style scoped lang="postcss">
.suggestion-list {
    @apply absolute;
    z-index: 10;
}
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

<style lang="postcss">
.mention {
    @apply bg-violet-150 text-violet-600 rounded-md;
    padding: 0 2px;
}
</style>
