<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';

import { PHeading, PButton } from '@spaceone/design-system';

import BookmarkManagementTable from '@/services/preference/components/BookmarkManagementTable.vue';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;

const storeState = reactive({
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
});

onUnmounted(() => {
    bookmarkPageStore.resetState();
});

onMounted(async () => {
    await bookmarkPageStore.fetchBookmarkFolderList();
});
</script>

<template>
    <div class="admin-bookmark-page">
        <p-heading :title="$t('IAM.BOOKMARK.ALL_BOOKMARK')"
                   class="title"
        >
            <template #extra>
                <div class="extra">
                    <p-button style-type="tertiary"
                              icon-left="ic_delete"
                              :disabled="storeState.selectedIndices.length === 0"
                    >
                        {{ $t('IAM.BOOKMARK.DELETE') }}
                    </p-button>
                    <p-button icon-left="ic_plus">
                        {{ $t('IAM.BOOKMARK.ADD_GLOBAL_BOOKMARK') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <bookmark-management-table />
    </div>
</template>

<style lang="postcss" scoped>
.admin-bookmark-page {
    .title {
        .extra {
            @apply flex;
            gap: 1rem;
        }
    }
}
</style>
