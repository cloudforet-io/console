import { Action } from 'vuex';
import { ProjectPageState } from '@/services/project/store/type';
import { ProjectGroupTreeItem, ProjectItemResp } from '@/services/project/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

export const initRoot: Action<ProjectPageState, any> = ({ dispatch, commit }, root) => {
    commit('setRootNode', root);
};

export const selectNode: Action<ProjectPageState, any> = async ({ state, commit, dispatch }, groupId?: string) => {
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
            const { node } = await state.rootNode.fetchAndFindNode(paths.map(d => (data => data.id === d)));
            return node;
        }
    } catch (e) {
        console.error(e);
    }

    return null;
};

export const openProjectGroupCreateForm: Action<ProjectPageState, any> = ({ commit }, target: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', target);
    commit('setProjectGroupFormUpdateMode', false);
    commit('setProjectGroupFormVisible', true);
};

export const openProjectGroupUpdateForm: Action<ProjectPageState, any> = ({ state, commit }, target: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', target);
    commit('setProjectGroupFormUpdateMode', true);
    commit('setProjectGroupFormVisible', true);
};

export const openProjectGroupDeleteCheckModal: Action<ProjectPageState, any> = ({ state, commit }, target: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', target);
    commit('setProjectGroupDeleteCheckModalVisible', true);
};

interface ProjectGroupInfo {parent_project_group_id?: string; name: string}

export const createProjectGroup: Action<ProjectPageState, any> = async ({ state, commit, getters },
    projectGroupInfo: ProjectGroupInfo) => {
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
                state.rootNode.addChildNodeByPath(getters.actionTargetNodePath, newData);
            } else {
                state.rootNode.addNode(newData);
            }
        }

        commit('addPermissionInfo', { [res.project_group_id]: true });
        commit('setHasProjectGroup', true);
    } catch (e) {
        throw new Error(e);
    } finally {
        commit('setActionTargetItem', {});
    }
};

export const updateProjectGroup: Action<ProjectPageState, any> = async ({ state, commit, getters },
    projectGroupInfo: Partial<ProjectGroupInfo>) => {
    if (!state.rootNode || !getters.actionTargetNodeData) return;

    try {
        const params = {
            project_group_id: getters.actionTargetNodeData.id,
            ...projectGroupInfo,
        };

        await SpaceConnector.client.identity.projectGroup.update(params);


        state.rootNode.updateNodeByPath(getters.actionTargetNodePath,
            { ...getters.actionTargetNodeData, ...projectGroupInfo });
    } catch (e) {
        throw new Error(e);
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
    } catch (e) {
        throw new Error(e);
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
        console.error(e);
    } finally {
        refreshPermissionInfoLoading = false;
    }
};

let addPermissionInfoLoading;
export const addPermissionInfo: Action<ProjectPageState, any> = async ({ commit, state }, ids: string[]): Promise<void> => {
    if (addPermissionInfoLoading) return;

    const projectGroupIds = ids.filter(id => state.permissionInfo[id] === undefined);
    if (!projectGroupIds.length) return;

    addPermissionInfoLoading = true;

    try {
        const permissionInfo = await getPermissionInfo(projectGroupIds);
        commit('addPermissionInfo', permissionInfo);
    } catch (e) {
        console.error(e);
    } finally {
        addPermissionInfoLoading = false;
    }
};

export const openProjectCreateForm: Action<ProjectPageState, any> = ({ commit }, projectGroup: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', projectGroup);
    commit('setProjectFormVisible', true);
};
