<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI, PTreeView } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { getWorkspaceInfo } from '@/services/preference/composables/bookmark-data-helper';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';
import type { TreeNode } from '@/services/project/tree/type';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const route = useRoute();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
});

const state = reactive({
    bookmarkTreeData: computed<TreeNode[]>(() => convertBookmarkItemsToTreeNodes(storeState.bookmarkFolderList)),
    selectedTreeId: undefined as string|undefined,
    // bookmarkGroupNavigation: computed<Breadcrumb[]>(() => {
    //     const allPaths = parentGroupitems.value.map((item) => ({
    //         name: item.name,
    //         to: {
    //             name: PREFERENCE_ROUTE.BOOKMARK._NAME,
    //             params: {
    //                 group: item.id,
    //             },
    //         },
    //     }));
    //
    //     return [
    //         { name: i18n.t('MENU.ADMINISTRATION_PREFERENCE'), data: null },
    //         { name: i18n.t('MENU.ADMINISTRATION_BOOKMARK'), data: null },
    //         ...allPaths,
    //     ];
    // }),
});

const convertBookmarkItemsToTreeNodes = (allBookmarkFolderItems: BookmarkItem[]): TreeNode[] => {
    const workspaceMap: { [key: string]: TreeNode } = {};
    const globalChildren: TreeNode[] = [];

    allBookmarkFolderItems?.forEach((item) => {
        const treeNode: TreeNode = {
            id: item.id || '',
            depth: 1,
            data: {
                id: item.id,
                name: item.name,
                to: {
                    name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL._NAME),
                    params: {
                        folder: item.name,
                    },
                },
            },
            children: undefined,
        };

        if (item.workspaceId) {
            if (!workspaceMap[item.workspaceId]) {
                workspaceMap[item.workspaceId] = {
                    id: item.workspaceId,
                    depth: 0,
                    data: {
                        id: item.workspaceId,
                        name: item.workspaceId,
                        to: {
                            name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.GROUP._NAME),
                            params: {
                                group: item.workspaceId,
                            },
                        },
                    },
                    children: [],
                };
            }
            workspaceMap[item.workspaceId].children?.push(treeNode);
        } else {
            globalChildren.push(treeNode);
        }
    });

    const result: TreeNode[] = Object.values(workspaceMap);

    result.unshift({
        id: 'global',
        depth: 0,
        data: {
            id: 'global',
            name: i18n.t('IAM.BOOKMARK.GLOBAL_BOOKMARK'),
            to: {
                name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.GROUP._NAME),
                params: {
                    group: 'global',
                },
            },
        },
        children: globalChildren,
    });

    return result;
};

// watch(() => state.bookmarkGroupNavigation, async (bookmarkGroupNavigation) => {
//     gnbStore.setBreadcrumbs(bookmarkGroupNavigation);
// });

watch(() => route.params, (params) => {
    const selectedTreeId = (params.group || params.id) as string|undefined;
    if (selectedTreeId) {
        state.selectedTreeId = selectedTreeId as string;
    } else {
        state.selectedTreeId = undefined;
    }
}, { immediate: true });

</script>

<template>
    <div class="bookmark-tree">
        <p-tree-view :tree-data="state.bookmarkTreeData"
                     :selected-id="state.selectedTreeId"
        >
            <template #content="{ node }">
                <div class="bookmark-menu-item-content">
                    <div class="contents-wrapper">
                        <div v-if="node.depth === 0"
                             class="bookmark"
                        >
                            <p-i v-if="node.id === 'global'"
                                 class="bookmark-icon"
                                 name="ic_globe-filled"
                                 :color="gray[500]"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <workspace-logo-icon v-else
                                                 :text="getWorkspaceInfo(node.data.id, storeState.workspaceList)?.name || ''"
                                                 :theme="getWorkspaceInfo(node.data.id, storeState.workspaceList)?.tags?.theme"
                                                 size="xxs"
                            />
                            <span class="text">{{ node.id === 'global' ? $t('IAM.BOOKMARK.GLOBAL_BOOKMARK') : getWorkspaceInfo(node.data.name, storeState.workspaceList)?.name || '' }}</span>
                        </div>
                        <div v-else
                             class="bookmark"
                        >
                            <p-i class="bookmark-icon"
                                 name="ic_folder"
                                 :color="gray[900]"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <span class="text">{{ node.data.name }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </p-tree-view>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-tree {
    width: 100%;
    .bookmark-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .contents-wrapper {
            @apply w-full;
            .bookmark {
                @apply flex items-center gap-1;
            }

            .bookmark-icon {
                min-width: 0.875rem;
            }
            .text {
                @apply text-label-md text-gray-900;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .favorite-button {
            display: none;
            min-width: 1.5rem;
            height: 1rem;
            padding-left: 0.5rem;
        }

        &:hover {
            .contents-wrapper {
                width: calc(100% - 1.5rem);
            }
            .favorite-button {
                display: block;
            }
        }
    }
}
</style>
