<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import BookmarkManagementDetailTable from '@/services/preference/components/BookmarkManagementDetailTable.vue';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();

const route = useRoute();

const state = reactive({
    group: computed<string>(() => route.params.group),
});

watch(() => route.params, () => {
    bookmarkPageStore.fetchBookmarkList();
}, { immediate: true });
</script>

<template>
    <div class="admin-bookmark-page">
        <div v-if="state.group === 'global'"
             class="notification"
        >
            <span>{{ $t('IAM.BOOKMARK.GLOBAL_NOTIFICATION') }}</span>
        </div>
        <bookmark-management-detail-table />
    </div>
</template>

<style lang="postcss" scoped>
.admin-bookmark-page {
    .notification {
        @apply bg-violet-200 text-paragraph-md;
        border-radius: 0.25rem;
        margin-bottom: 1.5rem;
        padding: 0.5rem 1rem;
    }
}
</style>
