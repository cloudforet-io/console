<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';

import { PHeading, PButton, PContextMenu } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';

import { i18n } from '@/translations';

import BookmarkManagementTable from '@/services/preference/components/BookmarkManagementTable.vue';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;

const storeState = reactive({
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
});
const state = reactive({
    visibleMenu: false,
    createMenu: computed<MenuItem[]>(() => ([
        {
            label: i18n.t('IAM.BOOKMARK.ADD_LINK'),
            name: 'link',
        },
        {
            label: i18n.t('IAM.BOOKMARK.CREATE_FOLDER'),
            name: 'folder',
        },
    ])),
});

const handleClickCreateButton = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectMenuItem = () => {
    state.visibleMenu = false;
};

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
                    <div class="create-button-wrapper">
                        <p-button icon-left="ic_plus"
                                  @click="handleClickCreateButton"
                        >
                            {{ $t('IAM.BOOKMARK.ADD_GLOBAL_BOOKMARK') }}
                        </p-button>
                        <p-context-menu v-show="state.visibleMenu"
                                        class="create-context-menu"
                                        reset-selected-on-unmounted
                                        :selected="[]"
                                        :menu="state.createMenu"
                                        @select="handleSelectMenuItem"
                        />
                    </div>
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
    }
}
</style>
