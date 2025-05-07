import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/type';

import type { ProjectGroupCreateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/create';
import type { ProjectGroupDeleteParameters } from '@/api-clients/identity/project-group/schema/api-verbs/delete';
import type { ProjectGroupUpdateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/update';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import type { ProjectCreateParameters } from '@/api-clients/identity/project/schema/api-verbs/create';
import type { ProjectUpdateParameters } from '@/api-clients/identity/project/schema/api-verbs/udpate';
import type { ProjectUpdateProjectTypeParameters } from '@/api-clients/identity/project/schema/api-verbs/update-project-type';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type {
    ProjectGroupTreeItem, ProjectGroupTreeNodeData, ProjectTreeNodeData, ProjectTreeRoot,
} from '@/common/modules/project/project-tree-type';
import { useProjectTree } from '@/common/modules/project/use-project-tree';

const projectTreeHelper = useProjectTree();
export const useProjectPageStore = defineStore('page-project', () => {
    const authorizationStore = useAuthorizationStore();

    const _state = reactive({
        currentRoleType: computed(() => authorizationStore.state.currentRoleInfo?.roleType),
    });
    const state = reactive({
        projectTreeKey: getRandomId(),
        isInitiated: false as boolean,
        searchText: undefined as string|undefined,
        rootNode: null as ProjectTreeRoot|null,
        selectedItem: {} as ProjectGroupTreeItem,
        treeEditMode: false as boolean,
        hasProjectGroup: undefined as boolean|undefined,
        projectCount: undefined as number|undefined,
        actionTargetItem: {} as ProjectGroupTreeItem,
        //
        projectGroupFormVisible: false as boolean,
        projectGroupFormUpdateMode: false as boolean,
        projectDeleteModalVisible: false as boolean,
        projectFormModalVisible: false as boolean,
        projectGroupMoveModalVisible: false as boolean,
        shouldUpdateProjectList: false as boolean,
        // form
        currentSelectedProjectId: undefined as string|undefined,
        currentSelectedProjectGroupId: undefined as string|undefined,
        //
        isWorkspaceOwner: computed<boolean>(() => _state.currentRoleType === 'WORKSPACE_OWNER'),
    });

    const getters = reactive({
        selectedNodeData: computed<ProjectTreeNodeData|undefined>(() => (state.selectedItem.node ? { ...state.selectedItem.node.data } : undefined)),
        selectedNodePath: computed<number[]|undefined>(() => (state.selectedItem.path ? state.selectedItem.path : undefined)),
        groupId: computed<string|undefined>(() => getters.selectedNodeData?.id),
        groupName: computed<string|undefined>(() => (getters.selectedNodeData ? getters.selectedNodeData.name : undefined)),
        actionTargetNodeData: computed<ProjectTreeNodeData|undefined>(() => (state.actionTargetItem.node ? state.actionTargetItem.node.data : undefined)),
        actionTargetNodePath: computed<number[]|undefined>(() => (state.actionTargetItem.path ? state.actionTargetItem.path : undefined)),
        parentGroups: computed<ProjectGroupTreeNodeData[]>(() => {
            const tree = state.rootNode;
            const path = getters.selectedNodePath;
            if (tree && path) {
                const parentItems = path.reduce((parents, d, i) => {
                    if (i + 1 === path.length) return parents;

                    const parentPath = path.slice(0, i + 1);
                    try {
                        const parent = tree.getNodeByPath(parentPath);

                        if (parent) parents.push(parent.data);
                    } catch (e) {}

                    return parents;
                }, []);
                return parentItems;
            }
            return [];
        }),
    });

    /* mutation */
    const setShouldUpdateProjectList = (val?: boolean) => {
        state.shouldUpdateProjectList = !!val;
    };
    const setProjectFormModalVisible = (val?: boolean) => {
        state.projectFormModalVisible = !!val;
    };
    const setProjectGroupMoveModalVisible = (val?: boolean) => {
        state.projectGroupMoveModalVisible = !!val;
    };
    const setProjectDeleteModalVisible = (val?: boolean) => {
        state.projectDeleteModalVisible = !!val;
    };
    const setProjectGroupFormVisible = (val?: boolean) => {
        state.projectGroupFormVisible = !!val;
    };
    const setProjectGroupFormUpdateMode = (val?: boolean) => {
        state.projectGroupFormUpdateMode = !!val;
    };
    const setTreeEditMode = (val?: boolean) => {
        state.treeEditMode = !!val;
    };
    const setIsInitiated = (val?: boolean) => {
        state.isInitiated = !!val;
    };
    const setSelectedItem = (item?: ProjectGroupTreeItem) => {
        state.selectedItem = item || {};
    };
    const setProjectCount = (count?: number) => {
        state.projectCount = count || 0;
    };
    const setRootNode = (root?: ProjectTreeRoot) => {
        state.rootNode = root || null;
    };
    const setCurrentSelectedProjectId = (projectId?: string) => {
        state.currentSelectedProjectId = projectId;
    };
    const setCurrentSelectedProjectGroupId = (groupId?: string) => {
        state.currentSelectedProjectGroupId = groupId;
    };

    /* action */
    const selectNode = async (groupId?: string): Promise<TreeNode<ProjectTreeNodeData>|null> => {
        if (!groupId) {
            if (state.rootNode) {
                state.rootNode.resetSelect();
            }
            return null;
        }

        try {
            const res = await projectTreeHelper.getProjectTreeSearchPath({
                item_id: groupId,
                item_type: 'PROJECT_GROUP',
            });
            const paths = res.open_path || [];

            if (state.rootNode && paths.length) {
                const { node } = await state.rootNode.fetchAndFindNode(paths.map((d) => ((data) => data.id === d)));
                return node;
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }

        return null;
    };

    const openProjectFormModal = (target: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = target;
        state.projectFormModalVisible = true;
    };
    const reset = () => {
        state.isInitiated = false;
        state.searchText = undefined;
        state.rootNode = null;
        state.selectedItem = {};
        state.treeEditMode = false;
        state.hasProjectGroup = undefined;
        state.projectCount = undefined;
        state.actionTargetItem = {};
        state.projectGroupFormVisible = false;
        state.projectGroupFormUpdateMode = false;
        state.projectDeleteModalVisible = false;
        state.projectFormModalVisible = false;
        state.shouldUpdateProjectList = false;
    };

    /* Project Group */
    const createProjectGroup = async (params: ProjectGroupCreateParameters) => {
        try {
            const _params: ProjectGroupCreateParameters = {
                ...params,
            };
            if (getters.actionTargetNodeData) {
                _params.parent_group_id = getters.actionTargetNodeData.id;
            }
            const res: ProjectGroupModel = await SpaceConnector.clientV2.identity.projectGroup.create(_params);

            const newData: ProjectTreeNodeData = {
                ...params,
                id: res.project_group_id,
                item_type: 'PROJECT_GROUP',
                has_child: false,
            };
            if (state.rootNode) {
                if (getters.actionTargetNodeData) {
                    const targetNode = state.rootNode.getNodeByPath(getters.actionTargetNodePath);
                    // fetch child data to show children nodes
                    await state.rootNode.fetchData(targetNode);
                    state.rootNode.unfold(targetNode);
                    // update target node's has_children to show toggle even after toggle is folded
                    state.rootNode.updateNodeByPath(getters.actionTargetNodePath, { ...targetNode.data, has_child: true });
                    // update selected item to prevent the case that selected node is updated by fetchData
                    const selectedNode = state.rootNode.getNodeByPath(getters.selectedNodePath);
                    state.rootNode.changeSelectState(selectedNode, getters.selectedNodePath);
                } else {
                    state.rootNode.addNode(newData);
                }
            }
            state.hasProjectGroup = true;
        } catch (e: any) {
            ErrorHandler.handleError(e);
            throw new Error(e);
        } finally {
            state.actionTargetItem = {};
        }
    };
    const updateProjectGroup = async (params: Partial<ProjectGroupUpdateParameters>) => {
        if (!state.rootNode || !getters.actionTargetNodeData) return;

        try {
            await SpaceConnector.clientV2.identity.projectGroup.update<ProjectGroupUpdateParameters>({
                project_group_id: getters.actionTargetNodeData.id,
                ...params,
            });

            state.rootNode.updateNodeByPath(
                getters.actionTargetNodePath,
                { ...getters.actionTargetNodeData, ...params },
            );
        } catch (e: any) {
            ErrorHandler.handleError(e);
            throw e;
        } finally {
            state.actionTargetItem = {};
        }
    };
    const deleteProjectGroup = async () => {
        if (!state.rootNode || !getters.actionTargetNodeData) {
            throw new Error('No Target for deletion');
        }

        await SpaceConnector.clientV2.identity.projectGroup.delete<ProjectGroupDeleteParameters>({
            project_group_id: getters.actionTargetNodeData.id,
        });
        state.rootNode.deleteNodeByPath(getters.actionTargetNodePath);
        // fetch data to update has child info
        // HACK: disable below code because it causes error when getNodeByPath
        // const targetNode = state.rootNode.getNodeByPath(getters.actionTargetNodePath);
        // await state.rootNode.fetchData(targetNode);
        state.actionTargetItem = {};
    };

    /* Project */
    const createProject = async (params: ProjectCreateParameters): Promise<ProjectModel> => {
        const res = await SpaceConnector.clientV2.identity.project.create<ProjectCreateParameters, ProjectModel>({
            ...params,
        });
        state.shouldUpdateProjectList = true;

        if (state.treeEditMode) {
            const newData: ProjectTreeNodeData = {
                name: params.name,
                id: res.project_id,
                item_type: 'PROJECT',
                has_child: false,
            };
            if (state.rootNode) {
                if (getters.selectedNodeData) {
                    state.rootNode.addChildNodeByPath(getters.selectedNodePath, newData);
                }
            }
        }
        return res;
    };
    const updateProject = async (params: ProjectUpdateParameters): Promise<ProjectModel> => {
        const res = await SpaceConnector.clientV2.identity.project.update<ProjectUpdateParameters, ProjectModel>({
            ...params,
        });
        return res;
    };
    const updateProjectType = async (params: ProjectUpdateProjectTypeParameters): Promise<ProjectModel> => {
        const res = await SpaceConnector.clientV2.identity.project.updateProjectType<ProjectUpdateProjectTypeParameters, ProjectModel>({
            ...params,
        });
        return res;
    };

    const refreshProjectTreeKey = () => {
        state.projectTreeKey = getRandomId();
    };

    const mutations = {
        setShouldUpdateProjectList,
        setProjectFormModalVisible,
        setProjectGroupMoveModalVisible,
        setProjectDeleteModalVisible,
        setProjectGroupFormVisible,
        setTreeEditMode,
        setIsInitiated,
        setSelectedItem,
        setProjectCount,
        setRootNode,
        setCurrentSelectedProjectId,
        setCurrentSelectedProjectGroupId,
        setProjectGroupFormUpdateMode,
    };
    const actions = {
        reset,
        selectNode,
        createProjectGroup,
        updateProjectGroup,
        deleteProjectGroup,
        createProject,
        updateProject,
        updateProjectType,
        openProjectFormModal,
        refreshProjectTreeKey,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
