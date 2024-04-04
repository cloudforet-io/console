import type { Ref } from 'vue';
import {
    nextTick, onMounted, reactive, toRef,
} from 'vue';
import type { Location } from 'vue-router';

import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type { TreeNode, TreeOpenMap } from '@/services/project/tree/type';
import type { ProjectTreeItemType } from '@/services/project/types/project-tree-type';

type ProjectGroupListResponse = ListResponse<ProjectGroupModel>;
type ProjectListResponse = ListResponse<ProjectModel>;
interface UseProjectTreeDataReturnType {
    treeData: Ref<TreeNode[]>;
    treeUIMap: Ref<TreeOpenMap>;
    fetchData: (item: TreeNode) => Promise<void>;
    findSelectedNode: (itemId: string, itemType: string) => Promise<void>;
}

export const useProjectTreeData = (): UseProjectTreeDataReturnType => {
    const state = reactive({
        treeData: [] as TreeNode[],
        treeUIMap: {} as TreeOpenMap,
    });

    const updateTreeData = (nodes: TreeNode[], targetId: string, children?: TreeNode[], loading?: boolean): TreeNode[] => nodes.map((node) => {
        if (node.data.project_group_id === targetId) {
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
    const fetchData = async (item: TreeNode) => {
        const projectGroupId = item.data.project_group_id;
        if (!projectGroupId) return;

        state.treeData = updateTreeData(state.treeData, projectGroupId, undefined, true);

        try {
            const childrenGroups = await fetchProjectGroupList(projectGroupId);
            const childrenProjects = await fetchProjectList(projectGroupId);

            state.treeData = updateTreeData(state.treeData, projectGroupId, convertItemsToTreeData([...childrenGroups, ...childrenProjects], item.depth + 1), false);
        } catch (e) {
            console.error(e);
            state.treeData = updateTreeData(state.treeData, projectGroupId, undefined, false);
        }
    };

    const findSelectedNode = async (itemId: string, itemType: string) => {
        state.treeUIMap = {};
        const openPaths = await getParentItem(itemId, itemType);
        openPaths.map(async (path) => {
            if (path === itemId) return;
            await setOpenStateById(path);
        });
    };

    /* Fetcher */
    const fetchProjectGroupList = async (parent_group_id?: string): Promise<ProjectGroupModel[]> => {
        try {
            const requestParams: ProjectGroupListParameters = {
                query: {
                    minimal: true,
                    sort: [{ key: 'name', desc: false }],
                    filter: [{ k: 'parent_group_id', v: parent_group_id || null, o: 'eq' }],
                },
            };
            const { results } = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>(requestParams);
            return results || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const fetchProjectList = async (project_group_id?: string): Promise<ProjectModel[]> => {
        try {
            const requestParams: ProjectGroupListParameters = {
                query: {
                    minimal: true,
                    sort: [{ key: 'name', desc: false }],
                    filter: [{ k: 'project_group_id', v: project_group_id || null, o: 'eq' }],
                },
            };
            const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>(requestParams);
            return results || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const initProjectTreeData = async (): Promise<void> => {
        const initialProjectGroup = await fetchProjectGroupList();
        const initialProject = await fetchProjectList();
        state.treeData = convertItemsToTreeData([...initialProjectGroup, ...initialProject], 0);
    };


    /* Helper */
    const convertItemsToTreeData = (items: (ProjectGroupModel | ProjectModel)[], depth: number): TreeNode[] => items.map((item) => ({
        id: item.project_id || item.project_group_id,
        depth,
        isOpen: false,
        data: {
            ...item,
            to: convertProjectTreeNodeToLocation(item),
        },
        children: item?.project_id ? undefined : convertItemsToTreeData([], depth + 1),
    }));
    const convertProjectTreeNodeToLocation = (item: ProjectGroupModel | ProjectModel): Location => {
        const projectId = item?.project_id as string|undefined;
        const projectGroupLocation: Location = {
            name: PROJECT_ROUTE._NAME,
            query: {
                select_pg: item.project_group_id,
            },
        };
        const projectLocation: Location = {
            name: PROJECT_ROUTE.DETAIL._NAME,
            params: {
                id: item.project_id,
            },
        };
        return projectId ? projectLocation : projectGroupLocation;
    };

    const setOpenStateById = async (nodeId: string) => {
        state.treeUIMap = {
            ...state.treeUIMap,
            [nodeId]: {
                isOpen: true,
            },
        };
        await nextTick();
    };

    const getParentItem = async (itemId: string, itemType: ProjectTreeItemType, openItems: string[] = []): Promise<string[]> => {
        if (itemType === 'PROJECT') {
            const response = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ProjectListResponse>({
                project_id: itemId,
            });

            if (response.total_count === 1) {
                const projectInfo = response?.results?.[0];
                if (projectInfo) openItems.unshift(projectInfo.project_id);

                const parentItemId = get(projectInfo, 'project_group_id');
                if (parentItemId) await getParentItem(parentItemId, 'PROJECT_GROUP', openItems);
            }
        } else {
            const response = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ProjectGroupListResponse>({
                project_group_id: itemId,
            });

            if (response.total_count === 1) {
                const projectGroupInfo = response?.results?.[0];
                if (projectGroupInfo) openItems.unshift(projectGroupInfo.project_group_id);

                const parentItemId = get(projectGroupInfo, 'parent_group_id');
                if (parentItemId) await getParentItem(parentItemId, 'PROJECT_GROUP', openItems);
            }
        }
        return openItems;
    };

    onMounted(async () => {
        await initProjectTreeData();
    });

    return {
        treeData: toRef(state, 'treeData'),
        treeUIMap: toRef(state, 'treeUIMap'),
        fetchData,
        findSelectedNode,
    };
};
