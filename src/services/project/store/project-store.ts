import type { ComputedRef, UnwrapNestedRefs } from 'vue';
import { computed, reactive } from 'vue';

import type { TreeNode } from '@spaceone/design-system/types/data-display/tree/type';
import { reverse } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProjectPageState } from '@/services/project/store/type';
import type { ProjectGroup, ProjectItemResp, ProjectGroupTreeItem } from '@/services/project/type';

interface ProjectGroupInfo {parent_project_group_id?: string; name: string}
interface ProjectInfo {
    project_group_id: string;
    name: string;
}
interface ProjectPageStore {
    state: UnwrapNestedRefs<ProjectPageState>;
    getters: UnwrapNestedRefs<{
        selectedNodeData: ComputedRef<ProjectItemResp|undefined>;
        selectedNodePath: ComputedRef<number[]|undefined>;
        groupId: ComputedRef<string|undefined>;
        groupName: ComputedRef<string|undefined>;
        actionTargetNodeData: ComputedRef<ProjectItemResp|undefined>;
        actionTargetNodePath: ComputedRef<number[]|undefined>;
        parentGroups: ComputedRef<ProjectGroup[]>;
    }>;
    initRoot: (root: ProjectGroupTreeItem) => void;
    selectNode: (groupId?: string) => Promise<TreeNode<ProjectItemResp>|null>;
    openProjectGroupCreateForm: (target?: ProjectGroupTreeItem) => void;
    openProjectGroupUpdateForm: (target?: ProjectGroupTreeItem) => void;
    openProjectGroupDeleteCheckModal: (target?: ProjectGroupTreeItem) => void;
    createProjectGroup: (projectGroupInfo: ProjectGroupInfo) => Promise<void>;
    updateProjectGroup: (projectGroupInfo: ProjectGroupInfo) => Promise<void>;
    deleteProjectGroup: (projectGroupId: string) => Promise<void>;
    createProject: (projectInfo: ProjectInfo) => Promise<void>;
    refreshPermissionInfo: () => Promise<void>;
    addPermissionInfo: (permissionInfo: any) => void;
    openProjectCreateForm: (target?: ProjectGroupTreeItem) => void;
}

export const useProjectPageStore = defineStore('project-page', ():ProjectPageStore => {
    const state = reactive<ProjectPageState>({
        isInitiated: false,
        searchText: undefined,
        rootNode: null,
        selectedItem: {},
        treeEditMode: false,
        permissionInfo: {},
        hasProjectGroup: undefined,
        projectCount: undefined,
        actionTargetItem: {},
        projectGroupFormVisible: false,
        projectGroupFormUpdateMode: false,
        projectGroupDeleteCheckModalVisible: false,
        projectFormVisible: false,
        shouldUpdateProjectList: false,
    });

    // getter
    const getters = reactive({
        selectedNodeData: computed<ProjectItemResp|undefined>(() => (state.selectedItem.node ? state.selectedItem.node.data : undefined)),
        selectedNodePath: computed<number[]|undefined>(() => (state.selectedItem.path ? state.selectedItem.path : undefined)),
        groupId: computed<string|undefined>(() => (getters.selectedNodeData ? getters.selectedNodeData.id : undefined)),
        groupName: computed<string|undefined>(() => (getters.selectedNodeData ? getters.selectedNodeData.name : undefined)),
        actionTargetNodeData: computed<ProjectItemResp|undefined>(() => (state.actionTargetItem.node ? state.actionTargetItem.node.data : undefined)),
        actionTargetNodePath: computed<number[]|undefined>(() => (state.actionTargetItem.path ? state.actionTargetItem.path : undefined)),
        parentGroups: computed<ProjectGroup[]>(() => {
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

    const initRoot = (root) => {
        state.rootNode = root;
    };

    const selectNode = async (groupId?: string) => {
        if (!groupId) {
            if (state.rootNode) {
                state.rootNode.resetSelect();
            }
            return null;
        }

        try {
            const res = await SpaceConnector.client.identity.project.tree.search({
                item_id: groupId,
                item_type: 'PROJECT_GROUP',
            });
            const paths = res.open_path || [];

            if (state.rootNode) {
                const { node } = await state.rootNode.fetchAndFindNode(paths.map((d) => ((data) => data.id === d)));
                return node;
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }

        return null;
    };

    const openProjectGroupCreateForm = (target: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = target;
        state.projectGroupFormUpdateMode = false;
        state.projectGroupFormVisible = true;
    };

    const openProjectGroupUpdateForm = (target: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = target;
        state.projectGroupFormUpdateMode = true;
        state.projectGroupFormVisible = true;
    };

    const openProjectGroupDeleteCheckModal = (target: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = target;
        state.projectGroupDeleteCheckModalVisible = true;
    };


    const pushPermissionInfo = (permissionInfo) => {
        state.permissionInfo = { ...state.permissionInfo, ...permissionInfo };
    };
    const createProjectGroup = async (
        projectGroupInfo: ProjectGroupInfo,
    ) => {
        try {
            const params: ProjectGroupInfo = { ...projectGroupInfo };
            if (getters.actionTargetNodeData) {
                params.parent_project_group_id = getters.actionTargetNodeData.id;
            }
            const res = await SpaceConnector.client.identity.projectGroup.create(params);

            const newData: ProjectItemResp = {
                ...projectGroupInfo,
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

    const updateProjectGroup = async (
        projectGroupInfo: Partial<ProjectGroupInfo>,
    ) => {
        if (!state.rootNode || !getters.actionTargetNodeData) return;

        try {
            const params = {
                project_group_id: getters.actionTargetNodeData.id,
                ...projectGroupInfo,
            };

            await SpaceConnector.client.identity.projectGroup.update(params);

            state.rootNode.updateNodeByPath(
                getters.actionTargetNodePath,
                { ...getters.actionTargetNodeData, ...projectGroupInfo },
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

        await SpaceConnector.client.identity.projectGroup.delete({
            project_group_id: getters.actionTargetNodeData.id,
        });

        state.rootNode.deleteNodeByPath(getters.actionTargetNodePath);
        // fetch data to update has child info
        const targetNode = state.rootNode.getNodeByPath(getters.actionTargetNodePath);
        await state.rootNode.fetchData(targetNode);

        state.actionTargetItem = {};
    };

    const permissionApiQueryHelper = new ApiQueryHelper();
    const getPermissionInfo = async (ids: string[]): Promise<Record<string, boolean>> => {
        const permissionInfo = {};

        try {
            permissionApiQueryHelper.setOnly('project_group_id')
                .setFilters([{ k: 'project_group_id', v: ids }]);

            const { results } = await SpaceConnector.client.identity.projectGroup.list({
                query: permissionApiQueryHelper.data,
                author_within: true,
            });

            results.forEach((d) => {
                permissionInfo[d.project_group_id] = true;
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        }
        return permissionInfo;
    };

    const createProject = async (
        projectInfo: ProjectInfo,
    ) => {
        try {
            const res = await SpaceConnector.client.identity.project.create({
                ...projectInfo,
            });
            showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
            state.shouldUpdateProjectList = true;

            if (state.treeEditMode) {
                const newData: ProjectItemResp = {
                    name: projectInfo.name,
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
        } catch (e: any) {
            ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
            throw new Error(e);
        }
    };

    let refreshPermissionInfoLoading;
    const refreshPermissionInfo = async (ids?: string[]): Promise<void> => {
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

    let addPermissionInfoLoading;
    const addPermissionInfo = async (ids: string[]): Promise<void> => {
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

    const openProjectCreateForm = (projectGroup: ProjectGroupTreeItem = {}) => {
        state.actionTargetItem = projectGroup;
        state.projectFormVisible = true;
    };



    return {
        state,
        getters,
        // actions
        initRoot,
        selectNode,
        openProjectGroupCreateForm,
        openProjectGroupUpdateForm,
        openProjectGroupDeleteCheckModal,
        createProjectGroup,
        updateProjectGroup,
        deleteProjectGroup,
        createProject,
        refreshPermissionInfo,
        addPermissionInfo,
        openProjectCreateForm,
    };
});
