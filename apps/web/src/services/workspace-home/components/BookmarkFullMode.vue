<script setup lang="ts">
import { computed, reactive } from 'vue';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';

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
});
const state = reactive({
    folderBoardSets: computed<BookmarkItem[]>(() => {
        const defaultFolderItem: BookmarkItem[] = [
            {
                name: i18n.t('HOME.BOOKMARK_CREATE_FOLDER'),
                icon: 'ic_plus',
                id: 'create-folder',
            },
            {
                name: i18n.t('HOME.BOOKMARK_ADD_LINK'),
                icon: 'ic_plus',
                id: 'add-link',
            },
        ];
        if (!storeState.isWorkspaceMember) {
            return [
                ...defaultFolderItem,
                ...props.bookmarkFolderList,
            ];
        }
        return props.bookmarkFolderList;
    }),
    isFullMode: false,
});
</script>

<template>
    <div class="bookmark-full-mode">
        <bookmark-board v-if="!storeState.isWorkspaceMember && !storeState.isFileFullMode"
                        :board-list="state.folderBoardSets"
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
