<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import { at } from 'lodash';

import {
    PHeading, PButton, PContextMenu, PI, PIconButton, PStatus,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/inputs/context-menu/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { getWorkspaceInfo, workspaceStateFormatter } from '@/services/preference/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/preference/constants/workspace-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),

    workspaceList: computed<WorkspaceModel[]>(() => bookmarkPageState.workspaceList),
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
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
    selectedFolder: computed<BookmarkItem|undefined>(() => storeState.bookmarkFolderList.find((item) => item.name === state.folder)),
    headingTitle: computed<TranslateResult|string>(() => {
        if (state.folder) {
            return state.folder;
        }
        if (state.group === 'global') {
            return i18n.t('IAM.BOOKMARK.GLOBAL_BOOKMARK');
        }
        return state.workspaceInfo?.name || '';
    }),
    workspaceInfo: computed<WorkspaceModel|undefined>(() => getWorkspaceInfo(state.group, storeState.workspaceList)),
});

const handleClickCreateButton = () => {
    if (!state.folder) {
        state.visibleMenu = !state.visibleMenu;
        return;
    }
    handleSelectMenuItem({ name: BOOKMARK_MODAL_TYPE.LINK });
};
const handleClickGoBackButton = () => {
    router.push({
        name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.GROUP._NAME),
        params: {
            group: state.group,
        },
    });
};
const handleClickWorkspaceButton = () => {
    if (!state.workspaceInfo?.is_dormant) {
        window.open(router.resolve({
            name: WORKSPACE_HOME_ROUTE._NAME,
            params: {
                workspaceId: state.group,
            },
        }).href, '_blank');
        return;
    }
    window.open(router.resolve({
        name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
    }).href, '_blank');
};
const handleClickDeleteButton = () => {
    const selectedItems = at(storeState.bookmarkList, storeState.selectedIndices);
    bookmarkStore.setSelectedBookmarks(selectedItems);
    bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.MULTI_DELETE);
};
const handleClickEditFolderButton = () => {
    if (state.selectedFolder) {
        bookmarkStore.setSelectedBookmark(state.selectedFolder);
    }
    bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER, true);
};
const handleClickDeleteFolderButton = () => {
    if (state.selectedFolder) {
        bookmarkStore.setSelectedBookmark(state.selectedFolder);
    }
    bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.DELETE_FOLDER);
};
const handleSelectMenuItem = (value: MenuItem) => {
    if (value.name === BOOKMARK_MODAL_TYPE.LINK) {
        bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK);
        if (state.folder) {
            if (state.selectedFolder) {
                bookmarkStore.setSelectedBookmark(state.selectedFolder);
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
                   :show-back-button="!!state.folder"
                   class="title"
                   @click-back-button="handleClickGoBackButton"
        >
            <template #title-left-extra>
                <div v-if="!state.folder"
                     class="title-extra"
                >
                    <p-i v-if="state.group === 'global'"
                         name="ic_globe-filled"
                         :color="gray[500]"
                         width="1.5rem"
                         height="1.5rem"
                    />
                    <workspace-logo-icon v-else
                                         :text="state.workspaceInfo?.name || ''"
                                         :theme="state.workspaceInfo?.tags?.theme"
                                         size="sm"
                    />
                </div>
                <div v-else
                     class="title-extra"
                >
                    <p-i name="ic_folder"
                         :color="gray[900]"
                         width="1.25rem"
                         height="1.25rem"
                    />
                </div>
            </template>
            <template #title-right-extra>
                <p-status v-if="state.workspaceInfo?.is_dormant"
                          v-bind="workspaceStateFormatter( WORKSPACE_STATE.DORMANT)"
                          class="capitalize state"
                />
                <div v-if="state.folder && state.group === 'global'"
                     class="title-extra"
                >
                    <p-icon-button name="ic_edit-text"
                                   style-type="transparent"
                                   @click="handleClickEditFolderButton"
                    />
                    <p-icon-button name="ic_delete"
                                   style-type="transparent"
                                   @click="handleClickDeleteFolderButton"
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
                              @click="handleClickDeleteButton"
                    >
                        {{ $t('IAM.BOOKMARK.DELETE') }} {{ storeState.selectedIndices.length || ' ' }}
                    </p-button>
                    <div class="create-button-wrapper">
                        <p-button icon-left="ic_plus"
                                  @click="handleClickCreateButton"
                        >
                            {{ state.folder ? $t('IAM.BOOKMARK.ADD_LINK') : $t('IAM.BOOKMARK.ADD_GLOBAL_BOOKMARK') }}
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
                <p-button v-else-if="state.workspaceInfo?.state !== WORKSPACE_STATE.DISABLE"
                          style-type="tertiary"
                          :icon-right="!state.workspaceInfo?.is_dormant ? 'ic_arrow-right-up' : undefined"
                          :icon-left="state.workspaceInfo?.is_dormant ? 'ic_settings' : undefined"
                          @click="handleClickWorkspaceButton"
                >
                    {{ !state.workspaceInfo?.is_dormant? $t('IAM.BOOKMARK.GO_TO_WORKSPACE') : $t('IAM.BOOKMARK.GO_TO_SETTINGS') }}
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
        .title-extra {
            @apply flex items-center;
        }
        .state {
            @apply text-label-md border border-coral-300;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            border-radius: 6.25rem;
        }
    }
}
</style>
