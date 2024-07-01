<script setup lang="ts">
import { computed, reactive } from 'vue';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList: BookmarkItem[];
    bookmarkList: BookmarkItem[];
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
    bookmarkList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const storeState = reactive({
    isFileFullMode: computed<boolean>(() => bookmarkState.isFileFullMode),
    isWorkspaceMember: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    bookmarkType: computed<BookmarkType>(() => bookmarkState.bookmarkType),
});
</script>

<template>
    <div class="bookmark-full-mode">
        <bookmark-board v-if="!storeState.isFileFullMode && props.bookmarkFolderList.length > 0"
                        :board-list="props.bookmarkFolderList"
                        is-folder-board
                        is-full-mode
                        class="board"
        />
        <bookmark-board :board-list="props.bookmarkList"
                        is-full-mode
                        class="board"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark-full-mode {
    @apply flex flex-col text-label-md overflow-y-auto;
    width: 100%;
    min-height: 15.875rem;
    margin-top: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    gap: 1.25rem;

    .board {
        + .board {
            padding-top: 0;
        }
    }
}
</style>
