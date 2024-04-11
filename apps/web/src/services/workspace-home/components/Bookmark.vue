<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import BookmarkFullMode from '@/services/workspace-home/components/BookmarkFullMode.vue';
import BookmarkHeader from '@/services/workspace-home/components/BookmarkHeader.vue';

const storeState = reactive({
    // TODO: will be changed to data
    bookmarkList: computed(() => [
        {
            icon: '', title: 'BookmarkBookmark 1', id: '1', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 2', id: '2', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 3', id: '3', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 4', id: '4', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 5', id: '5', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 6', id: '6', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 7', id: '7', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
        {
            icon: '', title: 'Bookmark 8', id: '8', link: 'https://grafana.com/grafana/dashboards/17982-demo-dashboard/',
        },
    ]),
});
const state = reactive({
    boardSets: computed<BoardSet[]>(() => storeState.bookmarkList.map((d) => ({
        ...d,
        rounded: true,
    }))),
    isFullMode: false,
});
</script>

<template>
    <div class="bookmark"
         :class="{ 'full-mode': state.isFullMode }"
    >
        <bookmark-header :is-full-mode.sync="state.isFullMode" />
        <bookmark-full-mode v-if="state.isFullMode"
                            :bookmark-list="storeState.bookmarkList"
        />
        <bookmark-board v-else
                        :board-sets="state.boardSets"
                        class="bookmark-board-wrapper"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark {
    @apply border border-gray-200;
    padding: 1rem;
    border-radius: 0.375rem;

    &.full-mode {
        @apply bg-white;
        padding-bottom: 2.5rem;
    }
    .bookmark-board-wrapper {
        @apply grid-cols-7;
    }
}
</style>
