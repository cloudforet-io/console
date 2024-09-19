<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PI, PCheckbox, PIconButton,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import DashboardFolderTreeItem from '@/services/dashboards/components/dashboard-folder/DashboardFolderTreeItem.vue';
import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';


interface Props {
    type: 'PUBLIC' | 'PRIVATE';
}
const props = withDefaults(defineProps<Props>(), {
    type: 'PUBLIC',
});
const dashboardStore = useDashboardStore();
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const dashboardMainPageGetters = dashboardMainPageStore.getters;
const state = reactive({
    isAllSelected: computed(() => {
        let _isAllSelected = true;
        state.dashboardTreeData.forEach((node) => {
            if (!dashboardMainPageState.selectedIdMap[node.data.id]) _isAllSelected = false;
        });
        return _isAllSelected;
    }),
    isIndeterminate: computed<boolean>(() => {
        if (state.isAllSelected) return false;
        return Object.values(dashboardMainPageState.selectedIdMap).some((v) => v);
    }),
    dashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (props.type === 'PUBLIC') {
            return dashboardMainPageGetters.publicDashboardTreeData;
        }
        return dashboardMainPageGetters.privateDashboardTreeData;
    }),
    childrenShowMap: {} as Record<string, boolean>,
    controlButtons: computed(() => ([
        {
            name: 'clone',
            icon: 'ic_clone',
            clickEvent: handleClickCloneButton,
        },
        {
            name: 'move',
            icon: 'ic_move',
            clickEvent: handleClickMoveButton,
        },
        {
            name: 'delete',
            icon: 'ic_delete',
            clickEvent: handleClickDeleteButton,
        },
        {
            name: 'refresh',
            icon: 'ic_refresh',
            clickEvent: handleClickRefreshButton,
        },
    ])),
});

/* Util */
const isIndeterminate = (node: TreeNode<DashboardTreeDataType>): boolean => {
    if (node.data.type === 'DASHBOARD' || !node.children) return false;
    if (node.children.length === 0) return false;
    // check all children are selected
    if (node.children.every((child) => dashboardMainPageState.selectedIdMap[child.id])) return false;
    return node.children.some((child) => dashboardMainPageState.selectedIdMap[child.id]);
};

/* Event */
const handleChangeAllSelected = (value: boolean) => {
    if (!value) {
        dashboardMainPageStore.setSelectedIdMap({});
    } else {
        state.dashboardTreeData.forEach((node) => {
            dashboardMainPageStore.setSelectedIdMap({
                ...dashboardMainPageState.selectedIdMap,
                [node.data.id]: true,
            });
            if (node.data.type === 'FOLDER') {
                node.children?.forEach((child) => {
                    dashboardMainPageStore.setSelectedIdMap({
                        ...dashboardMainPageState.selectedIdMap,
                        [child.id]: true,
                    });
                });
            }
        });
    }
};
const handleSelectTreeItem = (node: TreeNode<DashboardTreeDataType>, value: [boolean]) => {
    const _isSelected = value[0];
    dashboardMainPageStore.setSelectedIdMap({
        ...dashboardMainPageState.selectedIdMap,
        [node.data.id]: _isSelected,
    });
    if (node.data.type === 'FOLDER') {
        if (node.children) {
            node.children.forEach((child) => {
                dashboardMainPageStore.setSelectedIdMap({
                    ...dashboardMainPageState.selectedIdMap,
                    [child.id]: _isSelected,
                });
            });
        }
    } else if (node.data.folderId) {
        if (_isSelected) {
            dashboardMainPageStore.setSelectedIdMap({
                ...dashboardMainPageState.selectedIdMap,
                [node.data.folderId]: true,
            });
        } else {
            const _folderNode = state.dashboardTreeData.find((n) => n.data.id === node.data.folderId);
            if (_folderNode?.children?.every((child) => !dashboardMainPageState.selectedIdMap[child.id])) {
                dashboardMainPageStore.setSelectedIdMap({
                    ...dashboardMainPageState.selectedIdMap,
                    [node.data.folderId]: false,
                });
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
const handleClickRefreshButton = () => {
    dashboardStore.load();
};
const handleClickDeleteButton = () => {
    dashboardMainPageStore.setFolderDeleteModalVisible(true);
};
const handleClickMoveButton = () => {
    dashboardMainPageStore.setFolderMoveModalVisible(true);
};
const handleClickCloneButton = () => {
    dashboardMainPageStore.setFolderCloneModalVisible(true);
};
</script>

<template>
    <div class="dashboard-folder-tree">
        <div class="tree-header">
            <div class="left-part">
                <p-checkbox :selected="state.isAllSelected"
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
                <p-checkbox :selected="dashboardMainPageState.selectedIdMap[treeData.data.id]"
                            :indeterminate="isIndeterminate(treeData)"
                            @change="handleSelectTreeItem(treeData, $event)"
                />
                <p-i v-if="treeData.data.type === 'FOLDER'"
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
                    <p-checkbox :selected="dashboardMainPageState.selectedIdMap[child.data.id]"
                                @change="handleSelectTreeItem(child, $event)"
                    />
                    <dashboard-folder-tree-item :tree-data="child" />
                </div>
                <div v-if="!treeData.children?.length"
                     class="folder-row-wrapper no-dashboard"
                >
                    <span>{{ $t('DASHBOARDS.ALL_DASHBOARDS.NO_DASHBOARD') }}</span>
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
        &.no-dashboard {
            @apply text-paragraph-md text-gray-300;
            padding: 0.5rem 0.5rem 0.5rem 2.875rem;
        }
    }
}
</style>
