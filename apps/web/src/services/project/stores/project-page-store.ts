import { computed, reactive } from 'vue';

import type { TreeNode } from '@spaceone/design-system/types/data-display/tree/type';
import { reverse } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupCreateParameters } from '@/schema/identity/project-group/api-verbs/create';
import type { ProjectGroupDeleteParameters } from '@/schema/identity/project-group/api-verbs/delete';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupUpdateParameters } from '@/schema/identity/project-group/api-verbs/update';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import type { ProjectCreateParameters } from '@/schema/identity/project/api-verbs/create';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectTree } from '@/services/project/composables/use-project-tree';
import type {
    ProjectGroupTreeNodeData, ProjectTreeNodeData, ProjectGroupTreeItem, ProjectTreeRoot,
} from '@/services/project/types/project-tree-type';


const projectTreeHelper = useProjectTree();
export const useProjectPageStore = defineStore('project-page', () => {
    const state = reactive({
        isInitiated: false as boolean,
        searchText: undefined as string|undefined,
        rootNode: null as ProjectTreeRoot|null,
        selectedItem: {} as ProjectGroupTreeItem,
        treeEditMode: false as boolean,
        permissionInfo: {} as Record<string, boolean>,
        hasProjectGroup: undefined as boolean|undefined,
        projectCount: undefined as number|undefined,
        actionTargetItem: {} as ProjectGroupTreeItem,
        //
        projectGroupFormVisible: false as boolean,
        projectGroupFormUpdateMode: false as boolean,
        projectGroupDeleteCheckModalVisible: false as boolean,
        projectCreateModalVisible: false as boolean,
        projectUpdateModalVisible: false as boolean,
        shouldUpdateProjectList: false as boolean,
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
                return reverse(parentItems);
            }
            return [];
        }),
    });

    /* mutation */
    const setShouldUpdateProjectList = (val?: boolean) => {
        state.shouldUpdateProjectList = !!val;
    };
    const setProjectCreateModalVisible = (val?: boolean) => {
        state.projectCreateModalVisible = !!val;
    };
    const setProjectUpdateModalVisible = (val?: boolean) => {
        state.projectUpdateModalVisible = !!val;
    };
    const setProjectGroupDeleteCheckModalVisible = (val?: boolean) => {
        state.projectGroupDeleteCheckModalVisible = !!val;
    };
    const setProjectGroupFormVisible = (val?: boolean) => {
        state.projectGroupFormVisible = !!val;
    };
    const setTreeEditMode = (val?: boolean) => {
        state.treeEditMode = !!val;
    };
    const setIsInitiated = (val?: boolean) => {
        state.isInitiated = !!val;
    };
    const setSelectedItem = (item: ProjectGroupTreeItem) => {
        state.selectedItem = item;
    };
    const setProjectCount = (count?: number) => {
        state.projectCount = count || 0;
    };
    const setRootNode = (root: ProjectTreeRoot) => {
        state.rootNode = root;
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
    const openProjectGroupFormModal = (target: ProjectGroupTreeItem = {}, isUpdateMode?: boolean) => {
        state.actionTargetItem = target;
        state.projectGroupFormUpdateMode = !!isUpdateMode;
        state.projectGroupFormVisible = true;
    };
    const openProjectGroupDeleteCheckModal = (target: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = target;
        state.projectGroupDeleteCheckModalVisible = true;
    };
    const openProjectCreateModal = (target: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = target;
        state.projectCreateModalVisible = true;
    };
    const getPermissionInfo = async (ids: string[]): Promise<Record<string, boolean>> => {
        const permissionApiQueryHelper = new ApiQueryHelper();

        const permissionInfo = {};

        try {
            permissionApiQueryHelper.setOnly('project_group_id')
                .setFilters([{ k: 'project_group_id', v: ids }]);

            const { results } = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>({
                domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
                query: permissionApiQueryHelper.data,
            });

            results?.forEach((d) => {
                permissionInfo[d.project_group_id] = true;
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        }
        return permissionInfo;
    };
    const refreshPermissionInfo = async (ids?: string[]): Promise<void> => {
        let refreshPermissionInfoLoading;
        if (refreshPermissionInfoLoading) return;

        const projectGroupIds = ids || Object.keys(state.permissionInfo);
        if (!projectGroupIds.length) return;

        refreshPermissionInfoLoading = true;

        try {
            const permissionInfo = await getPermissionInfo(projectGroupIds);

            if (ids) pushPermissionInfo(permissionInfo);
            else state.permissionInfo = permissionInfo;
        } catch (e) {
            ErrorHandler.handleError(e);
        } finally {
            refreshPermissionInfoLoading = false;
        }
    };
    const addPermissionInfo = async (ids: string[]): Promise<void> => {
        let addPermissionInfoLoading;
        if (addPermissionInfoLoading) return;

        const projectGroupIds = ids.filter((id) => state.permissionInfo[id] === undefined);
        if (!projectGroupIds.length) return;

        addPermissionInfoLoading = true;

        try {
            const permissionInfo = await getPermissionInfo(projectGroupIds);
            pushPermissionInfo(permissionInfo);
        } catch (e) {
            ErrorHandler.handleError(e);
        } finally {
            addPermissionInfoLoading = false;
        }
    };
    const pushPermissionInfo = (permissionInfo: Record<string, boolean>) => {
        state.permissionInfo = { ...state.permissionInfo, ...permissionInfo };
    };
    const reset = () => {
        state.isInitiated = false;
        state.searchText = undefined;
        state.rootNode = null;
        state.selectedItem = {};
        state.treeEditMode = false;
        state.permissionInfo = {};
        state.hasProjectGroup = undefined;
        state.projectCount = undefined;
        state.actionTargetItem = {};
        state.projectGroupFormVisible = false;
        state.projectGroupFormUpdateMode = false;
        state.projectGroupDeleteCheckModalVisible = false;
        state.projectCreateModalVisible = false;
        state.projectUpdateModalVisible = false;
        state.shouldUpdateProjectList = false;
    };

    /* Project Group */
    const createProjectGroup = async (params: ProjectGroupCreateParameters) => {
        try {
            const _params: ProjectGroupCreateParameters = {
                ...params,
                domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
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
            state.permissionInfo = { ...state.permissionInfo, [res.project_group_id]: true };
            pushPermissionInfo({ [res.project_group_id]: true });
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
                domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
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
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
            project_group_id: getters.actionTargetNodeData.id,
        });

        state.rootNode.deleteNodeByPath(getters.actionTargetNodePath);
        // fetch data to update has child info
        const targetNode = state.rootNode.getNodeByPath(getters.actionTargetNodePath);
        await state.rootNode.fetchData(targetNode);

        state.actionTargetItem = {};
    };

    /* Project */
    const createProject = async (params: ProjectCreateParameters): Promise<ProjectModel|undefined> => {
        try {
            const res = await SpaceConnector.clientV2.identity.project.create<ProjectCreateParameters, ProjectModel>({
                ...params,
                domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
            });
            showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
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

                pushPermissionInfo({ [res.project_id]: true });
            }
            return res;
        } catch (e: any) {
            ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
            throw new Error(e);
        }
    };

    const mutations = {
        setShouldUpdateProjectList,
        setProjectCreateModalVisible,
        setProjectUpdateModalVisible,
        setProjectGroupDeleteCheckModalVisible,
        setProjectGroupFormVisible,
        setTreeEditMode,
        setIsInitiated,
        setSelectedItem,
        setProjectCount,
        setRootNode,
    };
    const actions = {
        reset,
        selectNode,
        openProjectGroupFormModal,
        openProjectGroupDeleteCheckModal,
        createProjectGroup,
        updateProjectGroup,
        deleteProjectGroup,
        createProject,
        refreshPermissionInfo,
        addPermissionInfo,
        openProjectCreateModal,
        pushPermissionInfo,
        getPermissionInfo,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
