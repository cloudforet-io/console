<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PI, PCheckbox, PIconButton,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';

import DashboardFolderTreeItem from '@/services/dashboards/components/dashboard-folder/DashboardFolderTreeItem.vue';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';


type DashboardModel = PublicDashboardModel | PrivateDashboardModel;
type FolderModel = PublicFolderModel | PrivateFolderModel;
interface Props {
    dashboardList?: DashboardModel[];
    folderList?: FolderModel[];
}
const props = withDefaults(defineProps<Props>(), {
    dashboardList: () => ([]),
    folderList: () => ([]),
});
const state = reactive({
    isAllSelected: computed(() => {
        let _isAllSelected = true;
        state.dashboardTreeData.forEach((node) => {
            if (!state.selectedMap[node.data.id]) _isAllSelected = false;
        });
        return _isAllSelected;
    }),
    isIndeterminate: computed<boolean>(() => {
        if (state.isAllSelected) return false;
        return Object.values(state.selectedMap).some((v) => v);
    }),
    dashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        const nodes: Record<string, TreeNode<DashboardTreeDataType>> = {};
        props.folderList.forEach((d) => {
            nodes[d.folder_id] = {
                id: d.folder_id,
                depth: 0,
                data: {
                    name: d.name,
                    type: 'FOLDER',
                    id: d.folder_id,
                },
                children: [],
            };
        });
        props.dashboardList.forEach((d) => {
            nodes[d.dashboard_id] = {
                id: d.dashboard_id,
                depth: 0,
                data: {
                    name: d.name,
                    id: d.dashboard_id,
                    type: 'DASHBOARD',
                    folderId: d.folder_id,
                    shared: d?.shared,
                    scope: d?.scope,
                    userId: d?.user_id,
                    createdBy: d.tags?.created_by,
                },
            };
        });

        const rootNodes: TreeNode<DashboardTreeDataType>[] = [];
        const setDepth = (node, depth) => {
            node.depth = depth;
            if (!node.children) return;
            node.children.forEach((child) => {
                setDepth(child, depth + 1);
            });
        };
        Object.values(nodes).forEach((node) => {
            const folderId = node.data?.folderId;
            if (!folderId) {
                rootNodes.push(node);
                setDepth(node, 0);
            } else {
                const parentNode = nodes[folderId];
                if (parentNode) {
                    parentNode.children = parentNode.children || [];
                    parentNode.children.push(node);
                    setDepth(node, parentNode.depth + 1);
                }
            }
        });

        return rootNodes;
    }),
    selectedMap: {} as Record<string, boolean>,
    childrenShowMap: {} as Record<string, boolean>,
    controlButtons: computed(() => ([
        {
            name: 'clone',
            icon: 'ic_clone',
            clickEvent: () => {},
        },
        {
            name: 'move',
            icon: 'ic_move',
            clickEvent: () => {},
        },
        {
            name: 'delete',
            icon: 'ic_delete',
            clickEvent: () => {},
        },
        {
            name: 'refresh',
            icon: 'ic_refresh',
            clickEvent: () => {},
        },
    ])),
});

/* Util */
const isIndeterminate = (node: TreeNode<DashboardTreeDataType>): boolean => {
    if (node.data.type === 'DASHBOARD' || !node.children) return false;
    if (node.children.length === 0) return false;
    // check all children are selected
    if (node.children.every((child) => state.selectedMap[child.id])) return false;
    return node.children.some((child) => state.selectedMap[child.id]);
};

/* Event */
const handleChangeAllSelected = (value: boolean) => {
    if (!value) {
        state.selectedMap = {};
    } else {
        state.dashboardTreeData.forEach((node) => {
            state.selectedMap = { ...state.selectedMap, [node.data.id]: true };
        });
    }
};
const handleSelectTreeItem = (node: TreeNode<DashboardTreeDataType>, value: [boolean]) => {
    const _isSelected = value[0];
    if (node.data.type === 'FOLDER') {
        state.selectedMap = { ...state.selectedMap, [node.data.id]: _isSelected };
        if (node.children) {
            node.children.forEach((child) => {
                state.selectedMap = { ...state.selectedMap, [child.id]: _isSelected };
            });
        }
    } else {
        state.selectedMap = { ...state.selectedMap, [node.data.id]: _isSelected };
        if (node.data.folderId) {
            if (_isSelected) {
                state.selectedMap = { ...state.selectedMap, [node.data.folderId]: true };
            } else {
                const _folderNode = state.dashboardTreeData.find((n) => n.data.id === node.data.folderId);
                if (_folderNode?.children?.every((child) => !state.selectedMap[child.id])) {
                    state.selectedMap = { ...state.selectedMap, [node.data.folderId]: false };
                }
            }
        }
    }
};
const handleClickCollapseButton = (node: TreeNode<DashboardTreeDataType>) => {
    if (state.childrenShowMap[node.data.id]) {
        state.childrenShowMap[node.data.id] = false;
    } else {
        state.childrenShowMap = { ...state.childrenShowMap, [node.data.id]: true };
    }
};
</script>

<template>
    <div class="dashboard-folder-tree">
        <div class="tree-header">
            <div class="left-part">
                <p-checkbox v-model="state.isAllSelected"
                            :indeterminate="state.isIndeterminate"
                            class="tree-checkbox"
                            @change="handleChangeAllSelected"
                />
                <span>{{ $t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME') }}</span>
            </div>
            <div class="right-part">
                <p-icon-button v-for="controlButton in state.controlButtons"
                               :key="`control-button-${controlButton.name}`"
                               :name="controlButton.icon"
                               size="sm"
                               @click="controlButton.clickEvent"
                />
            </div>
        </div>
        <div v-for="treeData in state.dashboardTreeData"
             :key="`${treeData.data.id}-${treeData.data.type}`"
             class="tree-content-wrapper"
        >
            <div class="folder-row-wrapper">
                <p-checkbox :selected="state.selectedMap[treeData.data.id]"
                            :indeterminate="isIndeterminate(treeData)"
                            @change="handleSelectTreeItem(treeData, $event)"
                />
                <p-i v-if="treeData.children?.length"
                     :name="state.childrenShowMap[treeData.data.id] ? 'ic_chevron-down' : 'ic_chevron-right'"
                     width="1rem"
                     height="1rem"
                     color="gray[600]"
                     @click="handleClickCollapseButton(treeData)"
                />
                <dashboard-folder-tree-item :tree-data="treeData"
                                            @toggle-folder="handleClickCollapseButton(treeData)"
                />
            </div>
            <template v-if="state.childrenShowMap[treeData.data.id]">
                <div v-for="child in treeData.children"
                     :key="`${child.data.id}-${child.data.type}`"
                     class="folder-row-wrapper"
                >
                    <p-checkbox :selected="state.selectedMap[child.data.id]"
                                @change="handleSelectTreeItem(child, $event)"
                    />
                    <dashboard-folder-tree-item :tree-data="child" />
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-folder-tree {
    @apply bg-white rounded-md border border-gray-200;
    .tree-header {
        @apply border-b-2 border-gray-200 text-label-md rounded-t-md;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-weight: 700;
        padding: 0.6rem 0.5rem;
    }
    .tree-checkbox {
        padding-right: 0.5rem;
    }
    .tree-content-wrapper {
        &:last-child {
            .folder-row-wrapper {
                @apply border-0;
            }
        }
    }
    .folder-row-wrapper {
        @apply flex items-center border-b border-gray-200;
        padding: 0 0.5rem;
        cursor: pointer;
        &:hover {
            @apply bg-blue-100;
        }
    }
}
</style>
