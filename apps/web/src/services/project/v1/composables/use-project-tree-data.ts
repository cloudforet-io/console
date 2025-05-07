import type { Ref } from 'vue';
import {
    computed,
    nextTick, onMounted, reactive, toRef, watch,
} from 'vue';
import type { Location } from 'vue-router';

import { get } from 'lodash';

import type { TreeDisplayMap, TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectTreeStore } from '@/services/project/v1/stores/project-tree-store';

interface ParentGroupItem {
    name: string;
    id: string;
}

interface UseProjectTreeDataReturnType {
    treeData: Ref<TreeNode[]>;
    treeDisplayMap: Ref<TreeDisplayMap>;
    parentGroupItems: Ref<ParentGroupItem[]>;
    fetchData: (item: TreeNode) => void;
    setSelectedNodeId: (id: string) => void;
}

interface ProjectDataType {
    name: string;
    type: 'PROJECT'|'PROJECT_GROUP';
    id: string;
    parentGroupId?: string;
}

export const useProjectTreeData = (): UseProjectTreeDataReturnType => {
    const allReferenceStore = useAllReferenceStore();
    const projectTreeStore = useProjectTreeStore();
    const projectTreeState = projectTreeStore.state;

    const storeState = reactive({
        projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
        project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    });
    const state = reactive({
        projectData: computed<ProjectDataType[]>(() => Object.entries(storeState.project).map(([key, value]) => ({
            name: value.name,
            type: 'PROJECT',
            id: key,
            parentGroupId: value.data.groupInfo?.id,
        }))),
        projectGroupData: computed<ProjectDataType[]>(() => Object.entries(storeState.projectGroup).map(([key, value]) => ({
            name: value.name,
            type: 'PROJECT_GROUP',
            id: key,
            parentGroupId: value.data.parentGroupInfo?.id,
        }))),
        treeData: [] as TreeNode[],
        selectedTreeNodeId: '',
        parentGroupItems: [] as ParentGroupItem[],
    });
    const fetchProjectGroupList = (parentGroupId?: string): ProjectDataType[] => state.projectGroupData.filter((projectGroup) => projectGroup.parentGroupId === parentGroupId);
    const fetchProjectList = (parentGroupId?: string): ProjectDataType[] => state.projectData.filter((project) => project.parentGroupId === parentGroupId);


    const updateTreeData = (nodes: TreeNode[], targetId: string, children?: TreeNode[], loading?: boolean): TreeNode[] => nodes.map((node) => {
        if (node.data.id === targetId) {
            if (children) {
                node.children = children;
            }
            if (loading !== undefined) {
                node.loading = loading;
            }
        } else if (node.children) {
            node.children = updateTreeData(node.children, targetId, children, loading);
        }
        return node;
    });


    /* Method */
    const fetchData = (item: TreeNode) => {
        const projectGroupId = item.data.id;
        if (!projectGroupId) return;

        state.treeData = updateTreeData(state.treeData, projectGroupId, undefined, true);

        const childrenGroups = fetchProjectGroupList(projectGroupId);
        const childrenProjects = fetchProjectList(projectGroupId);

        state.treeData = updateTreeData(state.treeData, projectGroupId, convertItemsToTreeData([...childrenGroups, ...childrenProjects], item.depth + 1), false);
    };

    const findSelectedNode = async (itemId: string, itemType: ProjectDataType['type']) => {
        const openPaths = await getParentItem(itemId, itemType);
        openPaths.map(async (path) => {
            if (path === itemId) return;
            await setOpenStateById(path);
        });

        // Set parent group paths, when selecting current group item. For breadcrumbs
        state.parentGroupItems = openPaths.map((id) => ({
            name: storeState.projectGroup[id].name,
            id,
        }));
    };

    const setSelectedNodeId = (id: string) => {
        state.selectedTreeNodeId = id;
    };


    /* Helper */
    const convertItemsToTreeData = (items: ProjectDataType[], depth: number): TreeNode[] => items.map((item) => ({
        id: item.id,
        depth,
        isOpen: false,
        data: {
            ...item,
            to: convertProjectTreeNodeToLocation(item),
        },
        children: item.type === 'PROJECT' ? undefined : convertItemsToTreeData([], depth + 1),
    }));
    const convertProjectTreeNodeToLocation = (item: ProjectDataType): Location => (item.type === 'PROJECT' ? {
        name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
        params: {
            id: item.id,
        },
    } : {
        name: PROJECT_ROUTE_V1._NAME,
        params: {
            projectGroupId: item.id,
        },
    });
    const setOpenStateById = async (nodeId: string) => {
        projectTreeState.treeDisplayMap = {
            ...projectTreeState.treeDisplayMap,
            [nodeId]: {
                isOpen: true,
            },
        };
        await nextTick();
    };

    const getParentItem = async (itemId: string, itemType: ProjectDataType['type'], openItems: string[] = []): Promise<string[]> => {
        if (itemType === 'PROJECT') {
            const parentProjectInfo = state.projectData.find((project) => project.id === itemId);
            if (parentProjectInfo) openItems.unshift(parentProjectInfo.id);

            const parentItemId = get(parentProjectInfo, 'parentGroupId');
            if (parentItemId) await getParentItem(parentItemId, 'PROJECT_GROUP', openItems);
        } else {
            const parentProjectGroupInfo = state.projectGroupData.find((projectGroup) => projectGroup.id === itemId);
            if (parentProjectGroupInfo) openItems.unshift(parentProjectGroupInfo.id);

            const parentItemId = get(parentProjectGroupInfo, 'parentGroupId');
            if (parentItemId) await getParentItem(parentItemId, 'PROJECT_GROUP', openItems);
        }
        return openItems;
    };

    /* Init */
    const init = (): void => {
        const initialProjectGroup = fetchProjectGroupList();
        const initialProject = fetchProjectList();
        state.treeData = convertItemsToTreeData([...initialProjectGroup, ...initialProject], 0);
    };

    onMounted(async () => {
        await allReferenceStore.load('project_group');
        await allReferenceStore.load('project');
    });

    // Whenever loading, creating or changing Project/ProjectGroup, update initial treeData
    watch([() => storeState.projectGroup, () => storeState.project], () => {
        init();
    }, { immediate: true });

    watch([() => state.selectedTreeNodeId, () => state.treeData], async ([id]) => {
        const itemType = id.startsWith('pg-') ? 'PROJECT_GROUP' : 'PROJECT';
        await findSelectedNode(id, itemType);
    });

    return {
        treeData: toRef(state, 'treeData'),
        treeDisplayMap: toRef(projectTreeState, 'treeDisplayMap'),
        parentGroupItems: toRef(state, 'parentGroupItems'),
        fetchData,
        setSelectedNodeId,
    };
};
