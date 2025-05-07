<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PI, PTreeView } from '@cloudforet/mirinae';
import type { TreeNode, TreeDisplayMap } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { getDashboardTreeData } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



interface Props {
    dashboards: DashboardModel[];
    folders: FolderModel[];
    type: 'PRIVATE' | 'PUBLIC';
    selected: string|undefined;
}
const props = withDefaults(defineProps<Props>(), {
    dashboards: () => ([]),
    type: 'PUBLIC',
    selected: undefined,
});
const emit = defineEmits<{e: 'update:selected', value: string|undefined}>();


const state = reactive({
    currentParentPathIds: [] as string[],
    currentFolderId: undefined as string|undefined,
    treeDisplayMap: {} as TreeDisplayMap,
    dashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(props.folders, props.dashboards)),
    proxySelected: useProxyValue<string|undefined>('selected', props, emit),
});

/* Util */
const updateTreeDisplayMap = (selectedTreeId: string) => {
    state.treeDisplayMap[selectedTreeId] = { isOpen: !state.treeDisplayMap[selectedTreeId]?.isOpen };
    state.currentFolderId = selectedTreeId;
    state.treeDisplayMap = { ...state.treeDisplayMap };
};

/* Event */
const handleClickTreeItem = (node: TreeNode<DashboardTreeDataType>) => {
    if (node.data.type === 'FOLDER') {
        updateTreeDisplayMap(node.data.id);
        return;
    }
    state.proxySelected = node.data.id;
};

</script>

<template>
    <div class="project-main-tree">
        <p-tree-view :tree-data="state.dashboardTreeData"
                     :tree-display-map="state.treeDisplayMap"
                     :selected-id="state.proxySelected"
                     use-default-indent
        >
            <template #content="{ node }">
                <div class="dashboard-menu-item-content"
                     @click="handleClickTreeItem(node)"
                >
                    <div class="contents-wrapper">
                        <p-i class="dashboard-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder' : 'ic_service_dashboard'"
                             :color="gray[600]"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <span class="text">{{ node.data.name }}</span>
                    </div>
                </div>
            </template>
        </p-tree-view>
    </div>
</template>

<style scoped lang="postcss">
.project-main-tree {
    width: 100%;
    overflow-y: auto;
    .dashboard-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .contents-wrapper {
            @apply flex items-center gap-1 w-full;

            .dashboard-icon {
                min-width: 0.875rem;
            }
            .text {
                @apply text-label-md text-gray-900;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
</style>
