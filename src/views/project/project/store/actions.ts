import { Action } from 'vuex';
import { ProjectPageState } from '@/views/project/project/store/type';
import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';
import { SpaceConnector } from '@/lib/space-connector';

const rootFetchParams: any = {
    exclude_type: 'PROJECT',
    sort: { key: 'name', desc: false },
    item_type: 'ROOT',
};

export const fetchRootNodes: Action<ProjectPageState, any> = async ({ state, commit }) => {
    let res;
    try {
        const { items } = await SpaceConnector.client.identity.project.tree(rootFetchParams);
        res = items;
    } catch (e) {
        console.error(e);
        res = false;
    } finally {
        if (state.rootNode && res) await state.rootNode.setChildren(res);
        commit('setHasProjectGroup', Array.isArray(res) ? !!res.length : false);
    }
};

export const initRoot: Action<ProjectPageState, any> = async ({ dispatch, commit }, root) => {
    commit('setRootNode', root);
    await dispatch('fetchRootNodes');
};

export const selectAllProjectNode: Action<ProjectPageState, any> = ({ state }): void => {
    if (state.selectedNode) {
        state.selectedNode.setSelected(false);
    }
};

export const selectNode: Action<ProjectPageState, any> = async ({ state, commit, dispatch }, groupId?: string) => {
    if (!groupId) {
        dispatch('selectAllProjectNode');
        return null;
    }

    try {
        const res = await SpaceConnector.client.identity.project.tree.search({
            item_id: groupId,
            item_type: 'PROJECT_GROUP',
        });
        const paths = res.open_path || [];

        if (state.rootNode) {
            const item = await state.rootNode.findNode(groupId, paths);
            if (item) {
                item.setSelected(true);
                return item;
            }
        }
    } catch (e) {
        console.error(e);
    }

    return null;
};

export const openProjectGroupCreateForm: Action<ProjectPageState, any> = ({ commit }, target?: ProjectTreeItem|null) => {
    commit('setActionTargetNode', target);
    commit('setProjectGroupFormUpdateMode', false);
    commit('setProjectGroupFormVisible', true);
};

export const openProjectGroupUpdateForm: Action<ProjectPageState, any> = ({ state, commit }, target?: ProjectTreeItem|null) => {
    commit('setActionTargetNode', target);
    commit('setProjectGroupFormUpdateMode', true);
    commit('setProjectGroupFormVisible', true);
};

export const openProjectGroupDeleteCheckModal: Action<ProjectPageState, any> = ({ state, commit }, target: ProjectTreeItem) => {
    commit('setActionTargetNode', target);
    commit('setProjectGroupDeleteCheckModalVisible', true);
};

interface ProjectGroupInfo {parent_project_group_id?: string; name: string}

export const createProjectGroup: Action<ProjectPageState, any> = async ({ state, commit },
    projectGroupInfo: ProjectGroupInfo) => {
    try {
        const params: ProjectGroupInfo = { ...projectGroupInfo };
        if (state.actionTargetNode) {
            params.parent_project_group_id = state.actionTargetNode.data.id;
        }
        const res = await SpaceConnector.client.identity.projectGroup.create(params);

        const newData: ProjectItemResp = {
            ...projectGroupInfo,
            id: res.project_group_id,
            item_type: 'PROJECT_GROUP',
            has_child: false,
        };

        if (state.actionTargetNode) {
            state.actionTargetNode.addChild(newData);
        } else if (state.rootNode) {
            state.rootNode.addChild(newData);
        }

        commit('setHasProjectGroup', true);
    } catch (e) {
        throw new Error(e);
    } finally {
        commit('setActionTargetNode', null);
    }
};

export const updateProjectGroup: Action<ProjectPageState, any> = async ({ state, commit },
    projectGroupInfo: Partial<ProjectGroupInfo>) => {
    if (!state.actionTargetNode) return;

    try {
        const params = {
            project_group_id: state.actionTargetNode.data.id,
            ...projectGroupInfo,
        };

        await SpaceConnector.client.identity.projectGroup.update(params);

        state.actionTargetNode.setData({ ...state.actionTargetNode.data, ...projectGroupInfo });
    } catch (e) {
        throw new Error(e);
    } finally {
        commit('setActionTargetNode', null);
    }
};

export const deleteProjectGroup: Action<ProjectPageState, any> = async ({ state, commit, dispatch }) => {
    if (!state.actionTargetNode) return;

    try {
        await SpaceConnector.client.identity.projectGroup.delete({
            project_group_id: state.actionTargetNode.data.id,
        });

        state.actionTargetNode.deleteNode();
    } catch (e) {
        throw new Error(e);
    } finally {
        commit('setActionTargetNode', null);
    }
};

export const openProjectCreateForm: Action<ProjectPageState, any> = ({ commit }, projectGroup?: ProjectTreeItem|null) => {
    commit('setActionTargetNode', projectGroup);
    commit('setProjectFormVisible', true);
};
