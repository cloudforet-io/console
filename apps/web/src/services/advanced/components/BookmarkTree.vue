<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI, PTreeView, PTextButton } from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { gray } from '@/styles/colors';

import { getWorkspaceInfo } from '@/services/advanced/composables/refined-table-data';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';
import type { TreeNode } from '@/services/project/v-shared/tree/type';

const gnbStore = useGnbStore();
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;

const route = useRoute();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => bookmarkPageState.workspaceList),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
});

const state = reactive({
    showMorePage: 1,
    convertedList: computed<TreeNode[]>(() => convertBookmarkItemsToTreeNodes(storeState.bookmarkFolderList)),
    bookmarkTreeData: computed<TreeNode[]>(() => state.convertedList.slice(0, 20 * state.showMorePage)),
    selectedTreeId: undefined as string|undefined,
    group: computed<string>(() => route.params.group),
    folder: computed<string>(() => route.params.folder),
    bookmarkGroupNavigation: computed<Breadcrumb[]>(() => {
        const allPaths: Breadcrumb[] = [];
        if (state.group) {
            const workspaceItem = storeState.workspaceList.find((item) => item.workspace_id === state.group);
            allPaths.push({
                name: state.group === 'global' ? i18n.t('IAM.BOOKMARK.GLOBAL_BOOKMARK') : workspaceItem?.name || '',
                to: {
                    name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME,
                    params: {
                        group: state.group,
                    },
                },
            });
        }
        if (state.folder) {
            allPaths.push({
                name: state.folder,
                to: {
                    name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME,
                    params: {
                        group: state.group,
                        folder: state.folder,
                    },
                },
            });
        }

        return [
            {
                name: i18n.t('MENU.ADMINISTRATION_ADVANCED'),
                to: {
                    name: ADMIN_ADVANCED_ROUTE._NAME,
                },
            },
            {
                name: i18n.t('MENU.ADMINISTRATION_BOOKMARK'),
                to: {
                    name: ADMIN_ADVANCED_ROUTE.BOOKMARK._NAME,
                },
            },
            ...allPaths,
        ];
    }),
});

const convertBookmarkItemsToTreeNodes = (allBookmarkFolderItems: BookmarkItem[]): TreeNode[] => {
    const workspaceMap: { [key: string]: TreeNode } = storeState.workspaceList.flatMap((item) => item.workspace_id)
        .reduce((acc, cur) => {
            acc[cur] = {
                id: cur,
                depth: 0,
                data: {
                    id: cur,
                    name: cur,
                    to: {
                        name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME,
                        params: {
                            group: cur,
                        },
                    },
                },
                children: [],
            };
            return acc;
        }, {} as { [key: string]: TreeNode });
    const globalChildren: TreeNode[] = [];

    allBookmarkFolderItems?.forEach((item) => {
        const treeNode: TreeNode = {
            id: item.id || '',
            depth: 1,
            data: {
                id: item.id,
                name: item.name,
                to: {
                    name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME,
                    params: {
                        group: item.workspaceId || 'global',
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
                            name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME,
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
                name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME,
                params: {
                    group: 'global',
                },
            },
        },
        children: globalChildren,
    });

    return result;
};

watch(() => state.bookmarkGroupNavigation, async (bookmarkGroupNavigation) => {
    gnbStore.setBreadcrumbs(bookmarkGroupNavigation);
}, { immediate: true });
watch([() => route.params, () => storeState.bookmarkFolderList], ([params, bookmarkFolderList]) => {
    let selectedTreeId: string|undefined = '';
    if (params.folder) {
        const selectedFolder = bookmarkFolderList.find((item) => item.name === params.folder);
        selectedTreeId = selectedFolder?.id || '';
    } else if (params.group) {
        selectedTreeId = params.group;
    }
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
                                                 class="workspace-logo-icon"
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
        <p-text-button v-if="state.convertedList.length !== state.bookmarkTreeData.length"
                       style-type="highlight"
                       size="sm"
                       icon-right="ic_chevron-down"
                       class="show-more"
                       @click="state.showMorePage += 1"
        >
            {{ $t('IAM.BOOKMARK.TOGGLE_MORE') }}
        </p-text-button>
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
            .workspace-logo-icon {
                width: 0.875rem;
                min-width: 0.875rem;
                height: 0.875rem;
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
    .show-more {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
}
</style>
