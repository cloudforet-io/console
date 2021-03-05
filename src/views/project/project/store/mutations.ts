import { Mutation } from 'vuex';
import { ProjectPageState } from '@/views/project/project/store/type';
import { RootTreeNode } from '@spaceone/design-system/dist/src/data-display/tree/type';
import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';


export const setSearchText: Mutation<ProjectPageState> = (state, text?: string) => {
    state.searchText = text;
};

export const setSelectedNode: Mutation<ProjectPageState> = (state, selectedNode?: ProjectTreeItem) => {
    state.selectedNode = selectedNode;
};

export const setRootNode: Mutation<ProjectPageState> = (state, root?: RootTreeNode<ProjectItemResp>|null) => {
    state.rootNode = root;
};

export const setHasProjectGroup: Mutation<ProjectPageState> = (state, hasProjectGroup: boolean) => {
    state.hasProjectGroup = hasProjectGroup;
};

export const setProjectCount: Mutation<ProjectPageState> = (state, projectCount?: number) => {
    state.projectCount = projectCount;
};

export const setTreeEditMode: Mutation<ProjectPageState> = (state, treeEditMode: boolean) => {
    state.treeEditMode = treeEditMode;
};

export const setActionTargetNode: Mutation<ProjectPageState> = (state, actionTargetNode?: ProjectTreeItem|null) => {
    state.actionTargetNode = actionTargetNode;
};

export const setProjectGroupFormVisible: Mutation<ProjectPageState> = (state, projectGroupFormVisible: boolean) => {
    state.projectGroupFormVisible = projectGroupFormVisible;
};

export const setProjectGroupFormUpdateMode: Mutation<ProjectPageState> = (state, projectGroupFormUpdateMode: boolean) => {
    state.projectGroupFormUpdateMode = projectGroupFormUpdateMode;
};

export const setProjectGroupDeleteCheckModalVisible: Mutation<ProjectPageState> = (state, projectGroupDeleteCheckModalVisible: boolean) => {
    state.projectGroupDeleteCheckModalVisible = projectGroupDeleteCheckModalVisible;
};

export const setProjectFormVisible: Mutation<ProjectPageState> = (state, projectFormVisible: boolean) => {
    state.projectFormVisible = projectFormVisible;
};
