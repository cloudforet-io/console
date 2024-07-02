<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PButton, PContextMenu, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { getWorkspaceInfo } from '@/services/preference/composables/bookmark-data-helper';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const route = useRoute();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
});
const state = reactive({
    visibleMenu: false,
    createMenu: computed<MenuItem[]>(() => ([
        {
            label: i18n.t('IAM.BOOKMARK.ADD_LINK'),
            name: BOOKMARK_MODAL_TYPE.LINK,
        },
        {
            label: i18n.t('IAM.BOOKMARK.CREATE_FOLDER'),
            name: BOOKMARK_MODAL_TYPE.FOLDER,
        },
    ])),
    group: computed<string>(() => route.params.group),
    folder: computed<string>(() => route.params.folder),
    headingTitle: computed<TranslateResult|string>(() => {
        if (state.folder) {
            return state.folder;
        }
        if (state.group === 'global') {
            return i18n.t('IAM.BOOKMARK.GLOBAL_BOOKMARK');
        }
        return getWorkspaceInfo(state.group, storeState.workspaceList)?.name || '';
    }),
});

const handleClickCreateButton = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectMenuItem = (value: MenuItem) => {
    if (value.name === BOOKMARK_MODAL_TYPE.LINK) {
        bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK);
        if (state.folder) {
            const selectedFolder = storeState.bookmarkFolderList.find((item) => item.name === state.folder);
            if (selectedFolder) {
                bookmarkStore.setSelectedBookmark(selectedFolder);
            }
        }
    } else if (value.name === BOOKMARK_MODAL_TYPE.FOLDER) {
        bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER);
    }
    state.visibleMenu = false;
};
</script>

<template>
    <div class="bookmark-detail-container">
        <p-heading :title="state.headingTitle"
                   class="title"
        >
            <template #title-left-extra>
                <div v-if="state.group"
                     class="title-left-extra"
                >
                    <p-i v-if="state.group === 'global'"
                         name="ic_globe-filled"
                         :color="gray[500]"
                         width="1.5rem"
                         height="1.5rem"
                    />
                    <workspace-logo-icon v-else
                                         :text="getWorkspaceInfo(state.group, storeState.workspaceList)?.name || ''"
                                         :theme="getWorkspaceInfo(state.group, storeState.workspaceList)?.tags?.theme"
                                         size="sm"
                    />
                </div>
            </template>
            <template #extra>
                <div v-if="state.group === 'global'"
                     class="extra"
                >
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
                <p-button v-else
                          style-type="tertiary"
                          icon-right="ic_arrow-right-up"
                >
                    {{ $t('IAM.BOOKMARK.GO_TO_WORKSPACE') }}
                </p-button>
            </template>
        </p-heading>
        <router-view />
    </div>
</template>

<style lang="postcss" scoped>
.bookmark-detail-container {
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
}
</style>
