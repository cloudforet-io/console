import { Getter } from 'vuex';
import { ProjectPageState } from '@/views/project/project/store/type';
import { reverse } from 'lodash';
import { ProjectGroup, ProjectTreeItem } from '@/views/project/project/type';


export const selectedNodeData: Getter<ProjectPageState, any> = (state): any|undefined => (state.selectedItem.node ? state.selectedItem.node.data : undefined);

export const selectedNodePath: Getter<ProjectPageState, any> = (state): any|undefined => (state.selectedItem.path ? state.selectedItem.path : undefined);

export const groupId: Getter<ProjectPageState, any> = (state, getters): string|undefined => (getters.selectedNodeData ? getters.selectedNodeData.id : undefined);

export const groupName: Getter<ProjectPageState, any> = (state, getters): string|undefined => (getters.selectedNodeData ? getters.selectedNodeData.name : undefined);

export const actionTargetNodeData: Getter<ProjectPageState, any> = (state): any|undefined => (state.actionTargetItem.node ? state.actionTargetItem.node.data : undefined);

export const actionTargetNodePath: Getter<ProjectPageState, any> = (state): any|undefined => (state.actionTargetItem.path ? state.actionTargetItem.path : undefined);

const getParentGroup = (item: ProjectTreeItem, res: ProjectGroup[] = []): ProjectGroup[] => {
    if (item && item.level !== 0) {
        res.push(item.data);
        if (item.parent?.data) return getParentGroup(item.parent, res);
        return res;
    }
    return res;
};

export const parentGroups: Getter<ProjectPageState, any> = (state, getters): ProjectGroup[] => {
    if (getters.selectedNode?.parent) return reverse(getParentGroup(getters.selectedNode.parent));
    return [];
};
