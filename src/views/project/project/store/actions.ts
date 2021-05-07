import { Action } from 'vuex';
import { ProjectPageState } from '@/views/project/project/store/type';
import { ProjectGroupTreeItem, ProjectItemResp } from '@/views/project/project/type';
import { SpaceConnector } from '@/lib/space-connector';

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
            const node = await state.rootNode.fetchAndFindNode(paths.map(d => (data => data.id === d)));
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

export const openProjectCreateForm: Action<ProjectPageState, any> = ({ commit }, projectGroup: ProjectGroupTreeItem = {}) => {
    commit('setActionTargetItem', projectGroup);
    commit('setProjectFormVisible', true);
};
