<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButtonModal, PI, PLazyImg } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/common/components/bookmark/type/type';

import { gray } from '@/styles/colors';

interface Props {
    bookmarkList: BookmarkItem[]
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkList: () => [],
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const emit = defineEmits<{(e: 'confirm', isFolder?: boolean): void; }>();

const storeState = reactive({
    type: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    selectedBookmarks: computed<BookmarkItem[]>(() => bookmarkState.selectedBookmarks),
});
const state = reactive({
    loading: false,
    isFolder: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_FOLDER),
    isLink: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_LINK),
    isMulti: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.MULTI_DELETE),
    headerTitle: computed<TranslateResult>(() => {
        let title: TranslateResult = '';
        if (state.isFolder) {
            title = i18n.t('HOME.BOOKMARK_DELETE_FOLDER_TITLE');
        } else if (state.isLink) {
            title = i18n.t('HOME.BOOKMARK_DELETE_LINK_TITLE');
        } else if (state.isMulti) {
            title = i18n.t('HOME.BOOKMARK_DELETE_MULTI_ITEMS');
        }
        return title;
    }),
    items: computed<BookmarkItem[]>(() => {
        if (state.isFolder || state.isLink) {
            return [storeState.selectedBookmark] as BookmarkItem[];
        }
        return storeState.selectedBookmarks;
    }),
});

const deleteFolder = async (id?: string) => {
    await bookmarkStore.deleteBookmarkFolder({
        id,
        bookmarkList: props.bookmarkList,
    });
};
const deleteLink = async (id?: string) => {
    await bookmarkStore.deleteBookmarkLink(id);
};
const handleConfirm = async () => {
    state.loading = true;
    let isFolder: undefined|boolean;
    try {
        if (state.isFolder) {
            isFolder = true;
            await deleteFolder(storeState.selectedBookmark?.id);
        } else if (state.isLink) {
            await deleteLink(storeState.selectedBookmark?.id);
        } else {
            const promises = storeState.selectedBookmarks.map(async (item) => {
                if (item.link) {
                    return deleteLink(item.id);
                }
                isFolder = true;
                return deleteFolder(item.id);
            });
            await Promise.all(promises);
            bookmarkStore.setSelectedBookmarks([]);
        }

        emit('confirm', isFolder);
        await handleClose();
    } finally {
        state.loading = false;
    }
};
const handleClose = () => {
    bookmarkStore.setModalType(undefined, false, false);
};
</script>

<template>
    <div class="bookmark-delete-modal">
        <p-button-modal :header-title="state.headerTitle"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        :visible="state.isFolder || state.isLink || state.isMulti"
                        theme-color="alert"
                        :loading="state.loading"
                        @confirm="handleConfirm"
                        @close="handleClose"
                        @cancel="handleClose"
        >
            <template #body>
                <div class="content">
                    <div v-for="(item, idx) in state.items"
                         :key="`delete-item-${idx}`"
                         class="content-wrapper"
                    >
                        <div v-if="item.isGlobal"
                             class="global-wrapper"
                        >
                            <p-i name="ic_globe-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 :color="gray[500]"
                            />
                        </div>
                        <div class="icon-wrapper"
                             :class="{'is-folder': !item.link}"
                        >
                            <p-i v-if="!item.link"
                                 name="ic_folder"
                                 width="1.25rem"
                                 height="1.25rem"
                            />
                            <p-lazy-img
                                v-else
                                :src="assetUrlConverter(item?.imgIcon)"
                                width="1.5rem"
                                height="1.5rem"
                                error-icon="ic_globe-filled"
                                :error-icon-color="gray[500]"
                                class="icon"
                            />
                        </div>
                        <div class="text-wrapper">
                            <p>{{ item?.name }}</p>
                            <p v-if="item.link"
                               class="link"
                            >
                                {{ item.link }}
                            </p>
                        </div>
                    </div>
                </div>
            </template>
            <template #confirm-button>
                <span>{{ $t('HOME.BOOKMARK_DELETE') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-delete-modal {
    .content {
        @apply overflow-y-auto;
        max-height: 16rem;
        .content-wrapper {
            @apply relative flex items-center bg-gray-100 rounded-xl;
            padding: 0.5rem;
            margin-right: 1rem;
            margin-left: 1rem;
            gap: 0.5rem;
            &:first-child {
                margin-top: 0.375rem;
            }
            .global-wrapper {
                @apply absolute flex items-center justify-center bg-white border border-gray-200;
                width: 1.25rem;
                height: 1.25rem;
                top: -0.25rem;
                left: -0.25rem;
                border-radius: 0.375rem;
                z-index: 10;
            }
            .icon-wrapper {
                @apply relative flex items-center justify-center rounded-xl;
                width: 2.5rem;
                min-width: 2.5rem;
                height: 2.5rem;
                &.is-folder {
                    @apply bg-blue-200;
                }
            }
            .text-wrapper {
                @apply flex flex-col text-label-md;
                .link {
                    @apply truncate text-label-sm text-gray-500;
                    max-width: 22rem;
                }
            }
            & + .content-wrapper {
                margin-top: 0.25rem;
            }
        }
    }
}

/* custom design-system component - p-button-modal */
:deep(.p-button-modal) {
    .modal-content {
        padding: 1rem;
    }
    .header {
        padding-top: 1rem;
        padding-right: 1rem;
        padding-left: 1rem;
        .modal-header {
            margin-bottom: 0;
        }
    }
}
</style>
