<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import BookmarkManagementDetailTable from '@/services/preference/components/BookmarkManagementDetailTable.vue';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();

const route = useRoute();

const state = reactive({
    selectedItem: computed<string>(() => route.params.group || route.params.folder),
    isFolderDetailPage: computed<boolean>(() => route.name === PREFERENCE_ROUTE.BOOKMARK.GROUP.DETAIL._NAME),
});

watch(() => route.params, () => {
    bookmarkPageStore.fetchBookmarkList();
}, { immediate: true });
</script>

<template>
    <div class="admin-bookmark-page">
        <div v-if="!state.isFolderDetailPage && state.selectedItem === 'global'"
             class="notification"
        >
            <span>{{ $t('IAM.BOOKMARK.GLOBAL_NOTIFICATION') }}</span>
        </div>
        <bookmark-management-detail-table />
    </div>
</template>

<style lang="postcss" scoped>
.admin-bookmark-page {
    .title {
        .extra {
            @apply flex;
            gap: 1rem;
            .create-button-wrapper {
                @apply relative;
                .create-context-menu {
                    @apply absolute;
                    min-width: unset;
                    width: 9rem;
                    top: 2rem;
                    right: 0;
                    z-index: 10;
                }
            }
        }
        .title-left-extra {
            @apply flex items-center;
        }
    }
    .notification {
        @apply bg-violet-200 text-paragraph-md;
        border-radius: 0.25rem;
        margin-bottom: 1.5rem;
        padding: 0.5rem 1rem;
    }
}
</style>
