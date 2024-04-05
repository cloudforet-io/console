<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI } from '@spaceone/design-system';

import { indigo, peacock } from '@/styles/colors';

import TreeView from '@/services/project/tree/TreeView.vue';
import type { TreeNode } from '@/services/project/tree/type';
import { useProjectTreeData } from '@/services/project/tree/use-project-tree-data';

const {
    treeData,
    treeDisplayMap,
    fetchData,
    setSelectedNodeId,
} = useProjectTreeData();

const route = useRoute();


const state = reactive({
    projectTreeData: computed<TreeNode[]>(() => treeData.value),
    selectedTreeId: undefined as string|undefined,
});

watch(route, () => {
    const selectedTreeId = (route.query.select_pg || route.params.id) as string|undefined;
    if (selectedTreeId) {
        state.selectedTreeId = selectedTreeId as string;
        setSelectedNodeId(selectedTreeId);
    }
}, { immediate: true });

</script>

<template>
    <div class="project-main-tree">
        <tree-view :tree-data="state.projectTreeData"
                   :initial-tree-display-map="treeDisplayMap"
                   :selected-id="state.selectedTreeId"
                   @click-toggle="fetchData"
        >
            <template #content="{ node }">
                <div class="project-menu-item-content">
                    <p-i class="project-icon"
                         :name="Array.isArray(node.children) ? 'ic_folder-filled' : 'ic_document-filled'"
                         :color="Array.isArray(node.children) ? indigo[500] : peacock[600]"
                         width="0.875rem"
                         height="0.875rem"
                    />
                    <span class="text">{{ node.data.name }}</span>
                </div>
            </template>
        </tree-view>
    </div>
</template>

<style scoped lang="postcss">
.project-main-tree {
    width: 100%;
    .project-menu-item-content {
        @apply flex items-center gap-1 w-full;
        height: 2rem;
        .project-icon {
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
</style>
