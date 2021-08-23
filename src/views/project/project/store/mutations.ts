import { Mutation } from 'vuex';
import { ProjectPageState } from '@/views/project/project/store/type';
import { ProjectGroupTreeItem } from '@/views/project/project/type';

export const setIsInitiated: Mutation<ProjectPageState> = (state, isInitiated: boolean) => {
    state.isInitiated = isInitiated;
};

export const setSearchText: Mutation<ProjectPageState> = (state, text?: string) => {
    state.searchText = text;
};

export const setSelectedItem: Mutation<ProjectPageState> = (state, selectedItem) => {
    state.selectedItem = selectedItem;
};

export const setRootNode: Mutation<ProjectPageState> = (state, root?: any|null) => {
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

export const setPermissionInfo: Mutation<ProjectPageState> = (state, permissionInfo: Record<string, boolean>) => {
    state.permissionInfo = permissionInfo;
};

export const addPermissionInfo: Mutation<ProjectPageState> = (state, permissionInfo: Record<string, boolean>) => {
    state.permissionInfo = { ...state.permissionInfo, ...permissionInfo };
};

export const setActionTargetItem: Mutation<ProjectPageState> = (state, actionTargetItem: ProjectGroupTreeItem = {}) => {
    state.actionTargetItem = actionTargetItem;
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
