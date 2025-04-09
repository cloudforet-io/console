<script setup lang="ts">

import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual } from 'lodash';

import { PI, PTreeView } from '@cloudforet/mirinae';
import type { TreeData, TreeDisplayMap, TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { indigo, peacock } from '@/styles/colors';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectTreeStore } from '@/services/project/v1/stores/project-tree-store';

interface ProjectDataType extends TreeData {
    name: string;
    type: 'PROJECT'|'PROJECT_GROUP';
    id: string;
    parentGroupId?: string;
}

const route = useRoute();
const gnbStore = useGnbStore();

const allReferenceStore = useAllReferenceStore();
const projectTreeStore = useProjectTreeStore();
const projectTreeState = projectTreeStore.state;

const storeState = reactive({
    projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    treeDisplayMap: computed(() => projectTreeState.treeDisplayMap),
});

const state = reactive({
    currentParentPathIds: [] as string[],
    projectGroupNavigation: computed<Breadcrumb[]>(() => {
        const allPaths = state.currentParentPathIds.map((id) => ({
            name: storeState.projectGroup[id].name,
            to: {
                name: PROJECT_ROUTE_V1._NAME,
                params: {
                    projectGroupId: id,
                },
            },
        }));
        return [{ name: i18n.t('MENU.PROJECT'), to: { name: PROJECT_ROUTE_V1._NAME } }, ...allPaths];
    }),
    selectedTreeId: undefined as string|undefined,
    projectTreeData: computed<TreeNode<ProjectDataType>[]>(() => {
        const nodes: Record<string, TreeNode<ProjectDataType>> = {};
        Object.keys(storeState.projectGroup).forEach((key) => {
            const projectGroup = storeState.projectGroup[key];
            nodes[key] = {
                id: key,
                depth: 0,
                data: {
                    name: projectGroup.name,
                    type: 'PROJECT_GROUP',
                    id: key,
                    parentGroupId: projectGroup.data.parentGroupInfo?.id,
                    to: {
                        name: PROJECT_ROUTE_V1._NAME,
                        params: {
                            projectGroupId: key,
                        },
                    },
                },
                children: [],
            };
        });
        Object.keys(storeState.project).forEach((key) => {
            const project = storeState.project[key];
            nodes[key] = {
                id: key,
                depth: 0,
                data: {
                    name: project.name,
                    type: 'PROJECT',
                    id: key,
                    parentGroupId: project.data.groupInfo?.id,
                    to: {
                        name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
                        params: {
                            id: key,
                        },
                    },
                },
            };
        });

        const rootNodes: TreeNode<ProjectDataType>[] = [];
        Object.values(nodes).forEach((node) => {
            const parentGroupId = node.data?.parentGroupId;
            if (!parentGroupId) {
                rootNodes.push(node);
            } else {
                const parentNode = nodes[parentGroupId];
                if (parentNode) {
                    parentNode.children = parentNode.children || [];
                    parentNode.children.push(node);
                }
            }
        });

        const visited = new Set();
        const setDepth = (node: TreeNode<ProjectDataType>, depth: number) => {
            if (visited.has(node.id)) return;
            visited.add(node.id);

            node.depth = depth;
            if (!node.children) return;
            node.children.forEach((child) => {
                setDepth(child, depth + 1);
            });
        };
        rootNodes.forEach((node) => setDepth(node, 0));

        return rootNodes;
    }),
});

/* Event */
const handleUpdateTreeDisplayMap = (treeDisplayMap: TreeDisplayMap) => {
    if (isEqual(treeDisplayMap, storeState.treeDisplayMap)) return;
    projectTreeStore.setTreeDisplayMap(treeDisplayMap);
};

/* Helper */
const updateTreeDisplayMap = (selectedTreeId: string) => {
    const displayMap = { ...storeState.treeDisplayMap };
    const parentPathIds: string[] = [];
    let currentId = selectedTreeId;

    while (currentId) {
        displayMap[currentId] = { isOpen: true };
        parentPathIds.unshift(currentId);
        const currentNode = storeState.projectGroup[currentId] || storeState.project[currentId];
        if (currentNode?.data?.parentGroupInfo?.id) {
            currentId = currentNode.data.parentGroupInfo.id;
        } else if (currentNode?.data?.groupInfo?.id) {
            currentId = currentNode.data?.groupInfo.id;
        } else {
            break;
        }
    }

    state.currentParentPathIds = parentPathIds;
    projectTreeStore.setTreeDisplayMap(displayMap);
};



onMounted(() => {
    const selectedProjectGroupId = route.params.projectGroupId as string|undefined;
    const selectedProjectId = route.params.id as string|undefined;
    if (selectedProjectGroupId) {
        state.selectedTreeId = selectedProjectGroupId as string;
        updateTreeDisplayMap(selectedProjectGroupId);
    }
    if (selectedProjectId) {
        state.selectedTreeId = selectedProjectId as string;
        const parentGroupId = storeState.project[selectedProjectId]?.data.groupInfo?.id;
        if (parentGroupId) updateTreeDisplayMap(parentGroupId);
    }
});

watch(() => route.params, ({ id, projectGroupId }) => {
    if (projectGroupId) {
        state.selectedTreeId = projectGroupId as string;
        updateTreeDisplayMap(projectGroupId);
    }
    if (id) {
        state.selectedTreeId = id as string;
        const parentGroupId = storeState.project[id]?.data.groupInfo?.id;
        if (parentGroupId) updateTreeDisplayMap(parentGroupId);
    }
});
watch(() => state.projectGroupNavigation, async (projectGroupNavigation) => {
    gnbStore.setBreadcrumbs(projectGroupNavigation);
});


</script>

<template>
    <div class="project-main-tree">
        <p-tree-view :tree-data="state.projectTreeData"
                     :tree-display-map="storeState.treeDisplayMap"
                     :selected-id="state.selectedTreeId"
                     use-default-indent
                     @update:tree-display-map="handleUpdateTreeDisplayMap"
        >
            <template #content="{ node }">
                <div class="project-menu-item-content">
                    <div class="contents-wrapper">
                        <p-i class="project-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder-filled' : 'ic_document-filled'"
                             :color="Array.isArray(node.children) ? indigo[500] : peacock[600]"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <span class="text">{{ node.data.name }}</span>
                    </div>
                    <favorite-button :item-id="node.id"
                                     :favorite-type="Array.isArray(node.children) ? FAVORITE_TYPE.PROJECT_GROUP : FAVORITE_TYPE.PROJECT"
                                     scale="0.8"
                                     class="favorite-button"
                    />
                </div>
            </template>
        </p-tree-view>
    </div>
</template>

<style scoped lang="postcss">
.project-main-tree {
    width: 100%;
    .project-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .contents-wrapper {
            @apply flex items-center gap-1 w-full;

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
