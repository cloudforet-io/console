import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProjectPageState } from '@/services/project/store/type';
import type { ProjectGroupTreeItem, ProjectItemResp } from '@/services/project/type';

export const initRoot: Action<ProjectPageState, any> = ({ commit }, root) => {
    commit('setRootNode', root);
};

export const selectNode: Action<ProjectPageState, any> = async ({ state }, groupId?: string) => {
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

export const openProjectGroupCreateForm: Action<ProjectPageState, any> = ({ commit }, target: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', target);
    commit('setProjectGroupFormUpdateMode', false);
    commit('setProjectGroupFormVisible', true);
};

export const openProjectGroupUpdateForm: Action<ProjectPageState, any> = ({ commit }, target: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', target);
    commit('setProjectGroupFormUpdateMode', true);
    commit('setProjectGroupFormVisible', true);
};

export const openProjectGroupDeleteCheckModal: Action<ProjectPageState, any> = ({ commit }, target: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', target);
    commit('setProjectGroupDeleteCheckModalVisible', true);
};

interface ProjectGroupInfo {parent_project_group_id?: string; name: string}

export const createProjectGroup: Action<ProjectPageState, any> = async (
    { state, commit, getters },
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

        commit('addPermissionInfo', { [res.project_group_id]: true });
        commit('setHasProjectGroup', true);
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw new Error(e);
    } finally {
        commit('setActionTargetItem', {});
    }
};

export const updateProjectGroup: Action<ProjectPageState, any> = async (
    { state, commit, getters },
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
        commit('setActionTargetItem', {});
    }
};

export const deleteProjectGroup: Action<ProjectPageState, any> = async ({ state, commit, getters }) => {
    if (!state.rootNode || !getters.actionTargetNodeData) {
        throw new Error('No Target for deletion');
    }

    try {
        await SpaceConnector.client.identity.projectGroup.delete({
            project_group_id: getters.actionTargetNodeData.id,
        });

        state.rootNode.deleteNodeByPath(getters.actionTargetNodePath);
        // fetch data to update has child info
        const targetNode = state.rootNode.getNodeByPath(getters.actionTargetNodePath);
        await state.rootNode.fetchData(targetNode);
    } catch (e: any) {
        throw e;
    } finally {
        commit('setActionTargetItem', {});
    }
};

const permissionApiQueryHelper = new ApiQueryHelper();
const getPermissionInfo = async (ids: string[]): Promise<Record<string, boolean>> => {
    const permissionInfo = {};

    permissionApiQueryHelper.setOnly('project_group_id')
        .setFilters([{ k: 'project_group_id', v: ids }]);

    const { results } = await SpaceConnector.client.identity.projectGroup.list({
        query: permissionApiQueryHelper.data,
        author_within: true,
    });

    results.forEach((d) => {
        permissionInfo[d.project_group_id] = true;
    });

    return permissionInfo;
};

interface ProjectInfo {
    project_group_id: string;
    name: string;
}
export const createProject: Action<ProjectPageState, any> = async (
    { state, commit, getters },
    projectInfo: ProjectInfo,
) => {
    try {
        const res = await SpaceConnector.client.identity.project.create({
            ...projectInfo,
        });
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
        commit('setShouldUpdateProjectList', true);

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

            commit('addPermissionInfo', { [res.project_id]: true });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
        throw new Error(e);
    }
};

let refreshPermissionInfoLoading;
export const refreshPermissionInfo: Action<ProjectPageState, any> = async ({ commit, state }, ids?: string[]): Promise<void> => {
    if (refreshPermissionInfoLoading) return;

    const projectGroupIds = ids || Object.keys(state.permissionInfo);
    if (!projectGroupIds.length) return;

    refreshPermissionInfoLoading = true;

    try {
        const permissionInfo = await getPermissionInfo(projectGroupIds);

        if (ids) commit('addPermissionInfo', permissionInfo);
        else commit('setPermissionInfo', permissionInfo);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        refreshPermissionInfoLoading = false;
    }
};

let addPermissionInfoLoading;
export const addPermissionInfo: Action<ProjectPageState, any> = async ({ commit, state }, ids: string[]): Promise<void> => {
    if (addPermissionInfoLoading) return;

    const projectGroupIds = ids.filter((id) => state.permissionInfo[id] === undefined);
    if (!projectGroupIds.length) return;

    addPermissionInfoLoading = true;

    try {
        const permissionInfo = await getPermissionInfo(projectGroupIds);
        commit('addPermissionInfo', permissionInfo);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        addPermissionInfoLoading = false;
    }
};

export const openProjectCreateForm: Action<ProjectPageState, any> = ({ commit }, projectGroup: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', projectGroup);
    commit('setProjectFormVisible', true);
};
