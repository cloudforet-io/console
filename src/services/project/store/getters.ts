import type { Getter } from 'vuex';

import { reverse } from 'lodash';

import type { ProjectPageState } from '@/services/project/store/type';
import type { ProjectGroup, ProjectItemResp } from '@/services/project/type';

export const selectedNodeData: Getter<ProjectPageState, any> = (state): ProjectItemResp|undefined => (state.selectedItem.node ? state.selectedItem.node.data : undefined);

export const selectedNodePath: Getter<ProjectPageState, any> = (state): number[]|undefined => (state.selectedItem.path ? state.selectedItem.path : undefined);

export const groupId: Getter<ProjectPageState, any> = (state, getters): string|undefined => (getters.selectedNodeData ? getters.selectedNodeData.id : undefined);

export const groupName: Getter<ProjectPageState, any> = (state, getters): string|undefined => (getters.selectedNodeData ? getters.selectedNodeData.name : undefined);

export const actionTargetNodeData: Getter<ProjectPageState, any> = (state): ProjectItemResp|undefined => (state.actionTargetItem.node ? state.actionTargetItem.node.data : undefined);

export const actionTargetNodePath: Getter<ProjectPageState, any> = (state): number[]|undefined => (state.actionTargetItem.path ? state.actionTargetItem.path : undefined);

export const parentGroups: Getter<ProjectPageState, any> = (state: ProjectPageState, getters): ProjectGroup[] => {
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
};
