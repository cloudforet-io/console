<script setup lang="ts">
import { reactive } from 'vue';

import {
    PButton, PDivider, PFieldTitle, PIconButton, PTextButton, PI,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    isFullMode: boolean,
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    isFullMode: false,
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();

const emit = defineEmits<{(event: 'update:isFullMode', value: boolean): void}>();

const state = reactive({
    activeButtonIdx: undefined as number | undefined,
    proxyIsFullMode: useProxyValue('isFullMode', props, emit),
});

const handleClickFullModeButton = () => {
    state.proxyIsFullMode = !state.proxyIsFullMode;
};
const handleClickCreateButton = (type: BookmarkModalType) => {
    bookmarkStore.setModalType(type);
};
const handleClickFolder = (idx: number, name: string) => {
    if (state.activeButtonIdx === idx) {
        state.activeButtonIdx = undefined;
        bookmarkStore.fetchBookmarkList(undefined);
        return;
    }
    state.activeButtonIdx = idx;
    bookmarkStore.fetchBookmarkList(name);
};
const handleClickDeleteFolder = (name: string, e) => {
    e.stopPropagation();
    bookmarkStore.deleteBookmarkFolder(name);
};
</script>

<template>
    <div class="bookmark-header">
        <p-field-title :label="$t('HOME.BOOKMARK_TITLE')"
                       size="lg"
        />
        <div v-if="!state.proxyIsFullMode"
             class="bookmark-folders-wrapper"
        >
            <div class="bookmark-folders">
                <p-button v-for="(item, idx) in props.bookmarkFolderList"
                          :key="idx"
                          style-type="tertiary"
                          class="folders-button"
                          :class="{'active': state.activeButtonIdx === idx}"
                          @click="handleClickFolder(idx, item.name)"
                >
                    <p-icon-button v-if="state.activeButtonIdx === idx"
                                   name="ic_close"
                                   style-type="transparent"
                                   size="sm"
                                   @click="handleClickDeleteFolder(item.name, $event)"
                    />
                    <p-i v-else
                         name="ic_folder-filled"
                         width="0.875rem"
                         height="0.875rem"
                    />
                    <span>{{ item.name }}</span>
                </p-button>
            </div>
            <p-divider vertical
                       class="divider"
            />
            <p-icon-button v-if="props.bookmarkFolderList.length > 0"
                           name="ic_plus"
                           style-type="tertiary"
                           shape="square"
                           size="sm"
                           @click="handleClickCreateButton(BOOKMARK_MODAL_TYPE.FOLDER)"
            />
            <p-text-button v-else
                           icon-left="ic_plus"
                           class="create-folder-button"
                           @click="handleClickCreateButton(BOOKMARK_MODAL_TYPE.FOLDER)"
            >
                {{ $t('HOME.BOOKMARK_CREATE_FOLDER') }}
            </p-text-button>
        </div>
        <div class="toolbox-wrapper">
            <p-button icon-left="ic_plus"
                      :style-type="!state.proxyIsFullMode ? 'tertiary' : 'substitutive'"
                      @click="handleClickCreateButton(BOOKMARK_MODAL_TYPE.LINK)"
            >
                {{ $t('HOME.BOOKMARK_ADD_LINK') }}
            </p-button>
            <p-icon-button v-if="!state.proxyIsFullMode"
                           name="ic_chevron-down"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
            <p-icon-button v-else
                           name="ic_close"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-header {
    @apply flex items-center;
    padding-bottom: 1rem;
    gap: 0.5rem;
    .bookmark-folders-wrapper {
        @apply flex items-center;
        margin-left: 0.25rem;
        gap: 0.75rem;
        flex: 1;
        .bookmark-folders {
            @apply flex;
            gap: 0.25rem;
            .folders-button {
                @apply flex items-center font-normal text-label-md bg-gray-150;
                min-width: initial;
                height: 1.625rem;
                padding: 0.25rem 0.625rem;
                border: none;
                gap: 0.25rem;
                &.active {
                    @apply bg-blue-300;
                }
            }
        }
        .divider {
            height: 1.25rem;
        }
        .create-folder-button {
            padding-left: 0;
        }
    }
    .toolbox-wrapper {
        @apply flex;
        margin-left: auto;
        gap: 0.5rem;
    }
}
</style>
