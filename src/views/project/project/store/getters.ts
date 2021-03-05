import { Getter } from 'vuex';
import { ProjectPageState } from '@/views/project/project/store/type';
import { reverse } from 'lodash';
import { ProjectGroup, ProjectTreeItem } from '@/views/project/project/type';

export const groupId: Getter<ProjectPageState, any> = (state): string|undefined => (state.selectedNode ? state.selectedNode.data.id : undefined);

export const groupName: Getter<ProjectPageState, any> = (state): string|undefined => (state.selectedNode ? state.selectedNode.data.name : undefined);

const getParentGroup = (item: ProjectTreeItem, res: ProjectGroup[] = []): ProjectGroup[] => {
    if (item && item.level !== 0) {
        res.push(item.data);
        if (item.parent?.data) return getParentGroup(item.parent, res);
        return res;
    }
    return res;
};

export const parentGroups: Getter<ProjectPageState, any> = (state): ProjectGroup[] => {
    if (state.selectedNode?.parent) return reverse(getParentGroup(state.selectedNode.parent));
    return [];
};
